
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in">
      <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
      <div className="bg-secondary px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <p className="mt-4 text-lg text-content-light dark:text-content-dark">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
