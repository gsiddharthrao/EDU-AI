import React from 'react';
import { useAppContext } from '../context/AppContext';

const HowItWorks: React.FC = () => {
    const { translate } = useAppContext();

    const steps = [
        {
            icon: '🎯',
            title: translate('step_1_title'),
            description: translate('step_1_desc'),
        },
        {
            icon: '🗺️',
            title: translate('step_2_title'),
            description: translate('step_2_desc'),
        },
        {
            icon: '🌱',
            title: translate('step_3_title'),
            description: translate('step_3_desc'),
        },
    ];

    return (
        <section className="py-20 bg-background-light dark:bg-background-dark">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-neutral-light dark:text-white">
                    {translate('how_it_works_title')}
                </h2>
                <div className="grid md:grid-cols-3 gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center p-6 bg-white dark:bg-neutral-light/20 rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-5xl mb-4">{step.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-neutral-light dark:text-gray-200">{step.title}</h3>
                            <p className="text-content-light dark:text-content-dark">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
