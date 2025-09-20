import React, { useState, useEffect } from 'react';
import './Alerts.css';

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

/**
 * The Alerts component allows users to configure their email notification preferences.
 * @param {object} user - The current Firebase user object.
 * @param {object} settings - The user's current alert settings from the database.
 * @param {Function} onSave - A function passed from the Dashboard to save updated settings.
 */
export default function Alerts({ user, settings, onSave }) {
    // Local state to manage the form, initialized from the settings prop.
    // We use optional chaining (?.) and fallbacks to prevent errors if settings are still loading.
    const [alertsEnabled, setAlertsEnabled] = useState(settings?.alertsEnabled || true);
    const [recipientEmail, setRecipientEmail] = useState(settings?.recipientEmail || user?.email || '');
    const [alertThreshold, setAlertThreshold] = useState(settings?.alertThreshold || 1);
    
    // This effect keeps the form's state synchronized with the data loaded from the backend.
    useEffect(() => {
        if (settings) {
            setAlertsEnabled(settings.alertsEnabled);
            setRecipientEmail(settings.recipientEmail);
            setAlertThreshold(settings.alertThreshold);
        }
    }, [settings]);

    // Handles the form submission by calling the onSave function from the Dashboard.
    const handleSaveChanges = (e) => {
        e.preventDefault();
        onSave({
            alertsEnabled,
            recipientEmail,
            alertThreshold
        });
    };
    
    return (
        <div className="alerts-container">
            <form className="alerts-card" onSubmit={handleSaveChanges}>
                <div className="card-header">
                    <div className="card-icon"><MailIcon /></div>
                    <h3 className="card-title">Email Notifications</h3>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={alertsEnabled}
                            onChange={(e) => setAlertsEnabled(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
                <p className="card-description">
                    Receive an email alert when a monitored site goes down.
                </p>
                
                <div className="input-group">
                    <label htmlFor="email">Recipient Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        disabled={!alertsEnabled}
                        required
                    />
                </div>
                
                <div className="input-group">
                    <label htmlFor="threshold">Alert Threshold</label>
                    <select 
                        id="threshold" 
                        value={alertThreshold}
                        onChange={(e) => setAlertThreshold(e.target.value)}
                        disabled={!alertsEnabled}
                    >
                        <option value="0">Instantly</option>
                        <option value="1">After 1 minute of downtime</option>
                        <option value="5">After 5 minutes of downtime</option>
                        <option value="10">After 10 minutes of downtime</option>
                    </select>
                    <p className="input-description">
                        Only receive an alert if the site remains down for the selected duration.
                    </p>
                </div>
                
                <div className="save-button-container">
                    <button type="submit" className="save-button">Save Changes</button>
                </div>
            </form>
        </div>
    );
}

