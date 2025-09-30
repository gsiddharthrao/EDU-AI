import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import InteractiveBackground from '../components/InteractiveBackground';
import { useAppContext } from '../context/AppContext';

const HomePage: React.FC = () => {
    const { isAnimationEnabled } = useAppContext();
    return (
        <div className="relative">
            {isAnimationEnabled && <InteractiveBackground />}
            {/* The z-10 ensures the content stays above the canvas background */}
            <div className="relative z-10">
                <Hero />
                <HowItWorks />
            </div>
        </div>
    );
};

export default HomePage;
