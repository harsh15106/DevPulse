import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addSite, getSites } from './apiService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPage from './components/LandingPage/LandingPage.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import AuthPage from './components/AuthPage/AuthPage.jsx';
// ✅ 1. Import the new loader component
import { MainPageLoader } from './components/Loaders.jsx'; 

import './index.css';

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [currentView, setCurrentView] = useState('landing');
    const [sites, setSites] = useState([]);
    const [urlToAdd, setUrlToAdd] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));

    const fetchSites = async () => {
        if (!auth.currentUser) return;
        try {
            const userSites = await getSites();
            setSites(userSites);
        } catch (error) {
            console.error("Failed to fetch sites:", error);
            setError("Could not load your sites. Please try again later.");
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setIsLoadingAuth(true);
            if (currentUser) {
                setUser(currentUser);
                fetchSites().then(() => {
                    setCurrentView('dashboard');
                    setIsLoadingAuth(false);
                });
            } else {
                setUser(null);
                setSites([]);
                setCurrentView('landing');
                setIsLoadingAuth(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleStartMonitoring = async (e) => {
        e.preventDefault();
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
        const trimmedUrl = urlToAdd.trim();
        if (!trimmedUrl) {
            setError('Please enter a website URL.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            await addSite(trimmedUrl);
            setUrlToAdd('');
            await fetchSites();
            setCurrentView('dashboard');
        } catch (apiError) {
            setError(apiError.message);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToAuth = () => setCurrentView('auth');
    const navigateToLanding = () => setCurrentView('landing');
    const handleLogout = () => auth.signOut();
    const handleReset = () => {
        setUrlToAdd('');
        setError('');
        setCurrentView('landing');
    };

    const renderCurrentPage = () => {
        // ✅ 2. Use the new full-screen loader during the initial auth check
        if (isLoadingAuth) {
            return <MainPageLoader />;
        }

        if (currentView === 'dashboard') {
            return <Dashboard
                user={user}
                sites={sites}
                fetchSites={fetchSites}
                handleReset={handleReset}
                handleLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
            />;
        }
        
        if (currentView === 'auth') {
            return <AuthPage 
                navigateToLanding={navigateToLanding}
                theme={theme}
                toggleTheme={toggleTheme}
            />;
        }
        
        return <LandingPage
            isAuthenticated={!!user}
            navigateToAuth={navigateToAuth}
            handleLogout={handleLogout}
            url={urlToAdd}
            setUrl={setUrlToAdd}
            handleStartMonitoring={handleStartMonitoring}
            isLoading={isLoading}
            error={error}
            theme={theme}
            toggleTheme={toggleTheme}
            showLoginPrompt={showLoginPrompt}
            setShowLoginPrompt={setShowLoginPrompt}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
        />;
    };

    return (
        <div className="app-container">
            {renderCurrentPage()}
            <ToastContainer
                position="bottom-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}

