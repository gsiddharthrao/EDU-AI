
import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, studentName, onClose }) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Feedback for ${studentName}: ${feedback}`);
    alert('Feedback submitted! (Check console for details)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-neutral-light/95 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Provide Feedback for {studentName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-40 p-3 mt-1 block bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Enter your feedback here..."
            required
          />
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
