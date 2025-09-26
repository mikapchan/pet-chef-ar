// script.js

const video = document.getElementById('camera');
const hat = document.getElementById('hat');
const spoon = document.getElementById('spoon');

let animationId; // requestAnimationFrame用

// カメラ起動（背面カメラ）
navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: { exact: "environment" } } // 外カメラ
})
.then(stream => {
  if ('srcObject' in video) {
    video.srcObject = stream;
  } else {
    video.src = window.URL.createObjectURL(stream);
  }
  video.play().catch(err => console.error('Video play error:', err));
})
.catch(err => { 
  console.error('カメラアクセス失敗:', err);
  // fallback: 前面カメラ
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(stream => { video.srcObject = stream; video.play(); })
    .catch(err => console.error('前面カメラも失敗:', err));
});

// ペット顔トラッキングなしでもOK: 画面中央に固定配置
function updatePositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 帽子と小物を固定位置に
  hat.style.position = 'absolute';
  hat.style.left = (vw / 2 - 50) + 'px'; // 調整可
  hat.style.top = (vh / 3) + 'px';       // 調整可

  spoon.style.position = 'absolute';
  spoon.style.left = (vw / 2 - 30) + 'px'; // 調整可
  spoon.style.top = (vh / 2) + 'px';       // 調整可

  animationId = requestAnimationFrame(updatePositions);
}

// ループ開始
updatePositions();

// カメラ停止関数
function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// requestAnimationFrame停止関数
function stopUpdate() {
  if (animationId) cancelAnimationFrame(animationId);
}

// ページ離脱時にカメラとループを停止
window.addEventListener('beforeunload', () => {
  stopUpdate();
  stopCamera();
});
