import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, LearningPath, UserProfile, LeaderboardEntry, ChatMessage, Badge } from '../types';
import { generateLearningPath as apiGenerateLearningPath, streamChatbotResponse as apiStreamChatbotResponse } from '../services/geminiService';
import { Language, translations } from '../translations';
import { AVAILABLE_BADGES, MOCK_LEADERBOARD } from '../constants';
import { generateProfileHash } from '../lib/crypto';
import { useAuth } from './AuthContext';

interface AppContextType {
    isPathLoading: boolean;
    learningPath: LearningPath | null;
    pathError: string | null;
    leaderboard: LeaderboardEntry[];
    isLeaderboardLoading: boolean;
    generateLearningPath: (profile: UserProfile) => Promise<void>;
    updateUserProfile: (newProfile: UserProfile) => Promise<void>;
    completeLesson: (lessonId: string) => Promise<void>;
    awardPointsAndBadge: (points: number, badgeId?: string) => Promise<void>;
    streamChatbotResponse: (messages: ChatMessage[], input: string, pathContext: any, onChunk: (chunk: string) => void) => Promise<void>;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    translate: (key: string) => string;
    notification: Badge | null;
    hideNotification: () => void;
    isAnimationEnabled: boolean;
    toggleAnimation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isMobile = () => {
    // A simple check for mobile user agents.
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, setUser } = useAuth();

    const [isPathLoading, setIsPathLoading] = useState(true);
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [pathError, setPathError] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');
    const [notification, setNotification] = useState<Badge | null>(null);
    const [isAnimationEnabled, setIsAnimationEnabled] = useState(() => {
        const saved = localStorage.getItem('animationEnabled');
        // Disable by default on mobile for better performance.
        return saved !== null ? JSON.parse(saved) : !isMobile();
    });
    const notificationTimerRef = useRef<number | null>(null);
    
    const hideNotification = useCallback(() => {
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        setNotification(null);
    }, []);

