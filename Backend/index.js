// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('./firebaseAdmin');
const { connectDB } = require('./config/db');
const { startMonitoring } = require('./services/monitoringService');
const { register } = require('./metrics');

// Import only the necessary route files
const siteRoutes = require('./routes/sites');
// const settingsRoutes = require('./routes/settings'); // This line is now removed

// --- Main Server Function ---
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ Successfully connected to MongoDB.');

        const app = express();

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Public Routes
        app.get('/', (req, res) => {
            res.status(200).json({ message: 'DevPulse Backend is running!' });
        });

        // Prometheus metrics endpoint
        app.get('/metrics', async (req, res) => {
            res.setHeader('Content-Type', register.contentType);
            res.end(await register.metrics());
        });

        // API Routes
        app.use('/api/sites', siteRoutes);
        // app.use('/api/settings', settingsRoutes); // This line is now removed

        // Finally, start the server.
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`✅ Server is listening on port ${PORT}`);
            startMonitoring();
        });

    } catch (error) {
        console.error('❌ Could not start server:');
        console.error(error);
        process.exit(1);
    }
};

// --- Start the application ---
startServer();

