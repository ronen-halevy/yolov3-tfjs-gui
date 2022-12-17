import * as tf from '@tensorflow/tfjs';

const yoloNms = (bboxes, scores, classIndices, iouTHR, scoreTHR, maxBoxes) => {
  const nms = new Promise((resolve) => {
    const nmsResults = tf.image.nonMaxSuppressionAsync(
      bboxes,
      scores,
      maxBoxes,
      iouTHR,
      scoreTHR
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
