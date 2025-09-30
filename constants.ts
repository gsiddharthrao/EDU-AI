// FIX: Consolidate all mock data and constants here. Import types from the newly cleaned up types.ts file.
import { Role, Difficulty, LearningPath, JobRecommendation, Badge, User } from './types';

export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
];

export const AVAILABLE_BADGES: Badge[] = [
    { id: 'first_steps', name: 'First Steps', description: 'Completed your first quiz!', icon: '👣' },
    { id: 'html_hero', name: 'HTML Hero', description: 'Mastered the HTML module.', icon: '🦸' },
    { id: 'js_journeyer', name: 'JS Journeyer', description: 'Completed the JavaScript module.', icon: '🚀' },
    { id: 'css_champ', name: 'CSS Champion', description: 'Excelled in the CSS module.', icon: '🎨' },
    { id: 'profile_powerup', name: 'Profile Power-Up', description: 'You completed your profile!', icon: '⭐' },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Achieved a perfect score on a quiz!', icon: '🎯' },
    { id: 'pathfinder', name: 'Pathfinder', description: 'Completed your first learning path!', icon: '🗺️' },
    { id: 'react_ranger', name: 'React Ranger', description: 'Completed the React module.', icon: '⚛️' },
    { id: 'python_pro', name: 'Python Pro', description: 'Mastered the Python module.', icon: '🐍' },
    { id: 'agile_advocate', name: 'Agile Advocate', description: 'Completed the Agile Methodologies module.', icon: '🔄' },
    { id: 'daily_learner', name: 'Daily Learner', description: 'Completed an activity for 3 consecutive days.', icon: '🗓️' },
    { id: 'weekly_warrior', name: 'Weekly Warrior', description: 'Completed an activity for 7 consecutive days.', icon: '📅' },
];
