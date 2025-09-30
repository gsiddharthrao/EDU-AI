import React, { useState, useMemo } from 'react';
import { Lesson } from '../types';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';

interface QuizModalProps {
    lesson: Lesson;
    onClose: () => void;
    onComplete: () => Promise<void>;
}

const QuizModal: React.FC<QuizModalProps> = ({ lesson, onClose, onComplete }) => {
    const { awardPointsAndBadge } = useAppContext();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [quizFinished, setQuizFinished] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const quiz = useMemo(() => lesson.quizzes?.[0], [lesson]);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        // This effect will be caught in the next render cycle, so we just call onComplete.
        Promise.resolve().then(onComplete);
        return null;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;

    const handleAnswerSelect = (answer: string) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        setQuizFinished(true);
        const correctAnswers = (quiz.questions || []).reduce((acc, q, index) => {
            return userAnswers[index] === q.correctAnswer ? acc + 1 : acc;
        }, 0);

        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        if (score >= 70) {
            await awardPointsAndBadge(20, 'quiz_master'); 
        }
    };
    
    const score = useMemo(() => {
        if (!quizFinished) return 0;
        const correctAnswers = (quiz.questions || []).reduce((acc, q, index) => {
            return userAnswers[index] === q.correctAnswer ? acc + 1 : acc;
        }, 0);
        return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    }, [quizFinished, userAnswers, quiz, totalQuestions]);

    const handleContinueAfterPass = async () => {
        setIsCompleting(true);
        await onComplete();
        // The modal will close, so no need to set isCompleting to false
    };

    if (quizFinished) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in p-4">
                <div className="bg-white dark:bg-neutral-light/95 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-primary mb-4">Quiz Results</h2>
                    <p className="text-lg mb-2">You scored:</p>
                    <p className={`text-5xl font-bold mb-6 ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                        {score}%
                    </p>
                    {score >= 70 ? (
                        <p className="text-content-light dark:text-content-dark mb-6">Great job! You passed the quiz and completed the lesson.</p>
                    ) : (
                        <p className="text-content-light dark:text-content-dark mb-6">You didn't pass this time. Review the lesson and try again!</p>
                    )}
                    <button
                        onClick={score >= 70 ? handleContinueAfterPass : onClose}
                        disabled={isCompleting}
                        className="w-48 flex justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {isCompleting ? (
                             <Spinner />
                        ) : (score >= 70 ? 'Continue Learning' : 'Close and Review')}
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-neutral-light/95 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start">
                     <div>
                        <h2 className="text-2xl font-bold text-primary">{quiz.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    <h3 className="text-xl font-semibold mb-6 text-neutral-light dark:text-white">{currentQuestion.questionText}</h3>
                    <div className="space-y-3">
                        {(currentQuestion.options || []).map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                    userAnswers[currentQuestionIndex] === option
                                        ? 'bg-primary/20 border-primary'
                                        : 'bg-gray-100 dark:bg-neutral-light/10 border-gray-200 dark:border-gray-600 hover:border-primary/50'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t dark:border-gray-700 flex justify-between items-center">
                     <p className="text-sm text-gray-500">Select an answer to proceed.</p>
                     <div>
                        {currentQuestionIndex < totalQuestions - 1 ? (
                             <button
                                onClick={handleNext}
                                disabled={!userAnswers[currentQuestionIndex]}
                                className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        ) : (
                             <button
                                onClick={handleSubmit}
                                disabled={!userAnswers[currentQuestionIndex]}
                                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Submit Quiz
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizModal;