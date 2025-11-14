// /api/auth/callback.js
// Primește `code` de la Kick și cere access_token

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: "Missing ?code parameter in callback URL",
    });
  }

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  const redirectUri = process.env.KICK_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({
      error:
        "Missing KICK_CLIENT_ID / KICK_CLIENT_SECRET / KICK_REDIRECT_URI env vars",
    });
  }

  try {
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", code);
    body.set("redirect_uri", redirectUri);
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);

    // ATENȚIE: endpoint-ul poate fi ușor diferit, dar în demo-urile Kick
    // de obicei e de forma asta:
    const tokenResponse = await fetch("https://kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(500).json({
        error: "Failed to exchange code for token",
        kickResponse: tokenData,
      });
    }

    // Setăm tokenul într-un cookie HttpOnly (simplu)
    const maxAge = tokenData.expires_in || 3600;

    res.setHeader("Set-Cookie", [
      `kick_access_token=${tokenData.access_token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Secure`,
    ]);

    // Poți schimba unde redirecționezi după login
    res.writeHead(302, { Location: "/" });
    res.end();
  } catch (err) {
    console.error("Kick token error:", err);
    return res.status(500).json({
      error: "Exception while calling Kick token endpoint",
    });
  }
}
