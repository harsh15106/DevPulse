import React from 'react';
import { SectionLoader } from '../Loaders.jsx';
import './ChartsPage.css';

// --- Sub-component for Response Time Statistics ---
const ResponseTimeStats = ({ stats }) => (
    <div className="stats-grid">
        <div className="stat-card">
            <span className="stat-title">Avg. Response</span>
            <span className="stat-value">{stats.avg}</span>
        </div>
        <div className="stat-card">
            <span className="stat-title">Min Response</span>
            <span className="stat-value">{stats.min}</span>
        </div>
        <div className="stat-card">
            <span className="stat-title">Max Response</span>
            <span className="stat-value">{stats.max}</span>
        </div>
        <div className="stat-card">
            <span className="stat-title">p95 Response</span>
            <span className="stat-value">{stats.p95}</span>
        </div>
    </div>
);

// --- Sub-component for the Uptime Heatmap ---
const UptimeHeatmap = ({ data }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
        <div className="heatmap-container">
            <div className="heatmap-days">
                {days.map(day => <div key={day} className="heatmap-day-label">{day}</div>)}
            </div>
            <div className="heatmap-grid">
                {data.map((day, dayIndex) => (
                    day.map((status, hourIndex) => {
                        let statusClass = 'no-data';
                        if (status === 1) statusClass = 'up';
                        if (status === 0) statusClass = 'down';
                        return <div key={`${dayIndex}-${hourIndex}`} className={`heatmap-cell ${statusClass}`} />;
                    })
                ))}
            </div>
        </div>
    );
};

export default function ChartsPage({ sites, selectedSite, setSelectedSite, analyticsData, isLoading }) {
  return (
    <div className="charts-page-container">
      <h2>Advanced Analytics</h2>
      
      <div className="chart-site-selector">
        <label htmlFor="chart-site-select">Displaying Analytics For:</label>
        <select
          id="chart-site-select"
          value={selectedSite?.id || ''}
          onChange={(e) => setSelectedSite(sites.find(s => s.id === e.target.value))}
          disabled={!sites || sites.length === 0}
        >
          {(sites || []).map(site => (
            <option key={site.id} value={site.id}>{site.url}</option>
          ))}
        </select>
      </div>

      {isLoading ? <SectionLoader /> : analyticsData ? (
        <div className="analytics-grid">
            <div className="dashboard-card chart-card">
                <h3>Response Time Stats (24h)</h3>
                <ResponseTimeStats stats={analyticsData.responseTimeStats} />
            </div>
            <div className="dashboard-card chart-card">
                <h3>Uptime Heatmap (Last 7 Days)</h3>
                <UptimeHeatmap data={analyticsData.uptimeHeatmap} />
                 <div className="heatmap-legend">
                    <span className="legend-item"><div className="legend-color up"></div>Operational</span>
                    <span className="legend-item"><div className="legend-color down"></div>Downtime</span>
                    <span className="legend-item"><div className="legend-color no-data"></div>No Data</span>
                </div>
            </div>
        </div>
      ) : <p>No analytics data available for this site.</p>}
    </div>
  );
}