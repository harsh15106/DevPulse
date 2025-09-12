const cron = require('node-cron');
const axios = require('axios');
const { getDB } = require('../config/db');
const { website_up, website_response_time_ms } = require('../metrics');

const checkSites = async () => {
    console.log('Running scheduled job: Checking all websites...');
    try {
        const db = getDB();
        const sites = await db.collection('sites').find({}).toArray();

        for (const site of sites) {
            const startTime = Date.now();
            try {
                // We use a HEAD request for efficiency, as we only need status and headers
                await axios.head(site.url, { timeout: 5000 }); // 5 second timeout
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                // Update Prometheus metrics
                website_up.labels(site.url, site.ownerId).set(1);
                website_response_time_ms.labels(site.url, site.ownerId).set(responseTime);

                console.log(`[UP] ${site.url} - ${responseTime}ms`);

            } catch (error) {
                // If the request fails for any reason, the site is considered down
                website_up.labels(site.url, site.ownerId).set(0);
                // Set response time to a high value or a specific indicator for down
                website_response_time_ms.labels(site.url, site.ownerId).set(0); 

                console.log(`[DOWN] ${site.url} - ${error.message}`);
            }
        }
    } catch (error) {
        console.error('Error during site check job:', error);
    }
};

// Schedule the job to run every minute
const startMonitoring = () => {
    cron.schedule('* * * * *', checkSites);
};

module.exports = { startMonitoring };
