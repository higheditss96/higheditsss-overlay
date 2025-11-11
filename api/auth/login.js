export default function handler(req, res) {
  try {
    const authUrl = new URL("https://kick.com/oauth/authorize");

    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.KICK_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", process.env.KICK_REDIRECT_URI);
    authUrl.searchParams.set("scope", "user.read channel.read follows.read");

    console.log("Redirecting user to Kick OAuth:", authUrl.toString());
    return res.redirect(302, authUrl.toString());
  } catch (error) {
    console.error("OAuth login redirect failed:", error);
    res.status(500).json({ error: "Kick OAuth redirect failed" });
  }
}
