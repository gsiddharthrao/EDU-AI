import React from 'react';
import { User } from '../types';
import { AVAILABLE_BADGES } from '../constants';
import { useAuth } from '../context/AuthContext';

interface GamificationDisplayProps {
    completionPercentage: number;
}

const GamificationDisplay: React.FC<GamificationDisplayProps> = ({ completionPercentage }) => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const earnedBadges = AVAILABLE_BADGES.filter(badge => user.badges.includes(badge.id));

    return (
        <section className="p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-semibold text-neutral-light dark:text-gray-200 mb-4">Your Progress</h2>
            
            {/* Overall Path Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xl font-medium text-content-light dark:text-content-dark">Overall Path Completion</p>
                    <p className="text-3xl font-bold text-secondary">{completionPercentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700 overflow-hidden">
                    <div 
                        className="bg-secondary h-5 rounded-full transition-all duration-500" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Points and Badges */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                    <p className="text-lg text-content-light dark:text-content-dark">Points</p>
                    <p className="text-4xl font-bold text-primary">{user.points}</p>
                </div>
                <div className="flex-1 md:ml-8">
                    <p className="text-lg text-content-light dark:text-content-dark mb-2 text-center md:text-left">Badges Earned</p>
                    {earnedBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            {earnedBadges.map(badge => (
                                <div key={badge.id} className="group relative flex flex-col items-center">
                                    <span className="text-4xl">{badge.icon}</span>
                                    <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="font-bold">{badge.name}</p>
                                        <p>{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-content-light dark:text-content-dark text-center md:text-left">No badges earned yet. Keep learning!</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default GamificationDisplay;
