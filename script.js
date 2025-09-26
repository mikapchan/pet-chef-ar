const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const sparkle = document.getElementById('sparkle');
const recordBtn = document.getElementById('recordBtn');

let mediaRecorder;
let recordedChunks = [];

// canvasサイズ調整
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// カメラ起動（背面優先）
navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => {
    console.warn('背面カメラ取得失敗、フロントに切替', err);
    return navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { video.srcObject = stream; });
  });

// 描画ループ
function draw() {
  const vw = canvas.width;
  const vh = canvas.height;

  // カメラ映像
  ctx.drawImage(video, 0, 0, vw, vh);

  // spoon描画（下部に横幅いっぱい）
  if (spoon.complete) {
    const aspect = spoon.naturalWidth / spoon.naturalHeight;
    const width = vw;
    const height = width / aspect;
    ctx.drawImage(spoon, 0, vh - height, width, height);
  }

  // sparkle描画（縦横比維持で中央）
  if (sparkle.complete) {
    const aspect = sparkle.naturalWidth / sparkle.naturalHeight;
    const width = vw;
    const height = width / aspect;
    ctx.drawImage(sparkle, 0, (vh - height)/2, width, height);
  }

  requestAnimationFrame(draw);
}
draw();

// 録画ボタン
recordBtn.addEventListener('click', () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    const stream = canvas.captureStream(30); // 30fps
    let options = { mimeType: 'video/webm; codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: '' };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
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

// ページ離脱でカメラ停止
window.addEventListener('beforeunload', () => {
  if (video.srcObject) video.srcObject.getTracks().forEach(track => track.stop());
});
