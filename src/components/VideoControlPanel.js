import React, { Component } from 'react';
import Player from '../Player';

export default class VideoControlPanel extends Component {
  constructor(props) {
    super(props);
    // todo add to config
    const height = 416;
    const width = 416;
    this.player = new Player(this.playCallback, height, width);

    this.state = {
      isVideoOn: false,
      isVideoPaused: false,
      videoRate: 1,
    };
  }

  findFps() {
    var thisLoop = new Date();
    this.setFps = 1000 / (thisLoop - this.lastLoop);
    this.lastLoop = thisLoop;
  }
  playCallback = (frame) => {
    this.props.frameCallback(frame);
    this.findFps();
  };

  feedAnimationControl = () => {
    this.player.getAnimationControl()();
  };
  onClickVideoSpeed = (e) => {
    const rate =
      this.state.videoRate * 2 > 2.0 ? 0.5 : this.state.videoRate * 2;
    this.player.setPlaybackRate(rate);
    this.setState({ videoRate: rate });
  };
  // onClickVideoSpeed1 = (e) => {
  //   const speed = videoRate * 2 > 2.0 ? 0.5 : videoRate * 2;
  //   playbackRate = parseFloat(speed);
  // };

  onClickPlay = () => {
    this.player.setDataUrl(this.props.dataUrl, this.props.dataType);
    const res = this.player.onClickPlay();
    this.setState({ isVideoOn: res });
    // const pause = res ? false : true;
    this.setState({ isVideoPaused: false });
  };
  pause = () => {
    console.log('pause!!!!');
    const res = this.player.pauseResumeVideo();
    console.log('pause res', res);
    this.setState({ isVideoPaused: res });
  };
  render() {
    const {
      // onClickVideoSpeed,
      videoSpeed,
      fps,
      currentDurationOfVideo,
      durationOfVideo,
      // isVideoOn,
      // pauseResumeVideo,
      // isVideoPaused,

      // onClickPlay,
    } = this.props;
    const onClickPlay = this.onClickPlay;
    return (
      <div className='row'>
        {/* Speed button */}
        <div className='col-4  text-center position-relative mb-1'>
          <span
            className='badge text-bg-dark  '
            onClick={this.onClickVideoSpeed}
          >
            {' '}
            speed
            <span className='badge text-bg-secondary  position-relative'>
              <small className=' '>
                fps: {fps.toFixed(2).toString().padStart(5, '0')}
              </small>
              <small className=' text-dark'>
                {currentDurationOfVideo}/{durationOfVideo}
              </small>
            </span>
            <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
              x{this.state.videoRate}
            </span>
          </span>
        </div>
        {/* Pause resume button */}
        <div className='col-4 text-center'>
          <span
            className='badge text-bg-dark mx-2'
            onClick={this.state.isVideoOn ? this.pause : () => {}}
          >
            {this.state.isVideoPaused ? 'resume' : 'pasue'}
          </span>
        </div>
        {/* Run-stop button */}
        <div className='col-4  text-center'>
          <span
            className='btn btn btn-dark  btn-lg  mb-1 position-relative badge '
            onClick={onClickPlay}
          >
            {' '}
            {!this.state.isVideoOn ? (
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
      </div>
    );
  }
}
