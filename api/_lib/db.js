const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((client) => client);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: null },
    timestamp: { type: Date, required: true },
    receivedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const Location = mongoose.models.Location || mongoose.model("Location", locationSchema);

module.exports = {
  connectToDatabase,
  Location
};
