// src/components/EventLog/EventLog.jsx
import React from 'react';
import './EventLog.css';

export default function EventLog({ events }) {
    const getStatusChip = (status) => {
        const statusClass = `status-chip status-${status.toLowerCase()}`;
        return <span className={statusClass}>{status}</span>;
    };
    return (
        <div className="dashboard-card">
            <h3>Recent Events</h3>
            <div className="log-list">
                {(!events || events.length === 0) ? (
                    <div className="log-placeholder">No recent events.</div>
                ) : (
                    events.map((event, index) => (
                        <div key={index} className="log-item">
                            <div className="log-details">
                                {getStatusChip(event.status)}
                                <p className="log-message">{event.message}</p>
                            </div>
                            <div className="log-time-details">
                                <p className="log-time">{event.time}</p>
                                {event.duration && <p className="log-duration">{event.duration}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}