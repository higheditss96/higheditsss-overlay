export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing ?code parameter in callback URL" });
  }

  try {
    // Trimite cererea către Kick OAuth pentru a obține tokenul
    const tokenResponse = await fetch("https://kick.com/oauth/token", {
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Kick token exchange failed:", errorText);
      return res.status(500).json({ error: "Failed to exchange code for token" });
    }

    const tokenData = await tokenResponse.json();

    // Obține datele utilizatorului
    const userResponse = await fetch("https://kick.com/api/v2/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Kick user info request failed:", errorText);
      return res.status(500).json({ error: "Failed to get user info from Kick" });
    }

    const userData = await userResponse.json();

    // Returnează info simplă în browser
    res.status(200).json({
      message: "Kick OAuth successful!",
      access_token: tokenData.access_token,
      user: userData,
    });
  } catch (err) {
    console.error("Kick callback error:", err);
    res.status(500).json({ error: "Kick callback failed" });
  }
}
