module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) {
    return res.status(500).json({ error: "GAS_URL not configured" });
  }

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { status: "success", raw: text };
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach backend", detail: err.message });
  }
};
