import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const LoginPage: React.FC = () => {
    const { login, sessionLoading, user, authError, clearAuthError } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // If the user is already logged in, redirect them to the dashboard.
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        // Clear any previous authentication errors when the component mounts.
        clearAuthError();
    }, [clearAuthError]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            return; // Basic validation, can be enhanced
        }

        setIsSubmitting(true);
        await login(email, password);
        // The onAuthStateChange listener in AuthContext will handle navigation on success
        // or setting an error message on failure.
        setIsSubmitting(false);
    };

    return (
        <div className="flex items-center justify-center py-12 animate-fade-in">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-neutral-light dark:text-white">
                    Login to Your Account
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    
                    {authError && (
                        <Alert type="error" message={authError} onClose={clearAuthError} />
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || sessionLoading}
                            className="w-full flex justify-center px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting || sessionLoading ? (
                                <Spinner className="-ml-1 mr-3 h-5 w-5 text-white" />
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary hover:underline">
                            Register here
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500">
                        (Use any email and password for registration)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
