import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

tf.setBackend('webgl');

import LoadModel from './LoadModel.js';
import yoloDecode from './yolo_decode.js';
// import yoloNms from "./yolo_nms.js";
import Draw from './draw.js';
import { image } from '@tensorflow/tfjs';

const imageHeight = 416;
const imageWidth = 416;

const MODEL_URL = 'http://127.0.0.1:8887/models/shapes/model.json';

export const YoloV3 = () => {
	const videoRef = useRef(null);
	const photoRef = useRef(null);
	const canvasRefVideo = useRef(null);
	const canvasRefImage = useRef(null);

	const [model, setModel] = useState(null);
	const [jsxVisibility, setJsxVisibility] = useState('invisible');

	let photo = photoRef.current;

	let classesDir = {
		1: {
			name: 'Kangaroo',
			id: 1,
		},
		2: {
			name: 'Other',
			id: 2,
		},
	};

	const [selectedVidFile, setSelectedVidFile] = useState('');
	const [selectedImageFile, setSelectedImageFile] = useState('');
	const [imageUrl, setImageUrl] = useState(null);

	useEffect(() => {
		getVideo();
	}, [videoRef]);

	const getVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: { width: 300 } })
			.then((stream) => {
				let video = videoRef.current;
				video.srcObject = stream;
				video.play();
			})
			.catch((err) => {
				console.error('error:', err);
			});
	};

	function doPredict8(field) {
		return new Promise((resolve) => {
			const reader = new FileReader();

			reader.addEventListener('load', () => {
				resolve(reader.result);
			});

			reader.readAsDataURL(field);
		});
	}

	function doPredict(res, imageFrame) {
		return new Promise((resolve) => {
			let resized = imagePreprocess(imageFrame);

			resolve(res.predict(resized));
		});
	}

	const makeDetectFrameNew = (isVideo) => {
		const detectFrame = (model, imageFrame) => {
			tf.engine().startScope();
			const imageTensor = imagePreprocess(imageFrame);
			const model_output_grids = model.predict(imageTensor);

			let nclasses = 7; // TODO!!
			let yoloMaxBoxes = 100;
			let nmsIouThreshold = 0.5;
			let nmsScoreThreshold = 0.3;

			let [bboxes, confidences, classProbs] = yoloDecode(
				model_output_grids,
				nclasses
			);

			let axis = 0;
			bboxes = bboxes.squeeze(axis);

			classProbs = classProbs.squeeze(axis);

			confidences = confidences.squeeze(axis);

			axis = -1;
			let classIndices = classProbs.argMax(axis);

			classProbs = classProbs.max(axis);

			confidences = confidences.squeeze(axis);

			let scores = confidences.mul(classProbs);

			const nms = new Promise((resolve) => {
				const nmsResults = tf.image.nonMaxSuppressionAsync(
					bboxes,
					scores,
					yoloMaxBoxes,
					nmsIouThreshold,
					nmsScoreThreshold
				);
				resolve(nmsResults);
			});

			nms
				.then((nmsResults) => {
					let selectedBboxes = bboxes.gather(nmsResults);
					let selectedClasses = classIndices.gather(nmsResults);
					let selectedScores = scores.gather(nmsResults);

					const bboxesArray = selectedBboxes.array();
					const scoresArray = selectedScores.array();
					const classIndicesArray = selectedClasses.array();
					let reasultArrays = Promise.all([
						bboxesArray,
						scoresArray,
						classIndicesArray,
					]);
					return reasultArrays;
				})
				.then((reasultArrays) => {
					let [selBboxes, scores, classIndices] = reasultArrays;
					let canvas = isVideo
						? canvasRefVideo.current
						: canvasRefImage.current;
					var draw = new Draw(canvas);
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

	const takePhoto = () => {
		let photo = photoRef.current;
		console.warn(strip);
		const data = photo.toDataURL('image/jpeg');

		console.warn(data);
		const link = document.createElement('a');
		link.href = data;
		link.setAttribute('download', 'myWebcam');
		link.innerHTML = `<img src='${data}' alt='thumbnail'/>`;
		strip.insertBefore(link, strip.firstChild);
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

	// Load and create model on start
	useEffect(() => {
		const buildModel = async () => {
			setModel(await LoadModel());
		};
		buildModel();
	}, []);

	// Unhide display when model is ready - protect from starting before that
	useEffect(() => {
		setJsxVisibility('visible');
	}, [model]);

	// init video session when
	useEffect(() => {
		if (selectedVidFile) {
			setSelectedImageFile(null);
			playVideoFile(selectedVidFile);
			var isVideo = true;
			var imageFrame = videoRef.current;

			const modelPromise = LoadModel();
			const detectFrame = makeDetectFrameNew(isVideo);

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
			setSelectedVidFile(null);
			var isVideo = false;
			var imageFrame = new window.Image();
			var promise = fileToDataUri(selectedImageFile);
			promise.then((contents) => {
				imageFrame.src = contents;
			});
			const detectFrame = makeDetectFrameNew(isVideo);
			imageFrame.addEventListener('load', async () => {
				detectFrame(model, imageFrame);
			});
		}
	}, [selectedImageFile]);

	const onImageFileChange = (event) => {
		setImageUrl(URL.createObjectURL(event.target.files[0]));
		setSelectedImageFile(event.target.files[0]);
	};
	const onVidFileChange = (event) => {
		setSelectedVidFile(event.target.files[0]);
	};

	return (
		<div className='container '>
			<h2 className='text-center'>Yolo TfJs Demo</h2>
			<div className={jsxVisibility}>
				<div className='row   '>
					<div className='col-1'></div>

					<label htmlFor='formFileLg' className='form-label display-5  col-4'>
						Video File
					</label>
					<div className='col-2'></div>
					<label htmlFor='formFileLg' className='form-label display-5 col-5'>
						Image File
					</label>
				</div>
				<div className='row'>
					<input
						className='btn btn-success col-5'
						id='formFileLg'
						type='file'
						onChange={onVidFileChange}
						accept='video/*'
					/>

					<div className='col-1'></div>
					<input
						className='btn btn-success  col-5'
						id='formFileLg'
						type='file'
						onChange={onImageFileChange}
						accept='image/*'
					/>
				</div>
			</div>
			<div className='row'>
				<div className='col-6'>
					<video
						style={{ height: '200px', width: '200px' }}
						className='size'
						autoPlay
						playsInline
						muted
						ref={videoRef}
						width='416'
						height='416'
						id='frame'
					/>
				</div>
				<div className='col-6'>
					{imageUrl && (
						<img
							className=''
							id='myimage'
							src={imageUrl}
							alt='image'
							width='200'
							height='200'
						/>
					)}
				</div>
			</div>
			<div className='row'>
				<div className='col-6'>
					<canvas className='video' ref={canvasRefVideo} width='' height='' />
				</div>

				<div className='col-6'>
					<canvas className='image' ref={canvasRefImage} width='' height='' />
				</div>
			</div>
		</div>
	);
};

export default YoloV3;
