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
	const stripRef = useRef(null);
	const canvasRef = useRef(null);
	const [model, setModel] = useState(null);

	let photo = photoRef.current;

	const threshold = 0.75;

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

			let [bboxes, confidences, classProbs] = yoloDecode(
				model_output_grids,
				nclasses
			);

			let yoloMaxBoxes = 100;

			let nmsIouThreshold = 0.5;

			let nmsScoreThreshold = 0.3;

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
					//let [bboxesArray, scoresArray, classIndicesArray]
					// let x = outArrays(nmsResults, bboxes, scores, classIndices);
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
					let canvas = canvasRef.current;
					var draw = new Draw(canvas);
					draw.drawOnImage(imageFrame, selBboxes, scores, classIndices);
					if (isVideo) {
						requestAnimationFrame(() => {
							detectFrame(model, imageFrame);
						});
					}

					tf.engine().endScope();
				});

			// });
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
		let strip = stripRef.current;

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

	function fileToDataUri(field) {
		return new Promise((resolve) => {
			const reader = new FileReader();

			reader.addEventListener('loadend', () => {
				resolve(reader.result);
			});

			reader.readAsDataURL(field);
		});
	}

	useEffect(() => {
		console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! setModel', model);
	}, [model]);

	useEffect(() => {
		const bb = async () => {
			setModel(await LoadModel());
		};
		bb();
	}, []);

	///
	useEffect(() => {
		// let imageFrame;
		if (selectedVidFile) {
			playVideoFile(selectedVidFile);
			var isVideo = true;
			var imageFrame = videoRef.current;

			const modelPromise = LoadModel();
			const detectFrame = makeDetectFrameNew(isVideo);

			let promiseC = new Promise((resolve, reject) => {
				videoRef.current.onloadedmetadata = () => {
					resolve();
				};
			});

			promiseC.then(() => {
				detectFrame(model, imageFrame);
			});

			// imageFrame.addEventListener('load', async () => {
			// detectFrame(model, imageFrame);
			// });

			// detectFrame(imageFrame, modelPromise);
			//detectFrame(model, imageFrame);
		} else if (selectedImageFile) {
			var isVideo = false;
			var imageFrame = new window.Image();
			var promise = fileToDataUri(selectedImageFile);

			promise.then((contents) => {
				imageFrame.src = contents;
				// let resized = imagePreprocess(imageFrame);
			});

			const detectFrame = makeDetectFrameNew(isVideo);

			imageFrame.addEventListener('load', async () => {
				// imageFrame = imagePreprocess(imageFrame);
				detectFrame(model, imageFrame);
			});

			// const modelPromise = LoadModel();
			// const detectFrame = makeDetectFrame(isVideo);
			// detectFrame(imageFrame, modelPromise);
		}
		if (selectedVidFile || selectedImageFile) {
			//const modelPromise = LoadModel();
			// const detectFrame = makeDetectFrame(isVideo);
		}
	}, [selectedVidFile, selectedImageFile]);

	const onImageFileChange = (event) => {
		setImageUrl(URL.createObjectURL(event.target.files[0]));
		setSelectedImageFile(event.target.files[0]);
	};
	const onVidFileChange = (event) => {
		// Update the state
		setImageUrl('');
		setSelectedVidFile(event.target.files[0]);
	};

	const onClick2 = () => {
		// Update the state
		if (selectedVidFile) {
			playVideoFile(selectedVidFile);
			const isVideo = true;
			var imageFrame = videoRef.current;

			const modelPromise = LoadModel();
			const detectFrame = makeDetectFrameNew(isVideo);

			let promiseC = new Promise((resolve, reject) => {
				videoRef.current.onloadedmetadata = () => {
					resolve();
				};
			});

			promiseC.then(() => {
				detectFrame(model, imageFrame);
			});
		}
	};

	return (
		<div>
			<button onClick={() => takePhoto()}>Take a photo</button>
			<button onClick={onClick2}>Replay</button>
			<input type='file' onChange={onVidFileChange} accept='video/*' />
			<label format='name'>Image:</label>
			<input type='file' onChange={onImageFileChange} accept='image/*' />
			// // <canvas ref={photoRef} />
			<video
				style={{ height: '600px', width: '500px' }}
				className='size'
				autoPlay
				playsInline
				muted
				ref={videoRef}
				width='500'
				height='500'
				id='frame'
			/>
			<canvas className='size' ref={canvasRef} width='600' height='500' />
			{imageUrl && <img id='myimage' src={imageUrl} alt='image' />}
			<div>
				<div ref={stripRef} />
			</div>
		</div>
	);
};

export default YoloV3;
