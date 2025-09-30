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
            // Any error here is critical, as a session exists but the profile is inaccessible.
            // This is the most common point of failure due to missing RLS policies.
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
        setSessionLoading(true);
        console.log("Auth: Setting up auth state change listener.");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log(`Auth: Auth state change detected. Event: ${_event}, Session:`, session ? 'Exists' : 'null');
            try {
                if (session?.user) {
                    const userProfile = await fetchUserProfile(session.user);
                    if (userProfile && !userProfile.is_locked) {
                        setUser(userProfile);
                        setSession(session);
                        console.log("Auth: User session restored and profile loaded successfully.");
                    } else {
                        // This block handles cases where the session is valid but the profile is not.
                        if (userProfile?.is_locked) {
                            console.warn("Auth: User account is locked. Forcing sign out.");
                        } else {
                            console.error("Auth: Session exists, but user profile could not be fetched or is invalid. Forcing sign out. This is often caused by missing RLS policies on the 'profiles' table.");
                        }
                        setUser(null);
                        setSession(session); // Keep session info for context if needed, but user is null
                        await supabase.auth.signOut();
                    }
                } else {
                    // This handles logout or expired sessions.
                    setUser(null);
                    setSession(null);
                }
            } catch (e) {
                console.error("Auth: A critical error occurred in onAuthStateChange. This is unexpected.", e);
                setUser(null); 
                setSession(null);
            } finally {
                // This block is guaranteed to run, ensuring the app is never stuck in a loading state.
                setSessionLoading(false);
                console.log("Auth: Session loading finished.");
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
        // The error object might contain a user object even if an error occurs (e.g., email already exists but is unconfirmed).
        // Check for error first.
        if (error) {
            return { error };
        }
        // Check if a user was created but needs confirmation.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            return { error: { message: "This email address is already in use. Please try logging in." } };
        }

        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
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
