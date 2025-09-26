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

// 帽子・小物を背景フレームと同じサイズで重ねる
function updatePositions() {
  // 左上を原点にして幅・高さ100%で揃える
  hat.style.position = 'absolute';
  hat.style.left = '0';
  hat.style.top = '0';
  hat.style.width = '100%';
  hat.style.height = '100%';

  spoon.style.position = 'absolute';
  spoon.style.left = '0';
  spoon.style.top = '0';
  spoon.style.width = '100%';
  spoon.style.height = '100%';

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
