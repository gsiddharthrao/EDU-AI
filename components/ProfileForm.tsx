import React, { useState } from 'react';
import { UserProfile } from '../types';
import Spinner from './Spinner';

interface ProfileFormProps {
    initialProfile: UserProfile;
    onSave: (newProfile: UserProfile) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSave, onCancel, isSaving }) => {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [skillsInput, setSkillsInput] = useState(initialProfile.skills.join(', '));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedSkills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
        onSave({ ...profile, skills: updatedSkills });
    };
    
    const isFirstTimeSetup = onCancel.toString() === '() => {}';

    return (
        <form onSubmit={handleSave} className="bg-white dark:bg-neutral-light/20 p-6 rounded-lg shadow-md mt-4 space-y-4 animate-fade-in">
            <div>
                <label htmlFor="aspirations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Career Aspirations</label>
                <input
                    type="text"
                    id="aspirations"
                    placeholder="e.g., Full Stack Web Developer"
                    value={profile.career_aspirations}
                    onChange={(e) => setProfile({ ...profile, career_aspirations: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                />
            </div>
             <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Skills (comma-separated)</label>
                <input
                    type="text"
                    id="skills"
                    placeholder="e.g., HTML, CSS, Basic JavaScript"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                />
            </div>
            <div className="flex justify-end space-x-4">
                {!isFirstTimeSetup && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    className="min-w-[120px] flex justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <Spinner />
                    ) : (
                        isFirstTimeSetup ? 'Create My Learning Path' : 'Save & Update Path'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;