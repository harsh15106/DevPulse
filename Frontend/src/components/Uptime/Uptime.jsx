import React from 'react';
import './Uptime.css';

/**
 * Uptime component displays the historical uptime data for a selected site.
 * @param {Array} sites - The list of all monitored sites for the user.
 * @param {object} selectedSite - The currently selected site object.
 * @param {Function} setSelectedSite - Function to change the selected site.
 * @param {object} history - Object containing historical data (timeline, events).
 * @param {boolean} isLoading - Flag indicating if data is being fetched.
 * @param {object} metrics - Object containing the latest calculated metrics (like uptime %).
 */
export default function Uptime({ sites, selectedSite, setSelectedSite, history, isLoading, metrics }) {
  // Safely access data, providing empty arrays as fallbacks to prevent crashes
  const timeline = history?.uptimeTimeline || [];
  const incidents = history?.recentEvents || [];

  return (
    <div className="uptime-container">
      <header className="uptime-header">
        <h1>Uptime History</h1>
        <p>Review the availability of your service over the last 24 hours.</p>
      </header>
      
      {/* Dropdown to select which site's data to view */}
      <div className="chart-site-selector">
        <label htmlFor="uptime-site-select">Displaying Uptime For:</label>
        <select
          id="uptime-site-select"
          value={selectedSite?.id || ''}
          onChange={(e) => {
            const newSelectedSite = sites.find(s => s.id === e.target.value);
            setSelectedSite(newSelectedSite);
          }}
          disabled={!sites || sites.length === 0}
        >
          {(sites || []).map(site => (
            <option key={site.id} value={site.id}>
              {site.url}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional rendering based on loading state */}
      {isLoading ? <p className="loading-text">Loading uptime data...</p> : (
        <>
          <div className="uptime-summary-card">
            <div className="timeline-container">
              <div className="timeline-labels">
                <span>24 hours ago</span>
                <span>Today</span>
              </div>
              <div className="timeline-bar">
                {timeline.length > 0 ? (
                  timeline.map((status, index) => (
                    <div
                      key={index}
                      className={`timeline-segment ${status === 1 ? 'up' : 'down'}`}
                      title={`Status: ${status === 1 ? 'Operational' : 'Downtime'}`}
                    ></div>
                  ))
                ) : <p className="no-data-text">No timeline data available for this period.</p>}
              </div>
              <div className="overall-uptime">
                Overall Uptime (24h): <strong>{metrics?.uptime24h || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div className="incident-history-card">
            <h2>Incident History</h2>
            {incidents.length > 0 ? (
              <table className="incident-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Event</th>
                    <th>Timestamp</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`status-badge ${incident.status.toLowerCase()}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td>{incident.message}</td>
                      <td>{incident.timestamp}</td>
                      <td>{incident.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No incidents recorded in the last 24 hours.</p>}
          </div>
        </>
      )}
    </div>
  );
}