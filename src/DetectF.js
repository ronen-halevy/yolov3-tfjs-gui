import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

import yoloDecode from './yoloDecode.js';
import yoloNms from './yoloNms.js';
import Draw from './draw.js';

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
// 		configData.textBackgoundColor
// 	);
// );

var model;
const initModel1 = (model_) => {
	model = model_;
	console.log('!!!!!!initModel1 model ', model);
};
var anchors;
const initAnchors = (anchors_) => {
	anchors = anchors_;
	console.log('!!!!!!initModel1 anchors ', anchors);
};
var classNames;
var nclasses;

const initClassNames = (classNames_) => {
	classNames = classNames_;
	nclasses = classNames.length;
	console.log('!!!!!!initModel1 classNames_ ', classNames_);
};
var videoCanvas;
var imageCanvas;
var imageRender;
var videoRender;
var videoRef;

// debug todo
const configData = {
	yoloMaxBoxes: 100, // property name may be an identifier
	nmsIouThreshold: 0.5,
};
const nmsThresh = 0.1;

var renderCallback;
const initVideoRender = (canvas) => {
	videoCanvas = canvas;
	// const image = document.createElement('video');
	// console.log(image);
};

const initRenderCallback = (renderCallback_) => {
	renderCallback = renderCallback_;
	// const image = document.createElement('video');
	// console.log(image);
};
const initImageRender = (canvas) => {
	imageCanvas = canvas;
};
const initVideoObject = (videoRef_) => {
	videoRef = videoRef_;
};
var animationCallback;
const setAnimationCallback = (animationCallback_) => {
	animationCallback = animationCallback_;
};

const initModel = (modelConfig) => {
	const modelUrl = modelConfig.modelUrl;
	const anchorsUrl = modelConfig.anchorsUrl;
	const classNamesUrl = modelConfig.classNamesUrl;

	const modelPromise = tf.loadLayersModel(modelUrl);
	const anchorsPromise = fetch(anchorsUrl).then((response) => response.json());

	const classNamesPromise = fetch(classNamesUrl).then((x) => x.text());

	Promise.all([modelPromise, anchorsPromise, classNamesPromise]).then(
		(values) => {
			// setModel(values[0]);
			model = values[0];
			// setAnchors(values[1].anchor);
			anchors = values[1].anchor;

			classNames = values[2].split(/\r?\n/);
			// setClassNames(classNames);
			// setNclasses(classNames.length);
			nclasses = classNames.length;
			// setModelLoadedMessage('Model ' + modelConfig.name + ' is ready!');
			// setIsModelLoadSpinner(false);
			// setIsModelLoaded(true);
			// imageRender = new Draw(imageCanvas);

			// videoRender = new Draw(videoCanvas);
		}
	);
};

// };

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

const animationControl = (imageFrame, currentTime, duration) => {
	console.log('YYYYYYYYY', videoRef.currentTime, videoRef.duration);
	var id = window.requestAnimationFrame(function () {
		detectFrameVideo(imageFrame);
	});
	if (currentTime >= duration) {
		cancelAnimationFrame(id);
		console.log('XXXXXXXXXXXXXXXXXXXXXXXX cancelAnimationFrame 2');
	}
};

const detectFrameVideo = (imageFrame) => {
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

		console.log('??????!!!!!!!!!renderCallback');

		renderCallback(imageFrame, selBboxes, scores, classIndices);

		// videoRender.drawOnImage(
		// 	imageFrame,
		// 	selBboxes,
		// 	scores,
		// 	classIndices,
		// 	classNames
		// );

		if (imageFrame.tagName == 'VIDEO') {
			// animationControl(imageFrame, videoRef.currentTime, videoRef.duration);
			animationCallback(imageFrame);
		}

		// if (imageFrame.tagName == 'VIDEO') {
		// 	var id = window.requestAnimationFrame(function () {
		// 		detectFrameVideo(imageFrame);
		// 	});
		// 	if (videoRef.currentTime >= videoRef.duration) {
		// 		cancelAnimationFrame(id);
		// 	}
		// }
		tf.engine().endScope();
	});
};

const detectFrameImage = (imageFrame) => {
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
		renderCallback(imageFrame, selBboxes, scores, classIndices);

		// imageRender.drawOnImage(
		// 	imageFrame,
		// 	selBboxes,
		// 	scores,
		// 	classIndices,
		// 	classNames
		// );
		tf.engine().endScope();
	});
};

export {
	detectFrameVideo,
	detectFrameImage,
	initModel,
	initVideoRender,
	initImageRender,
	initVideoObject,
	setAnimationCallback,
	initRenderCallback,
	initModel1,
	initAnchors,
	initClassNames,
};
