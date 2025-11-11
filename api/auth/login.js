export default function handler(req, res) {
  try {
    const baseUrl = "https://kick.com/oauth/authorize";

    // Construim parametrii pentru Kick OAuth
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.KICK_CLIENT_ID,
      redirect_uri: process.env.KICK_REDIRECT_URI,
      scope: "user.read channel.read follows.read",
      force_verify: "true",
    });

    // ✅ Kick cere ca redirect_uri să fie URL-encoded manual
    const redirectUri = encodeURIComponent(process.env.KICK_REDIRECT_URI);

    // Refacem URL-ul final cu redirect-ul corect codificat
    const finalUrl = `${baseUrl}?response_type=code&client_id=${process.env.KICK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user.read%20channel.read%20follows.read&force_verify=true`;

    console.log("Redirecting to Kick OAuth:", finalUrl);

    // Redirecționează userul către Kick
    return res.redirect(302, finalUrl);
  } catch (error) {
    console.error("Kick OAuth redirect failed:", error);
    res.status(500).json({
      error: "Kick OAuth redirect failed",
      details: error.message,
    });
  }
}
