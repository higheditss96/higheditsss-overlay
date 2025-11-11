export default async function handler(req, res) {
  const authorizeUrl = "https://kick.com/oauth/authorize";
  const redirectUri = "https://highstatsss-overlay.vercel.app/api/auth/callback";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.KICK_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "user.read channel.read followers.read",
    force_verify: "true",
  });

  return res.redirect(`${authorizeUrl}?${params.toString()}`);
}
