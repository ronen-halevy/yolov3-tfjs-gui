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

  stopVideo = () => {
    if (this.videoObject.played.length) {
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
      this.stopVideo();
      imageObject.addEventListener('load', async () => {
        this.playCallback(imageObject, null, null);
      });
    };
    runAsync();
    return false;
  };

  getAnimationControl = () => {
    return this.animationControl;
  };

  setPlaybackRate = (rate) => {
    console.log(rate);
    this.videoObject.playbackRate = parseFloat(rate);
  };

  setCurrentTime(value) {
    this.videoObject.currentTime = value;
  }

  animationControl = () => {
    // block animation when pause, otherwise last frame sent continuesly
    // if (!this.videoObject.paused) {
    var id = window.requestAnimationFrame(() =>
      this.playCallback(
        this.videoObject,
        this.videoObject.currentTime,
        this.videoObject.duration
      )
    );
    // this.findFps();
    console.log('b', this.videoObject.currentTime, this.videoObject.duration);

    if (
      this.videoObject.currentTime >= this.videoObject.duration ||
      this.videoObject.paused
    ) {
      cancelAnimationFrame(id);
      this.setIsVideoOn(false);
      this.playCallback(null, null, null);
    }
  };

  playVideo = (url) => {
    if (!this.videoObject.paused) {
      this.videoObject.pause();

      return false;
    }
    if (url != this.dataUrl) {
      this.videoObject.currentTime = 0;
    }
    this.dataUrl = url;

    if (this.videoObject.currentTime) {
      this.videoObject.play();
      this.playCallback(
        this.videoObject,
        this.videoObject.currentTime,
        this.videoObject.duration
      );
      return true;
    } else {
      this.setIsVideoOn(true);
      this.videoObject.preload = 'auto';
      this.videoObject.crossOrigin = 'anonymous';
      this.videoObject.src = url;
      this.videoObject.play();

      new Promise((resolve) => {
        this.videoObject.onloadedmetadata = () => {
          resolve();
        };
      }).then(() => {
        this.durationOfVideo = this.videoObject.duration;
        this.playCallback(
          this.videoObject,
          this.videoObject.currentTime,
          this.videoObject.duration
        );
      });

      return true;
    }
  };

  setIsVideoOn(val) {
    this.isVideoOn = val;
  }
}
