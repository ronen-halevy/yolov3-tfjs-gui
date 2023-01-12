import React, { Component } from 'react';
import Accordion from './components/Accordion';
import ModelSelectionPanel from './components/ModelSelectionPanel';
import ConfigurationsPanel from './components/ConfigurationsPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';
import { VideoControlPanel } from './components/VideoControlPanel';
// import VfbfStreamer from './VfbfStreamer';
const { VfbfStreamer } = require('./VfbfStreamer');

import Render from './utils/Render.js';
export class Main extends Component {
  constructor(props) {
    super(props);
    this.vfbfStreamer = new VfbfStreamer(
      this.vfbfStreamerFrameCallBack,
      this.vfbfStreamerEndedCallback
    );

    this.state = {
      isVideoPlaying: false,
      fps: 0,
      currentTime: 0.0,
      duration: 0.0,

      duration: 0.0,
      isReady: false,
      title: '',
    };
    // this.canvasRefVideo = React.createRef();
  }

  componentDidMount() {
    this.yoloPredictor = new YoloPredictor();
    // this.draw = new Render(this.canvasRefVideo.current);
    this.setState({ isReady: true });
  }

  doD = (frame, currentTime, duration) => {
    return this.yoloPredictor.detectFrame(frame);
  };

  onLoadModel = (model, anchors, classNames) => {
    this.yoloPredictor.setModelParams(model, anchors, classNames.length);
    this.setState({ classNames: classNames });
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
    this.setState({ title: title });
    this.setState({ dataUrl: url });
    this.setState({ dataType: type });
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
            classNames={this.state.classNames}
            doD={this.doD}
            dataUrl={this.state.dataUrl}
            dataType={this.state.dataType}
          />
        )}
      </div>
    );
  }
}
