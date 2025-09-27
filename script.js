const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spoon = document.getElementById('spoon');
const sparkle = document.getElementById('sparkle');
const recordBtn = document.getElementById('recordBtn');

let mediaRecorder;
let recordedChunks = [];
let recording = false;
let blinkInterval;

// canvas 内部サイズ固定 1080x1920
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

// spoon と sparkle の読み込み完了で描画開始
spoon.onload = () => draw();
sparkle.onload = () => draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // カメラ映像
  if(video.readyState === video.HAVE_ENOUGH_DATA){
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  // spoon：canvas 下端に幅いっぱい表示
  if(spoon.complete){
    const aspect = spoon.naturalWidth / spoon.naturalHeight;
    const width = canvas.width;
    const height = width / aspect;
    const y = canvas.height - height;
    ctx.drawImage(spoon, 0, y, width, height);
  }

  // sparkle GIF：canvas 全体に描画
  if(sparkle.complete){
    ctx.drawImage(sparkle, 0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(draw);
}

// 録画ボタン
recordBtn.addEventListener('click', ()=>{
  if(!mediaRecorder || mediaRecorder.state==='inactive'){
    // 録画開始
    const stream = canvas.captureStream(30);
    let options = { mimeType:'video/webm; codecs=vp9' };
    if(!MediaRecorder.isTypeSupported(options.mimeType)) options={ mimeType:'' };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => { if(e.data.size>0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = ()=>{
      const blob = new Blob(recordedChunks, {type:'video/webm'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pet_chefs_ar.webm';
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    recording = true;

    // 録画中点滅
    blinkInterval = setInterval(()=>{
      recordBtn.style.opacity = recordBtn.style.opacity === '0.4' ? '1' : '0.4';
    }, 500);

  } else if(mediaRecorder.state==='recording'){
    // 録画停止
    mediaRecorder.stop();
    recording = false;
    clearInterval(blinkInterval);
    recordBtn.style.opacity = '1';
  }
});

// ページ離脱でカメラ停止
window.addEventListener('beforeunload', ()=>{
  if(video.srcObject) video.srcObject.getTracks().forEach(track=>track.stop());
});
