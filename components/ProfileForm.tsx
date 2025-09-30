import React, { useState } from 'react';
import { UserProfile } from '../types';

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
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        isFirstTimeSetup ? 'Create My Learning Path' : 'Save & Update Path'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;