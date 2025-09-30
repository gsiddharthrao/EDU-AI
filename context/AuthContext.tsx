import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

// Helper function to fetch user profile from Supabase
const fetchUserProfile = async (sessionUser: SupabaseUser): Promise<User | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // Ignore 'exact one row not found'
                console.error('Error fetching user profile:', error);
            }
            return null;
        }

        if (data) {
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
        console.error('Exception fetching user profile:', e);
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                const userProfile = await fetchUserProfile(session.user);
                // The login function now handles the lock check, but this is a good safeguard
                if (userProfile?.is_locked) {
                    setUser(null);
                    supabase.auth.signOut();
                } else {
                    setUser(userProfile);
                }
            } else {
                setUser(null);
            }
            setSessionLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        // Step 1: Sign in the user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
            // FIX: Provide a more user-friendly error message for invalid credentials.
            if (signInError.message === 'Invalid login credentials') {
                return { error: { message: "Invalid email or password. Please try again or register for a new account." } };
            }
            return { error: signInError };
        }
        if (!data.user) {
             return { error: { message: "Login failed, please try again." } };
        }

        // Step 2: Immediately try to fetch the user's profile to ensure it's accessible.
        // This is a critical check for RLS policies.
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // Step 3: If profile is not found or there's an error, something is wrong.
        // This could be an RLS issue or a missing profile. Sign out and show an error.
        if (profileError) {
            await supabase.auth.signOut(); // Important: don't leave the user in a half-logged-in state.
            console.error('Error fetching profile after login:', profileError);
            return { error: { message: "Login successful, but could not retrieve your profile. Please ensure database security policies are active or contact support." } };
        }

        // Step 4: Check if the fetched profile shows the account is locked.
        if (profileData.is_locked) {
            await supabase.auth.signOut();
            return { error: { message: "This account has been locked by an administrator." } };
        }

        // Step 5: Success. onAuthStateChange will now handle setting the user state.
        return { error: null };
    };

    const register = async (name: string, email: string, password: string) => {
        // We only call signUp. The database trigger will handle profile creation.
        // We pass the user's full name in the `data` field so the trigger can use it.
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    name: name,
                }
            }
        });

        // The profile creation logic is now removed from here.
        // If there's an error during signUp, we just return it.
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