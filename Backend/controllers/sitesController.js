const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const axios = require('axios');
const getSslDetails = require('ssl-checker'); // ✅ Import the new library

const getSites = async (req, res) => {
    try {
        const db = getDB();
        const sitesFromDB = await db.collection('sites').find({ userId: req.user.uid }).toArray();
        const formattedSites = sitesFromDB.map(site => ({ id: site._id, url: site.url, userId: site.userId }));
        res.status(200).json(formattedSites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ message: 'Error fetching sites' });
    }
};

const addSite = async (req, res) => {
    const { url } = req.body;
    if (!url) { return res.status(400).json({ message: 'URL is required' }); }
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
        // ✅ Add a `lastStatus` field when creating a site. Default to 1 (UP).
        const newSite = { url, userId: req.user.uid, createdAt: new Date(), lastStatus: 1 };
        const result = await db.collection('sites').insertOne(newSite);
        res.status(201).json({ id: result.insertedId, url: newSite.url, userId: newSite.userId });
    } catch (error) {
        console.error('Error adding site:', error);
        res.status(500).json({ message: 'Error adding site' });
    }
};

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

const getSiteMetrics = async (req, res) => {
    try {
        const db = getDB();
        const site = await db.collection('sites').findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (!site) { return res.status(404).json({ message: 'Site not found' }); }
        
        const urlLabel = site.url.replace(/\/$/, "");
        const prometheusUrl = 'http://localhost:9090/api/v1/query';
        const hostname = new URL(site.url).hostname;
        
        const statusQuery = `last_over_time(site_status{site_url="${urlLabel}"}[5m])`;
        const responseTimeQuery = `last_over_time(response_time_seconds{site_url="${urlLabel}"}[5m])`;
        const uptimeQuery = `avg_over_time(site_status{site_url="${urlLabel}"}[24h])`;
        const sslPromise = getSslDetails(hostname); // ✅ Perform SSL check

        const [statusRes, responseTimeRes, uptimeRes, sslDetails] = await Promise.all([
            axios.get(prometheusUrl, { params: { query: statusQuery } }),
            axios.get(prometheusUrl, { params: { query: responseTimeQuery } }),
            axios.get(prometheusUrl, { params: { query: uptimeQuery } }),
            sslPromise
        ]);

        const statusValue = statusRes.data?.data?.result[0]?.value[1];
        const responseTimeValue = responseTimeRes.data?.data?.result[0]?.value[1];
        const uptimeValue = uptimeRes.data?.data?.result[0]?.value[1];
        
        const metrics = {
            status: statusValue === "1" ? "Operational" : "Down",
            avgResponseTime: responseTimeValue ? `${parseFloat(responseTimeValue * 1000).toFixed(0)}ms` : 'N/A',
            uptime24h: uptimeValue ? `${(parseFloat(uptimeValue) * 100).toFixed(2)}%` : 'N/A',
            sslExpiry: sslDetails.valid ? `in ${sslDetails.daysRemaining} days` : 'Invalid' // ✅ Use real SSL data
        };
        
        res.status(200).json(metrics);
    } catch (error) {
        console.error(`Error fetching metrics for site ${req.params.id}:`, error);
        res.status(200).json({
            status: 'Unknown', avgResponseTime: 'N/A', uptime24h: 'N/A', sslExpiry: 'N/A'
        });
    }
};

const getSiteHistory = async (req, res) => {
    try {
        const db = getDB();
        const site = await db.collection('sites').findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (!site) { return res.status(404).json({ message: 'Site not found' }); }

        const urlLabel = site.url.replace(/\/$/, "");
        const prometheusUrl = 'http://localhost:9090/api/v1/query_range';

        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

        // Query for both response time and status history in parallel
        const [responseTimeRes, statusRes] = await Promise.all([
            axios.get(prometheusUrl, {
                params: {
                    query: `response_time_seconds{site_url="${urlLabel}"}`,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    step: '15m' // One data point every 15 minutes
                }
            }),
            axios.get(prometheusUrl, {
                params: {
                    query: `site_status{site_url="${urlLabel}"}`,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    step: '15m' // Match the same step for consistency
                }
            })
        ]);

        // Process Response Time History for the chart
        const responseTimeValues = responseTimeRes.data?.data?.result[0]?.values || [];
        const responseTimeHistory = responseTimeValues.map(([time, value]) => ({
            time: new Date(time * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            ms: parseFloat(value * 1000).toFixed(0)
        }));
        
        // ✅ NEW: Process Status History to create the Uptime timeline and Recent Events
        const statusValues = statusRes.data?.data?.result[0]?.values || [];
        const uptimeTimeline = statusValues.map(([time, value]) => parseInt(value)); // Just the 1s and 0s
        const recentEvents = [];
        let lastStatus = 1; // Assume the site was up initially
        let downtimeStart = null;

        for (const [time, valueStr] of statusValues) {
            const currentStatus = parseInt(valueStr);
            const eventTime = new Date(time * 1000);

            // If site goes from UP to DOWN, record the start of an incident
            if (lastStatus === 1 && currentStatus === 0) {
                downtimeStart = eventTime;
                recentEvents.unshift({
                    status: 'Down',
                    message: 'Service became unresponsive.',
                    timestamp: eventTime.toLocaleString(),
                    duration: 'Ongoing'
                });
            }
            // If site goes from DOWN to UP, resolve the incident
            else if (lastStatus === 0 && currentStatus === 1 && downtimeStart) {
                const durationMs = eventTime - downtimeStart;
                const durationMinutes = Math.round(durationMs / 60000);
                
                // Update the previous "Down" event with the duration
                if(recentEvents[0]) {
                    recentEvents[0].duration = `${durationMinutes} min`;
                }

                recentEvents.unshift({
                    status: 'Resolved',
                    message: 'Service is back online.',
                    timestamp: eventTime.toLocaleString(),
                    duration: ''
                });
                downtimeStart = null;
            }
            lastStatus = currentStatus;
        }

        res.status(200).json({ 
            responseTimeHistory, 
            recentEvents,
            uptimeTimeline // Send the timeline data to the Uptime page
        });

    } catch (error) {
        console.error(`Error fetching history for site ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to fetch site history' });
    }
};

const getSiteAnalytics = async (req, res) => {
    try {
        const db = getDB();
        const site = await db.collection('sites').findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid });
        if (!site) { return res.status(404).json({ message: 'Site not found' }); }

        const urlLabel = site.url.replace(/\/$/, "");
        const prometheusUrl = 'http://localhost:9090/api/v1/query';
        const prometheusRangeUrl = 'http://localhost:9090/api/v1/query_range';

        // --- 1. Response Time Statistics (Last 24h) ---
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


        // --- 2. Uptime Heatmap Data (Last 7 Days) ---
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        const statusHistoryRes = await axios.get(prometheusRangeUrl, {
            params: {
                query: `site_status{site_url="${urlLabel}"}`,
                start: start.toISOString(),
                end: end.toISOString(),
                step: '1h' // One data point per hour
            }
        });
        
        const statusValues = statusHistoryRes.data?.data?.result[0]?.values || [];
        const heatmap = Array(7).fill(null).map(() => Array(24).fill(-1)); // -1 = no data
        for (const [time, value] of statusValues) {
            const date = new Date(time * 1000);
            const dayOfWeek = date.getDay();
            const hour = date.getHours();
            heatmap[dayOfWeek][hour] = parseInt(value);
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
    getSiteAnalytics // ✅ Export the new function
};

