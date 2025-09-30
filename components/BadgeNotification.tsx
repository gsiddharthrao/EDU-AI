import React from 'react';
import { useAppContext } from '../context/AppContext';

const BadgeNotification: React.FC = () => {
    const { notification, hideNotification } = useAppContext();

    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (notification) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [notification]);

    return (
        <div 
            aria-live="assertive" 
            className="fixed inset-0 flex items-start justify-end p-6 pointer-events-none z-50"
        >
            <div 
                className={`
                    max-w-sm w-full bg-white dark:bg-neutral-light/95 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
                    transform-gpu transition-all duration-300 ease-in-out
                    ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                `}
            >
                {notification && (
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 text-4xl">
                                {notification.icon}
                            </div>
                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className="text-sm font-bold text-neutral-light dark:text-white">New Badge Unlocked!</p>
                                <p className="mt-1 text-sm font-semibold text-primary dark:text-secondary">{notification.name}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                                <button
                                    onClick={hideNotification}
                                    className="inline-flex text-gray-400 dark:text-gray-500 rounded-md hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BadgeNotification;
