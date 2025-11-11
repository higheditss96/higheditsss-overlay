export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing ?code parameter in callback URL" });
  }

  try {
    const tokenUrl = "https://kick.com/oauth/token";

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KICK_CLIENT_ID,
      client_secret: process.env.KICK_CLIENT_SECRET,
      redirect_uri: process.env.KICK_REDIRECT_URI,
      code,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description || "OAuth error", details: data });
    }

    // ✅ Token primit — Kick a autentificat utilizatorul
    return res.status(200).json({
      success: true,
      message: "Kick OAuth successful",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    console.error("Kick OAuth callback error:", err);
    res.status(500).json({ error: "Kick OAuth callback failed", details: err.message });
  }
}
