import React from 'react';
import EduBot from './EduBot';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component that conditionally renders the global EduBot assistant
 * only when a user is logged in.
 */
const GlobalAssistant: React.FC = () => {
    const { user } = useAuth();
    
    // Only show the assistant if there is an active user session.
    if (!user) {
        return null;
    }

    return <EduBot />;
};

export default GlobalAssistant;
