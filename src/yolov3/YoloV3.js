import * as tf from '@tensorflow/tfjs';
tf.setBackend('webgl');
import { decode } from './decode';

import Render from './Render';
import { createModel } from './createModel';
import { nms } from './nms';

export default class YoloPredictor {
  constructor(canvasRefVideo) {
    this.render = new Render(canvasRefVideo);
  }

  // findFps();
  setModel = (modelUrl, anchorsUrl, classNamesUrl) => {
    const promise = createModel(modelUrl, anchorsUrl, classNamesUrl).then(
      (res) => {
        this.model = res[0];
        this.anchors = res[1].anchor;
        this.classNames = res[2].split(/\r?\n/);
        this.nclasses = this.classNames.length;
        return res;
      }
    );
    return promise;
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
    const modelOutputGrids = this.model.predict(imageTensor);

    // Decode predictions: combines all grids detection results
    let [bboxes, confidences, classProbs] = decode(
      modelOutputGrids,
      this.nclasses,
      this.anchors
    );
    let axis = -1;
    let classIndices = classProbs.argMax(axis);
    classProbs = classProbs.max(axis);
    confidences = confidences.squeeze(axis);
    let scores = confidences.mul(classProbs);
    // clean mem
    classProbs.dispose();
    confidences.dispose();

    nms(bboxes, scores, classIndices, iouTHR, scoreTHR, maxBoxes).then(
      (reasultArrays) => {
        let [selBboxes, scores, classIndices] = reasultArrays;
        this.render.renderOnImage(
          imageFrame,
          selBboxes,
          scores,
          classIndices,
          this.classNames
        );
        if (imageFrame.tagName == 'VIDEO') {
          this.animationCallback(imageFrame);
        }

        tf.engine().endScope();
      }
    );
  };
}
