// /api/last-follower.js

export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user parameter" });
  }

  // timeout helper (max 3 secunde)
  const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);
  };

  try {
    const url = `https://kick.com/api/v1/channels/${user}/followers?limit=1`;

    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HighStatsOverlay/1.0)"
      }
    });

    const text = await response.text();

    // dacă Kick trimite HTML, fallback
    if (text.startsWith("<!DOCTYPE")) {
      console.warn("⚠️ Kick a răspuns cu HTML, folosim fallback.");
      return res.status(200).json([
        {
          user: {
            username: "mock_user",
            profile_pic:
              "https://api.dicebear.com/7.x/thumbs/svg?seed=mock_user"
          },
          created_at: new Date().toISOString()
        }
      ]);
    }

    const data = JSON.parse(text);

    // dacă lista e goală
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Kick nu a returnat followers, fallback activ.");
      return res.status(200).json([
        {
          user: {
            username: "test_follower",
            profile_pic:
              "https://api.dicebear.com/7.x/thumbs/svg?seed=test_follower"
          },
          created_at: new Date().toISOString()
        }
      ]);
    }

    // returnează followerul real
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Eroare la Kick API sau timeout:", err.message);
    // fallback final
    return res.status(200).json([
      {
        user: {
          username: "fallback_follower",
          profile_pic:
            "https://api.dicebear.com/7.x/thumbs/svg?seed=fallback_follower"
        },
        created_at: new Date().toISOString()
      }
    ]);
  }
}
