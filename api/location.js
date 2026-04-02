const { connectToDatabase, Location } = require("./_lib/db");
const { handleCorsPreflight, setCorsHeaders } = require("./_lib/cors");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreflight(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { latitude, longitude, accuracy, timestamp } = req.body || {};

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ error: "Invalid location payload" });
  }

  try {
    await connectToDatabase();

    const saved = await Location.create({
      latitude,
      longitude,
      accuracy: typeof accuracy === "number" ? accuracy : null,
      timestamp: timestamp || new Date(),
      receivedAt: new Date()
    });

    return res.status(200).json({ message: "Location saved", entry: saved });
  } catch (error) {
    console.error("Failed to save location:", error);
    return res.status(500).json({ error: "Failed to save location" });
  }
};
