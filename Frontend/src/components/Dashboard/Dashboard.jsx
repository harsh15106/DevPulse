import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar.jsx';
import MetricCard from '../MetricCard/MetricCard.jsx';
import ResponseTimeChart from '../ResponseTimeChart/ResponseTimeChart.jsx';
import EventLog from '../EventLog/EventLog.jsx';
import Profile from '../Profile/Profile.jsx';
import Alerts from '../Alerts/Alerts.jsx';
import Uptime from '../Uptime/Uptime.jsx';
import ChartsPage from '../ChartsPage/ChartsPage.jsx';
import './Dashboard.css';

const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;

export default function Dashboard({ user, monitoringData, handleReset, handleLogout, theme, toggleTheme, isAuthenticated, navigateToAuth, navigateToForgotPassword }) {
    const [activeView, setActiveView] = useState('Home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeView) {
            case 'Home':
                return (
                    <>
                        <div className="metrics-grid">
                            <MetricCard title="Status" value={monitoringData.status} type="status" />
                            <MetricCard title="Uptime (24h)" value={monitoringData.uptime24h} type="uptime" />
                            <MetricCard title="Avg. Response Time" value={monitoringData.avgResponseTime} type="responseTime" />
                            <MetricCard title="SSL Expires" value={monitoringData.sslExpiry} type="sslExpiry" />
                        </div>
                        <div className="dashboard-row">
                            <ResponseTimeChart data={monitoringData.responseTimeHistory} />
                            <EventLog events={monitoringData.recentEvents} />
                        </div>
                    </>
                );
            case 'Charts':
                return <ChartsPage />;
            case 'Profile':
                // Pass the user object to the Profile component
                return <Profile user={user} navigateToForgotPassword={navigateToForgotPassword} />;
            case 'Uptime':
                return <Uptime />;
            case 'Alerts':
                return <Alerts />;
            default:
                return <div>Page not found</div>;
        }
    };

    return (
        <div className="dashboard-layout">
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
            />
            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-left">
                        <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)}>
                            <MenuIcon />
                        </button>
                        <h2>{activeView}</h2>
                        <span className="monitoring-url">{monitoringData.url}</span>
                    </div>
                    <div className="header-right">
                        <button className="header-button" onClick={handleReset}>Monitor Another Site</button>
                        <button className="icon-button"><BellIcon /></button>
                        {isAuthenticated ? (
                            <button className="auth-button" onClick={handleLogout}>Logout</button>
                        ) : (
                            <>
                                <button className="auth-button" onClick={navigateToAuth}>Login</button>
                                <button className="auth-button-secondary" onClick={navigateToAuth}>Sign Up</button>
                            </>
                        )}
                    </div>
                </header>
                <main className="dashboard-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
