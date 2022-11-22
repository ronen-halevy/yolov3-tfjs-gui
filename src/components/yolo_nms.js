import * as tf from "@tensorflow/tfjs";

async function yolo_nms(
  bboxes,
  confidence,
  class_probs,
  yolo_max_boxes,
  nms_iou_threshold,
  nms_score_threshold
) {
  let axis = 0;
  bboxes = bboxes.squeeze(axis);
  confidence = confidence.squeeze(axis);
  let classProbs = class_probs.squeeze(axis);
  axis = -1;
  // pre each bbox, select class with max prob:
  let classIndices = classProbs.argMax(axis);
  // select class from class probs array
  classProbs = classProbs.max(axis);

  confidence = confidence.squeeze(axis);
  let scores = confidence.mul(classProbs);

  // non_max_suppression_padded vs non_max_suppression supports batched input, returns results per batch
  const pad_to_max_output_size = true;
  let nmsResults = await tf.image.nonMaxSuppressionAsync(
    bboxes,
    scores,
    yolo_max_boxes,
    nms_iou_threshold,
    nms_score_threshold
  );
  nmsResults.print();

  bboxes.gather(nmsResults).print(); // todo clean
  classIndices.gather(nmsResults).print();
  scores.gather(nmsResults).print();
  let selectedBboxes = bboxes.gather(nmsResults);
  let selectedClasses = classIndices.gather(nmsResults);
  let selectedScores = scores.gather(nmsResults);

  return [selectedBboxes, selectedScores, selectedClasses];
}
export default yolo_nms;
