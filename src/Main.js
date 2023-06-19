import React, { Component } from 'react';
import Accordion from './components/Accordion';
import ModelSelectionPanel from './components/ModelSelectionPanel';
import ConfigurationsPanel from './components/ConfigurationsPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';
import { VideoControlPanel } from './components/VideoControlPanel';

import configNms from './config/configNms.json';

// import cdn module:
// import { YoloV3 } from './yolov3/YoloV3.js';

import Render from './utils/Render.js';
export class Main extends Component {
	constructor(props) {
		super(props);
		this.title = ''; // vid/img display title - currently unused
		this.dataUrl = '';
		this.dataType = '';
		this.state = {
			classNames: '',
		};
		this.yoloCreated = false;
	}

	detectFrame = (frame) => {
		return this.yoloV3.detectFrame(frame);
	};

	onLoadModel = (model, anchors, classNames) => {
		if (!this.yoloCreated) {
			// note: configNms values are expected to be overrided by config component on init:
			this.yoloV3 = new YoloV3(
				model,
				anchors,
				classNames.length,
				configNms.scoreTHR,
				configNms.iouTHR,
				configNms.maxBoxes
			);
			this.yoloCreated = true;
		} else {
			this.yoloV3.setModelParams(model, anchors, classNames.length);
		}

		this.setState({ classNames: classNames });
	};

	setScoreTHR = (val) => {
		this.yoloV3.setScoreTHR(val);
	};
	setIouTHR = (val) => {
		this.yoloV3.setIouTHR(val);
	};
	setMaxBoxes = (val) => {
		this.yoloV3.setMaxBoxes(val);
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
							{/* send configs updates not before object is constructed */}
							{this.yoloCreated && (
								<ConfigurationsPanel
									setScoreTHR={this.setScoreTHR}
									setIouTHR={this.setIouTHR}
									setMaxBoxes={this.setMaxBoxes}
								/>
							)}
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
