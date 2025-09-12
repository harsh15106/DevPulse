// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('./firebaseAdmin');
const authMiddleware = require('./middleware/authMiddleware');
const { connectDB } = require('./config/db');
const siteRoutes = require('./routes/sites');

// Import the monitoring service and metrics register
const { startMonitoring } = require('./services/monitoringService');
const { register } = require('./metrics');


// Connect to the database
connectDB().then(() => {
    // Start the monitoring service after the DB is connected
    startMonitoring();
});

// Create the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Public Routes ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'DevPulse Backend is running!' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// --- API Routes ---
app.use('/api/sites', siteRoutes);

// Get the port from environment variables, with a default
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log('Firebase Admin SDK initialized successfully.');
});

