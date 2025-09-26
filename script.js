const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const sparkle = document.getElementById('sparkle');

const recordBtn = document.createElement('button');
recordBtn.textContent = '録画開始';
recordBtn.style.position = 'absolute';
recordBtn.style.top = '10px';
recordBtn.style.left = '10px';
recordBtn.style.zIndex = '10';
recordBtn.style.padding = '10px 20px';
recordBtn.style.fontSize = '16px';
document.body.appendChild(recordBtn);

let mediaRecorder;
let recordedChunks = [];

// canvas サイズ調整
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// カメラ起動（背面カメラ）
navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error('カメラアクセス失敗', err); });

// 描画ループ
function draw() {
  const vw = canvas.width;
  const vh = canvas.height;

  // カメラ映像
  ctx.drawImage(video, 0, 0, vw, vh);

  // spoonの描画（元画像の縦横比維持）
  if (spoon.complete) {
    const spoonAspect = spoon.naturalWidth / spoon.naturalHeight;
    const spoonWidth = vw;               // 横幅いっぱい
    const spoonHeight = spoonWidth / spoonAspect;
    const spoonY = vh - spoonHeight;     // 下部に配置
    ctx.drawImage(spoon, 0, spoonY, spoonWidth, spoonHeight);
  }

  // sparkleの描画（縦横比維持）
  if (sparkle.complete) {
    const sparkleAspect = sparkle.naturalWidth / sparkle.naturalHeight;
    const sparkleWidth = vw;
    const sparkleHeight = sparkleWidth / sparkleAspect;
    const sparkleY = (vh - sparkleHeight) / 2;  // 中央寄せ
    ctx.drawImage(sparkle, 0, sparkleY, sparkleWidth, sparkleHeight);
  }

  requestAnimationFrame(draw);
}
draw();

// 録画ボタン処理
recordBtn.addEventListener('click', () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    const stream = canvas.captureStream(30); // 30fps
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pet_chefs_ar.webm';
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    recordBtn.textContent = '録画停止';
  } else if (mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = '録画開始';
  }
});

// ページ離脱時にカメラ停止
window.addEventListener('beforeunload', () => {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
