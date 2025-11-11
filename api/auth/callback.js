export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) return res.status(400).send("Missing code");

  try {
    const response = await fetch("https://kick.com/api/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.KICK_CLIENT_ID,
        client_secret: process.env.KICK_CLIENT_SECRET,
        redirect_uri: process.env.KICK_REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // ✅ Afișăm tokenul în browser pentru a-l salva în Vercel
      return res.status(200).send(`
        <h2>✅ Kick OAuth complet!</h2>
        <p>Copiază acest <b>access_token</b> și pune-l în Vercel:</p>
        <pre style="background:#111;color:#0f0;padding:15px;border-radius:8px;">${data.access_token}</pre>
        <p><b>Vercel → Settings → Environment Variables →</b> adaugă:</p>
        <code>KICK_ACCESS_TOKEN=${data.access_token}</code>
      `);
    }

    return res.status(500).json({ error: "No access token returned", data });
  } catch (err) {
    console.error("OAuth error:", err);
    return res.status(500).json({ error: "OAuth failed" });
  }
}
