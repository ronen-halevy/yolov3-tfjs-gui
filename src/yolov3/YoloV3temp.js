// import * as tf from '@tensorflow/tfjs';

// import { decode } from './decode';
// import Render from './Render';
// import { createModel } from './createModel';
// import { nms } from './nms';
import configNms from '../config/configNms.json';
import isVideoPlaying from '../config/configRender.json';
// tf.setBackend('webgl');

export default class YoloPredictor {
  constructor(canvasRefVideo) {
    this.render = new Render(canvasRefVideo);
    this.scoreTHR = configNms.scoreThreshold;
    this.iouTHR = configNms.iouThreshold;
    this.maxBoxes = configNms.maxBoxes;
    this.animationCallback = null;
  }

  setScoreTHR = (val) => {
    this.scoreTHR = val;
  };
  setIouTHR = (val) => {
    this.iouTHR = val;
  };

  setMaxBoxes = (val) => {
    this.maxBoxes = val;
  };

  // findFps();
  createModel = (modelUrl, anchorsUrl, classNamesUrl) => {
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

  detectFrameVideo = (imageFrame) => {
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

    nms(
      bboxes,
      scores,
      classIndices,
      this.iouTHR,
      this.scoreTHR,
      this.maxBoxes
    ).then((reasultArrays) => {
      let [selBboxes, scores, classIndices] = reasultArrays;
      this.render.renderOnImage(
        imageFrame,
        selBboxes,
        scores,
        classIndices,
        this.classNames
      );
      if (imageFrame.tagName == 'VIDEO') {
        if (this.animationCallback) {
          this.animationCallback(imageFrame);
        } else {
          console.log('animationCallback was not set for video');
        }
      }

      tf.engine().endScope();
    });
  };
}

const nms = (bboxes, scores, classIndices, iouTHR, scoreTHR, maxBoxes) => {
  const nmsPromise = new Promise((resolve) => {
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

    selectedBboxes.dispose();
    selectedClasses.dispose();
    selectedScores.dispose();
    return reasultArrays;
  });

  return nmsPromise;
};

export function decode(grids_outputs, nclasses, anchors) {
  const nanchors_per_scale = 3; // Large, Medium, Small
  const anchor_entry_size = 2; // width, height
  let anchors_table = tf.reshape(anchors, [
    -1,
    nanchors_per_scale,
    anchor_entry_size,
  ]);

  let bboxes = [];
  let confidences = [];
  let classProbs = [];
  for (let idx = 0; idx < grids_outputs.length; idx++) {
    let axis = -1;
    let [xy, wh, obj, class_prob] = tf.split(
      grids_outputs[idx],
      [2, 2, 1, nclasses],
      axis
    );
    let anchors = tf.slice(anchors_table, [idx], 1);
    const bboxes_in_grid = arrange_bbox(tf.sigmoid(xy), wh.exp().mul(anchors));

    bboxes.push(
      tf.reshape(bboxes_in_grid, [
        bboxes_in_grid.shape[0],
        -1,
        bboxes_in_grid.shape[4],
      ])
    );

    confidences.push(
      tf.reshape(tf.sigmoid(obj), [obj.shape[0], -1, obj.shape[4]])
    );
    classProbs.push(
      tf.reshape(tf.sigmoid(class_prob), [
        class_prob.shape[0],
        -1,
        class_prob.shape[4],
      ])
    );
  }

  let axis = 1;
  bboxes = tf.concat(bboxes, axis);
  confidences = tf.concat(confidences, axis);
  classProbs = tf.concat(classProbs, axis);

  axis = 0;
  bboxes = bboxes.squeeze(axis);
  classProbs = classProbs.squeeze(axis);
  confidences = confidences.squeeze(axis);

  return [bboxes, confidences, classProbs];
}

function arrange_bbox(xy, wh) {
  let grid_size = [xy.shape[1], xy.shape[1]];

  let grid = tf.meshgrid(
    tf.range(0, xy.shape[1], 1),
    tf.range(0, xy.shape[1], 1)
  );
  var axis = -1;
  grid = tf.stack(grid, axis);

  axis = 2;
  grid = grid.expandDims(axis);

  xy = xy.add(tf.cast(grid, 'float32'));
  xy = xy.div(tf.cast(grid_size, 'float32'));

  let value1 = tf.scalar(2);
  wh = wh.div(value1);
  var xy_min = xy.sub(wh);
  var xy_max = xy.add(wh);

  var bbox = tf.concat([xy_min, xy_max], -1);
  grid.dispose();
  grid.dispose();

  return bbox;
}

export const createModel = (modelUrl, anchorsUrl, classNamesUrl) => {
  const modelPromise = tf.loadLayersModel(modelUrl);
  const anchorsPromise = fetch(anchorsUrl).then((response) => response.json());
  const classNamesPromise = fetch(classNamesUrl).then((x) => x.text());

  const promise = Promise.all([
    modelPromise,
    anchorsPromise,
    classNamesPromise,
  ]);
  return promise;
};

/**
 * Contains methods to render bounding boxes and text annotations on an image's (same as a single frame) detection.
 */
class Render {
  constructor(canvas) {
    this.canvas = canvas;
    this.font = isVideoPlaying.font;
    this.lineWidth = isVideoPlaying.lineWidth;
    this.lineColor = isVideoPlaying.lineColor;
    this.textColor = isVideoPlaying.textColor;
    this.textBackgoundColor = isVideoPlaying.textBackgoundColor;
  }
  /**
   * @summary renders a bounding box and text annotations for a detection
   * @param {contextType} context - THe canvas context to render on.
   * @param {Array<float>} bbox - A normalized to [0,1] bbox: [xmin, ymon, xmax, ymax].
   * @param {float} score - Detections's  score value, val range [0,1].
   * @param {float} classId - Class's index.
   * @param {float} imageWidth - Input image's original width.
   * @param {float} imageHeight - Input image's original height.
   */

