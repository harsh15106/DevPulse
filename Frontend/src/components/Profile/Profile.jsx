import React, { useState, useEffect } from 'react';
import './Profile.css';
import { auth } from '../../firebase';
import { updateProfile } from 'firebase/auth';

export default function Profile({ user, navigateToForgotPassword }) {
    const [isEditMode, setIsEditMode] = useState(false);
    // Initialize state from the user prop
    const [displayName, setDisplayName] = useState(user?.displayName || 'User');
    
    // Keep local state in sync with the user prop
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || 'User');
        }
    }, [user]);

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (auth.currentUser) {
            try {
                await updateProfile(auth.currentUser, {
                    displayName: displayName
                });
                alert('Profile updated successfully!');
                setIsEditMode(false);
            } catch (error) {
                alert('Failed to update profile.');
                console.error("Error updating profile: ", error);
            }
        }
    };

    const handleCancel = () => {
        setDisplayName(user?.displayName || 'User'); // Revert changes
        setIsEditMode(false);
    };

    if (!user) {
        return <div className="profile-container">Please log in to view your profile.</div>;
    }

    // Format the creation time for "Member Since"
    const memberSince = new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="profile-container">
            <form className="profile-card" onSubmit={handleSaveChanges}>
                <div className="profile-avatar">
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="profile-info">
                    {isEditMode ? (
                        <input 
                            type="text"
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)} 
                            className="profile-name-input" 
                        />
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
                        <strong>0 / 10</strong>
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
                            <button type="button" className="profile-button-secondary" onClick={() => setIsEditMode(true)}>
                                Edit Profile
                            </button>
                            <button type="button" className="profile-button" onClick={navigateToForgotPassword}>
                                Change Password
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
