import React from 'react';
import './Alerts.css';

// --- SVG Icons ---
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

export default function Alerts() {
    return (
        <div className="alerts-container">
            <div className="alerts-card">
                <div className="card-header">
                    <div className="card-icon"><MailIcon /></div>
                    <h3 className="card-title">Email Notifications</h3>
                    <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider round"></span>
                    </label>
                </div>
                <p className="card-description">
                    Receive email alerts when your site goes down and when it comes back up.
                </p>
                <div className="input-group">
                    <label htmlFor="email">Recipient Email</label>
                    <input type="email" id="email" defaultValue="user@example.com" />
                </div>
                
                {/* --- NEW: Alert Threshold Section --- */}
                <div className="input-group">
                    <label htmlFor="threshold">Alert Threshold</label>
                    <select id="threshold" defaultValue="1">
                        <option value="0">Instantly</option>
                        <option value="1">After 1 minute of downtime</option>
                        <option value="5">After 5 minutes of downtime</option>
                        <option value="10">After 10 minutes of downtime</option>
                    </select>
                    <p className="input-description">
                        Only receive an alert if the site remains down for the selected duration.
                    </p>
                </div>
            </div>

            <div className="save-button-container">
                 <button className="save-button">Save Changes</button>
            </div>
        </div>
    );
}

