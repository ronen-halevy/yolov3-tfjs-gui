import * as tf from '@tensorflow/tfjs';

import config from './configNms.json';

const yoloNms = (bboxes, scores, classIndices, nmsIouTHR, nmsScoreTHR) => {
	const nms = new Promise((resolve) => {
		const nmsResults = tf.image.nonMaxSuppressionAsync(
			bboxes,
			scores,
			config.yoloMaxBoxes,
			nmsIouTHR,
			nmsScoreTHR
		);
		resolve(nmsResults);
	}).then((nmsResults) => {
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
	});

	return nms;
};

export default yoloNms;
