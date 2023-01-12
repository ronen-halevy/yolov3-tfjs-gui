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
    this.state = {};
    this.title = ''; // vid/img display title - currently unused
    this.dataUrl = '';
    this.dataType = '';
    this.state = {
      classNames: '',
    };
    this.yoloPredictor = new YoloPredictor();
  }

  detectFrame = (frame) => {
    return this.yoloPredictor.detectFrame(frame);
  };

  onLoadModel = (model, anchors, classNames) => {
    this.yoloPredictor.setModelParams(model, anchors, classNames.length);
    this.setState({ classNames: classNames });
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
    this.dataUrl = url;
    this.dataType = type;
  };

  render() {
    const {} = this.props;
    return (
      <div className='container '>
        <h2 className='text-center mb-1 mt-2'>Yolo TfJs Demo</h2>
        <Accordion />

        <div className='col '>
          <div className=' row text-center'>
            <div className=' col'>Model Selection</div>
          </div>
          <div className='model  border border-1 border-secondary position-relative bg-light'>
            <ModelSelectionPanel onLoadModel={this.onLoadModel} />
          </div>

          <div className=' row text-center'>
            <div className=' col'>Data Source Selection </div>
          </div>

          <div className='dataSource border border-1 border-secondary position-relative bg-light'>
            <DataSourceSelectionPanel
              onClickSetDataSource={this.onClickSetDataSource}
            />
          </div>

          <div className=' row text-center'>
            <div className=' col'>Configurations </div>
          </div>
          <div className='configButtons border border-1 border-secondary position-relative  bg-light'>
            <div className='row mb-2'>
              <ConfigurationsPanel
                setScoreTHR={this.setScoreTHR}
                setIouTHR={this.setIouTHR}
                setMaxBoxes={this.setMaxBoxes}
              />
            </div>
          </div>
        </div>
        <div className=' row text-center'>
          <div className=' col'>Video Control</div>
        </div>
        <div className='col  border border-1 border-secondary bg-light '>
          <div className='row mb-2'>
            <VideoControlPanel
              detectFrame={this.detectFrame}
              classNames={this.state.classNames}
              inputUrl={{ url: this.dataUrl, type: this.dataType }}
            />
          </div>
        </div>
      </div>
    );
  }
}
