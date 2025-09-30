import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { NAV_LINKS } from '../constants';

const Sun: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path></svg>
);

const Moon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
);

const Globe: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
);

const Zap: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

const ZapOff: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m13.2 2-10 12h9l-1.2 8 10-12h-9z"></path><path d="m2 2 20 20"></path></svg>
);


const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, language, setLanguage, isAnimationEnabled, toggleAnimation } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as 'en' | 'hi' | 'ta');
    };

    return (
        <nav className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm sticky top-0 z-40 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        EDU-AI
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {NAV_LINKS.map(link => {
                            if (link.name === 'Dashboard' && !user) return null;
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) => 
                                        `text-lg font-medium transition-colors ${
                                            isActive 
                                            ? 'text-primary dark:text-secondary' 
                                            : 'text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-secondary'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            );
                        })}
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="relative">
                           <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                            <select 
                                value={language} 
                                onChange={handleLanguageChange}
                                className="pl-8 pr-2 py-1.5 bg-gray-100 dark:bg-neutral-light/20 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                aria-label="Select language"
                            >
                                <option value="en">EN</option>
                                <option value="hi">HI</option>
                                <option value="ta">TA</option>
                            </select>
                        </div>

                        <button onClick={toggleAnimation} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-light/20 transition-colors" aria-label={isAnimationEnabled ? 'Disable background animation' : 'Enable background animation'}>
                            {isAnimationEnabled ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6 text-red-500" />}
                        </button>

                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-light/20 transition-colors" aria-label="Toggle dark mode">
                            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="font-semibold hidden sm:block">{user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-2">
                                <Link to="/login" className="px-4 py-2 font-semibold text-primary rounded-lg hover:bg-primary/10 transition-colors">Login</Link>
                                <Link to="/register" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
