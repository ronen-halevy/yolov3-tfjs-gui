import * as tf from '@tensorflow/tfjs';

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
