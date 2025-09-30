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
        console.log("Auth: Starting up auth provider.");

        const checkInitialSession = async () => {
            setSessionLoading(true);
            try {
                console.log("Auth: Performing initial getSession() check.");
                const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (initialSession?.user) {
                    console.log("Auth: Active initial session found. Fetching user profile.");
                    const userProfile = await fetchUserProfile(initialSession.user);
                    if (userProfile && !userProfile.is_locked) {
                        setUser(userProfile);
                        setSession(initialSession);
                        console.log("Auth: Initial session and profile loaded successfully.");
                    } else {
                         console.log("Auth: Initial session found, but profile fetch failed or user is locked. Clearing session locally.");
                         setUser(null);
                         setSession(null);
                    }
                } else {
                    console.log("Auth: No initial session found.");
                    setUser(null);
                    setSession(null);
                }
            } catch (error) {
                console.error("Auth: Critical error during initial session check:", error);
                setUser(null);
                setSession(null);
            } finally {
                // CRITICAL: This guarantees the loading state is always turned off and unlocks the UI.
                setSessionLoading(false);
                console.log("Auth: Initial session check finished. UI is now unlocked.");
            }
        };

        checkInitialSession();

        // Set up the listener for all subsequent auth events (e.g., explicit sign-in/out).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log(`Auth: Auth state changed. Event: ${event}`);
            if (event === 'SIGNED_IN' && newSession?.user) {
                const userProfile = await fetchUserProfile(newSession.user);
                if (userProfile && !userProfile.is_locked) {
                    setUser(userProfile);
                    setSession(newSession);
                } else {
                    // If sign-in event occurs but profile is missing/locked, force sign-out to prevent inconsistent state.
                    await supabase.auth.signOut();
                    setUser(null);
                    setSession(null);
                }
            } else if (event === 'SIGNED_OUT') {
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
        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

            if (signInError) {
                console.error("Auth: Login failed at signInWithPassword.", signInError.message);
                if (signInError.message.toLowerCase().includes('email not confirmed')) {
                    return { error: { message: "Please check your inbox and confirm your email address before logging in." } };
                }
                if (signInError.message === 'Invalid login credentials') {
                    return { error: { message: "The email or password you entered is incorrect. Please double-check your credentials and try again." } };
                }
                return { error: signInError };
            } 
            
            if (!data.user) {
                 return { error: { message: "Login failed, please try again." } };
            }
            
            const userProfile = await fetchUserProfile(data.user);

            if (!userProfile) {
                await supabase.auth.signOut(); 
                console.error('Auth: Login successful, but could not retrieve user profile. Forcing logout.');
                return { error: { message: "Login successful, but we couldn't load your profile. Please contact support. (This may be due to database security policies)." } };
            }

            if (userProfile.is_locked) {
                await supabase.auth.signOut();
                return { error: { message: "This account has been locked by an administrator." } };
            }

            setUser(userProfile);
            setSession(data.session);
            return { error: null };
        } catch (e: any) {
            console.error("Auth: A critical, unexpected error occurred during the signIn process.", e);
            return { error: { message: `A critical error occurred: ${e.message}` } };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
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
                 if (error.message.includes("User already registered")) {
                    return { error: { message: "This email is already registered. If you haven't confirmed your email, please check your inbox." } };
                }
                return { error };
            }
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                return { error: { message: "This email address is already in use. Please try logging in." } };
            }

            return { error: null };
        } catch (e: any) {
            console.error("Auth: A critical, unexpected error occurred during the signUp process.", e);
            return { error: { message: `A critical error occurred: ${e.message}` } };
        }
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