// Socket.ioのフロントエンド・モジュールはバックエンドからインポート可能
import "/socket.io/socket.io.js";

const pc = new RTCPeerConnection({
  // GoogleのSTUNサーバーを指定
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
});
const socket = io();

globalThis.onClickBtn = async () => {
  // 端末のカメラとマイクのアクセスをリクエスト
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  for (const track of stream.getTracks()) {
    pc.addTrack(track);
  }
  const video = document.createElement("video");

  // ブラウザのポリシーによる映像再生エラーの回避
  video.playsInline = true;
  video.muted = true;

  video.style.width = "100%";
  // MediaStreamをvideoタグにアタッチ
  video.srcObject = stream;
  video.play();
  document.body.appendChild(video);

  // LocalDescriptionを生成
  pc.createOffer().then((desc) => {
    // LocalDescriptionをPeerConnectionにセット
    pc.setLocalDescription(desc);
    // LocalDescriptionをリモートユーザーへ送信
    socket.emit("offer", desc);
  });
};

// リモートユーザーがPeerConnectionにMediaStreamTrackを追加したら発火
pc.addEventListener("track", ({ track }) => {
  if (track.kind === "video") {
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.style.width = "100%";
    video.srcObject = new MediaStream([track]);
    video.play();
    document.body.appendChild(video);
  }
  if (track.kind === "audio") {
    const audio = document.createElement("audio");
    audio.srcObject = new MediaStream([track]);
    audio.play();
  }
});
// RTCPeerConnection.setLocalDescription()の呼び出しに応じて、
// ICE Candidateが見つかった時や収集が終了した際に発火
pc.addEventListener("icecandidate", ({ candidate }) => {
  if (candidate) {
    // ICE Candidateをリモートユーザーへ送信
    socket.emit("ice", candidate);
  }
});

socket
  // リモートユーザーのofferイベントの受信
  .on("offer", (desc) => {
    // RemoteDescriptionをPeerConnectionにセット
    pc.setRemoteDescription(desc);
    // LocalDescriptionを生成
    pc.createAnswer().then((desc) => {
      // LocalDescriptionをPeerConnectionにセット
      pc.setLocalDescription(desc);
      // LocalDescriptionをリモートユーザーへ送信
      socket.emit("answer", desc);
    });
  })
  // リモートユーザーのanswerイベントを受信し、RemoteDescriptionをPeerConnectionにセット
  .on("answer", (desc) => pc.setRemoteDescription(desc))
  // リモートユーザーのiceイベントを受信し、ICE Candidateを追加
  .on("ice", (candidate) => pc.addIceCandidate(candidate));
