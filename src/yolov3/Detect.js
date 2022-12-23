import * as tf from '@tensorflow/tfjs';

import yoloDecode from './yoloDecode.js';
import yoloNms from './yoloNms.js';

class YoloPredictor {
  constructor(renderCallback_) {
    this.renderCallback = renderCallback_;
  }

  initNclasses = (val) => {
    this.nclasses = val;
  };
  initAnchors = (val_) => {
    this.anchors = val_;
  };
  initModel = (val) => {
    this.model = val;
  };
  setAnimationCallback = (animationCallback_) => {
    this.animationCallback = animationCallback_;
  };

  imagePreprocess = (image) => {
    const imgTensor = tf.browser.fromPixels(image);
    // Yolo input width:
    const imageHeight = 416;
    const imageWidth = 416;
    var resized = tf.image.resizeBilinear(imgTensor, [imageHeight, imageWidth]);
    var tensor = resized.expandDims(0).toFloat();
    tensor = tensor.div(255);
    return tensor;
  };

  detectFrameVideo = (imageFrame, iouTHR, scoreTHR, maxBoxes) => {
    tf.engine().startScope();
    const imageTensor = this.imagePreprocess(imageFrame);
    const model_output_grids = this.model.predict(imageTensor);

    // Decode predictions: combines all grids detection results
    let [bboxes, confidences, classProbs] = yoloDecode(
      model_output_grids,
      this.nclasses,
      this.anchors
    );
    let axis = -1;
    let classIndices = classProbs.argMax(axis);
    classProbs = classProbs.max(axis);
    confidences = confidences.squeeze(axis);
    let scores = confidences.mul(classProbs);

    yoloNms(bboxes, scores, classIndices, iouTHR, scoreTHR, maxBoxes).then(
      (reasultArrays) => {
        let [selBboxes, scores, classIndices] = reasultArrays;

        this.renderCallback(imageFrame, selBboxes, scores, classIndices);

        if (imageFrame.tagName == 'VIDEO') {
          this.animationCallback(imageFrame);
        }

        tf.engine().endScope();
      }
    );
  };
}

export default YoloPredictor;
