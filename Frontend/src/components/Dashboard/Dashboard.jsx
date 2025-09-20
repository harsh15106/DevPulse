import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Import all child components
import Sidebar from '../Sidebar/Sidebar.jsx';
import Home from '../Home/Home.jsx';
import Profile from '../Profile/Profile.jsx';
import Uptime from '../Uptime/Uptime.jsx';
import ChartsPage from '../ChartsPage/ChartsPage.jsx';
import { SectionLoader } from '../Loaders.jsx';

// Import all necessary API functions
import { 
    getSiteMetrics, 
    getSiteHistory, 
    deleteSite, 
    getSiteAnalytics
} from '../../apiService.js';

import './Dashboard.css';

const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

export default function Dashboard({ user, sites, fetchSites, handleReset, handleLogout, theme, toggleTheme }) {
    const [activeView, setActiveView] = useState('Home');
    const [isSidebarOpen, setIsOpen] = useState(false);
    
    // State for data management
    const [selectedSite, setSelectedSite] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to select the first site by default
    useEffect(() => {
        if (!selectedSite && sites && sites.length > 0) {
            setSelectedSite(sites[0]);
        }
    }, [sites, selectedSite]);

    // Effect to fetch all data for the currently selected site
    useEffect(() => {
        const fetchAllDataForSite = async () => {
            if (!selectedSite) {
                setMetrics(null);
                setHistory(null);
                setAnalyticsData(null);
                return;
            }
            setIsLoading(true);
            try {
                // Fetch all data types in parallel for maximum speed
                const [fetchedMetrics, fetchedHistory, fetchedAnalytics] = await Promise.all([
                    getSiteMetrics(selectedSite.id),
                    getSiteHistory(selectedSite.id),
                    getSiteAnalytics(selectedSite.id)
                ]);
                setMetrics(fetchedMetrics);
                setHistory(fetchedHistory);
                setAnalyticsData(fetchedAnalytics);
            } catch (error) {
                console.error("Failed to fetch data for site:", error);
                toast.error("Could not load all site data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllDataForSite();
    }, [selectedSite]);

    // Function to handle deleting a site
    const handleDeleteSite = (siteIdToDelete, siteUrl) => {
        const handleConfirm = async () => {
            try {
                await deleteSite(siteIdToDelete);
                toast.success(`'${siteUrl}' was deleted successfully.`);
                fetchSites();
            } catch (error) {
                toast.error("Could not delete the site. Please try again.");
                console.error("Failed to delete site:", error);
            }
        };
        const ConfirmToast = ({ closeToast }) => (
            <div>
                <p>Are you sure you want to remove '{siteUrl}'?</p>
                <button className="toast-button" onClick={() => { handleConfirm(); closeToast(); }}>Yes, remove</button>
                <button className="toast-button-secondary" onClick={closeToast}>Cancel</button>
            </div>
        );
        toast.warn(<ConfirmToast />, { position: "top-center", autoClose: false, closeOnClick: false, draggable: false });
    };

    // Renders the main content area based on the selected view
    const renderContent = () => {
        switch (activeView) {
            case 'Home':
                return <Home 
                            sites={sites}
                            selectedSite={selectedSite}
                            setSelectedSite={setSelectedSite}
                            metrics={metrics}
                            history={history}
                            isLoadingMetrics={isLoading}
                            handleDeleteSite={handleDeleteSite}
                        />;
            case 'Charts': 
                return <ChartsPage 
                            sites={sites}
                            selectedSite={selectedSite}
                            setSelectedSite={setSelectedSite}
                            analyticsData={analyticsData}
                            isLoading={isLoading}
                        />;
            case 'Profile': 
                return <Profile user={user} sites={sites} fetchSites={fetchSites} />;
            case 'Uptime': 
                return <Uptime 
                            sites={sites}
                            selectedSite={selectedSite}
                            setSelectedSite={setSelectedSite}
                            history={history}
                            isLoading={isLoading}
                            metrics={metrics}
                        />;
            default: 
                return <h2>Page not found</h2>;
        }
    };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`} onClick={() => setIsOpen(false)}></div>
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsOpen} 
                theme={theme} 
                toggleTheme={toggleTheme} 
            />
            <div className="dashboard-main">
                <header className="dashboard-header">
                    <button className="mobile-menu-button" onClick={() => setIsOpen(true)}>
                        <MenuIcon />
                    </button>
                    <h2>{activeView}</h2>
                    <div className="header-right">
                        <button className="header-button" onClick={handleReset}>Monitor Another Site</button>
                        <button className="auth-button" onClick={handleLogout}>Logout</button>
                    </div>
                </header>
                <main className="dashboard-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}