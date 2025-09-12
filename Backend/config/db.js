const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    db = client.db("devpulse"); // You can name your database here
    console.log("Successfully connected to MongoDB Atlas!");
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process with failure
  }
};

const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized! Call connectDB first.');
    }
    return db;
}

module.exports = { connectDB, getDB };
