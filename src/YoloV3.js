import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
// import Dropdown from 'react-bootstrap/Dropdown';

tf.setBackend('webgl');

// import LoadModel from './LoadModel.js';

import Draw from './draw.js';
import { image } from '@tensorflow/tfjs';

import configData from './configModel.json';

import YoloPredictor from './Detect.js';

export const YoloV3 = () => {
	// Refs:
	const canvasRefVideo = useRef(null);
	const canvasRefImage = useRef(null);

	const classNames = useRef(null);
	const yoloPredictor = useRef(null);
	const videoRender = useRef(null);
	const video = useRef(null);
	// refs affect changes during animation:
	const nmsScoreTHRRef = useRef(configData.nmsScoreThreshold);
	const nmsIouTHRRef = useRef(configData.nmsIouThreshold);

	const [listModels, setListModels] = useState(configData.models);

	// States:
	const [selectedFile, setSelectedFile] = useState('');
	// const [selectedVidFile, setSelectedVidFile] = useState('');
	const [selectedModel, setSelectedModel] = useState('');
	const [modelLoadedMessage, setModelLoadedMessage] =
		useState('No Model Loaded!');
	const [isModelLoadSpinner, setIsModelLoadSpinner] = useState(false);
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [nmsScoreTHR, setNmsScoreTHR] = useState(configData.nmsScoreThreshold);
	const [nmsIouTHR, setNmsIouTHR] = useState(configData.nmsIouThreshold);

	const [showVideoControl, setShowVideoControl] = useState(true);
	const [canvasWidth, setCanvasWidth] = useState(416);
	const [canvasHeight, setCanvasHeight] = useState(416);
	const [durationOfVideo, setDurationOfVideo] = useState(0);
	const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);

	const animationControl = () => {
		var id = window.requestAnimationFrame(function () {
			yoloPredictor.current.detectFrameVideo(
				video.current,
				nmsIouTHRRef.current,
				nmsScoreTHRRef.current
			);
		});
		if (video.current.currentTime >= video.current.duration) {
			cancelAnimationFrame(id);
		}
	};

	const getVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: {} })
			.then((stream) => {
				video.current.srcObject = stream;
				video.current.play();
			})
			.catch((err) => {
				console.error('error:', err);
			});
	};

	const stopVideo = () => {
		setShowVideoControl(false);

		if (video.current.src != '') {
			video.current.pause();
			video.current.currentTime = video.current.duration;
		}
	};

	const pauseVideo = () => {
		video.current.pause();
	};

	const resumeVideo = () => {
		video.current.play();
	};

	const retrieveGetDurationOfVideo = () => {
		const getDurationOfVideo = () => {
			const videoIntervalTime = setInterval(() => {
				setCurrentDurationOfVideo(
					parseFloat(video.current.currentTime).toFixed(1)
				);

				if (parseFloat(video.current.currentTime) >= video.current.duration) {
					clearVideoInterval();
				}
			}, 500);

			const clearVideoInterval = () => {
				clearInterval(videoIntervalTime);
			};
		};
		return getDurationOfVideo;
	};
	const setVideoSpeed = (e) => {
		video.current.playbackRate = parseFloat(e.target.value);
	};

	const videoDuration = (e) => {
		setCurrentDurationOfVideo(parseFloat(e.target.value));
		video.current.currentTime = parseFloat(e.target.value);
	};

	// create image file read promise
	function fileToDataUri(field) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.addEventListener('loadend', () => {
				resolve(reader.result);
			});
			reader.readAsDataURL(field);
		});
	}
	/* Use Effect Hooks:*/

	const createModel = (modelData) => {
		const modelUrl = modelData.modelUrl;
		const anchorsUrl = modelData.anchorsUrl;
		const classNamesUrl = modelData.classNamesUrl;

		const modelPromise = tf.loadLayersModel(modelUrl);
		const anchorsPromise = fetch(anchorsUrl).then((response) =>
			response.json()
		);

		const classNamesPromise = fetch(classNamesUrl).then((x) => x.text());

		Promise.all([modelPromise, anchorsPromise, classNamesPromise]).then(
			(values) => {
				const classNames_ = values[2].split(/\r?\n/);
				yoloPredictor.current.initModel(values[0]);
				yoloPredictor.current.initAnchors(values[1].anchor);
				yoloPredictor.current.initNclasses(classNames_.length);

				// setClassNames(classNames_);
				classNames.current = classNames_;
				setModelLoadedMessage('Model ' + modelData.name + ' is ready!');
				setIsModelLoadSpinner(false);
				setIsModelLoaded(true);
			}
		);
	};
	const renderCallback_ = (imageFrame, selBboxes, scores, classIndices) => {
		videoRender.current.drawOnImage(
			imageFrame,
			selBboxes,
			scores,
			classIndices,
			classNames.current
		);
	};

	useEffect(() => {
		video.current = document.createElement('video');
		// video.src =
		// 	'https://archive.org/download/C.E.PriceCatWalksTowardCamera/cat_walks_toward_camera_512kb.mp4';

		video.current.controls = true;
		video.current.muted = true;
		video.current.height = canvasHeight; // in px
		video.current.width = canvasWidth; // in px
		getVideo();

		setShowVideoControl(false);

		videoRender.current = new Draw(canvasRefVideo.current);
		yoloPredictor.current = new YoloPredictor(renderCallback_);
	}, []);

	const runVideo = (selectedFile) => {
		setShowVideoControl(true);

		var URL = window.URL || window.webkitURL;
		var fileURL = URL.createObjectURL(selectedFile);
		video.current.src = fileURL;
		video.current.play();

		new Promise((resolve) => {
			video.current.onloadedmetadata = () => {
				resolve();
			};
		}).then(() => {
			setDurationOfVideo(video.current.duration);
			retrieveGetDurationOfVideo()();
			yoloPredictor.current.setAnimationCallback(animationControl);
			yoloPredictor.current.detectFrameVideo(
				video.current,
				nmsIouTHR,
				nmsScoreTHR
			);
		});
	};

	const runImage = (selectedFile) => {
		var imageFrame = new window.Image();

		var promise = fileToDataUri(selectedFile);
		promise.then((contents) => {
			imageFrame.src = contents;
		});
		imageFrame.addEventListener('load', async () => {
			yoloPredictor.current.detectFrameVideo(
				imageFrame,
				nmsIouTHR,
				nmsScoreTHR
			);
		});
	};

	const onClickRun = () => {
		if ((selectedFile != '') & isModelLoaded) {
			if (selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
				URL.createObjectURL(selectedFile);
				runImage(selectedFile);
			} else {
				// setSelectedVidFile(selectedFile);
				runVideo(selectedFile);
			}
		}
	};
	const onChangeFile = (event) => {
		stopVideo();

		setSelectedFile(event.target.files[0]);
		if (event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/i)) {
			setShowVideoControl(false);
		} else {
			setShowVideoControl(true);
		}
	};

	const onSelectModel = (event) => {
		setSelectedModel(listModels[event.target.value]);
	};
	const onLoadModel = () => {
		setModelLoadedMessage('Loading Model...');
		setIsModelLoadSpinner(true);

		const modelConfig = selectedModel != '' ? selectedModel : listModels[0];
		createModel(modelConfig);

		setModelLoadedMessage('Model ' + modelConfig.name + ' is ready!');
		setIsModelLoadSpinner(false);
		setIsModelLoaded(true);
	};

	const onChangeNmsScoreTHR = (event) => {
		console.log(event.target.value);
		if ((event.target.value <= 1) & (event.target.value >= 0)) {
			// refs affect changes during animation:
			nmsScoreTHRRef.current = event.target.value;

			setNmsScoreTHR(event.target.value);
		}
	};
	const onChangeNmsIouTHR = (event) => {
		console.log(event.target.value);
		if ((event.target.value <= 1) & (event.target.value >= 0)) {
			// refs affect changes during animation:
			nmsIouTHRRef.current = event.target.value;
			setNmsIouTHR(event.target.value);
		}
	};

	const onChangeVideoWidth = (event) => {
		setCanvasWidth(event.target.value);
	};
	const onChangeVideoHeight = (event) => {
		setCanvasHeight(event.target.value);
	};

	return (
		<div className='container '>
			<div className='col-6'>
				<h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
			</div>
			<div>
				<div className='col mb-3'>
					<div className='col'>
						<label htmlFor='selectModel' className=' h5 '>
							Select a Model
						</label>
					</div>
					<div className='col-4'>
						<select
							className='form-select form-select-lg mb-1'
							onChange={onSelectModel}
						>
							{listModels.map((option, index) => (
								<option key={index} value={index}>
									{option.name}
								</option>
							))}
						</select>
					</div>
					<div className='col mb-5'>
						<div className='col'>
							<button
								variant='primary'
								// type='submit'
								className='btn btn btn-dark btn-lg col-4 mb-1 mt-3'
								onClick={onLoadModel}
							>
								{isModelLoadSpinner && (
									<span
										className='spinner-border spinner-border-sm'
										role='status'
										aria-hidden='true'
									></span>
								)}
								{isModelLoadSpinner ? 'Loading' : 'Load Model'}
							</button>
						</div>

						<div className='col'>
							{/* <div className='coll-2'></div> */}
							<div className='coll-4 h5 mb-3'>{modelLoadedMessage}</div>
						</div>
					</div>

					<div className='col mb-5'>
						<div className='col'>
							<label htmlFor='selectFile' className='  h5  '>
								Select Video or Image File
							</label>
						</div>
						<div className='col'>
							<input
								className='col-6 form-select-lg'
								id='selectFile'
								type='file'
								onChange={onChangeFile}
								accept='video/*, image/*'
							/>
						</div>
					</div>
				</div>

				<div className='mb-3'>
					<div className='row mb-2'>
						<div className='col-2'>
							<div className='col'>
								<label className=' h5 '>NMS Score THLD</label>
							</div>
							<div className='col'>
								<input
									className='form-select-lg'
									type='number'
									min='0'
									max='1'
									step='0.1'
									value={nmsScoreTHR}
									onChange={onChangeNmsScoreTHR}
								/>
							</div>
						</div>
						<div className='col-2'>
							<div className='col'>
								<label className=' h5 '>NMS Iou THLD</label>
							</div>
							<div className='col'>
								<input
									className='form-select-lg'
									type='number'
									min='0'
									max='1'
									step='0.1'
									value={nmsIouTHR}
									onChange={onChangeNmsIouTHR}
								/>
							</div>
						</div>
					</div>

					<div className='row'>
						<div className='col-2'>
							<div className='col'>
								<label className=' h5  '>Video Width</label>
							</div>
							<div className='col'>
								<input
									className='form-select-lg '
									type='number'
									min='0'
									max='1920'
									step='1'
									value={canvasWidth}
									onChange={onChangeVideoWidth}
								/>
							</div>
						</div>
						<div className='col-2'>
							<div className='col'>
								<label className=' h5  '>Video Height</label>
							</div>

							<div className='col'>
								<input
									className='form-select-lg '
									type='number'
									min='0'
									max='1920'
									step='1'
									value={canvasHeight}
									onChange={onChangeVideoHeight}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className='col'>
					<div className='row '>
						<div>
							<button
								variant='primary'
								disabled={selectedFile == '' || !isModelLoaded}
								className='btn btn btn-dark  btn-lg col-4 mb-1'
								onClick={onClickRun}
							>
								Run Detection
							</button>
						</div>
					</div>
					<div className='row '>
						{selectedFile == '' && (
							<div className='  mb-5 col-2 h5' id='liveAlertBtn'>
								Please Select A File!
							</div>
						)}
						{!isModelLoaded && (
							<div className='  mb-5 col-3 h5' id='liveAlertBtn'>
								Please Load A Model!
							</div>
						)}
					</div>
				</div>
			</div>
			<div className='col'>
				{showVideoControl == true && (
					<div className='col '>
						<div className='col mb-3'>
							<div className='col'>
								<label className=' form-select-lg'>Playback Speed</label>
							</div>
							<div className='col-4 mb-3'>
								<select
									className='className= form-select form-select-lg mb- '
									onChange={setVideoSpeed}
								>
									<option value={1.0}>Normal speed</option>
									<option value={0.5}>Slow</option>
									<option value={2.0}>Fast speed</option>
								</select>
							</div>

							<div className='h1 col'>
								<span className='badge text-bg-dark form-select-lg h3'>
									{currentDurationOfVideo} /{durationOfVideo}
								</span>
							</div>
						</div>

						<label htmlFor='customRange3' className='form-label'></label>
						<input
							type='range'
							className='form-range'
							min='0'
							max={durationOfVideo}
							// step='0.5'
							id='customRange3'
							value={currentDurationOfVideo}
							onChange={videoDuration}
						></input>
						<div className='row '>
							<button
								variant='primary'
								className='btn btn btn-success btn-lg col-1 mb-1 mx-2'
								onClick={pauseVideo}
							>
								Pause Video
							</button>
							<button
								variant='primary'
								className='btn btn btn-primary btn-lg col-1 mb-1'
								onClick={resumeVideo}
							>
								Resume Video
							</button>
							<button
								variant='primary'
								className='btn btn btn-danger btn-lg col-1 mb-1 mx-2'
								onClick={stopVideo}
							>
								Stop Video
							</button>
						</div>
					</div>
				)}
				<div className='mt-3'>
					<canvas className='video' ref={canvasRefVideo} width='' height='' />
				</div>
			</div>
		</div>
	);
};

export default YoloV3;
