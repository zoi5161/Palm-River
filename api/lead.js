export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  try {
    const { projectName, createdAt, name, phone, source } = req.body || {};
    console.log("New lead:", { projectName, createdAt, name, phone, source });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("lead function error:", err);
    res.status(200).json({ ok: true });
  }
}
