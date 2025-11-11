export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokenResponse = await fetch("https://kick.com/oauth/token", {
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token error:", tokenData);
      return res.status(500).json({ error: "Failed to get access token" });
    }

    const userResponse = await fetch("https://kick.com/api/v1/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    return res.status(200).json({
      success: true,
      user: userData,
      access_token: tokenData.access_token,
    });
  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
