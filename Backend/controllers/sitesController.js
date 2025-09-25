const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const axios = require('axios');
const getSslDetails = require('ssl-checker');

// ✅ This line gets the Prometheus server URL from an environment variable.
// If the variable isn't set, it defaults to localhost for local development.
const PROMETHEUS_BASE_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';

/**
 * @desc    Get all monitored sites for the logged-in user
 * @route   GET /api/sites
 * @access  Private
 */
const getSites = async (req, res) => {
    try {
        const db = getDB();
        const sitesFromDB = await db.collection('sites').find({ userId: req.user.uid }).toArray();
        const formattedSites = sitesFromDB.map(site => ({
            id: site._id,
            url: site.url,
            userId: site.userId
        }));
        res.status(200).json(formattedSites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ message: 'Error fetching sites' });
    }
};

/**
 * @desc    Add a new site to monitor, with a 5-site limit
 * @route   POST /api/sites
 * @access  Private
 */
const addSite = async (req, res) => {
    let { url } = req.body; // Use 'let' so we can modify it
    if (!url) { return res.status(400).json({ message: 'URL is required' }); }

    // ✅ FIX: Automatically format the URL before processing
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    try {
        const db = getDB();
        const siteCount = await db.collection('sites').countDocuments({ userId: req.user.uid });
        if (siteCount >= 5) {
            return res.status(403).json({ message: 'You have reached the maximum limit of 5 monitored sites.' });
        }
        const existingSite = await db.collection('sites').findOne({ url: url, userId: req.user.uid });
        if (existingSite) {
            return res.status(409).json({ message: 'You are already monitoring this site.' });
        }
        const newSite = { url, userId: req.user.uid, createdAt: new Date(), lastStatus: 1 };
        const result = await db.collection('sites').insertOne(newSite);
        res.status(201).json({ id: result.insertedId, url: newSite.url, userId: newSite.userId });
    } catch (error) {
        console.error('Error adding site:', error);
        res.status(500).json({ message: 'Error adding site' });
    }
};


/**
 * @desc    Delete a monitored site
 * @route   DELETE /api/sites/:id
 * @access  Private
 */
const deleteSite = async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('sites').deleteOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Site not found or not authorized.' });
        }
        res.status(200).json({ message: 'Site deleted successfully.' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ message: 'Error deleting site' });
    }
};

/**
 * @desc    Get latest metrics for the dashboard cards
 * @route   GET /api/sites/:id/metrics
 * @access  Private
 */
