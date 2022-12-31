import React, { Component } from 'react';
import AnimationPlayer from 'https://cdn.jsdelivr.net/gh/ronen-halevy/yolov3-tfjs/src/AnimationPlayer.js';

export default class VideoControlPanel extends Component {
  constructor(props) {
    super(props);
    // todo add to config
    const height = 416;
    const width = 416;
    this.animPlayer = new AnimationPlayer(this.playCallback, height, width);

    this.state = {
      isVideoPlaying: false,
      videoRate: 1,
      fps: 0,
      currentTime: 0.0,
      duration: 0.0,
    };
  }

  findFps() {
    var thisLoop = new Date();
    const fps = (1000 / (thisLoop - this.lastLoop))
      .toFixed(2)
      .toString()
      .padStart(5, '0');

    this.lastLoop = thisLoop;
    return fps;
  }
  playCallback = (frame, currentTime, duration) => {
    // console.log(currentTime, duration);
    if (frame) {
      this.props.frameCallback(frame);
      // avoid if image:
      if (duration) {
        const fps = this.findFps();
        this.setState({
          fps: fps,
          currentTime: currentTime.toFixed(1),
          duration: duration.toFixed(1),
        });
      }
    } else {
      this.setState({ isVideoPlaying: false });
    }
  };

  feedAnimationControl = () => {
    this.animPlayer.getAnimationControl()();
  };
  onClickVideoSpeed = (e) => {
    const rate =
      this.state.videoRate * 2 > 2.0 ? 0.5 : this.state.videoRate * 2;
    this.animPlayer.setPlaybackRate(rate);
    this.setState({ videoRate: rate });
  };

  onClickPlay = () => {
    if (this.props.dataType == 'video') {
      var isVideoPlaying = this.animPlayer.playVideo(
        this.props.dataUrl
        // this.props.dataType
      );
    } else {
      var isVideoPlaying = this.animPlayer.playImage(this.props.dataUrl);
    }
    this.setState({ isVideoPlaying: isVideoPlaying });
  };

  updateVideoDuration = (e) => {
    this.setState({ currentTime: parseFloat(e.target.value) });
    this.animPlayer.setCurrentTime(e.target.value);
    // videoRef.current.currentTime = parseFloat(e.target.value);
  };
  render() {
    const {} = this.props;
    const onClickPlay = this.onClickPlay;
    return (
      <div className='container '>
        {/* <div className='controlVideo  border border-1 border-secondary position-relative'> */}
        <div className=' row text-center'>
          <div className=' col'>
            <div className=' col-sm text-center badge rounded-pill bg-primary text-center'>
              Video Control
            </div>
          </div>
        </div>

        {/* </div> */}

        <div className='col bg-warning bg-gradient'>
          <div className='container'>
            <div className='row'>
              <div className='col-3  text-center '>
                <span
                  className='btn btn btn-dark  btn-lg  mb-1 position-relative badge '
                  onClick={onClickPlay}
                >
                  {' '}
                  {!this.state.isVideoPlaying ? (
                    <div>play </div>
                  ) : (
                    <div>
                      Stop{' '}
                      <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                        Running
                      </span>
                    </div>
                  )}
                </span>
              </div>
              {/* Speed button */}

              <div className='col-3 text-center'>
                {' '}
                <span
                  className='badge text-bg-dark  position-relative'
                  onClick={this.onClickVideoSpeed}
                >
                  {' '}
                  speed
                  <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
                    x{this.state.videoRate}
                  </span>
                </span>
              </div>

              <div className='col-3 text-center'>
                {' '}
                <span className='badge text-bg-light   position-relative'>
                  <span className=' '>fps: {this.state.fps}</span>
                </span>
              </div>
              <div className='col-3 text-center'>
                <span className='badge text-bg-light  position-relative'>
                  <span className='text-center'>
                    {this.state.currentTime}/{this.state.duration}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <input
            type='range'
            className='form-range'
            min='0'
            max={this.state.duration}
            step='0.1'
            id='customRange3'
            value={this.state.currentTime}
            onChange={this.updateVideoDuration}
          />
        </div>
      </div>
    );
  }
}
