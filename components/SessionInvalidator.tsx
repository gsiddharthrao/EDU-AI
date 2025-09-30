import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const SessionInvalidator: React.FC = () => {
    const { logout } = useAuth();

    useEffect(() => {
        // This component's purpose is to inform the user and then clean up the session.
        // We give the user a moment to see the message before logging out and redirecting.
        const timer = setTimeout(() => {
            logout().then(() => {
                // After logout, the onAuthStateChange listener will clear the user state,
                // causing the app to navigate to the login page via ProtectedRoute logic or manual redirect.
                // A hard redirect is still the most robust way to ensure a clean slate.
                window.location.href = '/#/login';
            });
        }, 2500); // 2.5 second delay

        return () => clearTimeout(timer);
    }, [logout]);

    return (
        <div className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm flex flex-col justify-center items-center z-[100] animate-fade-in">
            <div className="text-center p-8 bg-white dark:bg-neutral-light/20 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">Session Expired</h2>
                <p className="text-content-light dark:text-content-dark mb-6">
                    Your session is invalid or has expired. We're redirecting you to the login page.
                </p>
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        </div>
    );
};

export default SessionInvalidator;
