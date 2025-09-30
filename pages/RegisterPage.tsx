import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AlertTriangle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const RegisterPage: React.FC = () => {
  const { register, sessionLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const { error: authError } = await register(name, email, password);

        if (authError) {
          setError(authError.message);
        } else {
          // Set a clear success message for the user.
          setSuccessMessage("Success! Please check your email for a confirmation link to activate your account.");
          // Don't navigate away, let the user see the message.
        }
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-neutral-light dark:text-white">
          Create an Account
        </h2>
        
        {successMessage ? (
            <div className="text-center">
                 <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg" role="alert">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{successMessage}</span>
                </div>
                <p className="mt-4 text-sm">
                    Already confirmed?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Click here to login.
                    </Link>
                </p>
            </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input 
              type="text" 
              id="fullname" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
              required
            />
          </div>
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
            </div>
           )}
          
          <button
            type="submit"
            disabled={isSubmitting || sessionLoading}
            className="w-full flex justify-center px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
             {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             ) : 'Register'}
          </button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
                Login here
            </Link>
          </p>
        </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;