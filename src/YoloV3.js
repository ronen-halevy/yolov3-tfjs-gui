import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
// import Dropdown from 'react-bootstrap/Dropdown';

tf.setBackend('webgl');

// import LoadModel from './LoadModel.js';

import Draw from './draw.js';
import { image } from '@tensorflow/tfjs';

import configData from './configModel.json';
// import {
// 	detectFrameVideo,
// 	detectFrameImage,
// 	// initModel,
// 	initVideoRender,
// 	initImageRender,
// 	initVideoObject,
// 	setAnimationCallback,
// 	initRenderCallback,
// 	initModel1,
// 	initAnchors,
// 	initClassNames,
// } from './DetectF.js';
import YoloPredictor from './Detect.js';

export const YoloV3 = () => {
	// Refs:
	const videoRef = useRef(null);
	const canvasRefVideo = useRef(null);
	const canvasRefImage = useRef(null);

	// const drawImageRef = useRef(null);
	// const drawVideoRef = useRef(null);
	const classNames = useRef(null);

	// States:
	const [selectedFile, setSelectedFile] = useState('');

	const [selectedVidFile, setSelectedVidFile] = useState('');

	const [model, setModel] = useState(null);
	const [anchors, setAnchors] = useState(null);
	// const [classNames, setClassNames] = useState(null);
	const [nclasses, setNclasses] = useState(null);

	const [listModels, setListModels] = useState(configData.models);
	const [selectedModel, setSelectedModel] = useState('');
	const [modelLoadedMessage, setModelLoadedMessage] =
		useState('No Model Loaded!');
	const [isModelLoadSpinner, setIsModelLoadSpinner] = useState(false);

	const [isModelLoaded, setIsModelLoaded] = useState(false);

	const [nmsThresh, setNmsThresh] = useState(configData.nmsScoreThreshold);
	const [showVideoControl, setShowVideoControl] = useState(true);

	const [canvasWidth, setCanvasWidth] = useState(416);
	const [canvasHeight, setCanvasHeight] = useState(416);

	const [durationOfVideo, setDurationOfVideo] = useState(0);
	const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
	const [yoloPredictor, setYoloPredictor] = useState(0);
	const [videoRender, setVideoRender] = useState(0);

	// const [renderCallback, setRenderCallback] = useState(0);

	const [video, setVideo] = useState(0);
	// const [animationControl, setAnimationControl] = useState(0);

	// initVideoRender(canvasRefVideo.current);

	// const videoRender = new Draw(canvasRefVideo.current);
	// const renderCallback = (imageFrame_, selBboxes, scores, classIndices) => {
	// 	console.log(
	// 		'!!!!!!!!!renderCallback',
	// 		imageFrame_,
	// 		selBboxes,
	// 		scores,
	// 		classIndices,
	// 		classNames
	// 	);
	// 	videoRender.drawOnImage(
	// 		imageFrame_,
	// 		selBboxes,
	// 		scores,
	// 		classIndices,
	// 		classNames
	// 	);
	// };
	// initRenderCallback(renderCallback);

	// initImageRender(canvasRefImage.current);

	// const drawVideoRef = new Draw(
	// 	canvasRefVideo.current,
	// 	classNames,
	// 	configData.font,
	// 	configData.lineWidth,
	// 	configData.lineColor,
	// 	configData.textColor,
	// 	configData.textBackgoundColor,
	// 	'video'
	// );

	// const drawImageRef =
	// 	// useRef(
	// 	new Draw(
	// 		canvasRefImage.current,
	// 		classNames,
	// 		configData.font,
	// 		configData.lineWidth,
	// 		configData.lineColor,
	// 		configData.textColor,
	// 		configData.textBackgoundColor,
	// 		'image'
	// 	);
	// );

	// const animationControl = () => {
	// 	console.log('YYYYYYYYY', video.currentTime, video.duration);

	// 	var id = window.requestAnimationFrame(function () {
	// 		yoloPredictor.detectFrameVideo(video);
	// 	});
	// 	if (video.currentTime >= video.duration) {
	// 		cancelAnimationFrame(id);
	// 		console.log('cancelAnimationFrame');
	// 	}
	// };
	// setAnimationCallback(animationControl);
	const animationControl = () => {
		var id = window.requestAnimationFrame(function () {
			yoloPredictor.detectFrameVideo(video);
		});
		if (video.currentTime >= video.duration) {
			cancelAnimationFrame(id);
		}
	};
	useEffect(() => {
		if (video) {
			getVideo();

			// setAnimationControl(animationControl);
		}
	}, [video]);

	const getVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: {} })
			.then((stream) => {
				video.srcObject = stream;
				video.play();
			})
			.catch((err) => {
				console.error('error:', err);
			});
	};

	// const detectFrameVideo = (imageFrame) => {
	// 	tf.engine().startScope();
	// 	const imageTensor = imagePreprocess(imageFrame);
	// 	const model_output_grids = model.predict(imageTensor);

	// 	// Decode predictions: combines all grids detection results
	// 	let [bboxes, confidences, classProbs] = yoloDecode(
	// 		model_output_grids,
	// 		nclasses,
	// 		anchors
	// 	);
	// 	let axis = -1;
	// 	let classIndices = classProbs.argMax(axis);
	// 	classProbs = classProbs.max(axis);
	// 	confidences = confidences.squeeze(axis);
	// 	let scores = confidences.mul(classProbs);
	// 	yoloNms(
	// 		bboxes,
	// 		scores,
	// 		classIndices,

	// 		configData.yoloMaxBoxes,
	// 		configData.nmsIouThreshold,
	// 		nmsThresh
	// 	).then((reasultArrays) => {
	// 		let [selBboxes, scores, classIndices] = reasultArrays;

	// 		drawVideoRef.drawOnImage(imageFrame, selBboxes, scores, classIndices);

	// 		if (imageFrame.tagName == 'VIDEO') {
	// 			var id = window.requestAnimationFrame(function () {
	// 				detectFrameVideo(imageFrame);
	// 			});
	// 			if (video.currentTime >= video.duration) {
	// 				cancelAnimationFrame(id);
	// 			}
	// 		}
	// 		tf.engine().endScope();
	// 	});
	// };

	// const detectFrameImage = (imageFrame) => {
	// 	tf.engine().startScope();

	// 	const imageTensor = imagePreprocess(imageFrame);
	// 	const model_output_grids = model.predict(imageTensor);

	// 	// Decode predictions: combines all grids detection results
	// 	let [bboxes, confidences, classProbs] = yoloDecode(
	// 		model_output_grids,
	// 		nclasses,
	// 		anchors
	// 	);
	// 	let axis = -1;
	// 	let classIndices = classProbs.argMax(axis);
	// 	classProbs = classProbs.max(axis);
	// 	confidences = confidences.squeeze(axis);
	// 	let scores = confidences.mul(classProbs);
	// 	yoloNms(
	// 		bboxes,
	// 		scores,
	// 		classIndices,

	// 		configData.yoloMaxBoxes,
	// 		configData.nmsIouThreshold,
	// 		nmsThresh
	// 	).then((reasultArrays) => {
	// 		let [selBboxes, scores, classIndices] = reasultArrays;

	// 		console.log('call draw.drawOnImage');
	// 		drawImageRef.drawOnImage(imageFrame, selBboxes, scores, classIndices);
	// 		tf.engine().endScope();
	// 	});
	// };

	// const imagePreprocess = (image) => {
	// 	const imgTensor = tf.browser.fromPixels(image);
	// 	// Yolo input width:
	// 	const imageHeight = 416;
	// 	const imageWidth = 416;
	// 	var resized = tf.image.resizeBilinear(imgTensor, [imageHeight, imageWidth]);
	// 	var tensor = resized.expandDims(0).toFloat();
	// 	tensor = tensor.div(255);
	// 	return tensor;
	// };

	const stopVideo = () => {
		video.pause();

		// video.src = 'fffffff';
		// setShowVideoControl(false);

		if (selectedVidFile != '') {
			setSelectedVidFile('');
			video.pause();
			// TODO - consider remove:
		}
	};

	const retrieveGetDurationOfVideo = (durationOfVideo1) => {
		const getDurationOfVideo = () => {
			const videoIntervalTime = setInterval(() => {
				setCurrentDurationOfVideo(Math.trunc(parseFloat(video.currentTime)));

				if (parseFloat(video.currentTime) >= durationOfVideo1) {
					clearVideoInterval();
				}
			}, 1000);

			const clearVideoInterval = () => {
				clearInterval(videoIntervalTime);
			};
		};
		return getDurationOfVideo;
	};
	const setVideoSpeed = (e) => {
		video.playbackRate = parseFloat(e.target.value);
	};

	const videoDuration = (e) => {
		setCurrentDurationOfVideo(parseFloat(e.target.value));
		video.currentTime = parseFloat(e.target.value);
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

	const initModel2 = (modelData) => {
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
				setModel(values[0]);
				setAnchors(values[1].anchor);

				const classNames_ = values[2].split(/\r?\n/);
				yoloPredictor.initModel(values[0]);
				yoloPredictor.initAnchors(values[1].anchor);
				yoloPredictor.initNclasses(classNames_.length);

				// setClassNames(classNames_);
				classNames.current = classNames_;
				setNclasses(classNames_.length);
				setModelLoadedMessage('Model ' + modelData.name + ' is ready!');
				setIsModelLoadSpinner(false);
				setIsModelLoaded(true);
			}
		);
	};
	const renderCallback_ = (imageFrame, selBboxes, scores, classIndices) => {
		videoRender.drawOnImage(
			imageFrame,
			selBboxes,
			scores,
			classIndices,
			classNames.current
		);
	};

	useEffect(() => {
		if (classNames) {
		}
	}, [classNames]);

	useEffect(() => {
		if (videoRender) {
			const yoloPredictor = new YoloPredictor(renderCallback_);
			setYoloPredictor(yoloPredictor);
		}
	}, [videoRender]);
	useEffect(() => {
		const video_ = document.createElement('video');
		// initVideoObject(video);

		// video.src =
		// 	'https://archive.org/download/C.E.PriceCatWalksTowardCamera/cat_walks_toward_camera_512kb.mp4';

		video_.controls = true;
		video_.muted = true;
		video_.height = canvasHeight; // in px
		video_.width = canvasWidth; // in px

		setVideo(video_);

		// setShowVideoControl(false);

		const videoRender = new Draw(canvasRefVideo.current);
		setVideoRender(videoRender);
	}, []);

	const runVideo = (selectedFile) => {
		stopVideo(); // TODO -  effective?
		// playVideo(selectedFile);
		var URL = window.URL || window.webkitURL;
		var fileURL = URL.createObjectURL(selectedFile);
		video.src = fileURL;
		video.play();
		var isVideo = true;
		var imageFrame = video;

		// const detectFrame = makeDetectFrame(isVideo);

		new Promise((resolve) => {
			video.onloadedmetadata = () => {
				resolve();
			};
		}).then(() => {
			setDurationOfVideo(video.duration);
			retrieveGetDurationOfVideo(video.duration)();
			// initVideoObject(video);
			yoloPredictor.setAnimationCallback(animationControl);

			// getDurationOfVideo();
			// detectFrame(model, imageFrame);

			yoloPredictor.detectFrameVideo(imageFrame);
		});
	};

	const runImage = (selectedFile) => {
		// stopVideo();

		var imageFrame = new window.Image();

		imageFrame.width = String(canvasWidth);
		if ('HTMLImageElement' in imageFrame) {
		}
		if (imageFrame.HTMLImageElement != undefined) {
		}
		const a = imageFrame.tagName;
		var promise = fileToDataUri(selectedFile);
		promise.then((contents) => {
			imageFrame.src = contents;
		});
		var isVideo = false;
		// const detectFrame = makeDetectFrame(isVideo);
		imageFrame.addEventListener('load', async () => {
			// detectFrame(model, imageFrame);
			// mother of patches - run twice...Reason: image after video execution fails probably due to disposal issues
			// detectFrame(model, imageFrame);
			// detectFrameImage(imageFrame);
			yoloPredictor.detectFrameVideo(imageFrame);
		});
	};

	const onClickRun = () => {
		if ((selectedFile != '') & isModelLoaded) {
			if (selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
				URL.createObjectURL(selectedFile);
				runImage(selectedFile);
				// setShowVideoControl(false);
			} else {
				// setShowVideoControl(true);

				setSelectedVidFile(selectedFile);
				runVideo(selectedFile);
			}
		}
	};
	const onChangeFile = (event) => {
		stopVideo();
		// video.src = null;
		// video.pause();

		stopVideo();

		setSelectedFile(event.target.files[0]);
		if (event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/i)) {
			// setShowVideoControl(false);
		} else {
			// setShowVideoControl(true);
		}
	};

	const onSelectModel = (event) => {
		setSelectedModel(listModels[event.target.value]);
	};
	const onLoadModel = () => {
		setModelLoadedMessage('Loading Model...');
		setIsModelLoadSpinner(true);

		// stopVideo();
		const modelConfig = selectedModel != '' ? selectedModel : listModels[0];
		initModel2(modelConfig);
		// initModel(modelConfig);

		setModelLoadedMessage('Model ' + modelConfig.name + ' is ready!');
		setIsModelLoadSpinner(false);
		setIsModelLoaded(true);
	};

	const onChangeNmsThresh = (event) => {
		console.log(event.target.value);
		if ((event.target.value <= 1) & (event.target.value >= 0)) {
			setNmsThresh(event.target.value);
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
					<div className='row'>
						<div className='col-2'>
							<div className='col'>
								<label className=' h5 '>NMS Threshold</label>
							</div>
							<div className='col'>
								<input
									className='form-select-lg'
									type='number'
									min='0'
									max='1'
									step='0.1'
									value={nmsThresh}
									onChange={onChangeNmsThresh}
								/>
							</div>
						</div>
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
								<label className=' h5  '>Video Width</label>
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

						<button
							variant='primary'
							className='btn btn btn-danger btn-lg col-4 mb-1'
							onClick={stopVideo}
						>
							Stop Video
						</button>
					</div>
				)}
				<div className='mt-3'>
					<canvas className='video' ref={canvasRefVideo} width='' height='' />
				</div>
				{/* <video
					className='mt-1 invisible'
					autoPlay
					playsInline
					muted
					ref={videoRef}
					width={String(canvasWidth)}
					height={String(canvasHeight)}
					id='frame'
					controls
				/> */}
			</div>
			<div className='row '>
				<div>
					<canvas className='image' ref={canvasRefImage} width='' height='' />
				</div>
			</div>
		</div>
	);
};

export default YoloV3;
