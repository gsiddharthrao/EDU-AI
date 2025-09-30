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
        console.log("Auth: Setting up unified auth state listener.");
        // Set loading to true initially. It will be set to false after the first auth event is received.
        setSessionLoading(true);

        // The onAuthStateChange listener is the single source of truth.
        // It fires an INITIAL_SESSION event on page load, and subsequent events for SIGNED_IN, SIGNED_OUT, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log(`Auth: Auth state change detected. Event: ${event}, Session: ${newSession ? 'Exists' : 'Null'}`);

            if (newSession?.user) {
                // This handles SIGNED_IN, TOKEN_REFRESHED, and INITIAL_SESSION with a user.
                const userProfile = await fetchUserProfile(newSession.user);
                if (userProfile && !userProfile.is_locked) {
                    setUser(userProfile);
                    setSession(newSession);
                } else {
                    // If profile is missing or user is locked, force a clean state by signing out.
                    // This prevents the user from being stuck in a valid session without a valid profile.
                    console.log("Auth: Profile not found or user locked. Forcing sign-out.");
                    await supabase.auth.signOut();
                    setUser(null);
                    setSession(null);
                }
            } else {
                // This handles SIGNED_OUT and INITIAL_SESSION without a user.
                setUser(null);
                setSession(null);
            }

            // CRITICAL: Once the first event is processed, loading is complete, which unlocks the UI.
            setSessionLoading(false);
            console.log("Auth: Auth event processed. UI is now unlocked.");
        });

        return () => {
            console.log("Auth: Unsubscribing from auth state changes.");
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

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
            
            // On success, we don't set the state here. We let the onAuthStateChange listener handle it.
            return { error: null };
        } catch (e: any) {
            console.error("Auth: A critical, unexpected error occurred during the signIn process.", e);
            return { error: { message: `A critical error occurred: ${e.message}` } };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({ 
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

            return { error: null };
        } catch (e: any) {
            console.error("Auth: A critical, unexpected error occurred during the signUp process.", e);
            return { error: { message: `A critical error occurred: ${e.message}` } };
        }
    };

    const logout = async () => {
        console.log("Auth: Attempting to log out.");
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Auth: Error during Supabase sign out:", error);
                // As a fallback, clear the local state manually if the server call fails.
                setUser(null);
                setSession(null);
            }
            // If successful, the onAuthStateChange listener will handle setting user/session to null.
        } catch (e) {
            console.error("Auth: Critical error during logout process:", e);
            // As a failsafe, also clear the local state.
            setUser(null);
            setSession(null);
        }
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