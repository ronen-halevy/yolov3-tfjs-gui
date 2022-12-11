import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import Dropdown from 'react-bootstrap/Dropdown';

tf.setBackend('webgl');

// import LoadModel from './LoadModel.js';
import yoloDecode from './yoloDecode.js';
import yoloNms from './yoloNms.js';
import Draw from './draw.js';
import { image } from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

import configData from './config.json';

export const YoloV3 = () => {
	// Refs:
	const videoRef = useRef(null);
	const canvasRefVideo = useRef(null);
	const canvasRefImage = useRef(null);

	// States:
	const [selectedFile, setSelectedFile] = useState('');

	const [selectedVidFile, setSelectedVidFile] = useState('');

	const [model, setModel] = useState(null);
	const [anchors, setAnchors] = useState(null);
	const [classNames, setClassNames] = useState(null);
	const [nclasses, setNclasses] = useState(null);

	const [listModels, setListModels] = useState(configData.models);
	const [selectedModel, setSelectedModel] = useState('');
	const [modelLoadedMessage, setModelLoadedMessage] =
		useState('No Model Loaded!');
	const [isModelLoaded, setIsModelLoaded] = useState(false);

	const [nmsThresh, setNmsThresh] = useState(configData.nmsScoreThreshold);
	const [showVideoControl, setShowVideoControl] = useState(false);

	useEffect(() => {
		getVideo();
	}, [videoRef]);

	const getVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: {} })
			.then((stream) => {
				let video = videoRef.current;
				video.srcObject = stream;
				video.play();
			})
			.catch((err) => {
				console.error('error:', err);
			});
	};

	const makeDetectFrame = (isVideo) => {
		const detectFrame = (model, imageFrame) => {
			tf.engine().startScope();
			const imageTensor = imagePreprocess(imageFrame);
			const model_output_grids = model.predict(imageTensor);

			// Decode predictions: combines all grids detection results
			let [bboxes, confidences, classProbs] = yoloDecode(
				model_output_grids,
				nclasses,
				anchors
			);
			let axis = -1;
			let classIndices = classProbs.argMax(axis);
			classProbs = classProbs.max(axis);
			confidences = confidences.squeeze(axis);
			let scores = confidences.mul(classProbs);
			yoloNms(
				bboxes,
				scores,
				classIndices,

				configData.yoloMaxBoxes,
				configData.nmsIouThreshold,
				nmsThresh
			).then((reasultArrays) => {
				let [selBboxes, scores, classIndices] = reasultArrays;
				let canvas = isVideo ? canvasRefVideo.current : canvasRefImage.current;

				var draw = new Draw(
					canvas,
					classNames,
					configData.font,
					configData.lineWidth,
					configData.lineColor,
					configData.textColor,
					configData.textBackgoundColor
				);
				draw.drawOnImage(imageFrame, selBboxes, scores, classIndices);
				if (isVideo) {
					requestAnimationFrame(() => {
						detectFrame(model, imageFrame);
					});
				}
				tf.engine().endScope();
			});
		};
		return detectFrame;
	};

	const imagePreprocess = (image) => {
		const imgTensor = tf.browser.fromPixels(image);
		// Yolo input width:
		const imageHeight = 416;
		const imageWidth = 416;
		var resized = tf.image.resizeBilinear(imgTensor, [imageHeight, imageWidth]);
		var tensor = resized.expandDims(0).toFloat();
		tensor = tensor.div(255);
		return tensor;
	};

	const playVideoFile = (file, enable) => {
		// var type = file.type;
		let video = videoRef.current;
		var URL = window.URL || window.webkitURL;
		var fileURL = URL.createObjectURL(file);
		video.src = fileURL;
		enable ? video.play() : video.pause();
		if (video.paused) {
			console.log('paused');
		} else {
			console.log('vidfo not paused');
		}
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

	const initModel = (modelData) => {
		const modelUrl = modelData.modelUrl;
		console.log('modelUrl', modelUrl);
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

				const classNames = values[2].split(/\r?\n/);
				setClassNames(classNames);
				setNclasses(classNames.length);
				setModelLoadedMessage('Model ' + modelData.name + ' is ready!');
				setIsModelLoaded(true);
			}
		);
	};
	useEffect(() => {
		setShowVideoControl(false);
	}, []);

	const runVideo = (selectedFile) => {
		stopVideo();

		playVideoFile(selectedFile, true);
		var isVideo = true;
		var imageFrame = videoRef.current;

		const detectFrame = makeDetectFrame(isVideo);

		let promiseVideoMetadata = new Promise((resolve) => {
			videoRef.current.onloadedmetadata = () => {
				resolve();
			};
		});
		promiseVideoMetadata.then(() => {
			detectFrame(model, imageFrame);
		});
	};

	const stopVideo = () => {
		if (selectedVidFile != '') {
			videoRef.current.pause();

			console.log('stopVideo');
			// 	makeDetectFrame(false);
			setSelectedVidFile('');
			// 	playVideoFile(selectedVidFile, false);
		}
	};
	const runImage = (selectedFile) => {
		stopVideo();

		var imageFrame = new window.Image();
		var promise = fileToDataUri(selectedFile);
		promise.then((contents) => {
			imageFrame.src = contents;
		});
		var isVideo = false;
		const detectFrame = makeDetectFrame(isVideo);
		imageFrame.addEventListener('load', async () => {
			detectFrame(model, imageFrame);
			// mother of patches - run twice...Reason: image after video execution fails probably due to disposal issues
			detectFrame(model, imageFrame);
		});
	};

	const onClickStopVideo = () => {
		stopVideo();
	};

	const onClickRun = () => {
		if ((selectedFile != '') & isModelLoaded) {
			console.log('selectedFile', selectedFile);
			if (selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
				URL.createObjectURL(selectedFile);
				runImage(selectedFile);
			} else {
				console.log('setSelectedVidFile ' + selectedFile);
				setSelectedVidFile(selectedFile);
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
		stopVideo();
		const model = selectedModel != '' ? selectedModel : listModels[0];
		initModel(model);
	};

	const handleChangeInpuThresh = (event) => {
		console.log(event.target.value);
		if ((event.target.value <= 1) & (event.target.value >= 0)) {
			setNmsThresh(event.target.value);
		}
	};

	return (
		<div className='container '>
			<div className='col-6'>
				<h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
			</div>
			<div>
				<div className='row'>
					<div className='col-2'>
						<label htmlFor='selectModel' className=' h5 form-select-lg'>
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
				</div>
				<div className='row'>
					<div className='col-2'></div>

					<button
						variant='primary'
						// type='submit'
						className='btn btn btn-dark btn-lg col-4 mb-1 '
						onClick={onLoadModel}
					>
						Load Model
					</button>
				</div>

				<div className='row'>
					<div className='col-2'></div>
					<div className='col-4 h5 mb-3'>{modelLoadedMessage}</div>
				</div>
				<div className='row'>
					<div className='col-2'>
						<label htmlFor='selectFile' className='  h5  form-select-lg mb-1'>
							Video or Image File
						</label>
					</div>

					<input
						className=' col-4 form-select-lg mb-3'
						id='selectFile'
						type='file'
						onChange={onChangeFile}
						accept='video/*, image/*'
					/>
				</div>
				<div className='mb-3'>
					<div className='col'>
						<label className=' h5 form-select-lg col-2'>
							Set NMS Threshold:
						</label>
						<input
							className='form-select-lg col-4'
							type='number'
							min='0'
							max='1'
							step='0.1'
							value={nmsThresh}
							onChange={handleChangeInpuThresh}
						/>
					</div>
				</div>
				<div className='col'>
					<div className='row '>
						<div>
							<button
								variant='primary'
								disabled={selectedFile == '' || !isModelLoaded}
								className='btn btn btn-outline-dark  btn-lg col-4 mb-1 mx-1'
								onClick={onClickRun}
							>
								Run Detection
							</button>

							<button
								variant='primary'
								className='btn btn btn-danger btn-lg col-2 mb-1 mx-1'
								onClick={onClickStopVideo}
							>
								Stop Video
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

			{showVideoControl == true && (
				<video
					className='mt-7 '
					autoPlay
					playsInline
					muted
					ref={videoRef}
					width={String(416)}
					height={String(416)}
					id='frame'
					controls
				/>
			)}

			<div className='row '>
				<div>
					<canvas className='video' ref={canvasRefVideo} width='' height='' />
				</div>
				<div>
					<canvas className='image' ref={canvasRefImage} width='' height='' />
				</div>
			</div>
		</div>
	);
};

export default YoloV3;
