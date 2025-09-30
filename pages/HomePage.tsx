import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import InteractiveBackground from '../components/InteractiveBackground';

const HomePage: React.FC = () => {
    return (
        <div className="relative">
            <InteractiveBackground />
            {/* The z-10 ensures the content stays above the canvas background */}
            <div className="relative z-10">
                <Hero />
                <HowItWorks />
            </div>
        </div>
    );
};

export default HomePage;