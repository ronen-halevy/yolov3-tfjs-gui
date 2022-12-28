export default class Player {
  constructor(playCallback, canvasHeight, canvasWidth) {
    this.videoObject = document.createElement('video');
    this.videoObject.controls = true;
    this.videoObject.muted = true;
    this.videoObject.height = canvasHeight; // in px
    this.videoObject.width = canvasWidth;
    this.playCallback = playCallback;
    this.dataType = 'video'; // set as a default...
    this.videoObject.src = 'null';
    console.log(this.videoObject.src);
  }

  setDataUrl = (url, type) => {
    this.dataUrl = url;
    this.dataType = type;
  };

  stopVideo = () => {
    this.setIsVideoOn(false);
    // avoid erros for video not yet activated case - constructor assigned null
    const src = /[^/]*$/.exec(this.videoObject.src)[0];
    console.log(src);
    if (src != 'null') {
      console.log(src);
      this.videoObject.pause();
      console.log(src);
      console.log(this.videoObject.duration);

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
      this.stopVideo();
      imageObject.addEventListener('load', async () => {
        this.playCallback(imageObject);
      });
    };
    runAsync();
  };

  playVideo = (dataUrl) => {
    console.log('playVideo, setIsVideoOn!!!');
    this.setIsVideoOn(true);
    this.videoObject.preload = 'auto';
    this.videoObject.crossOrigin = 'anonymous';
    this.videoObject.src = dataUrl;
    this.lastLoopRef = new Date();
    // this.stopVideo(); // todo - commented with component..
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
      console.log('in promise playVideo');
      this.durationOfVideo = this.videoObject.duration;
      this.traceDurationOfVideo();
      this.playCallback(this.videoObject);
    });
  };

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
    return this.isVideoPaused;
  };

  setPlaybackRate = (rate) => {
    this.videoObject.playbackRate = parseFloat(rate);
  };

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
    // this.findFps();
    if (this.videoObject.currentTime >= this.videoObject.duration) {
      cancelAnimationFrame(id);
      this.setIsVideoOn(false);
    }
  };

  onClickPlay = () => {
    console.log('!!!!!!!!!!!!!!!onClickPlay', this.isVideoOn);
    if (this.isVideoOn) {
      this.stopVideo();
      this.setIsVideoOn(false);
      return false;
    }
    // this.stopVideo();// prevents sopping now

    console.log('onClickPlay');
    console.log(this.dataUrl);
    if (this.dataUrl) {
      this.dataType == 'image'
        ? this.playImage(this.dataUrl)
        : this.playVideo(this.dataUrl);
    }
    return true;
  };
  setIsVideoOn(val) {
    console.log('setIsVideoOn', val);
    this.isVideoOn = val;
  }
}
