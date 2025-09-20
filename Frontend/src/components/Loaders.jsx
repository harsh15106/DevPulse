import React from 'react';
import './Loaders.css';

/**
 * A full-screen loader for the initial application startup,
 * featuring the app name and a bouncing dots animation.
 */
export const MainPageLoader = () => (
    <div className="main-loader-overlay">
        <h1 className="main-loader-logo">DevPulse</h1>
        <div className="bouncing-loader">
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
);

/**
 * A smaller, inline spinner for fetching data within a section.
 */
export const SectionLoader = () => (
    <div className="section-loader-container">
        <div className="section-spinner"></div>
        <span>Loading Data...</span>
    </div>
);