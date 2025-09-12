const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics for our application
const website_up = new client.Gauge({
    name: 'website_up',
    help: 'A gauge to show if a website is up (1) or down (0)',
    labelNames: ['url', 'ownerId']
});

const website_response_time_ms = new client.Gauge({
    name: 'website_response_time_ms',
    help: 'The response time of the website in milliseconds',
    labelNames: ['url', 'ownerId']
});

// Register the custom metrics
register.registerMetric(website_up);
register.registerMetric(website_response_time_ms);

module.exports = {
    register,
    website_up,
    website_response_time_ms,
};
