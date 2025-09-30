import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold text-primary mb-4">Terms of Service</h1>
      <p className="mb-4 text-content-light dark:text-content-dark">
        By using our service, you agree to these terms. This is a placeholder for your terms of service. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text.
      </p>
       <p className="mb-4 text-content-light dark:text-content-dark">
        A search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
      </p>
    </div>
  );
};

export default TermsOfServicePage;
