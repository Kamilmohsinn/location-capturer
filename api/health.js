const { setCorsHeaders } = require("./_lib/cors");

module.exports = async function handler(_req, res) {
  setCorsHeaders(res);
  return res.status(200).json({ ok: true });
};
