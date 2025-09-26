// script.js

const video = document.getElementById('camera');
const hat = document.getElementById('hat');
const spoon = document.getElementById('spoon');

let animationId; // requestAnimationFrame用

// カメラ起動（背面カメラ希望）
navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: { ideal: "environment" } } // 背面カメラを希望
})
.then(stream => {
  video.srcObject = stream;
  video.play().catch(err => console.error('Video play error:', err));
})
.catch(err => { 
  console.error('カメラアクセス失敗:', err);
  // フォールバック: 前面カメラ
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(stream => { 
      video.srcObject = stream; 
      video.play().catch(err => console.error('Fallback play error:', err));
    })
    .catch(err => console.error('前面カメラも失敗:', err));
});

// 帽子・小物を video の左側上下に配置
function updatePositions() {
  const vw = video.offsetWidth;
  const vh = video.offsetHeight;
  const vx = video.offsetLeft;
  const vy = video.offsetTop;

  // 帽子：左側中央より少し上
  hat.style.position = 'absolute';
  hat.style.width = (vw / 2) + 'px'; // 左半分に収める
  hat.style.height = 'auto';         // 元比率を維持
  hat.style.left = vx + 'px';
  hat.style.top = vy + vh * 0.15 + 'px'; // 少し上にずらす

  // スプーン：左側中央より下
  spoon.style.position = 'absolute';
  spoon.style.width = (vw / 2) + 'px';
  spoon.style.height = 'auto';
  spoon.style.left = vx + 'px';
  spoon.style.top = vy + vh * 0.6 + 'px'; // 下にずらす

  animationId = requestAnimationFrame(updatePositions);
}

// ループ開始
updatePositions();

// カメラ停止
function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// requestAnimationFrame停止
function stopUpdate() {
  if (animationId) cancelAnimationFrame(animationId);
}

// ページ離脱時に停止
window.addEventListener('beforeunload', () => {
  stopUpdate();
  stopCamera();
});
