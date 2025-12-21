const { MongoClient } = require("mongodb"); // Import MongoClient from mongodb package

let client;
let db;

async function initDb(uri) { // mongodb connection
  if (db) return db;
  try {  // If db is already initialized, return it
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });  // in 5 seconds
    await client.connect();  // Connect to MongoDB server
    db = client.db(process.env.MONGODB_DB || "inventory_app"); // Select the database
    // Create necessary indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true }); // unique email index 
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("otps").createIndex({ email: 1 }, { unique: true });
    await db
      .collection("otps")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    return db;  // Return the db instance upon successful connection
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    db = null;
    return null;
  }
}

function getDb() {
  if (!db) throw new Error("DB not initialized");
  return db;
}

module.exports = { initDb, getDb };
