import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Lesson, UserProfile, Module, SmartReview } from '../types';
import ProfileForm from './ProfileForm';
import LearningPathAccordion from './LearningPathAccordion';
import GamificationDisplay from './GamificationDisplay';
import Leaderboard from './Leaderboard';
import SmartReviewModal from './SmartReviewModal';
import { generateSmartReview } from '../services/geminiService';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const {
        learningPath,
        leaderboard,
        isGeneratingPath,
        generateLearningPath,
        updateUserProfile,
        completeLesson,
    } = useAppContext();
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [reviewModule, setReviewModule] = useState<Module | null>(null);
    const [reviewContent, setReviewContent] = useState<SmartReview | null>(null);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);

    const userProfileExists = user?.profile?.career_aspirations && user.profile.skills.length > 0;
    
    useEffect(() => {
        // Automatically generate path if profile exists but path is not loaded
        if (userProfileExists && !learningPath && !isGeneratingPath && user) {
            generateLearningPath(user.profile);
        }
    }, [userProfileExists, learningPath, isGeneratingPath, generateLearningPath, user]);

    const handleSaveProfile = async (newProfile: UserProfile) => {
        await updateUserProfile(newProfile);
        await generateLearningPath(newProfile);
        setIsEditingProfile(false);
    };

    const handleLessonComplete = (lesson: Lesson) => {
        completeLesson(lesson.id);
        // You could add logic here to award points/badges based on the lesson
    };
    
    const handleStartSmartReview = async (module: Module) => {
        setReviewModule(module);
        setIsGeneratingReview(true);
        setReviewContent(null);
        try {
            const content = await generateSmartReview(module);
            setReviewContent(content);
        } catch (error) {
            console.error("Failed to generate smart review:", error);
            // In a real app, you'd want to show an error message in the modal
            setReviewContent({ summary: "Sorry, we couldn't generate a review at this time. Please try again later.", flashcards: [] });
        } finally {
            setIsGeneratingReview(false);
        }
    };

    const handleCloseReviewModal = () => {
        setReviewModule(null);
        setReviewContent(null);
    };
    
    const completedLessons = useMemo(() => new Set(user?.completed_lessons || []), [user?.completed_lessons]);
    
    const totalLessons = useMemo(() => {
        return learningPath?.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
    }, [learningPath]);

    const completionPercentage = useMemo(() => {
        if (totalLessons === 0) return 0;
        return Math.round((completedLessons.size / totalLessons) * 100);
    }, [completedLessons, totalLessons]);

    const renderContent = () => {
        if (!user) return null;

        if (isGeneratingPath) {
            return (
                <div className="text-center p-12 bg-white dark:bg-neutral-light/20 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-primary mb-4 animate-pulse">Generating Your Personal Learning Path...</h2>
                    <p className="text-content-light dark:text-content-dark">Our AI is crafting the perfect journey for you. This might take a moment.</p>
                </div>
            );
        }

        if (learningPath) {
            return (
                <div className="animate-fade-in">
                    <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-sm px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                         <button
                            onClick={() => setIsEditingProfile(true)}
                            className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Update Profile & Path
                        </button>
                    </div>
                    <LearningPathAccordion
                        path={learningPath}
                        onLessonComplete={handleLessonComplete}
                        completedLessons={completedLessons}
                        searchTerm={searchTerm}
                        onStartSmartReview={handleStartSmartReview}
                    />
                </div>
            );
        }

        if (!userProfileExists) {
            return (
                <div className="text-center p-8 bg-white dark:bg-neutral-light/20 rounded-lg shadow-lg animate-fade-in">
                    <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
                    <p className="mb-6 text-content-light dark:text-content-dark">Let's create your personalized learning path. Tell us about your goals.</p>
                    <ProfileForm 
                        initialProfile={user.profile} 
                        onSave={handleSaveProfile} 
                        onCancel={() => {}} // No cancel if it's the first time
                    />
                </div>
            );
        }

        return (
             <div className="text-center p-12 bg-white dark:bg-neutral-light/20 rounded-lg shadow-lg">
                <p className="text-content-light dark:text-content-dark">Something went wrong. Please try refreshing the page.</p>
             </div>
        );
    };

    if (!user) return null;

    if (isEditingProfile) {
        return (
             <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4">Update Your Profile</h2>
                <p className="mb-4 text-content-light dark:text-content-dark">
                    Your learning path will be regenerated based on your updated skills and aspirations.
                </p>
                <ProfileForm 
                    initialProfile={user.profile} 
                    onSave={handleSaveProfile} 
                    onCancel={() => setIsEditingProfile(false)}
                />
            </div>
        );
    }
    
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {renderContent()}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <GamificationDisplay completionPercentage={completionPercentage} />
                    <Leaderboard data={leaderboard} currentUserId={user.id} />
                </div>
            </div>
            {reviewModule && (
                <SmartReviewModal
                    module={reviewModule}
                    isOpen={!!reviewModule}
                    onClose={handleCloseReviewModal}
                    reviewContent={reviewContent}
                    isLoading={isGeneratingReview}
                />
            )}
        </>
    );
};

export default StudentDashboard;