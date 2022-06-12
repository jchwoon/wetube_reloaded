const play = document.getElementById("play");
const playBtn = play.querySelector("i");
const mute = document.getElementById("mute");
const muteBtn = mute.querySelector("i");
const video = document.querySelector("video");
const volume = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeLine");
const videoContainer = document.getElementById("videoContainer");
const fullScreen = document.getElementById("fullScreen");
const fullScreenBtn = fullScreen.querySelector("i");
const videoControl = document.getElementById("videoControl");
const textarea = document.querySelector("textarea");

let controlTime = null;
let controlTime2 = null;
let target;

const handlePlay = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = () => {
  let temp = video.volume;
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volume.value = video.muted ? 0 : temp;
};

const handleInputVolume = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    muteBtn.classList = "fas fa-volume-up";
    video.muted = false;
  }
  if (Number(value) === 0) {
    muteBtn.classList = "fas fa-volume-mute";
    video.muted = true;
  }
  video.volume = value;
};

const formatTime = (second) =>
  new Date(second * 1000).toISOString().substring(15, 19);

const handleMetaData = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeLine.max = video.duration;
};
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeLine.value = video.currentTime;
};

const handleInputTimeLine = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handelFullScreen = () => {
  const full = document.fullscreenElement;
  if (full) {
    document.exitFullscreen();
    fullScreenBtn.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.classList = "fas fa-compress";
  }
  document.onfullscreenchange = () => {
    if (!full) {
      fullScreenBtn.classList = "fas fa-compress";
    }
  };
};

const handleMousemove = () => {
  if (controlTime) {
    clearTimeout(controlTime);
    controlTime = null;
  }
  videoControl.classList.add("showing");
  if (controlTime2) {
    clearTimeout(controlTime2);
    controlTime2 = null;
  }
  controlTime2 = setTimeout(() => {
    videoControl.classList.remove("showing");
  }, 3000);
};
const handleMouseLeave = () => {
  controlTime = setTimeout(() => {
    videoControl.classList.remove("showing");
  }, 1000);
};
const handlePlayClick = () => {
  handlePlay();
  handleMousemove();
};
const handlePlayKeyDown = (event) => {
  if (target === event.target) {
    return;
  }
  if (event.key === " ") {
    handlePlay();
    handleMousemove();
  }
  if (event.key === "f") {
    handelFullScreen();
  }
};
const handleEnded = () => {
  const { videoid } = videoContainer.dataset;
  console.log(videoid);
  fetch(`/api/videos/${videoid}/view`, {
    method: "POST",
  });
};

const handleChTarget = (event) => {
  target = event.target;
};

play.addEventListener("click", handlePlay);
mute.addEventListener("click", handleMute);
volume.addEventListener("input", handleInputVolume);
video.addEventListener("loadedmetadata", handleMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeLine.addEventListener("input", handleInputTimeLine);
fullScreen.addEventListener("click", handelFullScreen);
videoContainer.addEventListener("mousemove", handleMousemove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", handlePlayKeyDown);
if (textarea) {
  textarea.addEventListener("click", handleChTarget);
}
