import React from 'react';

const AlertTriangle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

interface AlertProps {
    message: string;
    type: 'error' | 'success';
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    const isError = type === 'error';

    const baseClasses = "flex items-center justify-between space-x-2 px-4 py-3 rounded-lg animate-fade-in";
    const typeClasses = isError 
        ? "bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300"
        : "bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300";

    const Icon = isError ? AlertTriangle : CheckCircle;

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{message}</span>
            </div>
            {onClose && (
                <button 
                    onClick={onClose} 
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    aria-label="Close alert"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            )}
        </div>
    );
};

export default Alert;
