import React from 'react';

// Import child components
import MetricCard from '../MetricCard/MetricCard.jsx';
import ResponseTimeChart from '../ResponseTimeChart/ResponseTimeChart.jsx';
import EventLog from '../EventLog/EventLog.jsx';
// Import the new loader component
import { SectionLoader } from '../Loaders.jsx';

import './Home.css';

/**
 * The Home component displays the main view of the dashboard, including a
 * dropdown to select a site and a detailed view of that site's metrics.
 */
export default function Home({ sites, selectedSite, setSelectedSite, metrics, history, isLoadingMetrics }) {
    
    // Handles changing the selected site from the dropdown menu
    const handleSiteChange = (e) => {
        const newSelectedSite = sites.find(s => s.id === e.target.value);
        setSelectedSite(newSelectedSite);
    };

    return (
        <div className="home-container">
            {/* Dropdown Card for Site Selection */}
            <div className="site-selector-card dashboard-card">
                <label htmlFor="site-select">Displaying Details For:</label>
                <select
                    id="site-select"
                    value={selectedSite?.id || ''}
                    onChange={handleSiteChange}
                    disabled={!sites || sites.length === 0}
                >
                    {(sites || []).map(site => (
                        <option key={site.id} value={site.id}>
                            {site.url}
                        </option>
                    ))}
                </select>
            </div>

            {/* Details View for the selected site */}
            {selectedSite ? (
                <div className="site-details-container">
                     <div className="metrics-grid">
                        {/* Use the SectionLoader when metrics are being fetched */}
                        {isLoadingMetrics ? <SectionLoader /> : metrics ? (
                            <>
                                <MetricCard title="Status" value={metrics.status} type="status" />
                                <MetricCard title="Uptime (24h)" value={metrics.uptime24h} type="uptime" />
                                <MetricCard title="Avg. Response Time" value={metrics.avgResponseTime} type="responseTime" />
                                <MetricCard title="SSL Expires" value={metrics.sslExpiry} type="sslExpiry" />
                            </>
                        ) : <p>No real-time metrics available for this site.</p>}
                    </div>
                    <div className="dashboard-row">
                        <ResponseTimeChart data={history?.responseTimeHistory || []} />
                        <EventLog events={history?.recentEvents || []} />
                    </div>
                </div>
            ) : (
                 <div className="dashboard-card"><p>You are not monitoring any sites yet. Use the "Monitor Another Site" button to add one.</p></div>
            )}
        </div>
    );
}

