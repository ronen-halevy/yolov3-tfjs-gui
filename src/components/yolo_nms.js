import * as tf from '@tensorflow/tfjs';
const yoloNms = (
	bboxes,
	scores,
	yoloMaxBoxes,
	nmsIouThreshold,
	nmsScoreThreshold
) => {
	// let axis = -1;
	// let classIndices = classProbs.argMax(axis);

	// classProbs = classProbs.max(axis);
	// confidences = confidences.squeeze(axis);
	// let scores = confidences.mul(classProbs);

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

	nms.then((nmsResults) => {
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
};

export default yoloNms;
