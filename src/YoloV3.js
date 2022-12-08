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
import SelectFile from './components/SelectFile.js';

export const YoloV3 = () => {
	// Yolo input width:
	const imageHeight = 416;
	const imageWidth = 416;

	// Load Configs // Todo check if called each invocation
	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1');
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
			).then((reasultArrays) => {
				let [selBboxes, scores, classIndices] = reasultArrays;
				let canvas = isVideo ? canvasRefVideo.current : canvasRefImage.current;
				var draw = new Draw(
					canvas,
					classNames,
					font,
					lineWidth,
					lineColor,
					textColor,
					textBackgoundColor
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

	const playVideoFile = (file, enable) => {
		var type = file.type;
		let video = videoRef.current;
		var URL = window.URL || window.webkitURL;
		var fileURL = URL.createObjectURL(file);
		video.src = fileURL;
		enable ? video.play() : video.pause();
	};

	// const stopPlayVideoFile = (file) => {
	// 	var type = file.type;
	// 	let video = videoRef.current;
	// 	var URL = window.URL || window.webkitURL;
	// 	var fileURL = URL.createObjectURL(file);
	// 	video.src = fileURL;
	// 	video.pause();
	// };

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

	const initModel = () => {
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
	};
	useEffect(() => {
		initModel();
	}, []);

	// init video session when
	useEffect(() => {
		if (selectedVidFile) {
			playVideoFile(selectedVidFile, true);
			var isVideo = true;
			var imageFrame = videoRef.current;

			// const modelPromise = LoadModel();
			const detectFrame = makeDetectFrame(isVideo);

			let promiseVideoMetadata = new Promise((resolve) => {
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
			// patch - Aims to fix image selection while video is on. Sometimes fails
			// So stop video and wait. Still dirty, TBD if patch improves
			const stopVideoPromise = new Promise((resolve, reject) => {
				setTimeout(() => {
					if (selectedVidFile != '') {
						playVideoFile(selectedVidFile, false);
						setSelectedVidFile('');
					}
					resolve(); // Yay! Everything went well!
				}, 200);
			});

			stopVideoPromise.then(() => {
				var imageFrame = new window.Image();
				var promise = fileToDataUri(selectedImageFile);
				promise.then((contents) => {
					imageFrame.src = contents;
				});
				const detectFrame = makeDetectFrame(isVideo);
				imageFrame.addEventListener('load', async () => {
					detectFrame(model, imageFrame);
				});
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

			{/* <div class='form-check'>
				<input
					className='form-check-input'
					type='radio'
					name='flexRadioDefault'
					id='flexRadioDefault1'
				/>
				<label className='form-check-label' for='flexRadioDefault1'>
					Default radio
				</label>
			</div>
			<div class='form-check '>
				<input
					className='form-check-input '
					type='radio'
					name='flexRadioDefault'
					id='flexRadioDefault2'
					checked
				/>
				<label className='form-check-label' for='flexRadioDefault2'>
					Default checked radio
				</label>
			</div>
 */}
			{/* set invisible before model loaded - at start, practically not noticed */}
			<SelectFile
				jsxVisibility={jsxVisibility}
				vidFileName={vidFileName}
				imageFileName={imageFileName}
				onChangeFile={onChangeFile}
			/>

			{/* <div className='row'> */}
			{/* <div className='mb-3'></div> */}

			<div className='row'>
				<div>
					<canvas className='video' ref={canvasRefVideo} width='' height='' />
				</div>
				<div>
					<canvas className='image' ref={canvasRefImage} width='' height='' />
				</div>
			</div>
			{/* Can remove  these: TODO */}
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
		</div>
	);
};

export default YoloV3;
