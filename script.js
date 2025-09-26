const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const sparkle = document.getElementById('sparkle');
const recordBtn = document.getElementById('recordBtn');

let mediaRecorder;
let recordedChunks = [];

// canvasサイズを画面サイズに
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

// 画像が読み込まれたら描画開始
let imagesLoaded = 0;
function checkAllLoaded() {
  imagesLoaded++;
  if(imagesLoaded === 2) draw();
}
spoon.onload = checkAllLoaded;
sparkle.onload = checkAllLoaded;

// 描画ループ
function draw() {
  const vw = canvas.width;
  const vh = canvas.height;

  // ① カメラ映像（奥）
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    ctx.drawImage(video, 0, 0, vw, vh);
  }

  // ② spoon（下部いっぱいに表示）
  if (spoon.complete) {
    const aspect = spoon.naturalWidth / spoon.naturalHeight;
    const width = vw;
    const height = width / aspect;
    ctx.drawImage(spoon, 0, vh - height, width, height);
  }

  // ③ sparkle（中央）
  if (sparkle.complete) {
    const aspect = sparkle.naturalWidth / sparkle.naturalHeight;
    const width = vw;
    const height = width / aspect;
    ctx.drawImage(sparkle, 0, (vh - height)/2, width, height);
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
