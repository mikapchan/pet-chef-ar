const video = document.getElementById('camera');
const hat = document.getElementById('hat');
const spoon = document.getElementById('spoon');

// カメラ起動
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error('カメラアクセス失敗', err); });

// ペット顔トラッキングなしでもOK: 画面中央に固定配置
function updatePositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  hat.style.left = (vw/2 - 50) + 'px';
  hat.style.top = (vh/3) + 'px';

  spoon.style.left = (vw/2 - 30) + 'px';
  spoon.style.top = (vh/2) + 'px';

  requestAnimationFrame(updatePositions);
}
updatePositions();
