const video = document.getElementById('camera');
const hat = document.getElementById('hat');
const spoon = document.getElementById('spoon');

// カメラ起動（背面カメラ）
navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error('カメラアクセス失敗', err); });

// 画像が読み込まれたら幅・高さ・位置を設定
hat.onload = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  hat.style.position = 'absolute';
  hat.style.width = (vw * 0.8) + 'px';   // 画面幅の50%
  hat.style.height = 'auto';             // 縦横比維持
  hat.style.left = (vw * 0.25) + 'px';   // 中央寄せ
  hat.style.top  = (vh * 0.1) + 'px';    // 上から10%
};

spoon.onload = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  spoon.style.position = 'absolute';
  spoon.style.width = vw + 'px';          // 画面幅いっぱい
  spoon.style.height = 'auto';
  spoon.style.left = '0px';
  spoon.style.top = (vh - spoon.offsetHeight) + 'px'; // 下端に配置
};

// 位置を毎フレーム更新（必要に応じて）
function updatePositions() {
  // 帽子とスプーンの位置はロード後に固定されているので、
  // 毎フレームの幅更新は不要
  requestAnimationFrame(updatePositions);
}
updatePositions();

// ページ離脱時にカメラ停止
window.addEventListener('beforeunload', () => {
  if(video.srcObject){
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
