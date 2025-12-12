 import { createServer } from "http";
 import { Server } from "socket.io";
 import express from "express";

 const app = express();
 const http = createServer(app);
 const io = new Server(http);

 // 静的ファイルを配置するディレクトリを指定
 app.use(express.static("public"));

 io.on("connection", (socket) =>
   socket.onAny((event, data) => socket.broadcast.emit(event, data)),
 );

 http.listen(Number(process.env.PORT) || 3000);
