import React, { Component } from 'react';
import Accordion from './components/Accordion';
import ModelSelectionPanel from './components/ModelSelectionPanel';
import ConfigurationsPanel from './components/ConfigurationsPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';
import { VideoControlPanel } from './components/VideoControlPanel';

import Render from './utils/Render.js';
export class Main extends Component {
  constructor(props) {
    super(props);
    this.vfbfStreamer = new VfbfStreamer(
      this.playCallback,
      this.videoEndedCallback
    );

    this.state = {
      isVideoPlaying: false,
      fps: 0,
      currentTime: 0.0,
      duration: 0.0,
      isReady: false,
      title: '',
    };
    this.canvasRefVideo = React.createRef();
  }

  componentDidMount() {
    this.yoloPredictor = new YoloPredictor();
    this.yoloPredictor.setAnimationCallback(this.feedAnimationControl);

    this.draw = new Render(this.canvasRefVideo.current);
    this.setState({ isReady: true });
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
  videoEndedCallback = () => {
    this.setState({ isVideoPlaying: false });
  };

  playCallback = (frame, currentTime, duration) => {
    this.yoloPredictor.detectFrame(frame).then((reasultArrays) => {
      if (duration) {
        var imageHeight = frame.videoHeight * this.scale;
        var imageWidth = frame.videoWidth * this.scale;
      } else {
        var imageHeight = frame.height * this.scale;
        var imageWidth = frame.width * this.scale;
      }
      let [selBboxes, scores, classIndices] = reasultArrays;
      this.draw.renderOnImage(
        frame,
        selBboxes,
        scores,
        classIndices,
        this.classNames,
        imageWidth,
        imageHeight
      );
      // avoid if image (not a video):
      if (duration) {
        const fps = this.findFps();
        this.setState({
          fps: fps,
          currentTime: currentTime.toFixed(1),
          duration: duration.toFixed(1),
        });
        this.feedAnimationControl();
      }
    });
  };

  feedAnimationControl = () => {
    this.vfbfStreamer.getAnimationControl()();
  };
  onClickVideoSpeed = (videoRate) => {
    this.vfbfStreamer.setPlaybackRate(videoRate);
  };
  onClickScale = (scale) => {
    this.scale = scale;
  };

  onClickPlay = () => {
    if (this.dataType == 'video') {
      var isVideoPlaying = this.vfbfStreamer.playVideo(
        this.dataUrl
        // this.props.dataType
      );
    } else {
      var isVideoPlaying = this.vfbfStreamer.playImage(this.props.dataUrl);
    }
    this.setState({ isVideoPlaying: isVideoPlaying });
  };

  onChangeCurrentTime = (e) => {
    this.setState({ currentTime: parseFloat(e.target.value) });
    this.vfbfStreamer.setCurrentTime(e.target.value);
  };

  onLoadModel = (model, anchors, classNames) => {
    this.yoloPredictor.setModelParams(model, anchors, classNames.length);

    this.classNames = classNames;
  };

  setScoreTHR = (val) => {
    this.yoloPredictor.setScoreTHR(val);
  };
  setIouTHR = (val) => {
    this.yoloPredictor.setIouTHR(val);
  };
  setMaxBoxes = (val) => {
    this.yoloPredictor.setMaxBoxes(val);
  };

  onClickSetDataSource = (url, type, title) => {
    this.dataUrl = url;
    this.dataType = type;
    this.setState({ title: title });
  };

  render() {
    const {} = this.props;
    return (
      <div className='container '>
        <h2 className='text-center mb-1 mt-2'>Yolo TfJs Demo</h2>
        <Accordion />
        <div className='col '>
          {/* enable after detector is ready */}
          {this.state.isReady && (
            <ModelSelectionPanel onLoadModel={this.onLoadModel} />
          )}
          <div className=' row text-center'>
            <div className=' col'>
              <div className=' col-sm text-center badge rounded-pill btn-outline-secondary text-dark text-center'>
                Data Source Selection{' '}
              </div>
            </div>
          </div>

          <div className='dataSource border border-1 border-secondary position-relative '>
            <DataSourceSelectionPanel
              onClickSetDataSource={this.onClickSetDataSource}
            />
          </div>

          <div className=' row text-center'>
            <div className=' col'>
              <div className=' col-sm text-center badge rounded-pill btn-outline-secondary text-dark text-center'>
                Configurations{' '}
              </div>
            </div>
          </div>
          <div className='configButtons border border-1 border-secondary position-relative'>
            <div className='row mb-2'>
              <ConfigurationsPanel
                setScoreTHR={this.setScoreTHR}
                setIouTHR={this.setIouTHR}
                setMaxBoxes={this.setMaxBoxes}
              />
            </div>
          </div>
        </div>
        {this.state.isReady && (
          <VideoControlPanel
            onClickVideoSpeed={this.onClickVideoSpeed}
            fps={this.state.fps}
            currentTime={this.state.currentTime}
            duration={this.state.duration}
            title={this.state.title}
            onChangeCurrentTime={this.onChangeCurrentTime}
            onClickScale={this.onClickScale}
            isVideoPlaying={this.state.isVideoPlaying}
          />
        )}
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
