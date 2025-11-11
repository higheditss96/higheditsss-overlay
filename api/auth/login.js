export default async function handler(req, res) {
  try {
    const baseUrl = "https://kick.com/oauth/authorize";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.KICK_CLIENT_ID,
      redirect_uri: process.env.KICK_REDIRECT_URI,
      scope: "user.read channel.read followers.read",
      force_verify: "true",
    });

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // 🧩 DEBUG: vezi exact ce URL construiește
    return res.status(200).json({
      debug: "Redirecting to Kick OAuth",
      finalUrl,
      clientId: process.env.KICK_CLIENT_ID,
      redirectUri: process.env.KICK_REDIRECT_URI,
    });

  } catch (err) {
    console.error("Login redirect error:", err);
    return res.status(500).json({ error: "Failed to create Kick auth URL" });
  }
}
