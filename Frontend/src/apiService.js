import { auth } from './firebase';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * A helper function to get the current user's Firebase auth token.
 * This is included in the header of every secure API request.
 */
const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (!user) { 
        throw new Error("User not authenticated. Please log in again."); 
    }
    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

/**
 * Fetches all monitored sites for the currently logged-in user.
 */
export const getSites = async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/sites`, { method: 'GET', headers });
    if (!response.ok) { throw new Error('Failed to fetch your monitored sites.'); }
    return response.json();
};

/**
 * Adds a new site to be monitored for the current user.
 */
export const addSite = async (url) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/sites`, { method: 'POST', headers, body: JSON.stringify({ url }) });
    if (!response.ok) { 
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add the new site.'); 
    }
    return response.json();
};

/**
 * Deletes a monitored site for the current user.
 */
export const deleteSite = async (siteId) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}`, { method: 'DELETE', headers });
    if (!response.ok) { throw new Error('Failed to delete the site.'); }
    return response.json();
};

/**
 * Fetches the latest real-time metrics (Status, Uptime, etc.) for a single site.
 */
export const getSiteMetrics = async (siteId) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/metrics`, { method: 'GET', headers });
    if (!response.ok) { throw new Error('Failed to fetch site metrics.'); }
    return response.json();
};

/**
 * Fetches the historical data (for charts and logs) for a single site.
 */
export const getSiteHistory = async (siteId) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/history`, { method: 'GET', headers });
    if (!response.ok) { throw new Error('Failed to fetch site history.'); }
    return response.json();
};

/**
 * Fetches advanced analytics data for the Charts page.
 */
export const getSiteAnalytics = async (siteId) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/analytics`, { method: 'GET', headers });
    if (!response.ok) {
        throw new Error('Failed to fetch site analytics.');
    }
    return response.json();
};