export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const user = url.searchParams.get("user");

  if (!user) {
    return new Response(JSON.stringify({ error: "Missing ?user" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(
      `https://kick.com/api/v1/channels/${user}/followers?limit=1`
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
