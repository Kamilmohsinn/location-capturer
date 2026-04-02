require("dotenv").config();
const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/geolocation_capture";
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS || "";

if (MONGO_DNS_SERVERS) {
  const servers = MONGO_DNS_SERVERS.split(",").map((item) => item.trim()).filter(Boolean);
  if (servers.length > 0) {
    dns.setServers(servers);
    console.log(`Using custom DNS servers: ${servers.join(", ")}`);
  }
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

const Location = mongoose.model("Location", locationSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Admin-Key");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

function requireAdminKey(req, res, next) {
  if (!ADMIN_KEY) {
    return res.status(503).json({ error: "ADMIN_KEY is not configured on server" });
  }

  const providedKey = req.header("x-admin-key");
  if (!providedKey || providedKey !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

app.post("/api/location", async (req, res) => {
  const { latitude, longitude, accuracy, timestamp } = req.body || {};

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ error: "Invalid location payload" });
  }

  const entry = {
    latitude,
    longitude,
    accuracy: typeof accuracy === "number" ? accuracy : null,
    timestamp: timestamp || new Date(),
    receivedAt: new Date()
  };

  try {
    const saved = await Location.create(entry);
    console.log("Location received:", entry);
    return res.json({ message: "Location saved", entry: saved });
  } catch (error) {
    console.error("Failed to save location:", error);
    return res.status(500).json({ error: "Failed to save location" });
  }
});

app.get("/api/locations", async (_req, res) => {
  try {
    const locations = await Location.find().sort({ receivedAt: -1 }).lean();
    return res.json({ total: locations.length, locations });
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return res.status(500).json({ error: "Failed to fetch locations" });
  }
});

app.get("/api/admin/locations", requireAdminKey, async (_req, res) => {
  try {
    const locations = await Location.find().sort({ receivedAt: -1 }).lean();
    return res.json({ total: locations.length, locations });
  } catch (error) {
    console.error("Failed to fetch admin locations:", error);
    return res.status(500).json({ error: "Failed to fetch locations" });
  }
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
