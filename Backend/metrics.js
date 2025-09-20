const client = require('prom-client');

// ✅ Create a single, shared registry for the entire application.
const register = new client.Registry();

// Collect default metrics like memory and CPU usage and register them
client.collectDefaultMetrics({ register });

// Define our custom gauges
const siteStatus = new client.Gauge({
  name: 'site_status',
  help: 'Indicates if the site is up (1) or down (0)',
  labelNames: ['site_url', 'user_id'],
});

const responseTime = new client.Gauge({
  name: 'response_time_seconds',
  help: 'Response time of the website in seconds',
  labelNames: ['site_url', 'user_id'],
});

// ✅ Register our custom gauges with the single, shared registry
register.registerMetric(siteStatus);
register.registerMetric(responseTime);

// Export the single registry and the gauges
module.exports = {
  register,
  siteStatus,
  responseTime,
};
