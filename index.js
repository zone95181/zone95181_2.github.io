// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port : 3001});

wss.on("connection", ws => {
  ws.on("message", msg => {
    // 受け取ったメッセージを他の全クライアントに送る
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(smg.toString());
      }
    });
  });
});

console.log("Signaling Server running on ws://localhost:3001");
