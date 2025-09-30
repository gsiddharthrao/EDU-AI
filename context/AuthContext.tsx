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
            if (error.code !== 'PGRST116') { // Ignore 'exact one row not found'
                console.error('Auth: Supabase error fetching user profile:', { code: error.code, message: error.message, details: error.details });
            } else {
                console.warn("Auth: Profile not found for user:", sessionUser.id, "(This is expected if the profile hasn't been created or RLS is blocking).");
            }
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
            console.log(`Auth: Auth state change detected. Event: ${_event}`);
            try {
                setSession(session);
                if (session?.user) {
                    const userProfile = await fetchUserProfile(session.user);
                    if (userProfile && !userProfile.is_locked) {
                        setUser(userProfile);
                        console.log("Auth: User session restored and profile loaded successfully.");
                    } else {
                         if (!userProfile) {
                            console.error("Auth: Session exists, but user profile could not be fetched. This could be due to RLS policies or a missing profile. Forcing sign out.");
                        }
                        if (userProfile?.is_locked) {
                            console.warn("Auth: User account is locked. Forcing sign out.");
                        }
                        setUser(null);
                        await supabase.auth.signOut();
                    }
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("Auth: A critical error occurred in onAuthStateChange. This is unexpected.", e);
                setUser(null); 
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
             // Add specific handling for email not confirmed
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

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            await supabase.auth.signOut();
            console.error('Error fetching profile after login:', profileError);
            return { error: { message: "Login successful, but could not retrieve your profile. Please ensure database security policies are active or contact support." } };
        }

        if (profileData.is_locked) {
            await supabase.auth.signOut();
            return { error: { message: "This account has been locked by an administrator." } };
        }

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
        return { error };
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
