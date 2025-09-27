const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const recordBtn = document.getElementById('recordBtn');

let mediaRecorder;
let recordedChunks = [];
let previewContainer; // プレビューをまとめて管理

// canvas 内部サイズ固定
canvas.width = 1080;
canvas.height = 1920;

// 背面カメラ起動
navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
  .then(stream => { video.srcObject = stream; })
  .catch(err => {
    console.warn('背面カメラ取得失敗、フロントに切替', err);
    return navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { video.srcObject = stream; });
  });

// 描画開始
video.onloadedmetadata = () => {
  video.play();
  draw();
};

spoon.onload = () => { draw(); };

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(video.readyState === video.HAVE_ENOUGH_DATA){
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  if(spoon.complete){
    const aspect = spoon.naturalWidth / spoon.naturalHeight;
    const width = canvas.width;
    const height = width / aspect;
    const y = canvas.height - height;
    ctx.drawImage(spoon, 0, y, width, height);
  }

  requestAnimationFrame(draw);
}

// 🔴 録画ボタン
recordBtn.addEventListener('click', ()=>{
  if(!mediaRecorder || mediaRecorder.state==='inactive'){
    const stream = canvas.captureStream(30);
    let options = { mimeType:'video/webm; codecs=vp9' };
    if(!MediaRecorder.isTypeSupported(options.mimeType)) options={ mimeType:'' };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => { if(e.data.size>0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = showPreview;

    mediaRecorder.start();
    recordBtn.classList.add('recording'); // 点滅開始
  }else if(mediaRecorder.state==='recording'){
    mediaRecorder.stop();
    recordBtn.classList.remove('recording'); // 点滅停止
  }
});

// ✅ プレビュー＆手動保存UI
function showPreview(){
  const blob = new Blob(recordedChunks, {type:'video/webm'});
  const url = URL.createObjectURL(blob);

  // 既存プレビューがあれば消去
  if(previewContainer) previewContainer.remove();

  // コンテナ
  previewContainer = document.createElement('div');
  Object.assign(previewContainer.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999'
  });

  // プレビュー動画
  const previewVideo = document.createElement('video');
  previewVideo.src = url;
  previewVideo.controls = true;
  previewVideo.autoplay = true;
  previewVideo.style.maxWidth = '90vw';
  previewVideo.style.maxHeight = '70vh';

  // 保存ボタン
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '保存する';
  Object.assign(saveBtn.style, {
    marginTop: '20px',
    padding: '20px 40px',
    fontSize: '20px',
    borderRadius: '10px',
    background: '#fff',
    border: 'none',
    cursor: 'pointer'
  });
  saveBtn.addEventListener('click', ()=>{
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pet_chefs_ar.webm';
    a.click();
    URL.revokeObjectURL(url);
  });

  // 閉じる(背景クリックで消える)
  previewContainer.addEventListener('click', e=>{
    if(e.target===previewContainer){
      previewContainer.remove();
      URL.revokeObjectURL(url);
    }
  });

  previewContainer.appendChild(previewVideo);
  previewContainer.appendChild(saveBtn);
  document.body.appendChild(previewContainer);
}

// ページ離脱でカメラ停止
window.addEventListener('beforeunload', ()=>{
  if(video.srcObject) video.srcObject.getTracks().forEach(track=>track.stop());
});
