import express from "express";
import WebSocket from "ws";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// variabilă globală pentru ultimul follower
let latestFollower = null;

// endpoint accesibil din frontend (overlay)
app.get("/latest-follower", (req, res) => {
  res.json({ latestFollower });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  connectToKick();
});

function connectToKick() {
  const ws = new WebSocket("wss://ws2.kick.com");

  ws.on("open", () => {
    console.log("🟢 Connected to Kick WebSocket");

    // Înlocuiește aici cu username-ul canalului tău de Kick!
    const channelName = "hyghman-edits"; 

    ws.send(
      JSON.stringify({
        event: "pusher:subscribe",
        data: {
          channel: `channel.${channelName}`,
        },
      })
    );
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.event === "App\\Events\\SubscriptionFollowed") {
        const username = data.data.username;
        latestFollower = username;
        console.log(`💚 New follower: ${username}`);
      }
    } catch (err) {
      console.error("❌ Error parsing message", err);
    }
  });

  ws.on("close", () => {
    console.log("⚠️ WS closed, reconnecting in 5s...");
    setTimeout(connectToKick, 5000);
  });

  ws.on("error", (err) => {
    console.error("WS Error:", err.message);
    ws.close();
  });
}
