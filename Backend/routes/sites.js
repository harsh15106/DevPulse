const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Import controller functions (we will create these next)
const { getSites, addSite } = require('../controllers/sitesController');

// Define the routes
// GET /api/sites - Fetches all sites for the logged-in user
router.get('/', authMiddleware, getSites);

// POST /api/sites - Adds a new site for the logged-in user
router.post('/', authMiddleware, addSite);

module.exports = router;
