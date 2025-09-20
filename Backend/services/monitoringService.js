const { getDB } = require('../config/db');
const https = require('https');
const http = require('http');
const url = require('url');
const { siteStatus, responseTime } = require('../metrics');
// ✅ All imports for mailService and firebaseAdmin have been removed as they are no longer needed.

async function checkAllSites() {
  console.log('Running background monitoring check for all sites...');
  try {
    const db = getDB();
    const sites = await db.collection('sites').find({}).toArray();

    for (const site of sites) {
      const startTime = Date.now();
      let duration = 0;
      let currentStatus = 0; // Default to DOWN

      let urlToCheck = site.url;
      if (!/^https?:\/\//i.test(urlToCheck)) {
        urlToCheck = `https://${urlToCheck}`;
      }
      const urlLabel = site.url.replace(/\/$/, "");

      try {
        await new Promise((resolve, reject) => {
            const parsedUrl = url.parse(urlToCheck);
            const lib = parsedUrl.protocol === 'https:' ? https : http;
            const options = {
                hostname: parsedUrl.hostname, port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80), path: parsedUrl.path || '/', method: 'GET',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 15000,
            };
            const req = lib.request(options, res => {
                res.on('data', () => {});
                res.on('end', () => res.statusCode >= 200 && res.statusCode < 400 ? resolve() : reject(new Error(`Status Code: ${res.statusCode}`)));
            });
            req.on('timeout', () => req.destroy(new Error('Timeout')));
            req.on('error', err => reject(err));
            req.end();
        });
        currentStatus = 1; // Mark as UP
        duration = (Date.now() - startTime) / 1000;
        console.log(`✅ ${urlToCheck} is UP (${duration.toFixed(3)}s)`);

      } catch (error) {
        currentStatus = 0; // Mark as DOWN
        console.error(`❌ ${urlToCheck} is DOWN. Reason: ${error.message}`);
      }
      
      // ✅ All logic for checking lastStatus and sending emails has been removed.

      // Update Prometheus metrics
      siteStatus.labels({ site_url: urlLabel, user_id: site.userId }).set(currentStatus);
      responseTime.labels({ site_url: urlLabel, user_id: site.userId }).set(duration);
    }
  } catch (dbError) {
    console.error('Database error during monitoring check:', dbError);
  }
}

function startMonitoring() {
  console.log('✅ Monitoring service started. Checks will run every minute.');
  checkAllSites();
  setInterval(checkAllSites, 60 * 1000); 
}

module.exports = { startMonitoring };

