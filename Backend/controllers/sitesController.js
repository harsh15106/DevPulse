const { getDB } = require('../config/db');

// @desc    Get all sites for a user
// @route   GET /api/sites
// @access  Private
const getSites = async (req, res) => {
    try {
        const db = getDB();
        // Find all sites that belong to the logged-in user (using the uid from authMiddleware)
        const sites = await db.collection('sites').find({ ownerId: req.user.uid }).toArray();
        res.status(200).json(sites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a new site to monitor
// @route   POST /api/sites
// @access  Private
const addSite = async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    try {
        const db = getDB();
        const newSite = {
            url,
            ownerId: req.user.uid, // Attach the user's ID to the site
            createdAt: new Date(),
        };

        const result = await db.collection('sites').insertOne(newSite);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error('Error adding site:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSites,
    addSite,
};
