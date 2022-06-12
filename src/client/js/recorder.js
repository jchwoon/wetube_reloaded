import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const startBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const createDownloadLink = (fileurl, filename) => {
  const a = document.createElement("a");
  a.href = fileurl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
};

const handleDownloadClick = async () => {
  startBtn.removeEventListener("click", handleDownloadClick);
  startBtn.innerText = "Transcoding...";
  startBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));

  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
  await ffmpeg.run(
    "-i",
    "recording.webm",
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    "thumbnail.jpg"
  );

  const mp4File = ffmpeg.FS("readFile", "output.mp4");
  const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  createDownloadLink(mp4Url, "Myrecording.mp4");
  createDownloadLink(thumbUrl, "My Thumbnail.jpg");

  ffmpeg.FS("unlink", "recording.webm");
  ffmpeg.FS("unlink", "thumbnail.jpg");
  ffmpeg.FS("unlink", "output.mp4");

  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);
  URL.revokeObjectURL(mp4Url);

  startBtn.innerText = "Record Again";
  startBtn.disabled = false;
  startBtn.addEventListener("click", handleStartBtnClick);
};

const handleStopBtnClick = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStopBtnClick);
  startBtn.addEventListener("click", handleDownloadClick);
  recorder.stop();
};

const handleStartBtnClick = () => {
  startBtn.innerText = "Stop Recordiing";
  startBtn.removeEventListener("click", handleStartBtnClick);
  startBtn.addEventListener("click", handleStopBtnClick);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.play();
    video.loop = true;
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};
init();

startBtn.addEventListener("click", handleStartBtnClick);
