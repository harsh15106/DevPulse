const admin = require('firebase-admin');

// Check if the environment variable is present and not empty.
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your .env file or hosting provider.');
}

try {
    // Parse the service account key from the environment variable.
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    // Initialize the Firebase Admin SDK with the parsed credentials.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin SDK configured successfully from environment variable.');

} catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY or initializing Firebase Admin:', error);
    // Exit the process if Firebase Admin fails to initialize, as it's a critical service.
    process.exit(1); 
}


// Export the initialized admin instance for use in other parts of the application.
module.exports = admin;

