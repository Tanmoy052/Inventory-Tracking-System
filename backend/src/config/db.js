const { MongoClient } = require("mongodb");

let client;
let db;

async function initDb(uri) {
  if (db) return db;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "inventory_app");
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });
    await db.collection("otps").createIndex({ email: 1 }, { unique: true });
    await db
      .collection("otps")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    return db;
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
