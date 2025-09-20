import React, { useState, useEffect } from 'react';
import './Profile.css';
import { auth } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import { deleteSite } from '../../apiService';

// The component accepts 'fetchSites' as a prop to refresh the list after a deletion
export default function Profile({ user, sites, fetchSites, navigateToForgotPassword }) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || 'User');
    
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || 'User');
        }
    }, [user]);

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        const promise = updateProfile(auth.currentUser, { displayName });
        toast.promise(promise, {
            pending: 'Updating profile...',
            success: 'Profile updated successfully!',
            error: 'Failed to update profile.'
        });
        setIsEditMode(false);
    };

    const handleCancel = () => {
        setDisplayName(user?.displayName || 'User');
        setIsEditMode(false);
    };

    // This function handles deleting a site with a confirmation toast
    const handleDeleteSite = (siteIdToDelete, siteUrl) => {
        const handleConfirm = async () => {
            try {
                await deleteSite(siteIdToDelete);
                toast.success(`'${siteUrl}' was deleted successfully.`);
                fetchSites(); // Refresh the sites list
            } catch (error) {
                toast.error("Could not delete the site. Please try again.");
                console.error("Failed to delete site:", error);
            }
        };

        // Custom component for the confirmation toast
        const ConfirmToast = ({ closeToast }) => (
            <div>
                <p>Delete '{siteUrl}' permanently?</p>
                <button className="toast-button" onClick={() => { handleConfirm(); closeToast(); }}>Delete</button>
                <button className="toast-button-secondary" onClick={closeToast}>Cancel</button>
            </div>
        );

        // Trigger the confirmation toast
        toast.warn(<ConfirmToast />, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
        });
    };

    if (!user) {
        return <div className="profile-container">Please log in to view your profile.</div>;
    }

    const memberSince = new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="profile-container">
            <div className="profile-card">
                <form onSubmit={handleSaveChanges}>
                    <div className="profile-avatar">
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="profile-info">
                        {isEditMode ? (
                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="profile-name-input" />
                        ) : (
                            <h3>{displayName}</h3>
                        )}
                        <p>{user.email}</p>
                    </div>
                    <div className="profile-details">
                        <div className="detail-item">
                            <span>Member Since</span>
                            <strong>{memberSince}</strong>
                        </div>
                        <div className="detail-item">
                            <span>Monitored Sites</span>
                            <strong>{sites ? sites.length : 0} / 5</strong>
                        </div>
                    </div>
                    <div className="profile-actions">
                        {isEditMode ? (
                            <>
                                <button type="button" className="profile-button-secondary" onClick={handleCancel}>Cancel</button>
                                <button type="submit" className="profile-button">Save Changes</button>
                            </>
                        ) : (
                            <>
                                <button type="button" className="profile-button-secondary" onClick={() => setIsEditMode(true)}>Edit Profile</button>
                                <button type="button" className="profile-button" onClick={navigateToForgotPassword}>Change Password</button>
                            </>
                        )}
                    </div>
                </form>

                <div className="profile-sites-section">
                    <h2>All Monitored Websites</h2>
                    {sites && sites.length > 0 ? (
                        <ul className="profile-sites-list">
                            {sites.map(site => (
                                <li key={site.id} className="profile-site-item">
                                    <span className="profile-site-url">{site.url}</span>
                                    {isEditMode && (
                                        <button 
                                            type="button" 
                                            className="profile-site-delete" 
                                            onClick={() => handleDeleteSite(site.id, site.url)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-sites-message">You are not monitoring any websites.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
