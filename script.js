const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const recordBtn = document.getElementById('recordBtn');

let mediaRecorder;
let recordedChunks = [];
let previewContainer;

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

  // 1️⃣ カメラ映像
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  // 2️⃣ sparkle動画（カメラの上、spoonの下）
  if(sparkle.readyState >= 2){ // HAVE_CURRENT_DATA以上
    ctx.drawImage(sparkle, 0, 0, canvas.width, canvas.height);
  }

  // 3️⃣ spoon（最前面）
  if(spoon.complete){
    const aspect = spoon.naturalWidth / spoon.naturalHeight;
    const width = canvas.width;
    const height = width / aspect;
    const y = canvas.height - height;
    ctx.drawImage(spoon, 0, y, width, height);
  }

  requestAnimationFrame(draw);
}
// 録画ボタン
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
    recordBtn.classList.add('recording');
  }else if(mediaRecorder.state==='recording'){
    mediaRecorder.stop();
    recordBtn.classList.remove('recording');
  }
});

// プレビュー＆保存UI
function showPreview(){
  const blob = new Blob(recordedChunks, {type:'video/webm'});
  const url = URL.createObjectURL(blob);

  if(previewContainer) previewContainer.remove();
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

  const previewVideo = document.createElement('video');
  previewVideo.src = url;
  previewVideo.controls = true;
  previewVideo.autoplay = true;
  previewVideo.style.maxWidth = '90vw';
  previewVideo.style.maxHeight = '70vh';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'MP4に変換して保存';
  Object.assign(saveBtn.style, {
    marginTop: '20px',
    padding: '20px 40px',
    fontSize: '20px',
    borderRadius: '10px',
    background: '#fff',
    border: 'none',
    cursor: 'pointer'
  });
  saveBtn.addEventListener('click', ()=> convertToMp4(blob));

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

// ffmpeg.wasmでwebm→mp4変換
async function convertToMp4(webmBlob){
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  const data = await fetchFile(webmBlob);
  ffmpeg.FS('writeFile','input.webm',data);
  await ffmpeg.run('-i','input.webm','-c:v','libx264','-c:a','aac','output.mp4');

  const mp4Data = ffmpeg.FS('readFile','output.mp4');
  const mp4Blob = new Blob([mp4Data.buffer], { type:'video/mp4' });
  const mp4Url = URL.createObjectURL(mp4Blob);

  const a = document.createElement('a');
  a.href = mp4Url;
  a.download = 'pet_chefs_ar.mp4';
  a.click();
  URL.revokeObjectURL(mp4Url);
}

// ページ離脱でカメラ停止
window.addEventListener('beforeunload', ()=>{
  if(video.srcObject) video.srcObject.getTracks().forEach(track=>track.stop());
});