  renderBox = (context, bbox, score, className, imageWidth, imageHeight) => {
    context.beginPath();

    // render bounding box
    context.rect(
      bbox[0] * imageWidth,
      bbox[1] * imageHeight,
      (bbox[2] - bbox[0]) * imageWidth,
      (bbox[3] - bbox[1]) * imageHeight
    );
    context.fillStyle = this.lineColor;
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.lineColor;
    context.stroke();
    const annotationText = className + ' ' + (100 * score).toFixed(2) + '%';

    context.fillStyle = this.textBackgoundColor;
    const textHeight = parseInt(this.font, 10); // base 10
    context.font = this.font;
    const textWidth = context.measureText(annotationText).width;

    // render text background.
    const textX =
      bbox[0] * imageWidth + textWidth < imageWidth
        ? bbox[0] * imageWidth
        : imageWidth - textWidth;
    const textY =
      bbox[1] * imageHeight - textHeight > 0
        ? bbox[1] * imageHeight
        : bbox[1] * imageHeight + textHeight;

    context.fillRect(textX, textY - textHeight, textWidth, textHeight);

    // render text
    context.fillStyle = this.textColor;

    context.fillText(annotationText, textX, textY);
  };

  /**
   * @summary renders a bounding box and text annotations for an array of detections
   * @param {img} image - An element to render into the context. The specification permits any canvas image source,.
   * @param {Array<Array<float>>} bboxes - An array with a bbox array per a detection. A bbox is 4 element array which holds normalized to [0,1] bbox: [xmin, ymon, xmax, ymax].
   * @param {Array<float>} scores - An array with a score value per a detectiono.
   * @param {Array<float>} classIndices - An array with a class index per a detectiono.
   */

  renderOnImage = async (image, bboxes, scores, classIndices, classNames) => {
    const context = this.canvas.getContext('2d');

    const imageWidth = image.width;
    const imageHeight = image.height;

    this.canvas.width = imageWidth;
    this.canvas.height = imageHeight;

    context.drawImage(image, 0, 0, imageWidth, imageHeight);
    bboxes.forEach((box, idx) =>
      this.renderBox(
        context,
        box,
        scores[idx],
        classNames[classIndices[idx]],
        imageWidth,
        imageHeight
      )
    );
  };
}
