import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold text-primary mb-4">About EDU-AI</h1>
      <p className="mb-4 text-content-light dark:text-content-dark">
        EDU-AI is a revolutionary AI-driven platform designed to generate dynamic, personalized learning paths for vocational learners in India. Our mission is to bridge the gap between education and employment by providing industry-aligned training that is accessible, adaptable, and effective.
      </p>
      <h2 className="text-2xl font-semibold text-neutral-light dark:text-white mb-2">Our Vision</h2>
      <p className="mb-4 text-content-light dark:text-content-dark">
        We leverage cutting-edge AI, including Google's Gemini models, to analyze real-time labor market data and the National Skills Qualification Framework (NSQF). This allows us to create learning journeys that are not only personalized to each student's skills and career aspirations but are also highly relevant to the current job market.
      </p>
      <h2 className="text-2xl font-semibold text-neutral-light dark:text-white mb-2">Key Features</h2>
      <ul className="list-disc list-inside space-y-2 text-content-light dark:text-content-dark">
        <li>AI-Powered Path Generation: Instantly create learning paths tailored to your goals.</li>
        <li>Interactive Learning: Engage with modules, lessons, and quizzes to track your progress.</li>
        <li>Gamification: Earn points and badges to stay motivated on your learning journey.</li>
        <li>Context-Aware AI Assistants: Get help from EduBot and our Global Assistant anytime.</li>
        <li>Role-Based Dashboards: A tailored experience for students, trainers, and administrators.</li>
      </ul>
    </div>
  );
};

export default AboutPage;