    const showNotification = useCallback((badge: Badge) => {
        hideNotification(); // Clear any existing notification
        setNotification(badge);
        notificationTimerRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 5000); // Auto-hide after 5 seconds
    }, [hideNotification]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        localStorage.setItem('animationEnabled', JSON.stringify(isAnimationEnabled));
    }, [isAnimationEnabled]);

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    
    const toggleAnimation = () => setIsAnimationEnabled(prev => !prev);
    
    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const translate = useCallback((key: string): string => {
        return translations[language]?.[key] || key;
    }, [language]);

    const fetchLeaderboard = useCallback(async () => {
        setIsLeaderboardLoading(true);
        try {
            const isPlaceholder = supabase.auth.getSession === undefined || !process.env.VITE_SUPABASE_URL;
            if (isPlaceholder) {
                setLeaderboard(MOCK_LEADERBOARD);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, email, points, badges')
                .order('points', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching leaderboard:', error);
                setLeaderboard(MOCK_LEADERBOARD); // Fallback to mock data on error
                return;
            }

            if (data) {
                const leaderboardData: LeaderboardEntry[] = data.map((profile, index) => {
                    let displayName = profile.name;
                    if (!displayName && profile.email) {
                        displayName = profile.email.split('@')[0];
                    }

                    return {
                        id: profile.id,
                        rank: index + 1,
                        name: displayName || 'Anonymous',
                        points: profile.points,
                        badges: profile.badges || [],
                    };
                });
                setLeaderboard(leaderboardData);
            }
        } finally {
            setIsLeaderboardLoading(false);
        }
    }, []);

    const generateLearningPath = useCallback(async (profile: UserProfile) => {
        if (!user) {
            setPathError("User not found. Cannot fetch learning path.");
            setIsPathLoading(false);
            return;
        }

        setIsPathLoading(true);
        setLearningPath(null);
        setPathError(null);
        try {
            const profileHash = await generateProfileHash(profile);

            const { data: cachedData, error: cacheError } = await supabase
                .from('cached_learning_paths')
                .select('path_data')
                .eq('user_id', user.id) // Securely query by user_id
                .eq('profile_hash', profileHash)
                .single();

            if (cacheError && cacheError.code !== 'PGRST116') {
                console.error('Error fetching from cache:', cacheError);
            }

            if (cachedData) {
                console.log("Cache hit! Serving learning path from database.");
                setLearningPath(cachedData.path_data as LearningPath);
            } else {
                console.log("Cache miss. Generating new learning path from AI.");
                const path = await apiGenerateLearningPath(profile);

                const { error: insertError } = await supabase
                    .from('cached_learning_paths')
                    .insert({ 
                        profile_hash: profileHash, 
                        path_data: path,
                        user_id: user.id // Securely insert with user_id
                    });

                if (insertError) {
                    console.error('Error saving new path to cache:', insertError);
                } else {
                    console.log("New path saved to cache.");
                }
                setLearningPath(path);
            }
        } catch (error) {
            console.error("Failed to generate or fetch learning path", error);
            setPathError("We couldn't generate your learning path. The AI service may be busy, or there might be a network issue. Please try again in a moment.");
        } finally {
            setIsPathLoading(false);
        }
    }, [user]); // Add user to dependency array

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard, user]);

    useEffect(() => {
        // This effect centrally manages loading or generating the path when the user's auth state changes.
        if (user) {
            const profileIsComplete = user.profile?.career_aspirations && user.profile.skills?.length > 0;
            if (profileIsComplete) {
                // User has a complete profile, so attempt to load or generate their path.
                generateLearningPath(user.profile);
            } else {
                // This is a new user or a user with an incomplete profile.
                // We don't generate a path automatically. The dashboard will show the profile form.
                console.log("User profile incomplete, skipping automatic path generation.");
                setLearningPath(null);
                setIsPathLoading(false); 
            }
        } else {
            // User is logged out, clear all path-related state.
            setLearningPath(null);
            setPathError(null);
            setIsPathLoading(false);
        }
    }, [user, generateLearningPath]);

    const updateUserProfile = async (newProfile: UserProfile): Promise<void> => {
        if (!user) return;

        let updates: any = {
            skills: newProfile.skills,
            career_aspirations: newProfile.career_aspirations,
        };
        
        let newBadge: Badge | undefined;
        if(!user.badges.includes('profile_powerup')){
            updates.badges = [...user.badges, 'profile_powerup'];
            updates.points = user.points + 10;
            newBadge = AVAILABLE_BADGES.find(b => b.id === 'profile_powerup');
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            throw error; // Propagate error for component-level handling
        }

        if (newBadge) {
            showNotification(newBadge);
        }

        setUser(currentUser => currentUser ? {
            ...currentUser,
            profile: newProfile,
            points: updates.points !== undefined ? updates.points : currentUser.points,
            badges: updates.badges !== undefined ? updates.badges : currentUser.badges,
        } : null);
    };
    
    const awardPointsAndBadge = useCallback(async (points: number, badgeId?: string): Promise<void> => {
        if (!user) return;
        
        const currentPoints = user.points;
        const currentBadges = user.badges;
        
        const updates: { points: number; badges?: string[] } = {
            points: currentPoints + points,
        };

        let newBadge: Badge | undefined;
        if (badgeId && !currentBadges.includes(badgeId)) {
            updates.badges = [...currentBadges, badgeId];
            newBadge = AVAILABLE_BADGES.find(b => b.id === badgeId);
        }

        setUser(u => u ? ({ ...u, ...updates }) : null);

        if (newBadge) {
            showNotification(newBadge);
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Error awarding points/badge:', error);
             setUser(u => u ? ({ ...u, points: currentPoints, badges: currentBadges }) : null);
        }
    }, [user, setUser, showNotification]);

    const completeLesson = useCallback(async (lessonId: string): Promise<void> => {
        if (!user || user.completed_lessons.includes(lessonId)) return;

        const newCompletedLessons = [...user.completed_lessons, lessonId];
        const newPoints = user.points + 10;

        setUser(u => u ? ({ 
            ...u, 
            completed_lessons: newCompletedLessons,
            points: newPoints
        }) : null);

        const { error } = await supabase
            .from('profiles')
            .update({ completed_lessons: newCompletedLessons, points: newPoints })
            .eq('id', user.id);
        
        if (error) {
            console.error('Error completing lesson:', error);
            setUser(u => u ? ({
                ...u,
                completed_lessons: user.completed_lessons,
                points: user.points,
            }) : null);
            throw error; // Propagate error
        }
    }, [user, setUser]);
    
    const streamChatbotResponse = async (messages: ChatMessage[], input: string, pathContext: any, onChunk: (chunk: string) => void) => {
        await apiStreamChatbotResponse(messages, input, pathContext, onChunk);
    };

    const value: AppContextType = {
        learningPath, leaderboard, isPathLoading, isLeaderboardLoading, pathError,
        generateLearningPath, updateUserProfile, completeLesson, awardPointsAndBadge,
        streamChatbotResponse,
        theme, toggleTheme,
        language, setLanguage: handleSetLanguage, translate,
        notification, hideNotification,
        isAnimationEnabled, toggleAnimation,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
