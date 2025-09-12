import React from 'react';
import './Uptime.css';

// --- Static Data for the new Uptime component ---
const uptimeData = {
    // Represents 24 hours, with 96 blocks of 15 minutes each.
    // '1' is up, '0' is down.
    timeline: [
        ...Array(60).fill(1), // Represents the first 15 hours of uptime
        0, 0,                 // Represents a 30-minute outage
        ...Array(34).fill(1), // Represents the remaining uptime
    ],
    incidents: [
        {
            status: 'Resolved',
            message: 'All systems operational.',
            timestamp: 'Sep 04, 2025, 11:30 PM',
            duration: '',
        },
        {
            status: 'Down',
            message: 'Primary server unresponsive (503 Error).',
            timestamp: 'Sep 04, 2025, 11:00 PM',
            duration: '30 min',
        },
        {
            status: 'Resolved',
            message: 'All systems operational.',
            timestamp: 'Sep 03, 2025, 08:00 AM',
            duration: '',
        },
    ],
    overallUptime: "99.86%",
};


export default function Uptime() {
    return (
        <div className="uptime-container">
            <header className="uptime-header">
                <h1>Uptime History</h1>
                <p>Monitor the availability of your service over time.</p>
            </header>

            <div className="uptime-summary-card">
                 {/* 24-Hour Status Timeline */}
                <div className="timeline-container">
                    <div className="timeline-labels">
                        <span>24 hours ago</span>
                        <span>Today</span>
                    </div>
                    <div className="timeline-bar">
                        {uptimeData.timeline.map((status, index) => (
                            <div
                                key={index}
                                className={`timeline-segment ${status === 1 ? 'up' : 'down'}`}
                                title={`Status at block ${index + 1}: ${status === 1 ? 'Operational' : 'Downtime'}`}
                            ></div>
                        ))}
                    </div>
                     <div className="overall-uptime">
                        Overall Uptime (24h): <strong>{uptimeData.overallUptime}</strong>
                    </div>
                </div>
            </div>

            {/* Incident History Log */}
            <div className="incident-history-card">
                <h2>Incident History</h2>
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
                        {uptimeData.incidents.map((incident, index) => (
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
            </div>
        </div>
    );
}

