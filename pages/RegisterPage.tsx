import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const RegisterPage: React.FC = () => {
  const { register, sessionLoading, authError, clearAuthError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // Local form error
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Clear any previous authentication errors when the component mounts.
    clearAuthError();
  }, [clearAuthError]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearAuthError();
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
    const { success } = await register(name, email, password);
    if (success) {
      setSuccessMessage("Success! Please check your email for a confirmation link to activate your account.");
    }
    // If not successful, the `authError` state in the context will be set and displayed.
    setIsSubmitting(false);
  };
  
  const displayError = authError || error;

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-neutral-light dark:text-white">
          Create an Account
        </h2>
        
        {successMessage ? (
            <div className="text-center">
                 <Alert type="success" message={successMessage} />
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

          {displayError && (
            <Alert 
              type="error" 
              message={displayError} 
              onClose={() => {
                setError('');
                clearAuthError();
              }}
            />
           )}
          
          <button
            type="submit"
            disabled={isSubmitting || sessionLoading}
            className="w-full flex justify-center px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
             {isSubmitting || sessionLoading ? (
                <Spinner className="-ml-1 mr-3 h-5 w-5 text-white" />
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
