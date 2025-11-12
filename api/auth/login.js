export default async function handler(req, res) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.KICK_CLIENT_ID,
    redirect_uri: process.env.KICK_REDIRECT_URI,
    scope: "user.read channel.read follows.read",
    force_verify: "true"
  });

  // noul URL corect pentru Kick OAuth
  const authURL = `https://kick.com/api/v1/oauth/authorize?${params.toString()}`;

  return res.redirect(authURL);
}
