export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  try {
    const { projectName, createdAt, name, phone, source } = req.body || {};
    console.log("New lead:", { projectName, createdAt, name, phone, source });

    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    const webhookSecret = process.env.LEAD_WEBHOOK_SECRET;

    if (webhookUrl && webhookSecret) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: webhookSecret,
            projectName,
            createdAt,
            name,
            phone,
            source,
          }),
        });
      } catch (webhookErr) {
        console.error("lead webhook forward error:", webhookErr);
      }
    } else {
      console.warn("LEAD_WEBHOOK_URL / LEAD_WEBHOOK_SECRET not configured, lead not forwarded to sheet.");
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("lead function error:", err);
    res.status(200).json({ ok: true });
  }
}
