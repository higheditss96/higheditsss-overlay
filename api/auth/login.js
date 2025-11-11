export default async function handler(req, res) {
  try {
    // Folosim mirror-ul Kick care funcționează stabil
    const mirrorBase = "https://kickoauth.mirror.highgoal.app/authorize";

    // Trimitem datele aplicației tale
    const params = new URLSearchParams({
      client_id: process.env.KICK_CLIENT_ID,
      redirect_uri: process.env.KICK_REDIRECT_URI,
      scope: "user.read channel.read followers.read",
      response_type: "code",
      mirror_redirect: "true",
    });

    // Redirecționează către mirror-ul nostru
    const mirrorUrl = `${mirrorBase}?${params.toString()}`;
    return res.redirect(mirrorUrl);
  } catch (err) {
    console.error("Login proxy error:", err);
    res.status(500).json({ error: "Kick OAuth mirror failed", details: err.message });
  }
}
