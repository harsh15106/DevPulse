const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  // Fix private_key by converting \n into real newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error(
    "❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY or initializing Firebase Admin:",
    error
  );
}

module.exports = admin;