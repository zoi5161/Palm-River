export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { projectName, createdAt, name, phone, source } = JSON.parse(event.body || "{}");
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("lead function error:", err);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  }
}
