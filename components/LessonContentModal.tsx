// FIX: Implement the LessonContentModal component. This file was previously empty.
import React, { useState, useEffect } from 'react';
import { Lesson, RecommendedVideo } from '../types';
import QuizModal from './QuizModal';
import YoutubeEmbed from './YoutubeEmbed';
import { marked } from 'marked';
import { findRelevantYouTubeVideos } from '../services/geminiService';

interface LessonContentModalProps {
    lesson: Lesson;
    onClose: () => void;
    onComplete: () => Promise<void>;
}

const RecommendedVideosLoadingSkeleton: React.FC = () => (
    <div className="flex space-x-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="w-48 flex-shrink-0">
                <div className="w-full h-28 bg-gray-300 dark:bg-gray-700 rounded-lg animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%]"></div>
                <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2 animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%]"></div>
            </div>
        ))}
    </div>
);


const LessonContentModal: React.FC<LessonContentModalProps> = ({ lesson, onClose, onComplete }) => {
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [parsedContent, setParsedContent] = useState('');
    const [recommendedVideos, setRecommendedVideos] = useState<RecommendedVideo[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const hasQuiz = lesson.quizzes && lesson.quizzes.length > 0;

    useEffect(() => {
        if (lesson.content) {
            setParsedContent(marked.parse(lesson.content) as string);
        }
        
        const fetchVideos = async () => {
          if (!lesson) return;
          setIsLoadingVideos(true);
          try {
            const videos = await findRelevantYouTubeVideos(lesson.title, lesson.content);
            setRecommendedVideos(videos);
          } catch (error) {
            console.error("Failed to fetch recommended videos:", error);
          } finally {
            setIsLoadingVideos(false);
          }
        };
        fetchVideos();

    }, [lesson]);

    const handleComplete = async () => {
        if (hasQuiz) {
            setIsQuizVisible(true);
        } else {
            setIsCompleting(true);
            try {
                await onComplete();
            } finally {
                // Modal closes, no need to reset state
            }
        }
    };

    const handleQuizComplete = async () => {
        setIsQuizVisible(false);
        await onComplete();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in p-4">
                <div className="bg-white dark:bg-neutral-light/95 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-primary">{lesson.title}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-grow space-y-8">
                        {lesson.youtube_video_id && (
                            <YoutubeEmbed embedId={lesson.youtube_video_id} />
                        )}
                        <div
                            className="prose dark:prose-invert max-w-none text-content-light dark:text-content-dark"
                            dangerouslySetInnerHTML={{ __html: parsedContent }}
                        />

                        {/* Recommended Videos Section */}
                        <div>
                           <h3 className="text-xl font-semibold mb-4 text-neutral-light dark:text-white border-t dark:border-gray-700 pt-6">Recommended Videos for Deeper Learning</h3>
                           <div className="flex space-x-4 overflow-x-auto pb-4">
                                {isLoadingVideos ? (
                                    <RecommendedVideosLoadingSkeleton />
                                ) : recommendedVideos.length > 0 ? (
                                    recommendedVideos.map(video => (
                                        <a
                                            key={video.videoId}
                                            href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block w-48 flex-shrink-0"
                                        >
                                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-28 object-cover rounded-lg mb-2 shadow-md group-hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700" />
                                            <p className="text-sm font-medium text-content-light dark:text-content-dark group-hover:text-primary dark:group-hover:text-secondary line-clamp-2">
                                                {video.title}
                                            </p>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-content-light dark:text-content-dark">No recommended videos found for this topic.</p>
                                )}
                           </div>
                        </div>

                    </div>

                    <div className="p-6 border-t dark:border-gray-700 flex justify-end items-center">
                        <button
                            onClick={handleComplete}
                            disabled={isCompleting}
                            className="min-w-[150px] flex justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {isCompleting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                hasQuiz ? 'Take Quiz & Complete' : 'Mark as Complete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {isQuizVisible && hasQuiz && (
                <QuizModal 
                    lesson={lesson} 
                    onClose={() => setIsQuizVisible(false)}
                    onComplete={handleQuizComplete}
                />
            )}
        </>
    );
};

export default LessonContentModal;