import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
    data: LeaderboardEntry[];
    currentUserId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data, currentUserId }) => {
    
    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return <span className="font-bold text-sm text-gray-500 dark:text-gray-400 w-6 text-center">{rank}</span>;
    };

    return (
        <section className="p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-semibold text-neutral-light dark:text-gray-200 mb-4">Leaderboard</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {data.map((user) => (
                    <div 
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            user.id === currentUserId 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : 'bg-gray-50 dark:bg-neutral-light/10'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className="w-8 text-center mr-3">{getMedal(user.rank)}</div>
                            <p className={`font-medium ${user.id === currentUserId ? 'text-primary dark:text-white' : 'text-neutral-light dark:text-content-dark'}`}>{user.name}</p>
                        </div>
                        <p className={`font-bold ${user.id === currentUserId ? 'text-primary dark:text-white' : 'text-accent'}`}>
                            {user.points} pts
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Leaderboard;
