import React, { Component } from 'react';
const { VfbfStreamer } = require('../VfbfStreamer');
import Render from '../utils/Render.js';

export class VideoControlPanel extends Component {
  constructor(props) {
    super(props);
    this.vfbfStreamer = new VfbfStreamer(
      this.vfbfStreamerFrameCallBack,
      this.vfbfStreamerEndedCallback
    );

    this.state = {
      scale: 0.25,
      videoRate: 1,
      currentTime: 0,
    };
    this.canvasRefVideo = React.createRef();
  }

  componentDidMount() {
    this.draw = new Render(this.canvasRefVideo.current);
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
  vfbfStreamerFrameCallBack = (frame, currentTime, duration) => {
    const pr = this.props.doD(frame, currentTime, duration);
    pr.then((reasultArrays) => {
      let [selBboxes, scores, classIndices] = reasultArrays;

      this.doDetection(
        frame,
        selBboxes,
        scores,
        classIndices,
        currentTime,
        duration
      );
    });
  };
  doDetection = (
    frame,
    selBboxes,
    scores,
    classIndices,
    currentTime,
    duration
  ) => {
    // this.yoloPredictor.detectFrame(frame).then((reasultArrays) => {
    const isVideoFrame = duration != 0;
    var imageHeight =
      (isVideoFrame ? frame.videoHeight : frame.height) * this.state.scale;
    var imageWidth =
      (isVideoFrame ? frame.videoWidth : frame.width) * this.state.scale;
    this.draw.renderOnImage(
      frame,
      selBboxes,
      scores,
      classIndices,
      this.props.classNames,
      imageWidth,
      imageHeight
    );

    // avoid if image (not a video):
    if (isVideoFrame) {
      const fps = this.findFps();
      this.setState({
        fps: fps,
        currentTime: currentTime.toFixed(1),
        duration: duration.toFixed(1),
      });
      this.vfbfStreamer.animationControl();
    }
  };

  vfbfStreamerEndedCallback = () => {
    this.setState({ isVideoPlaying: false });
  };

  onClickPlay = () => {
    var isVideoPlaying =
      this.props.dataType == 'video'
        ? this.vfbfStreamer.playVideo(this.props.dataUrl)
        : this.vfbfStreamer.playImage(this.props.dataUrl);
    this.setState({ isVideoPlaying: isVideoPlaying });
  };

  onChangeCurrentTime = (e) => {
    this.setState({ currentTime: parseFloat(e.target.value) });
    this.vfbfStreamer.setCurrentTime(e.target.value);
  };

  onClickScale = () => {
    const [min, max, stride] = [0.125, 2, 2];
    const newScale =
      this.state.scale * stride > max ? min : this.state.scale * stride;
    this.setState({ scale: newScale });
  };
  onClickVideoSpeed = () => {
    const [min, max, stride] = [0.5, 2, 2];
    const newRate =
      this.state.videoRate * stride > max ? min : this.state.videoRate * stride;
    this.setState({ videoRate: newRate });
    this.vfbfStreamer.setPlaybackRate(newRate);
  };

  render() {
    return (
      <div className='container'>
        <div className=' row text-center'>
          <div className=' col'>
            <div className=' col-sm text-center badge rounded-pill btn-outline-secondary text-dark text-center'>
              Video Control
            </div>
          </div>
        </div>
        <div className='col bg-warning bg-gradient'>
          <div className='container'>
            <div className='row'>
              {/* Speed button */}

              <div className='col-4 text-center'>
                {' '}
                <span
                  className='badge text-bg-dark  position-relative'
                  onClick={this.onClickVideoSpeed}
                >
                  {' '}
                  Speed
                  <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
                    x{this.state.videoRate}
                  </span>
                </span>
              </div>
              {/* fps display */}

              <div className='col-4 text-center'>
                {' '}
                <span className='badge text-bg-light   position-relative'>
                  <span className=' '>fps: {this.state.fps}</span>
                </span>
              </div>
              {/* time display */}

              <div className='col-4 text-center'>
                <span className='badge text-bg-light  position-relative'>
                  <span className='text-center'>
                    {this.state.currentTime}/{this.state.duration}
                  </span>
                </span>
              </div>
            </div>
            {/* range bar */}
            <input
              type='range'
              className='form-range'
              min='0'
              max={this.state.duration}
              step='0.1'
              id='customRange3'
              value={this.state.currentTime}
              onChange={this.onChangeCurrentTime}
            />
            <label className='mb-1 row'>
              <span className='col'>
                Touch<b className=''>Canvas</b>
                {/* Scale button */}
                <span
                  className='badge text-bg-dark  position-relative mx-1 '
                  onClick={this.onClickScale}
                >
                  {' '}
                  Scale
                  <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success'>
                    x{this.state.scale}
                  </span>
                </span>
                {/* on off indicator */}
                <span className='mx-1 '>
                  {!this.state.isVideoPlaying ? (
                    <span className='  ' role='status'></span>
                  ) : (
                    <span className=' bg-light ' role='status'>
                      running
                    </span>
                  )}
                </span>{' '}
              </span>
            </label>
          </div>
        </div>
        {/* canvas */}
        <label className='btn btn-dark   badge ' onClick={this.onClickPlay}>
          <canvas
            className='visible'
            ref={this.canvasRefVideo}
            width=''
            height=''
          />
        </label>
      </div>
    );
  }
}
