export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing ?code parameter in callback URL" });
  }

  try {
    // Schimbăm codul pentru access_token
    const tokenRes = await fetch("https://kick.com/api/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.KICK_CLIENT_ID,
        client_secret: process.env.KICK_CLIENT_SECRET,
        redirect_uri: process.env.KICK_REDIRECT_URI,
        code: code
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Kick token exchange failed:", tokenData);
      return res.status(500).json({ error: "Token exchange failed", details: tokenData });
    }

    // Luăm informațiile userului
    const userRes = await fetch("https://kick.com/api/v1/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // Răspuns
    return res.status(200).json({
      success: true,
      access_token: tokenData.access_token,
      user
    });
  } catch (error) {
    console.error("Kick OAuth callback error:", error);
    res.status(500).json({ error: "OAuth callback failed", details: error.message });
  }
}
