import React, { useState, useEffect } from 'react';
import './index.css';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import LandingPage from './components/LandingPage/LandingPage.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import AuthPage from './components/AuthPage/AuthPage.jsx';

export default function App() {
    // --- App State ---
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [currentView, setCurrentView] = useState('landing');
    const [authInitialView, setAuthInitialView] = useState('login');
    const [successMessage, setSuccessMessage] = useState('');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [monitoringData, setMonitoringData] = useState(null);
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Theme State ---
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    // --- Real-time Authentication Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) { // If the user is logged in
                if (!user) { // And they were not logged in before
                    setSuccessMessage('Login successful!');
                    setCurrentView('landing'); // <-- This redirects to the landing page
                }
                setUser(currentUser);
            } else { // If the user is logged out
                setUser(null);
            }
            setIsLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [user]);

    // --- Navigation Functions ---
    const navigateToAuth = (initialView = 'login') => {
        setAuthInitialView(initialView);
        setCurrentView('auth');
    };

    const navigateToLanding = () => {
        setCurrentView('landing');
    };
    
    const navigateToForgotPassword = () => {
        setMonitoringData(null);
        setAuthInitialView('forgotPassword');
        setCurrentView('auth');
    };

    // --- Auth Functions ---
    const handleLogout = () => {
        auth.signOut();
        setMonitoringData(null);
        setCurrentView('landing');
    };
    
    // --- Monitoring Functions ---
    const handleStartMonitoring = (e) => {
        e.preventDefault();
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
            setError('Please enter a website URL.');
            return;
        }
        let formattedUrl = trimmedUrl;
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const mockData = {
                url: formattedUrl, status: 'Operational', uptime24h: '99.98%', avgResponseTime: '128ms', sslExpiry: 'in 82 days',
                responseTimeHistory: [ { time: '24h ago', ms: 120 }, { time: '22h ago', ms: 110 }, { time: '20h ago', ms: 130 }, { time: '18h ago', ms: 115 }, { time: '16h ago', ms: 140 }, { time: '14h ago', ms: 122 }, { time: '12h ago', ms: 135 }, { time: '10h ago', ms: 98 }, { time: '8h ago', ms: 112 }, { time: '6h ago', ms: 150 }, { time: '4h ago', ms: 128 }, { time: '2h ago', ms: 133 }, { time: 'Now', ms: 128 }, ],
                recentEvents: [ { time: '10 min ago', status: 'UP', message: 'Site is back online.' }, { time: '14 min ago', status: 'DOWN', message: 'Server unresponsive (503).', duration: '4 min' }, { time: '2 hours ago', status: 'UP', message: 'Monitoring started.' }, ]
            };
            setMonitoringData(mockData);
            setIsLoading(false);
        }, 1500);
    };

    const handleReset = () => {
        setMonitoringData(null);
        setUrl('');
        setError('');
    };

    // --- RENDER LOGIC ---
    const renderCurrentPage = () => {
        if (isLoadingAuth) {
            return <div>Loading...</div>;
        }
        
        const isAuthenticated = !!user;

        if (currentView === 'auth') {
            return <AuthPage 
                        initialView={authInitialView} 
                        theme={theme} 
                        toggleTheme={toggleTheme}
                        navigateToLanding={navigateToLanding}
                    />;
        }
        
        if (monitoringData) {
            return (
                <Dashboard
                    user={user}
                    isAuthenticated={isAuthenticated}
                    navigateToAuth={navigateToAuth}
                    navigateToForgotPassword={navigateToForgotPassword}
                    monitoringData={monitoringData}
                    handleReset={handleReset}
                    handleLogout={handleLogout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            );
        }
        
        return (
            <LandingPage
                isAuthenticated={isAuthenticated}
                navigateToAuth={navigateToAuth}
                handleLogout={handleLogout}
                url={url}
                setUrl={setUrl}
                handleStartMonitoring={handleStartMonitoring}
                isLoading={isLoading}
                error={error}
                theme={theme}
                toggleTheme={toggleTheme}
                showLoginPrompt={showLoginPrompt}
                setShowLoginPrompt={setShowLoginPrompt}
                successMessage={successMessage}
                setSuccessMessage={setSuccessMessage}
            />
        );
    };

    return <div className="app-container">{renderCurrentPage()}</div>;
}

