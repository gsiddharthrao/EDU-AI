import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-background-light dark:bg-neutral-light/20 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} EDU-AI. All Rights Reserved.</p>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/about" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-secondary transition-colors">About Us</Link>
                        <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-secondary transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-secondary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