const getSiteMetrics = async (req, res) => {
    try {
        const db = getDB();
        const site = await db.collection('sites').findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (!site) { return res.status(404).json({ message: 'Site not found' }); }
        
        const urlLabel = site.url.replace(/\/$/, "");
        const prometheusUrl = `${PROMETHEUS_BASE_URL}/api/v1/query`;
        
        const statusQuery = `last_over_time(site_status{site_url="${urlLabel}"}[5m])`;
        const responseTimeQuery = `last_over_time(response_time_seconds{site_url="${urlLabel}"}[5m])`;
        const uptimeQuery = `avg_over_time(site_status{site_url="${urlLabel}"}[24h])`;

        let sslInfo = { valid: false };
        try {
            const hostname = new URL(site.url).hostname;
            sslInfo = await getSslDetails(hostname);
        } catch (sslError) {
            console.error(`SSL check failed for ${site.url}:`, sslError.message);
        }

        const [statusRes, responseTimeRes, uptimeRes] = await Promise.all([
            axios.get(prometheusUrl, { params: { query: statusQuery } }),
            axios.get(prometheusUrl, { params: { query: responseTimeQuery } }),
            axios.get(prometheusUrl, { params: { query: uptimeQuery } })
        ]);

        const statusValue = statusRes.data?.data?.result[0]?.value[1];
        const responseTimeValue = responseTimeRes.data?.data?.result[0]?.value[1];
        const uptimeValue = uptimeRes.data?.data?.result[0]?.value[1];

        const metrics = {
            status: statusValue === "1" ? "Operational" : "Down",
            avgResponseTime: responseTimeValue ? `${parseFloat(responseTimeValue * 1000).toFixed(0)}ms` : 'N/A',
            uptime24h: uptimeValue ? `${(parseFloat(uptimeValue) * 100).toFixed(2)}%` : 'N/A',
            sslExpiry: sslInfo.valid ? `in ${sslInfo.daysRemaining} days` : 'Invalid'
        };
        
        res.status(200).json(metrics);
    } catch (error) {
        console.error(`Error fetching metrics for site ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to fetch site metrics' });
    }
};

/**
 * @desc    Get historical data for charts and event logs
 * @route   GET /api/sites/:id/history
 * @access  Private
 */
const getSiteHistory = async (req, res) => {
    try {
        const db = getDB();
        const site = await db.collection('sites').findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (!site) { return res.status(404).json({ message: 'Site not found' }); }

        const urlLabel = site.url.replace(/\/$/, "");
        const prometheusRangeUrl = `${PROMETHEUS_BASE_URL}/api/v1/query_range`;
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

        const [responseTimeRes, statusRes] = await Promise.all([
            axios.get(prometheusRangeUrl, { params: { query: `response_time_seconds{site_url="${urlLabel}"}`, start: start.toISOString(), end: end.toISOString(), step: '15m' } }),
            axios.get(prometheusRangeUrl, { params: { query: `site_status{site_url="${urlLabel}"}`, start: start.toISOString(), end: end.toISOString(), step: '15m' } })
        ]);

        const responseTimeValues = responseTimeRes.data?.data?.result[0]?.values || [];
        const responseTimeHistory = responseTimeValues.map(([time, value]) => ({
            time: new Date(time * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            ms: parseFloat(value * 1000).toFixed(0)
        }));
        
        const statusValues = statusRes.data?.data?.result[0]?.values || [];
        const uptimeTimeline = statusValues.map(([time, value]) => parseInt(value));
        const recentEvents = [];
        let lastStatus = 1;
        let downtimeStart = null;
        for (const [time, valueStr] of statusValues) {
            const currentStatus = parseInt(valueStr);
            const eventTime = new Date(time * 1000);
            if (lastStatus === 1 && currentStatus === 0) {
                downtimeStart = eventTime;
                recentEvents.unshift({ status: 'Down', message: 'Service became unresponsive.', timestamp: eventTime.toLocaleString(), duration: 'Ongoing' });
            } else if (lastStatus === 0 && currentStatus === 1 && downtimeStart) {
                const durationMs = eventTime - downtimeStart;
                const durationMinutes = Math.round(durationMs / 60000);
                if(recentEvents[0]) { recentEvents[0].duration = `${durationMinutes} min`; }
                recentEvents.unshift({ status: 'Resolved', message: 'Service is back online.', timestamp: eventTime.toLocaleString(), duration: '' });
                downtimeStart = null;
            }
            lastStatus = currentStatus;
        }

        res.status(200).json({ responseTimeHistory, recentEvents, uptimeTimeline });
    } catch (error) {
        console.error(`Error fetching history for site ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to fetch site history' });
    }
};

/**
 * @desc    Get advanced analytics for the "Charts" page
 * @route   GET /api/sites/:id/analytics
 * @access  Private
 */
const getSiteAnalytics = async (req, res) => {
    try {
        const db = getDB();
        const site = await db.collection('sites').findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (!site) { return res.status(404).json({ message: 'Site not found' }); }

        const urlLabel = site.url.replace(/\/$/, "");
        const prometheusUrl = `${PROMETHEUS_BASE_URL}/api/v1/query`;
        const prometheusRangeUrl = `${PROMETHEUS_BASE_URL}/api/v1/query_range`;

        const statsQueries = {
            avg: `avg_over_time(response_time_seconds{site_url="${urlLabel}"}[24h])`,
            min: `min_over_time(response_time_seconds{site_url="${urlLabel}"}[24h])`,
            max: `max_over_time(response_time_seconds{site_url="${urlLabel}"}[24h])`,
            p95: `quantile_over_time(0.95, response_time_seconds{site_url="${urlLabel}"}[24h])`,
        };
        const statsPromises = Object.entries(statsQueries).map(([key, query]) =>
            axios.get(prometheusUrl, { params: { query } }).then(response => ({
                key,
                value: response.data?.data?.result[0]?.value[1]
            }))
        );
        const statsResults = await Promise.all(statsPromises);
        const responseTimeStats = statsResults.reduce((acc, { key, value }) => {
            acc[key] = value ? `${(parseFloat(value) * 1000).toFixed(0)}ms` : 'N/A';
            return acc;
        }, {});

        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        const statusHistoryRes = await axios.get(prometheusRangeUrl, { params: { query: `site_status{site_url="${urlLabel}"}`, start: start.toISOString(), end: end.toISOString(), step: '1h' } });
        const statusValues = statusHistoryRes.data?.data?.result[0]?.values || [];
        const heatmap = Array(7).fill(null).map(() => Array(24).fill(-1));
        for (const [time, value] of statusValues) {
            const date = new Date(time * 1000);
            heatmap[date.getDay()][date.getHours()] = parseInt(value);
        }

        res.status(200).json({ responseTimeStats, uptimeHeatmap: heatmap });
    } catch (error) {
        console.error(`Error fetching analytics for site ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to fetch site analytics' });
    }
};

module.exports = {
    getSites,
    addSite,
    deleteSite,
    getSiteMetrics,
    getSiteHistory,
    getSiteAnalytics
};

