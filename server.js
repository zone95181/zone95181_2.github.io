// server.js
const WebSocket = require("ws");

// ポート 3001 で WebSocket サーバーを起動
const wss = new WebSocket.Server({ port: 3001 });

console.log("Signaling Server running on ws://localhost:3001");
wss.on("connection", ws => { console.log("Client connected");

// クライアントからメッセージが来たら他の全クライアントへ送信
ws.on("message", msg => { console.log("Received:", msg.toString());
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(msg.toString());
      }
    });
  });

  // 切断時
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
