export default async function handler(req, res) {
  const authUrl = new URL("https://kick.com/oauth/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", process.env.KICK_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", process.env.KICK_REDIRECT_URI);
  authUrl.searchParams.set("scope", "user.read channel.read followers.read");

  return res.redirect(authUrl.toString());
}
