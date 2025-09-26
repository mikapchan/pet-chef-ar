const video = document.getElementById('camera');
const hat = document.getElementById('hat');
const spoon = document.getElementById('spoon');

// カメラ起動（背面カメラ）
navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error('カメラアクセス失敗', err); });

// 位置とサイズを更新
function updatePositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 帽子：画面幅の50%、上部に配置
  hat.style.position = 'absolute';
  hat.style.width = (vw * 0.5) + 'px';   // 幅50%
  hat.style.height = 'auto';             // 縦横比維持
  hat.style.left = (vw * 0.25) + 'px';   // 左から25%で中央寄せ
  hat.style.top  = (vh * 0.1) + 'px';    // 上から10%

  // スプーン：画面幅いっぱい、下部に配置
  spoon.style.position = 'absolute';
  spoon.style.width = vw + 'px';         // 幅100%
  spoon.style.height = 'auto';
  spoon.style.left = '0px';              // 左端
  spoon.style.top = (vh - spoon.offsetHeight) + 'px'; // 下端に配置

  requestAnimationFrame(updatePositions);
}

updatePositions();

// ページ離脱時にカメラ停止
window.addEventListener('beforeunload', () => {
  if(video.srcObject){
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
