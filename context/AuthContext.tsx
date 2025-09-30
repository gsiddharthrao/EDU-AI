import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

// Helper function to fetch user profile from Supabase
const fetchUserProfile = async (sessionUser: SupabaseUser): Promise<User | null> => {
    console.log("Auth: Attempting to fetch profile for user:", sessionUser.id);
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (error) {
            console.error('Auth: Supabase error fetching user profile. This is likely due to missing RLS policies.', { code: error.code, message: error.message });
            return null;
        }

        if (data) {
             console.log("Auth: Successfully fetched profile for user:", sessionUser.id);
            return {
                id: sessionUser.id,
                email: sessionUser.email!,
                name: data.name,
                role: data.role,
                points: data.points,
                badges: data.badges || [],
                completed_lessons: data.completed_lessons || [],
                is_locked: data.is_locked || false,
                profile: {
                    skills: data.skills || [],
                    career_aspirations: data.career_aspirations || '',
                },
            };
        }
        return null;
    } catch (e) {
        console.error('Auth: Critical exception during fetchUserProfile:', e);
        return null;
    }
};

interface AuthContextType {
    user: User | null;
    session: Session | null;
    sessionLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<{ error: any }>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    useEffect(() => {
        // This function proactively checks the session on initial app load.
        // It's more reliable than just waiting for onAuthStateChange to fire.
        const checkInitialSession = async () => {
            console.log("Auth: Starting initial session check...");
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (initialSession?.user) {
                    console.log("Auth: Initial session found. Fetching profile.");
                    const userProfile = await fetchUserProfile(initialSession.user);
                    if (userProfile && !userProfile.is_locked) {
                        setUser(userProfile);
                        setSession(initialSession);
                        console.log("Auth: Initial session and profile loaded successfully.");
                    } else {
                        // Profile fetch failed or user is locked, ensure they are logged out.
                         await supabase.auth.signOut();
                         setUser(null);
                         setSession(null);
                    }
                } else {
                    console.log("Auth: No initial session found.");
                }
            } catch (e) {
                console.error("Auth: Error during initial session check.", e);
            } finally {
                // This GUARANTEES the loading screen is removed.
                setSessionLoading(false);
                console.log("Auth: Initial session check complete. Loading finished.");
            }
        };

        checkInitialSession();

        // This listener handles subsequent auth changes (login, logout) after the initial load.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
             console.log(`Auth: Auth state change detected. Event: ${_event}`);
            if (newSession?.user) {
                if (newSession.user.id !== user?.id) { // Only refetch if the user is different
                    const userProfile = await fetchUserProfile(newSession.user);
                     if (userProfile && !userProfile.is_locked) {
                        setUser(userProfile);
                        setSession(newSession);
                    } else {
                        setUser(null);
                        setSession(null);
                    }
                }
            } else {
                setUser(null);
                setSession(null);
            }
        });

        return () => {
            console.log("Auth: Unsubscribing from auth state changes.");
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
            console.error("Auth: Login failed at signInWithPassword.", signInError.message);
            if (signInError.message.toLowerCase().includes('email not confirmed')) {
                return { error: { message: "Please check your inbox and confirm your email address before logging in." } };
            }
            if (signInError.message === 'Invalid login credentials') {
                return { error: { message: "Invalid email or password. Please try again or register for a new account." } };
            }
            return { error: signInError };
        } 
        
        if (!data.user) {
             return { error: { message: "Login failed, please try again." } };
        }
        
        // After successful sign-in, immediately try to fetch the profile to ensure it's accessible.
        const userProfile = await fetchUserProfile(data.user);

        if (!userProfile) {
            await supabase.auth.signOut(); // Log the user out to prevent an inconsistent state.
            console.error('Auth: Login successful, but could not retrieve user profile. Forcing logout.');
            return { error: { message: "Login successful, but we couldn't load your profile. Please contact support. (This may be due to database security policies)." } };
        }

        if (userProfile.is_locked) {
            await supabase.auth.signOut();
            return { error: { message: "This account has been locked by an administrator." } };
        }

        // Success! The onAuthStateChange listener will handle setting the user state.
        setUser(userProfile);
        setSession(data.session);
        return { error: null };
    };

    const register = async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    name: name,
                }
            }
        });
        if (error) {
            // Check for a specific error indicating the user exists but is unconfirmed.
             if (error.message.includes("User already registered")) {
                return { error: { message: "This email is already registered. If you haven't confirmed your email, please check your inbox." } };
            }
            return { error };
        }
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            return { error: { message: "This email address is already in use. Please try logging in." } };
        }

        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };
    
    const value = {
        user,
        session,
        sessionLoading,
        login,
        register,
        logout,
        setUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};