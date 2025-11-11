export default async function handler(req, res) {
  try {
    const baseUrl = "https://kick.com/oauth/authorize";

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.KICK_CLIENT_ID,
      redirect_uri: process.env.KICK_REDIRECT_URI,
      scope: "user.read channel.read followers.read",
    });

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // Redirecționează utilizatorul spre Kick
    return res.redirect(finalUrl);
  } catch (err) {
    console.error("Kick OAuth login error:", err);
    res.status(500).json({ error: "Failed to redirect to Kick OAuth" });
  }
}
