import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/StudentDashboard';
import TrainerDashboard from '../components/TrainerDashboard';
import AdminDashboard from '../components/AdminDashboard';

const DashboardPage: React.FC = () => {
    const { user, sessionLoading } = useAuth();

    if (sessionLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="text-lg font-semibold">Loading dashboard...</div></div>;
    }

    if (!user) {
        // This case should ideally be handled by ProtectedRoute, but as a fallback:
        return <div className="text-center py-12"><p>Please log in to view your dashboard.</p></div>;
    }

    switch (user.role) {
        case 'student':
            return <StudentDashboard />;
        case 'trainer':
            return <TrainerDashboard />;
        case 'admin':
            return <AdminDashboard />;
        default:
            return <div className="text-center py-12"><p>Unknown user role. Please contact support.</p></div>;
    }
};

export default DashboardPage;