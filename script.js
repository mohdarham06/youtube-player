




const videoContainer = document.querySelector('.video-container');
const video = document.querySelector('video');

// play icon
const playPauseBtn = document.querySelector('.play-pause-btn');

// volume elements
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");

// duration elements
const currentTimeElem = document.querySelector('.current-time');
const totalTimeElem = document.querySelector('.total-time');

// captions icon
const captionsBtn = document.querySelector('.captions-btn');

// speed icon
const speedBtn = document.querySelector('.speed-btn');

// veiw mode btns
const miniPlayerBtn = document.querySelector('.mini-player-btn');
const theaterBtn = document.querySelector('.theater-btn');
const fullScreenBtn = document.querySelector('.full-screen-btn');

// timeline
const timelineContainer = document.querySelector('.timeline-container');

// images
const previewImg = document.querySelector('.preview-img');
const thumbnailImg = document.querySelector('.thumbnail-img');






// Keys
document.addEventListener('keydown', e => {
    const tagName = document.activeElement.tagName.toLowerCase();
    if (tagName == "input") return
    switch (e.key.toLowerCase()) {
        case " ":
            if (tagName == "button") return
        case "k":
            togglePlay()
            break;

        case "m":
            toggleMute();
            break;

        case "arrowleft":
        case "j":
            skip(-5);
            break;

        case "arrowright":
        case "l":
            skip(+5);
            break;

        case "i":
            toggleMiniPlayerMode()
            break;

        case "t":
            toggleTheaterMode()
            break;

        case "f":
            toggleFullScreenMode()
            break;
    }
})






// Play/Pause
function togglePlay() {
    video.paused ? video.play() : video.pause();
}

playPauseBtn.addEventListener('click', togglePlay)
video.addEventListener('click', togglePlay)

video.addEventListener('play', () => {
    videoContainer.classList.remove('paused')
})
video.addEventListener('pause', () => {
    videoContainer.classList.add('paused')
})







// *** Volume ***
muteBtn.addEventListener('click', toggleMute);
volumeSlider.addEventListener('input', e => {
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
});


function toggleMute() {
    video.muted = !video.muted;
}

video.addEventListener('volumechange', () => {
    volumeSlider.value = video.volume;
    let volumeLevel
    if (video.muted || video.volume === 0) {
        volumeSlider.value = 0;
        volumeLevel = "muted";

    } else if (video.volume >= 0.5) {
        volumeLevel = "high";

    } else {
        volumeLevel = "low";
    }

    videoContainer.dataset.volumeLevel = volumeLevel;
})





// duration
video.addEventListener('loadeddata', () => {
    totalTimeElem.textContent = formatDuration(video.duration);
})
video.addEventListener('timeupdate', () => {
    currentTimeElem.textContent = formatDuration(video.currentTime);
    const percent = video.currentTime / video.duration;
    timelineContainer.style.setProperty("--progress-position", percent);
})


const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
});

function formatDuration(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`
    } else {
        return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`
    }
}

function skip(duration) {
    video.currentTime += duration;
}






// captions
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)
function toggleCaptions() {
    const isHidden = captions.mode === "hidden"
    captions.mode = isHidden ? "showing" : "hidden"
    videoContainer.classList.toggle("captions", isHidden)
}




// playback speed
speedBtn.addEventListener('click', changePlayBackSpeed)
function changePlayBackSpeed() {
    let newPlayBackRate = video.playbackRate + 0.25;
    if (newPlayBackRate > 2) newPlayBackRate = 0.25;

    video.playbackRate = newPlayBackRate;
    speedBtn.textContent = `${newPlayBackRate}x`
}




// *** View Modes ***
// mini player mode
function toggleMiniPlayerMode() {
    if (videoContainer.classList.contains('mini-player')) {
        document.exitPictureInPicture()
    } else {
        video.requestPictureInPicture()
    }
}
video.addEventListener('enterpictureinpicture', () => {
    videoContainer.classList.add('mini-player')
})
video.addEventListener('leavepictureinpicture', () => {
    videoContainer.classList.remove('mini-player')
})

// theater mode
function toggleTheaterMode() {
    videoContainer.classList.toggle('theater')
}

// full screen mode
function toggleFullScreenMode() {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}
document.addEventListener('fullscreenchange', () => {
    videoContainer.classList.toggle('full-screen', document.fullscreenElement)
})


miniPlayerBtn.addEventListener('click', toggleMiniPlayerMode)
theaterBtn.addEventListener('click', toggleTheaterMode)
fullScreenBtn.addEventListener('click', toggleFullScreenMode)












// timeline
timelineContainer.addEventListener('mousemove', handleTimeLineUpdate)
timelineContainer.addEventListener('mousedown', toggleScrubbing)
document.addEventListener('mouseup', e => {
    if(isScrubbing) toggleScrubbing(e);
})
document.addEventListener('mousemove', e => {
    if(isScrubbing) handleTimeLineUpdate(e);
})


let isScrubbing = false;
let wasPaused;
function toggleScrubbing(e) {
    const rectangle = timelineContainer.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.x - rectangle.x), rectangle.width) / rectangle.width;

    // setting scrubbing or not
    isScrubbing = (e.buttons & 1) === 1;
    videoContainer.classList.toggle('scrubbing', isScrubbing);

    if(isScrubbing) {
        // setting video was paused or not
        wasPaused = video.paused;
        // pause when we are scrubbing
        video.pause()
    } else {
        video.currentTime = percent * video.duration;
        // if not paused then play
        if (!wasPaused) video.play()
    }
    handleTimeLineUpdate(e)
}


function handleTimeLineUpdate(e) {
    const rectangle = timelineContainer.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.x - rectangle.x), rectangle.width) / rectangle.width;
    timelineContainer.style.setProperty("--preview-position", percent)
    

    // const previewImgNumber = Math.max(1, Math.floor((percent * video.duration) / 10))
    // const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`
    // previewImg.src = previewImgSrc


    if (isScrubbing) {
        // preventing default text highlight when its scrubbing
        e.preventDefault()
        // thumbnailImg.src = previewImgSrc
        timelineContainer.style.setProperty("--progress-position", percent)
      }
}









