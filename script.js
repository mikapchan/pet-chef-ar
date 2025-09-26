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

  // 帽子サイズ
  const hatWidth = 150;
  const hatHeight = 80;

  // 小物サイズ
  const spoonWidth = 80;
  const spoonHeight = 80;

  // 帽子を画面中央上寄せ
  hat.style.position = 'absolute';
  hat.style.width = hatWidth + 'px';
  hat.style.height = hatHeight + 'px';
  hat.style.left = (vw/2 - hatWidth/2) + 'px';
  hat.style.top = (vh/3 - hatHeight/2) + 'px';

  // 小物を画面中央下寄せ
  spoon.style.position = 'absolute';
  spoon.style.width = spoonWidth + 'px';
  spoon.style.height = spoonHeight + 'px';
  spoon.style.left = (vw/2 - spoonWidth/2) + 'px';
  spoon.style.top = (vh*2/3 - spoonHeight/2) + 'px';

  requestAnimationFrame(updatePositions);
}

updatePositions();
