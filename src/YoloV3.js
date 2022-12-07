import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

tf.setBackend('webgl');

// import LoadModel from './LoadModel.js';
import yoloDecode from './yoloDecode.js';
import yoloNms from './yoloNms.js';
import Draw from './draw.js';
import { image } from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

import configData from './config.json';

export const YoloV3 = () => {
	// Yolo input width:
	const imageHeight = 416;
	const imageWidth = 416;

	// Load Configs
	let yoloMaxBoxes = configData.yoloMaxBoxes;
	let nmsIouThreshold = configData.nmsIouThreshold;
	let nmsScoreThreshold = configData.nmsScoreThreshold;
	const modelUrl = configData.modelUrl;
	const anchorsUrl = configData.anchorsUrl;
	const cocoClassNamesUrl = configData.cocoClassNamesUrl;
	const font = configData.font;
	const lineWidth = configData.lineWidth;
	const lineColor = configData.lineColor;
	const textColor = configData.textColor;
	const textBackgoundColor = configData.textBackgoundColor;
	const textAlpha = configData.textAlpha;
	const textBackgroundAlpha = configData.textBackgroundAlpha;
	const lineAlpha = configData.lineAlpha;

	// Refs:
	const videoRef = useRef(null);
	const photoRef = useRef(null);
	const canvasRefVideo = useRef(null);
	const canvasRefImage = useRef(null);

	// States:
	const [selectedVidFile, setSelectedVidFile] = useState('');
	const [selectedImageFile, setSelectedImageFile] = useState('');
	const [imageUrl, setImageUrl] = useState(null);
	const [vidFileName, setVidFileName] = useState(null);
	const [imageFileName, setImageFileName] = useState(null);
	const [model, setModel] = useState(null);
	const [anchors, setAnchors] = useState(null);
	const [classNames, setClassNames] = useState(null);
	const [nclasses, setNclasses] = useState(null);
	const [jsxVisibility, setJsxVisibility] = useState('invisible');

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

			const nmsResult = yoloNms(
				bboxes,
				scores,
				classIndices,

				yoloMaxBoxes,
				nmsIouThreshold,
				nmsScoreThreshold
			);

			nmsResult.then((reasultArrays) => {
				let [selBboxes, scores, classIndices] = reasultArrays;
				let canvas = isVideo ? canvasRefVideo.current : canvasRefImage.current;
				var draw = new Draw(
					canvas,
					classNames,
					font,
					lineWidth,
					lineColor,
					textColor,
					textBackgoundColor,
					textAlpha,
					textBackgroundAlpha,
					lineAlpha
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
		var resized = tf.image.resizeBilinear(imgTensor, [imageHeight, imageWidth]);
		var tensor = resized.expandDims(0).toFloat();
		tensor = tensor.div(255);
		return tensor;
	};

	const playVideoFile = (file) => {
		var type = file.type;
		let video = videoRef.current;
		var URL = window.URL || window.webkitURL;
		var fileURL = URL.createObjectURL(file);
		video.src = fileURL;
		video.play();
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

	useEffect(() => {
		const modelPromise = tf.loadLayersModel(modelUrl);
		const anchorsPromise = fetch(anchorsUrl).then((response) =>
			response.json()
		);

		const cocoClassNamesPromise = fetch(cocoClassNamesUrl).then((x) =>
			x.text()
		);

		Promise.all([modelPromise, anchorsPromise, cocoClassNamesPromise]).then(
			(values) => {
				setModel(values[0]);
				setAnchors(values[1].anchor);

				const classNames = values[2].split(/\r?\n/);
				setClassNames(classNames);
				setNclasses(classNames.length);
				// model and anchors ready. All ready to go - so unhide gui
				setJsxVisibility('visible');
			}
		);
	}, []);

	// init video session when
	useEffect(() => {
		if (selectedVidFile) {
			playVideoFile(selectedVidFile);
			var isVideo = true;
			var imageFrame = videoRef.current;

			// const modelPromise = LoadModel();
			const detectFrame = makeDetectFrame(isVideo);

			let promiseVideoMetadata = new Promise((resolve, reject) => {
				videoRef.current.onloadedmetadata = () => {
					resolve();
				};
			});
			promiseVideoMetadata.then(() => {
				detectFrame(model, imageFrame);
			});
		}
	}, [selectedVidFile]);

	useEffect(() => {
		if (selectedImageFile) {
			var isVideo = false;
			var imageFrame = new window.Image();
			var promise = fileToDataUri(selectedImageFile);
			promise.then((contents) => {
				imageFrame.src = contents;
			});
			const detectFrame = makeDetectFrame(isVideo);
			imageFrame.addEventListener('load', async () => {
				detectFrame(model, imageFrame);
			});
		}
	}, [selectedImageFile]);

	const onChangeImageFile = (event) => {
		setImageUrl(URL.createObjectURL(event.target.files[0]));
		setImageFileName(event.target.value);

		setSelectedImageFile(event.target.files[0]);
		event.target.value = ''; /* Forces onChange event if same file is uploaded*/
	};

	const onChangeVidFile = (event) => {
		setSelectedVidFile(event.target.files[0]);
		setVidFileName(event.target.value);
		event.target.value = ''; /* Forces onChange event if same file is uploaded*/
	};

	const onChangeFile = (event) => {
		const filename = event.target.value;
		if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
			onChangeImageFile(event);
		} else {
			onChangeVidFile(event);
		}
	};

	return (
		<div className='container '>
			<h2 className='text-center'>Yolo TfJs Demo</h2>

			{/* set invisible before model loaded - at start, practically not noticed */}
			<div className={jsxVisibility}>
				<div className='row'>
					{/* Hack Explained: filename is changed to '' to let onChange event even for
					same. To avoid "No file chosen" text by input, it is set
					invisible+label */}

					<input
						className=' invisible'
						id='files'
						type='file'
						onChange={onChangeFile}
						accept='video/*, image/*'
					/>

					<div className='col-4'></div>
					<label htmlFor='files' className='btn btn-success col-4'>
						Select Image/Video File
					</label>
				</div>
				<div className='row justify-content-center'>
					<b className='col-4'>{vidFileName}</b>
				</div>
				<div className='row justify-content-center'>
					<b className='col-4'>{imageFileName}</b>
				</div>
			</div>

			{/* <div className='row'> */}
			{/* <div className='mb-3'></div> */}
			{vidFileName && (
				<video
					className='invisible'
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
			{imageFileName && (
				<img
					className='invisible'
					id='myimage'
					src={imageUrl}
					alt='image'
					width={String(imageHeight)}
					height={String(imageHeight)}
				/>
			)}
			{/* </div> */}
			{/* <div className='gap-3'></div> */}

			<div className='row'>
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
