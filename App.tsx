import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './components/NotFound';
import GlobalAssistant from './components/GlobalAssistant';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import BadgeNotification from './components/BadgeNotification';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, sessionLoading } = useAuth();

    if (sessionLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="text-lg font-semibold">Loading session...</div></div>;
    }

    return user ? children : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark transition-colors duration-300">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </div>
            {/* Overlays are placed here to ensure they are not trapped in a lower stacking context */}
            <GlobalAssistant />
            <BadgeNotification />
        </>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppProvider>
                <Router>
                    <AppContent />
                </Router>
            </AppProvider>
        </AuthProvider>
    );
};

export default App;