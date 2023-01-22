import React, { Component } from 'react';
import Render from '../utils/Render.js';
import { loadImage } from '../utils/loadImage.js';

export class VideoControlPanel extends Component {
	constructor(props) {
		super(props);
		this.vfbfStreamer = new VfbfStreamer(
			this.vfbfStreamerFrameCbk,
			this.vfbfStreamerEndedCbk
		);

		this.state = {
			scale: 0.25,
			videoRate: 1,
			currentTime: 0,
			duration: 0,
			fps: 0,
		};
		this.canvasRefVideo = React.createRef();
	}

	componentDidMount() {
		this.draw = new Render(this.canvasRefVideo.current);
	}

	// elements callbacks:
	onClickPlay = () => {
		if (this.props.inputUrl['type'] == 'video') {
			var isVideoPlaying = this.vfbfStreamer.playVideo(
				this.props.inputUrl['url']
			);
		} else {
			this.vfbfStreamer.stopVideo();
			loadImage(this.props.inputUrl['url'], this.vfbfStreamerFrameCbk);
			var isVideoPlaying = false;
		}
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

	// vfbf
	findFps() {
		var thisLoop = new Date();
		const fps = (1000 / (thisLoop - this.lastLoop))
			.toFixed(2)
			.toString()
			.padStart(5, '0');

		this.lastLoop = thisLoop;
		return fps;
	}
	vfbfStreamerFrameCbk = (frame, currentTime, duration) => {
		const detect = this.props.detectFrame(frame, currentTime, duration);
		detect.then((detectResults) => {
			const isVideoFrame = duration != 0;

			this.doRender(frame, detectResults, currentTime, isVideoFrame);
			// avoid if image (not a video):
			if (isVideoFrame) {
				this.statsDisplay(currentTime, duration);
				this.vfbfStreamer.animationControl();
			}
		});
	};
	statsDisplay = (currentTime, duration) => {
		const fps = this.findFps();
		this.setState({
			fps: fps,
			currentTime: currentTime.toFixed(1),
			duration: duration.toFixed(1),
		});
	};

	doRender = (frame, detectResults, isVideoFrame) => {
		let [selBboxes, scores, classIndices] = detectResults;
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
	};

	vfbfStreamerEndedCbk = () => {
		this.setState({ isVideoPlaying: false });
	};

	render() {
		return (
			<div className='container'>
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
								<span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger '>
									x{this.state.videoRate}
								</span>
							</span>
						</div>
						{/* fps display */}

						<div className='col-4 text-center'>
							{' '}
							<span className='badge text-bg-light border border-dark   position-relative'>
								<span className=' '>fps: {this.state.fps}</span>
							</span>
						</div>
						{/* time display */}

						<div className='col-4 text-center'>
							<span className='badge text-bg-light border border-dark position-relative'>
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
								<span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger'>
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
				{/* canvas */}
				{/* <div className='col'> */}
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
