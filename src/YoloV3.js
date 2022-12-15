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
	const videoRef = useRef(null);
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
				videoRef.current,
				nmsIouTHRRef.current,
				nmsScoreTHRRef.current
			);
		});
		if (videoRef.current.currentTime >= videoRef.current.duration) {
			cancelAnimationFrame(id);
		}
	};

	const stopVideo = () => {
		setShowVideoControl(false);

		if (videoRef.current.src != '') {
			videoRef.current.pause();
			videoRef.current.currentTime = videoRef.current.duration;
		}
	};

	const pauseVideo = () => {
		videoRef.current.pause();
	};

	const resumeVideo = () => {
		videoRef.current.play();
	};

	const retrieveGetDurationOfVideo = () => {
		const getDurationOfVideo = () => {
			const videoIntervalTime = setInterval(() => {
				setCurrentDurationOfVideo(
					parseFloat(videoRef.current.currentTime).toFixed(1)
				);

				if (
					parseFloat(videoRef.current.currentTime) >= videoRef.current.duration
				) {
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
		videoRef.current.playbackRate = parseFloat(e.target.value);
	};

	const videoDuration = (e) => {
		setCurrentDurationOfVideo(parseFloat(e.target.value));
		videoRef.current.currentTime = parseFloat(e.target.value);
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
	const renderCallback_ = (imageObject, selBboxes, scores, classIndices) => {
		videoRender.current.drawOnImage(
			imageObject,
			selBboxes,
			scores,
			classIndices,
			classNames.current
		);
	};

	useEffect(() => {
		videoRef.current = document.createElement('video');
		// video.src =
		// 	'https://archive.org/download/C.E.PriceCatWalksTowardCamera/cat_walks_toward_camera_512kb.mp4';

		videoRef.current.controls = true;
		videoRef.current.muted = true;
		videoRef.current.height = canvasHeight; // in px
		videoRef.current.width = canvasWidth; // in px

		setShowVideoControl(false);

		videoRender.current = new Draw(canvasRefVideo.current);
		yoloPredictor.current = new YoloPredictor(renderCallback_);
	}, []);

	const runVideo = (selectedFile) => {
		setShowVideoControl(true);

		var URL = window.URL || window.webkitURL;
		var fileURL = URL.createObjectURL(selectedFile);
		videoRef.current.preload = 'auto';
		videoRef.current.crossOrigin = 'anonymous';

		videoRef.current.src = fileURL;
		videoRef.current.play();

		new Promise((resolve) => {
			videoRef.current.onloadedmetadata = () => {
				resolve();
			};
		}).then(() => {
			setDurationOfVideo(videoRef.current.duration);
			retrieveGetDurationOfVideo()();
			yoloPredictor.current.setAnimationCallback(animationControl);
			yoloPredictor.current.detectFrameVideo(
				videoRef.current,
				nmsIouTHR,
				nmsScoreTHR
			);
		});
	};

	const runImage = (selectedFile) => {
		var imageObject = new window.Image();

		var promise = fileToDataUri(selectedFile);
		promise.then((fileUrl) => {
			imageObject.crossorigin = 'anonymous';
			imageObject.src = fileUrl;
		});
		imageObject.addEventListener('load', async () => {
			yoloPredictor.current.detectFrameVideo(
				imageObject,
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
		// if (event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/i)) {
		// 	setShowVideoControl(false);
		// } else {
		// 	// setShowVideoControl(true);
		// }
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
			<div className=' formExcludesVideo col bg-info bg-gradient'>
				<div className='col'>
					<h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
				</div>
				<div>
					<div className='col mb-3'>
						<div className='col'>
							<label htmlFor='selectModel' className=' h5 '>
								Select a Model
							</label>
						</div>
						<div className='col'>
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
						<div className='col mb-5 '>
							<div className='col'>
								<button
									variant='primary'
									// type='submit'
									className='btn btn btn-primary btn-lg  mb-1 mt-3 col-12'
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
								<div className='col-12 h5 mb-3 bg-warning'>
									{modelLoadedMessage}
								</div>
							</div>
						</div>

						<div className='col mb-5'>
							<div className='col'>
								<label htmlFor='selectFile' className=' h5 '>
									Select Video or Image
								</label>
							</div>
							<div className='col'>
								<input
									className='form-select-lg'
									id='selectFile'
									type='file'
									onChange={onChangeFile}
									accept='image/*, video/*'
								/>
							</div>
						</div>
					</div>

					<div className='mb-3'>
						<div className='row mb-2'>
							<div className='col-6 '>
								<div className='col'>
									<label className=' h5 '>Score THLD</label>
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
							<div className='col-6'>
								<div className='col'>
									<label className=' h5 '>Iou THLD</label>
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
							<div className='col '>
								<div className='col'>
									<label className=' h5  '>Width</label>
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
							<div className='col'>
								<div className='col'>
									<label className=' h5 col '>Height</label>
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
									className='btn btn btn-dark  btn-lg col-12 mb-1'
									onClick={onClickRun}
								>
									Run Detection
								</button>
							</div>
						</div>
						<div className='col '>
							{selectedFile == '' && (
								<div className='col-6 '>
									<div
										className='  col h5 text-warning bg-dark'
										id='liveAlertBtn'
									>
										Select A File!
									</div>
								</div>
							)}
							{!isModelLoaded && (
								<div className='col-6 '>
									<div className='   h5 text-warning bg-dark'>
										Load A Model!
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className='col'>
				{showVideoControl == true && (
					<div className='col bg-warning bg-gradient'>
						<div className='col mb-3'>
							<div className='col'>
								<label className=' form-select-lg text-center text-white bg-primary col-4'>
									Select Playback Speed
								</label>
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
				<div className='mt-3 '>
					<canvas className='video' ref={canvasRefVideo} width='' height='' />
				</div>
			</div>
			{/* <div className='customVideoTagClass '>
				<video ref={videoRef} preload='auto'></video>
			</div> */}
		</div>
	);
};

export default YoloV3;
