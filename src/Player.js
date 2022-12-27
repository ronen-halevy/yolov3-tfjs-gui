export default class Player {
  constructor(playCallback, canvasHeight, canvasWidth) {
    this.videoObject = document.createElement('video');
    this.videoObject.controls = true;
    this.videoObject.muted = true;
    this.videoObject.height = canvasHeight; // in px
    this.videoObject.width = canvasWidth;
    this.playCallback = playCallback;
    this.dataType = 'video'; // set as a default...
  }

  setDataUrl = (url, type) => {
    this.stopVideo();
    this.dataUrl = url;
    this.dataType = type;
  };

  stopVideo = () => {
    this.setIsVideoOn(false);

    if (this.videoObject.src != '') {
      this.videoObject.pause();
      this.videoObject.currentTime = this.videoObject.duration;
    }
  };

  playImage = (dataUrl) => {
    var imageObject = new window.Image();
    const runAsync = async () => {
      const res = await fetch(dataUrl);
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      imageObject.src = imageObjectURL;
      imageObject.addEventListener('load', async () => {
        this.playCallback(imageObject);
        // yoloPredictor.current.detectFrameVideo(
        //   imageObject,
        // );
      });
    };
    runAsync();
  };

  playVideo = (dataUrl) => {
    this.setIsVideoOn(true);
    this.videoObject.preload = 'auto';
    this.videoObject.crossOrigin = 'anonymous';
    this.videoObject.src = dataUrl;
    this.lastLoopRef = new Date();
    this.videoObject.play();

    // new Promise((resolve) => {
    //   videoRef.current.onloadedmetadata = () => {
    //     resolve();
    //   };
    // }).then(() => {

    new Promise((resolve) => {
      this.videoObject.onloadedmetadata = () => {
        resolve();
      };
    }).then(() => {
      this.durationOfVideo = this.videoObject.duration;
      this.traceDurationOfVideo();
      this.playCallback(this.videoObject);
    });
  };

  findFps() {
    var thisLoop = new Date();
    this.setFps = 1000 / (thisLoop - this.lastLoop);
    this.lastLoop = thisLoop;
  }

  getAnimationControl = () => {
    return this.animationControl;
  };
  pauseResumeVideo = () => {
    if (this.isVideoPaused) {
      this.videoObject.play();
      this.isVideoPaused = false;
    } else {
      this.videoObject.pause();
      this.isVideoPaused = true;
    }
  };

  // onClickVideoSpeed = (e) => {
  //   const speed = videoSpeed * 2 > 2.0 ? 0.5 : videoSpeed * 2;
  //  this.videoObject.playbackRate = parseFloat(speed);
  //   setVideoSpeed(speed);
  // };

  traceDurationOfVideo = () => {
    const videoIntervalTime = setInterval(() => {
      this.currentDurationOfVideo = parseFloat(
        this.videoObject.currentTime
      ).toFixed(1);

      if (
        parseFloat(this.videoObject.currentTime) >= this.videoObject.duration
      ) {
        clearVideoInterval();
      }
    }, 500);

    const clearVideoInterval = () => {
      clearInterval(videoIntervalTime);
    };
  };

  animationControl = () => {
    var id = window.requestAnimationFrame(() =>
      this.playCallback(this.videoObject)
    );
    this.findFps();
    if (this.videoObject.currentTime >= this.videoObject.duration) {
      cancelAnimationFrame(id);
      this.setIsVideoOn(false);
    }
  };

  onClickPlay = () => {
    console.log('onClickPlay', this.isVideoOn);
    if (this.isVideoOn) {
      this.stopVideo();
      this.setIsVideoOn(false);
      return;
    }
    this.stopVideo();

    console.log('onClickPlay');
    this.dataType == 'image'
      ? this.playImage(this.dataUrl)
      : this.playVideo(this.dataUrl);
  };
  setIsVideoOn(val) {
    console.log('setIsVideoOn', val);
    this.isVideoOn = val;
  }
}
