const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const recordBtn = document.getElementById('recordBtn');

let mediaRecorder;
let recordedChunks = [];

// canvas サイズを画面に合わせる
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// カメラ起動（背面カメラ優先）
navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => {
    console.warn('背面カメラ取得失敗、フロントに切替', err);
    return navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { video.srcObject = stream; });
  });

// 画像が読み込まれたら描画開始
spoon.onload = () => { draw(); };

// 描画ループ
function draw() {
  const vw = canvas.width;
  const vh = canvas.height;

  // ① カメラ映像（canvas奥）
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    ctx.drawImage(video, 0, 0, vw, vh);
  }

  // ② spoon（canvas 下端いっぱいに表示）
  if (spoon.complete) {
    const aspect = spoon.naturalWidth / spoon.naturalHeight;
    const width = vw;
    const height = width / aspect;
    const y = vh - height; // 下端に揃える
    ctx.drawImage(spoon, 0, y, width, height);
  }

  requestAnimationFrame(draw);
}

// 録画機能
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
