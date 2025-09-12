import React, { useEffect } from 'react';
import './LandingPage.css';

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

export default function LandingPage({
    isAuthenticated,
    navigateToAuth,
    handleLogout,
    url,
    setUrl,
    handleStartMonitoring,
    isLoading,
    error,
    theme,
    toggleTheme,
    showLoginPrompt,
    setShowLoginPrompt,
    successMessage,    // NEW PROP
    setSuccessMessage, // NEW PROP
}) {

    // NEW: Effect to clear the success message after a few seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000); // Message will disappear after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [successMessage, setSuccessMessage]);


    return (
        <div className="landing-page-container">
            {/* NEW: Success Message Banner */}
            {successMessage && <div className="success-banner">{successMessage}</div>}

            <header className="landing-header">
                <div className="logo-container">
                    <h1>DevPulse</h1>
                </div>
                <div className="header-actions">
                    <button className="theme-toggle-landing" onClick={toggleTheme}>
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                    {isAuthenticated ? (
                        <button className="auth-button" onClick={handleLogout}>Logout</button>
                    ) : (
                        <>
                            <button className="auth-button" onClick={() => navigateToAuth('login')}>Login</button>
                            <button className="auth-button-secondary" onClick={() => navigateToAuth('signup')}>Sign Up</button>
                        </>
                    )}
                </div>
            </header>

            <main className="landing-content">
                <h2 className="tagline">Real-Time Insights, Effortless Monitoring.</h2>
                <p className="description">
                    Enter any website URL to instantly check its uptime, response time, and performance metrics.
                </p>

                <form className="monitor-form" onSubmit={handleStartMonitoring}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g., google.com"
                        className="url-input"
                        disabled={isLoading}
                    />
                    <button type="submit" className="monitor-button" disabled={isLoading}>
                        {isLoading ? 'Checking...' : 'Monitor Site'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </main>

            {showLoginPrompt && (
                <div className="login-prompt-overlay" onClick={() => setShowLoginPrompt(false)}>
                    <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Login Required</h3>
                        <p>Please log in or create an account to monitor a website.</p>
                        <div className="prompt-buttons">
                            <button className="prompt-button-secondary" onClick={() => setShowLoginPrompt(false)}>
                                Close
                            </button>
                            <button className="prompt-button-primary" onClick={() => {
                                setShowLoginPrompt(false);
                                navigateToAuth('login');
                            }}>
                                Login / Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
