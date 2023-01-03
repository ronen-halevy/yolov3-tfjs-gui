export default class VfbfStreamer {
  /**
   * Brief description of the class here
   * @extends ParentClassNameHereIfAny
   */
  constructor(playCallback, canvasHeight, canvasWidth, endedCallback) {
    this.videoObject = document.createElement('video');
    // this.videoObject.height = canvasHeight; // in px
    // this.videoObject.width = canvasWidth;
    this.playCallback = playCallback;
    this.endedCallback = endedCallback;
  }

  stopVideo = () => {
    this.videoObject.pause();
    this.videoObject.currentTime = 0;
  };

  playImage = (dataUrl) => {
    var imageObject = new window.Image();
    //
    this.stopVideo();
    const fetchImage = async () => {
      const res = await fetch(dataUrl);
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      imageObject.src = imageObjectURL;
      imageObject.addEventListener('load', async () => {
        this.playCallback(imageObject, 0, 0);
      });
    };
    fetchImage();
    return false;
  };

  getAnimationControl = () => {
    return this.#animationControl;
  };

  setPlaybackRate = (rate) => {
    this.videoObject.playbackRate = parseFloat(rate);
  };

  setCurrentTime(value) {
    this.videoObject.currentTime = value;
  }

  #animationControl = () => {
    var id = window.requestAnimationFrame(() =>
      this.playCallback(
        this.videoObject,
        this.videoObject.currentTime,
        this.videoObject.duration
      )
    );
    if (
      this.videoObject.currentTime >= this.videoObject.duration ||
      this.videoObject.paused
    ) {
      cancelAnimationFrame(id);
      this.endedCallback();
    }
  };

  playVideo = (url) => {
    if (!this.videoObject.paused) {
      // pause if playing
      this.videoObject.pause();
      return false;
    }

    if (url != this.dataUrl) {
      // if new video - restart.
      this.videoObject.currentTime = 0;
    }
    this.dataUrl = url;

    if (this.videoObject.currentTime) {
      // resume
      this.videoObject.play();
      this.playCallback(
        this.videoObject,
        this.videoObject.currentTime,
        this.videoObject.duration
      );
      return true;
    } else {
      // start new video
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
}
