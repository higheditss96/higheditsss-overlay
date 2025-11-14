// /api/auth/login.js
// Redirecționează userul pe pagina de login Kick

export default async function handler(req, res) {
  const clientId = process.env.KICK_CLIENT_ID;
  const redirectUri = process.env.KICK_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({
      error: "Missing KICK_CLIENT_ID or KICK_REDIRECT_URI env vars",
    });
  }

  const authUrl = new URL("https://kick.com/oauth/authorize");

  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);

  // Scopes – ajustezi dacă Kick cere altele
  authUrl.searchParams.set(
    "scope",
    "user.read channel.read followers.read"
  );

  // Dacă vrei, poți trimite și `state` mai târziu pentru securitate
  // authUrl.searchParams.set("state", "ceva-random");

  // Redirect 302 către Kick
  res.writeHead(302, { Location: authUrl.toString() });
  res.end();
}
