require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('./firebaseAdmin');
const { connectDB } = require('./config/db');
const { startMonitoring } = require('./services/monitoringService');
const { register } = require('./metrics');
const siteRoutes = require('./routes/sites');

// ✅ NEW: CORS Configuration to allow your frontend to connect
const allowedOrigins = ['http://localhost:5173', 'https://dev-pulse-smoky.vercel.app'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) and from the whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ Successfully connected to MongoDB.');
        const app = express();
        
        // ✅ Use the new, more secure CORS options
        app.use(cors(corsOptions));
        
        app.use(express.json());

        // Public Routes
        app.get('/', (req, res) => res.status(200).json({ message: 'DevPulse Backend is running!' }));
        app.get('/metrics', async (req, res) => {
            res.setHeader('Content-Type', register.contentType);
            res.end(await register.metrics());
        });

        // API Routes
        app.use('/api/sites', siteRoutes);

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`✅ Server is listening on port ${PORT}`);
            startMonitoring();
        });
    } catch (error) {
        console.error('❌ Could not start server:', error);
        process.exit(1);
    }
};

startServer();

