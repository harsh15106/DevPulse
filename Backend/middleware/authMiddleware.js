const admin = require('../firebaseAdmin');

const authMiddleware = async (req, res, next) => {
    // 1. Get the token from the request header
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Unauthorized: No token provided.' });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        // 2. Verify the token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // 3. Attach the user's information to the request object
        req.user = decodedToken;

        // 4. Continue to the next step in the request chain (the actual API logic)
        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(403).send({ error: 'Unauthorized: Invalid token.' });
    }
};

module.exports = authMiddleware;
