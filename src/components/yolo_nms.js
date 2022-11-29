import * as tf from '@tensorflow/tfjs';

const yoloNms = (
	bboxes,
	scores,
	classIndices,
	yoloMaxBoxes,
	nmsIouThreshold,
	nmsScoreThreshold
) => {
	const nms = new Promise((resolve) => {
		const nmsResults = tf.image.nonMaxSuppressionAsync(
			bboxes,
			scores,
			yoloMaxBoxes,
			nmsIouThreshold,
			nmsScoreThreshold
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

const ff2a = (bboxes, classIndices, scores, nmsResults) => {};

export default yoloNms;
