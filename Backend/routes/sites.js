const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// ✅ This import list must include getSiteAnalytics
const { 
    getSites, 
    addSite, 
    deleteSite,
    getSiteMetrics,
    getSiteHistory,
    getSiteAnalytics 
} = require('../controllers/sitesController');

// Apply middleware to all routes in this file
router.use(authMiddleware);

router.route('/')
    .get(getSites)
    .post(addSite);

router.route('/:id')
    .delete(deleteSite);

router.route('/:id/metrics').get(getSiteMetrics);

router.route('/:id/history').get(getSiteHistory);

// ✅ FIX: This is the route that was missing from your running file
router.route('/:id/analytics').get(getSiteAnalytics);

module.exports = router;