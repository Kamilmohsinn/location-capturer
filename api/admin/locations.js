const { connectToDatabase, Location } = require("../_lib/db");
const { handleCorsPreflight, setCorsHeaders } = require("../_lib/cors");

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreflight(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminKey = process.env.ADMIN_KEY || "";
  const providedKey = req.header("x-admin-key");

  if (!adminKey) {
    return res.status(503).json({ error: "ADMIN_KEY is not configured on server" });
  }

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connectToDatabase();
    const locations = await Location.find().sort({ receivedAt: -1 }).lean();
    return res.status(200).json({ total: locations.length, locations });
  } catch (error) {
    console.error("Failed to fetch admin locations:", error);
    return res.status(500).json({ error: "Failed to fetch locations" });
  }
};
