// /api/auth/me.js

export default function handler(req, res) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("=", 2))
      .filter(([k]) => k)
  );

  if (!cookies.kickAuth) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const data = JSON.parse(decodeURIComponent(cookies.kickAuth));

    return res.status(200).json({
      loggedIn: true,
      username: data.username,
      avatar: data.avatar,
      verified: data.verified,
    });
  } catch (e) {
    console.error("Invalid kickAuth cookie:", e);
    return res.status(200).json({ loggedIn: false });
  }
}
