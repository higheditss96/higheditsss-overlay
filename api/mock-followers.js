// Simulează un API care returnează mereu un "follower nou"
const mockFollowers = [
  "alex_k",
  "gamerx",
  "luna_tv",
  "highgoal_test",
  "randomkick",
  "streamlover",
  "devtester",
  "nova_hub",
  "kickmania",
  "hyperzone"
];

export default async function handler(req, res) {
  // Alegem un follower random
  const randomUser =
    mockFollowers[Math.floor(Math.random() * mockFollowers.length)];

  const fakeFollower = [
    {
      user: {
        id: Math.floor(Math.random() * 1000000),
        username: randomUser,
        profile_pic: `https://api.dicebear.com/7.x/thumbs/svg?seed=${randomUser}`
      },
      created_at: new Date().toISOString()
    }
  ];

  return new Response(JSON.stringify(fakeFollower), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
