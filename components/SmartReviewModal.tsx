import React, { useState } from 'react';
import { Module, SmartReview } from '../types';

interface SmartReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    module: Module;
    reviewContent: SmartReview | null;
    isLoading: boolean;
}

const Flashcard: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full h-48 perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
            <div
                className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front of card */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-neutral-light/20 border-2 border-primary rounded-lg flex flex-col justify-center items-center p-4 cursor-pointer">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Question</p>
                    <p className="text-center font-semibold text-neutral-light dark:text-white">{question}</p>
                </div>
                {/* Back of card */}
                <div className="absolute w-full h-full backface-hidden bg-secondary/10 dark:bg-secondary/20 border-2 border-secondary rounded-lg flex flex-col justify-center items-center p-4 cursor-pointer rotate-y-180">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Answer</p>
                    <p className="text-center font-medium text-neutral-light dark:text-white">{answer}</p>
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-8">
        <div>
            <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%] mb-4"></div>
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%]"></div>
            <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded mt-2 animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%]"></div>
        </div>
         <div>
            <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%] mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                     <div key={i} className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg animate-shimmer bg-gradient-to-r from-transparent via-gray-400/30 to-transparent bg-[length:1000px_100%]"></div>
                ))}
            </div>
        </div>
    </div>
);


const SmartReviewModal: React.FC<SmartReviewModalProps> = ({ isOpen, onClose, module, reviewContent, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in p-4">
            <style>
                {`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                `}
            </style>
            <div className="bg-white dark:bg-neutral-light/95 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">✨ Smart Review</h2>
                        <p className="text-content-light dark:text-content-dark">Module: {module.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : reviewContent ? (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-neutral-light dark:text-white">Key Summary</h3>
                                <p className="text-content-light dark:text-content-dark">{reviewContent.summary}</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-neutral-light dark:text-white">Test Your Knowledge</h3>
                                {reviewContent.flashcards.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {reviewContent.flashcards.map((card, index) => (
                                            <Flashcard key={index} question={card.question} answer={card.answer} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-content-light dark:text-content-dark">No flashcards were generated for this module.</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-6 border-t dark:border-gray-700 flex justify-end items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartReviewModal;
