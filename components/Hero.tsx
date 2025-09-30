
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Hero: React.FC = () => {
    const { translate } = useAppContext();
    return (
        <div className="text-center py-20 md:py-32 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-light dark:text-white leading-tight mb-4">
                {translate('hero_title_1')} <span className="text-primary">{translate('hero_title_2')}</span> {translate('hero_title_3')} <span className="text-secondary">{translate('hero_title_4')}</span>
            </h1>
            <p className="text-lg md:text-xl text-content-light dark:text-content-dark max-w-3xl mx-auto mb-8">
                {translate('hero_subtitle')}
            </p>
            <Link to="/register" className="inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300">
                {translate('hero_cta')}
            </Link>
        </div>
    );
};

export default Hero;