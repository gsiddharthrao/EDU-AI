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
    authError: string | null;
    isSessionInvalid: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSessionInvalid, setIsSessionInvalid] = useState(false);

    const clearAuthError = () => setAuthError(null);

    useEffect(() => {
        setSessionLoading(true);
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchUserProfile(session.user);
                
                if (profile) {
                    // This is a valid session with a valid profile.
                    setIsSessionInvalid(false);
                    setAuthError(null);

                    if (profile.is_locked) {
                        setAuthError("Your account has been locked. Please contact an administrator.");
                        await supabase.auth.signOut(); // This will re-trigger onAuthStateChange with a null session
                    } else {
                        setUser(profile);
                        setSession(session);
                    }
                } else {
                    // CRITICAL: Authenticated user with no profile. This is an invalid state.
                    console.error("Auth: User has a valid session but no profile. Triggering session invalidation flow.");
                    setIsSessionInvalid(true);
                    // Clear local state immediately
                    setUser(null);
                    setSession(null);
                }
            } else {
                // No session, user is logged out. This is a valid, clean state.
                setIsSessionInvalid(false);
                setUser(null);
                setSession(session); // session is null here
                setAuthError(null);
            }
            setSessionLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        clearAuthError();
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

            if (signInError) {
                console.error("Auth: Login failed.", signInError.message);
                if (signInError.message.toLowerCase().includes('email not confirmed')) {
                    setAuthError("Please check your inbox and confirm your email address before logging in.");
                } else if (signInError.message === 'Invalid login credentials') {
                    setAuthError("The email or password you entered is incorrect. Please try again.");
                } else {
                    setAuthError(signInError.message);
                }
            }
            // On success, the onAuthStateChange listener handles setting the user state.
        } catch (e: any) {
            console.error("Auth: A critical error occurred during login.", e);
            setAuthError(`A critical error occurred: ${e.message}`);
        }
    };

    const register = async (name: string, email: string, password: string): Promise<{ success: boolean }> => {
        clearAuthError();
        try {
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    data: { name }
                }
            });

            if (error) {
                 if (error.message.includes("User already registered")) {
                    setAuthError("This email is already registered. If you haven't confirmed your email, please check your inbox.");
                 } else {
                    setAuthError(error.message);
                 }
                return { success: false };
            }
            return { success: true };
        } catch (e: any) {
            console.error("Auth: A critical error occurred during registration.", e);
            setAuthError(`A critical error occurred: ${e.message}`);
            return { success: false };
        }
    };

    const logout = async () => {
        console.log("Auth: Attempting to log out.");
        setUser(null);
        setSession(null);
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Auth: Error during Supabase sign out:", error);
            }
        } catch (e) {
            console.error("Auth: Critical error during logout process:", e);
        }
    };
    
    const value = {
        user,
        session,
        sessionLoading,
        authError,
        isSessionInvalid,
        login,
        register,
        logout,
        setUser,
        clearAuthError,
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
