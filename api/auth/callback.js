export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing ?code parameter in callback URL" });
  }

  try {
    // 1️⃣ Trimitem codul primit către Kick ca să obținem tokenul de acces
    const response = await fetch("https://kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.KICK_CLIENT_ID,
        client_secret: process.env.KICK_CLIENT_SECRET,
        redirect_uri: process.env.KICK_REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();

    // 2️⃣ Verificăm dacă Kick a returnat un token valid
    if (!response.ok) {
      console.error("Kick OAuth error:", data);
      return res.status(500).json({ error: "Failed to get token from Kick", details: data });
    }

    // 3️⃣ Returnăm tokenul (temporar doar pentru testare)
    // 💡 Într-o versiune finală îl vei salva într-un cookie sau DB
    return res.status(200).json({
      message: "Kick OAuth successful 🎉",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.status(500).json({ error: "Unexpected error", details: error.message });
  }
}
