// script.js

const video = document.getElementById('camera');
const hat = document.getElementById('hat');
const spoon = document.getElementById('spoon');

let animationId; // requestAnimationFrame用

// カメラ起動（背面カメラ希望）
navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: { ideal: "environment" } } // 背面カメラ希望
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

// 帽子・スプーンを video の左上を基準に absolute で配置
function updatePositions() {
  const vx = video.offsetLeft;
  const vy = video.offsetTop;
  const vw = video.offsetWidth;
  const vh = video.offsetHeight;

  // 帽子：左側中央より少し上
  hat.style.position = 'absolute';
  hat.style.left = (vx + vw * 0.1) + 'px'; // video 左5%
  hat.style.top = (vy + vh * 0.2) + 'px';   // video 高さの10%下
  hat.style.width = (vw * 0.5) + 'px';  // 画面幅の50%
　hat.style.height = 'auto';            // 縦横比維持

  // スプーン：左側中央より下
  spoon.style.position = 'absolute';
  spoon.style.left = '0px';      // 左端に揃える
　spoon.style.width = '100vw';   // 画面幅いっぱい
　spoon.style.height = 'auto';   // 縦横比を維持

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
