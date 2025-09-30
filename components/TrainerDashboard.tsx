
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import FeedbackModal from './FeedbackModal';
import { LeaderboardEntry } from '../types';

const TrainerDashboard: React.FC = () => {
    const { leaderboard } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<LeaderboardEntry | null>(null);

    const handleOpenFeedback = (student: LeaderboardEntry) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleCloseFeedback = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-neutral-light dark:text-white">Trainer Dashboard</h1>
            
            <section className="p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-neutral-light dark:text-gray-200 mb-4">Student Progress</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="p-4">Rank</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Points</th>
                                <th className="p-4">Badges</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map(student => (
                                <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-light/10">
                                    <td className="p-4">{student.rank}</td>
                                    <td className="p-4 font-medium">{student.name}</td>
                                    <td className="p-4 text-accent font-bold">{student.points}</td>
                                    <td className="p-4">{student.badges.length}</td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleOpenFeedback(student)}
                                            className="px-3 py-1 bg-secondary text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                        >
                                            Give Feedback
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            {selectedStudent && (
                 <FeedbackModal 
                    isOpen={isModalOpen} 
                    studentName={selectedStudent.name} 
                    onClose={handleCloseFeedback} 
                 />
            )}
        </div>
    );
};

export default TrainerDashboard;
