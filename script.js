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

  hat.style.position = 'absolute';
spoon.style.position = 'absolute';


  requestAnimationFrame(updatePositions);
}
updatePositions();
