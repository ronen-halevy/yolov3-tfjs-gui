import React, { Component } from 'react';

export default class VideoControlPanel extends Component {
  onClickVideoSpeed1 = (e) => {
    const speed = videoSpeed * 2 > 2.0 ? 0.5 : videoSpeed * 2;
    videoRef.current.playbackRate = parseFloat(speed);
    setVideoSpeed(speed);
  };

  render() {
    const {
      onClickVideoSpeed,
      videoSpeed,
      fps,
      currentDurationOfVideo,
      durationOfVideo,
      isVideoOn,
      pauseResumeVideo,
      isVideoPaused,

      onClickPlay,
    } = this.props;

    return (
      <div className='row'>
        {/* Speed button */}
        <div className='col-4  text-center position-relative mb-1'>
          <span className='badge text-bg-dark  ' onClick={onClickVideoSpeed}>
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
              x{videoSpeed}
            </span>
          </span>
        </div>
        {/* Pause resume button */}
        <div className='col-4 text-center'>
          <span
            className='badge text-bg-dark mx-2'
            onClick={isVideoOn ? pauseResumeVideo : () => {}}
          >
            {isVideoPaused ? 'resume' : 'pasue'}
          </span>
        </div>
        {/* Run-stop button */}
        <div className='col-4  text-center'>
          <span
            className='btn btn btn-dark  btn-lg  mb-1 position-relative badge '
            onClick={onClickPlay}
          >
            {' '}
            {!isVideoOn ? (
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
