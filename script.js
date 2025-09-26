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

// 帽子・小物を画面幅・高さに対して相対配置
function updatePositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 帽子：左側中心より少し上
  hat.style.position = 'absolute';
  hat.style.left = (vw * 0.05) + 'px';  // 左5%
  hat.style.top = (vh * 0.1) + 'px';    // 上10%
  hat.style.width = (vw * 0.4) + 'px';  // 幅40%
  hat.style.height = 'auto';            // 縦横比維持

  // スプーン：左側中心より下
  spoon.style.position = 'absolute';
  spoon.style.left = (vw * 0.05) + 'px';
  spoon.style.top = (vh * 0.6) + 'px';  // 下60%
  spoon.style.width = (vw * 0.4) + 'px';
  spoon.style.height = 'auto';

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
