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
    if (this.videoObject.played) {
      this.videoObject.pause();
      this.videoObject.currentTime = this.videoObject.duration;
    }

    // ronen todo change this to if played - check
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
        this.playCallback(imageObject, null, null);
      });
    };
    runAsync();
    return false;
  };

  // playVideo = (dataUrl) => {
  //   console.log('playVideo!!!!!!!!!!!!');
  //   this.setIsVideoOn(true);
  //   this.videoObject.preload = 'auto';
  //   this.videoObject.crossOrigin = 'anonymous';
  //   this.videoObject.src = dataUrl;
  //   // this.lastLoopRef = new Date();
  //   // this.stopVideo(); // todo - commented with component..
  //   this.videoObject.play();

  //   new Promise((resolve) => {
  //     this.videoObject.onloadedmetadata = () => {
  //       resolve();
  //     };
  //   }).then(() => {
  //     this.durationOfVideo = this.videoObject.duration;
  //     this.traceDurationOfVideo();
  //     this.playCallback(
  //       this.videoObject,
  //       this.videoObject.currentTime,
  //       this.videoObject.duration
  //     );
  //   });
  // };

  getAnimationControl = () => {
    return this.animationControl;
  };

  setPlaybackRate = (rate) => {
    console.log(rate);
    this.videoObject.playbackRate = parseFloat(rate);
  };

  traceDurationOfVideo = () => {
    console.log(this.videoObject.currentTime, this.videoObject.duration);

    this.videoIntervalTime = setInterval(() => {
      console.log(this.videoObject.currentTime, this.videoObject.duration);
      if (this.videoObject.currentTime >= this.videoObject.duration) {
        clearVideoInterval();
      }
    }, 1000);
    const clearVideoInterval = () => {
      clearInterval(this.videoIntervalTime);
      this.videoObject.currentTime = 0;
      this.playCallback(null, null, null);
    };
  };

  setCurrentTime(value) {
    this.videoObject.currentTime = value;
  }

  animationControl = () => {
    // block animation when pause, otherwise last frame sent continuesly
    if (!this.videoObject.paused) {
      var id = window.requestAnimationFrame(() =>
        this.playCallback(
          this.videoObject,
          this.videoObject.currentTime,
          this.videoObject.duration
        )
      );
      // this.findFps();
      // console.log('b', this.videoObject.currentTime);

      if (this.videoObject.currentTime >= this.videoObject.duration) {
        cancelAnimationFrame(id);
        this.setIsVideoOn(false);
      }
    }
  };

  playVideo = (url) => {
    if (!this.videoObject.paused) {
      this.videoObject.pause();
      clearInterval(this.videoIntervalTime);

      return false;
    }
    if (url != this.dataUrl) {
      this.videoObject.currentTime = 0;
    }
    this.dataUrl = url;

    if (this.videoObject.currentTime) {
      this.traceDurationOfVideo();

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
      // this.lastLoopRef = new Date();
      // this.stopVideo(); // todo - commented with component..
      this.videoObject.play();

      new Promise((resolve) => {
        this.videoObject.onloadedmetadata = () => {
          resolve();
        };
      }).then(() => {
        this.durationOfVideo = this.videoObject.duration;
        this.traceDurationOfVideo();
        this.playCallback(
          this.videoObject,
          this.videoObject.currentTime,
          this.videoObject.duration
        );
      });

      // if (!this.dataUrl) {
      //   return false;
      // }

      // if (this.dataUrl) {
      //   this.dataType = 'video';
      //   this.dataType == 'image'
      //     ? this.playImage(this.dataUrl)
      // this.playVideo(this.dataUrl);
      // }
      return true;
      if (this.dataType == 'image') {
        return false;
      } else {
        return true;
      }
    }
  };

  setIsVideoOn(val) {
    this.isVideoOn = val;
  }
}
