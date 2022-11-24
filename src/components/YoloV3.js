import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

tf.setBackend('webgl');

import LoadModel from './LoadModel.js';
import yoloDecode from './yolo_decode.js';
// import yoloNms from "./yolo_nms.js";
import Draw from './draw.js';

const imageHeight = 416;
const imageWidth = 416;

export const YoloV3 = () => {
	const videoRef = useRef(null);
	const photoRef = useRef(null);
	const stripRef = useRef(null);
	const canvasRef = useRef(null);

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

	const [selectedFile, setSelectedFile] = useState('');

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

	function doDecode(model_output_grids) {
		return new Promise((resolve) => {
			let nclasses = 7; // TODO!!
			resolve(yolo_decode(model_output_grids, nclasses));
		});
	}

	function drawDetections(imageFrame, selBboxes, scores, classIndices) {
		return new Promise((resolve) => {
			// tf.tidy(() => {
			let canvas = canvasRef.current;

			var draw = new Draw(canvas);
			resolve(draw.drawOnImage(imageFrame, selBboxes, scores, classIndices));
		});
	}

	function outArrays(nmsResults, bboxes, scores, classIndices) {
		return new Promise((resolve) => {
			// let [] = nmsResults;
			let selectedBboxes = bboxes.gather(nmsResults);
			let selectedClasses = classIndices.gather(nmsResults);
			let selectedScores = scores.gather(nmsResults);
			const bboxesArray = selectedBboxes.array();
			const scoresArray = selectedScores.array();
			const classIndicesArray = selectedClasses.array();
			resolve([bboxesArray, scoresArray, classIndicesArray]);
		});
	}
	const makeDetectFrame = (isVideo) => {
		const detectFrame = (imageFrame, model) => {
			tf.engine().startScope();

			//  model.executeAsync
			//     (res).then(() => {

			model
				.then(async (res) => {
					tf.engine().startScope();
					const model_output_grids = doPredict(res, imageFrame);
					return model_output_grids;
				})
				.then((model_output_grids) => {
					let nclasses = 7; // TODO!!

					let [bboxes, confidences, classProbs] = yoloDecode(
						model_output_grids,
						nclasses
					);
					return [bboxes, confidences, classProbs];
				})

				.then((decodeOutput) => {
					let yoloMaxBoxes = 100;
					let nmsIouThreshold = 0.1;
					let nmsScoreThreshold = 0.3;
					let [bboxes, confidences, classProbs] = decodeOutput;
					let axis = 0;
					bboxes = bboxes.squeeze(axis);
					classProbs = classProbs.squeeze(axis);
					confidences = confidences.squeeze(axis);

					axis = -1;

					classProbs = classProbs.max(axis);
					confidences = confidences.squeeze(axis);
					let scores = confidences.mul(classProbs);

					let nmsResults = tf.image.nonMaxSuppressionAsync(
						bboxes,
						scores,
						yoloMaxBoxes,
						nmsIouThreshold,
						nmsScoreThreshold
					);
					return [nmsResults, bboxes, confidences, classProbs];
				})

				.then((nmsOutput) => {
					let [nmsResults1, bboxes, scores, classIndices] = nmsOutput;
					nmsResults1
						.then((nmsResults) => {
							//let [bboxesArray, scoresArray, classIndicesArray]
							// let x = outArrays(nmsResults, bboxes, scores, classIndices);
							let selectedBboxes = bboxes.gather(nmsResults);
							let selectedClasses = classIndices.gather(nmsResults);
							let selectedScores = scores.gather(nmsResults);

							const bboxesArray = selectedBboxes.array();
							const scoresArray = selectedScores.array();
							const classIndicesArray = selectedClasses.array();
							let x = Promise.all([
								bboxesArray,
								scoresArray,
								classIndicesArray,
							]);
							return x;
						})
						.then((reasultArrays) => {
							let [selBboxes, scores, classIndices] = reasultArrays;
							let canvas = canvasRef.current;
							var draw = new Draw(canvas);
							draw.drawOnImage(imageFrame, selBboxes, scores, classIndices);
							if (isVideo) {
								requestAnimationFrame(() => {
									detectFrame(imageFrame, model);
								});
							}

							tf.engine().endScope();
						});
				});
		};
		return detectFrame;
	};
	const paintToCanvas = () => {
		let imageFrame = videoRef.current;
		// let photo = photoRef.current;
		// let ctx = photo.getContext("2d");
		// const width = 320;
		// const height = 240;
		// photo.width = width;
		// photo.height = height;
		const modelPromise = LoadModel();
		const isVideo = true;
		const detectFrame = makeDetectFrame(isVideo);
		detectFrame(imageFrame, modelPromise);
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

	useEffect(() => {
		console.log(selectedFile);
		var file = selectedFile;
		if (file) {
			playVideoFile(file);
			paintToCanvas();
		}
	}, [selectedFile]);

	const onFileChange = (event) => {
		// Update the state
		setSelectedFile(event.target.files[0]);
	};

	const onClick2o = () => {
		// Update the state
		if (selectedFile) {
			playVideoFile(selectedFile);
		}
		video.play();
	};

	//
	const onClick2 = () => {
		// Update the state
		if (selectedFile) {
			playVideoFile(selectedFile);
			paintToCanvas();
		}
	};

	return (
		<div>
			<button onClick={() => takePhoto()}>Take a photo</button>
			<button onClick={onClick2}>Replay</button>
			<input type='file' onChange={onFileChange} accept='video/*' />
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
			<div>
				<div ref={stripRef} />
			</div>
		</div>
	);
};

export default YoloV3;
