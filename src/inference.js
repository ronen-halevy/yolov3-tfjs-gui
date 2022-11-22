class Inference {
  constructor(model) {
    this.model = model;
  }
  async runInference(origImage) {
    let img = (origImage) => {
      var resized = tf.image.resizeBilinear(origImage, [416, 416]);
      var tensor = resized.expandDims(0);
      tensor = tensor.div(255);
      return tensor;
    };
    let image = img(origImage);
    var model_output_grids = await this.model.predict(image);
    const nclasses = 7; // TODO!!
    let [bboxes, confidences, classProbs] = await yolo_decode(
      model_output_grids,
      nclasses
    );
    let yolo_max_boxes = 100; // TODO!! config
    let nms_iou_threshold = 0.5;
    let nms_score_threshold = 0.5;
    let [selBboxes, scores, classIndices] = await yolo_nms(
      bboxes,
      confidences,
      classProbs,
      yolo_max_boxes,
      nms_iou_threshold,
      nms_score_threshold
    );
    return [selBboxes, scores, classIndices];
  }

  imagePreprocess = (imgTensor) => {
    var resized = tf.image.resizeBilinear(imgTensor, [416, 416]);
    var tensor = resized.expandDims(0);
    tensor = tensor.div(255);
    return tensor;
  };
}
