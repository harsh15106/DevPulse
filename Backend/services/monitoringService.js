const { getDB } = require('../config/db');
const https = require('https');
const http = require('http');
const url = require('url');
const { siteStatus, responseTime } = require('../metrics');

function requestWithDebug(siteUrl, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(siteUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path || '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: timeoutMs,
      rejectUnauthorized: false
    };

    const req = lib.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ statusCode: res.statusCode });
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
        }
      });
    });
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function checkAllSites() {
  console.log('Running background monitoring check...');
  try {
    const db = getDB();
    const sites = await db.collection('sites').find({}).toArray();
    for (const site of sites) {
      const startTime = Date.now();
      let urlToCheck = site.url;
      if (!/^https?:\/\//i.test(urlToCheck)) {
        urlToCheck = `https://${urlToCheck}`;
      }
      
      // ✅ FINAL FIX: Normalize the URL by removing any trailing slash
      const urlLabel = site.url.replace(/\/$/, "");

      try {
        await requestWithDebug(urlToCheck);
        const duration = (Date.now() - startTime) / 1000;
        siteStatus.labels({ site_url: urlLabel, user_id: site.userId }).set(1);
        responseTime.labels({ site_url: urlLabel, user_id: site.userId }).set(duration);
        console.log(`✅ ${urlToCheck} is UP (${duration.toFixed(3)}s)`);
      } catch (err) {
        siteStatus.labels({ site_url: urlLabel, user_id: site.userId }).set(0);
        responseTime.labels({ site_url: urlLabel, user_id: site.userId }).set(0);
        console.error(`❌ ${urlToCheck} is DOWN. Reason: ${err.message}`);
      }
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

