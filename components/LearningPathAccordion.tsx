import React, { useState, useMemo } from 'react';
import { LearningPath, Module, Lesson, Difficulty } from '../types';
import LessonContentModal from './LessonContentModal';

interface LearningPathAccordionProps {
    path: LearningPath;
    onLessonComplete: (lesson: Lesson) => void;
    completedLessons: Set<string>;
    searchTerm: string;
    onStartSmartReview: (module: Module) => void;
}

const getDifficultyClass = (difficulty: Difficulty | undefined) => {
    switch (difficulty) {
        case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const LearningPathAccordion: React.FC<LearningPathAccordionProps> = ({ path, onLessonComplete, completedLessons, searchTerm, onStartSmartReview }) => {
    const [openModuleId, setOpenModuleId] = useState<string | null>(path.modules?.[0]?.id || null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const filteredPath = useMemo(() => {
        if (!searchTerm.trim()) {
            return path;
        }

        const lowercasedFilter = searchTerm.toLowerCase();

        const modulesWithFilteredLessons = (path.modules || [])
            .map(module => {
                const isModuleMatch = module.title.toLowerCase().includes(lowercasedFilter) || 
                                      module.description.toLowerCase().includes(lowercasedFilter);

                const matchingLessons = (module.lessons || []).filter(lesson =>
                    lesson.title.toLowerCase().includes(lowercasedFilter) ||
                    lesson.content.toLowerCase().includes(lowercasedFilter)
                );

                if (isModuleMatch) {
                    return module; // If module text matches, show all its lessons
                }

                if (matchingLessons.length > 0) {
                    return { ...module, lessons: matchingLessons }; // Otherwise, show only matching lessons
                }
                
                return null;
            })
            .filter((module): module is Module => module !== null);

        return { ...path, modules: modulesWithFilteredLessons };
    }, [path, searchTerm]);


    const handleToggleModule = (moduleId: string) => {
        setOpenModuleId(prevId => (prevId === moduleId ? null : moduleId));
    };

    const handleLessonSelect = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const handleModalClose = () => {
        setSelectedLesson(null);
    };

    const handleLessonCompleteFlow = () => {
        if (selectedLesson) {
            onLessonComplete(selectedLesson);
        }
        setSelectedLesson(null);
    };

    if (filteredPath.modules.length === 0 && searchTerm) {
        return (
            <div className="text-center p-8 bg-gray-50 dark:bg-neutral-light/10 rounded-lg border border-dashed">
                <h4 className="font-semibold text-lg text-neutral-light dark:text-white">No Results Found</h4>
                <p className="text-content-light dark:text-content-dark mt-1">
                    We couldn't find any lessons matching "{searchTerm}".
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary dark:text-secondary">{filteredPath.title}</h3>
            <p className="text-content-light dark:text-content-dark mb-4">{filteredPath.description}</p>
            
            {(filteredPath.modules || []).map((module: Module) => {
                const isModuleComplete = module.lessons.every(lesson => completedLessons.has(lesson.id));

                return (
                    <div key={module.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => handleToggleModule(module.id)}
                            className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-light/10 hover:bg-gray-100 dark:hover:bg-neutral-light/20 transition-colors text-left"
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                    <h4 className="font-semibold text-lg text-neutral-light dark:text-white">{module.title}</h4>
                                    {module.difficulty && (
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getDifficultyClass(module.difficulty)}`}>
                                            {module.difficulty}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <span className={`transform transition-transform ${openModuleId === module.id ? 'rotate-180' : ''}`}>
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </span>
                            </div>
                        </button>
                        {openModuleId === module.id && (
                            <div className="bg-white dark:bg-neutral-light/5 animate-fade-in-up">
                                <ul className="space-y-2 p-4">
                                    {(module.lessons || []).map((lesson: Lesson) => (
                                        <li key={lesson.id}>
                                            <button
                                                onClick={() => handleLessonSelect(lesson)}
                                                className="w-full flex items-center justify-between text-left p-3 rounded-md hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors"
                                            >
                                                <span className="text-content-light dark:text-content-dark">{lesson.title}</span>
                                                {completedLessons.has(lesson.id) ? (
                                                    <span className="text-green-500 text-2xl" title="Completed">✓</span>
                                                ) : (
                                                    <span className="text-gray-400 text-2xl">○</span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {isModuleComplete && (
                                    <div className="p-4 border-t dark:border-gray-700 text-center">
                                        <button
                                            onClick={() => onStartSmartReview(module)}
                                            className="px-5 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors transform hover:scale-105"
                                        >
                                            ✨ Smart Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {selectedLesson && (
                <LessonContentModal 
                    lesson={selectedLesson}
                    onClose={handleModalClose}
                    onComplete={handleLessonCompleteFlow}
                />
            )}
        </div>
    );
};

export default LearningPathAccordion;