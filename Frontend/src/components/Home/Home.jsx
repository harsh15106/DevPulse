import React from 'react';
import './Home.css';

// --- SVG Icon ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;

export default function Home({ monitoringData }) {
    const siteStatus = monitoringData?.status || 'Loading...';
    
    return (
        <div className="home-container">
            <div className="welcome-card">
                <div className="welcome-icon">
                    <CheckCircleIcon />
                </div>
                <h2 className="welcome-title">Welcome to your Dashboard</h2>
                <p className="welcome-subtitle">
                    Everything looks good. Your site <strong className="site-url">{monitoringData.url}</strong> is currently <strong className="site-status">{siteStatus}</strong>.
                </p>
                <p className="welcome-info">
                    You can navigate using the sidebar to view detailed charts, uptime history, and manage alerts.
                </p>
            </div>
        </div>
    );
}
