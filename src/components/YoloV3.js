import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

import { loadGraphModel } from "@tensorflow/tfjs-converter";
tf.setBackend("webgl");

import LoadModel from "./LoadModel.js";
import yolo_decode from "./yolo_decode.js";
import yolo_nms from "./yolo_nms.js";
import Draw from "./draw.js";

const imageHeight = 416;
const imageWidth = 416;

export const YoloV3 = () => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const stripRef = useRef(null);
  const canvasRef = useRef(null);

  let photo = photoRef.current;

  const threshold = 0.75;

  let classesDir = {
    1: {
      name: "Kangaroo",
      id: 1,
    },
    2: {
      name: "Other",
      id: 2,
    },
  };

  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const detectFrame = (imageFrame, model) => {
    tf.engine().startScope();

    model.then(
      async (res) => {
        //  tf.engine().startScope();
        let resized = imagePreprocess(imageFrame);
        const model_output_grids = await res.predict(resized);

        const nclasses = 7; // TODO!!
        let [bboxes, confidences, classProbs] = await yolo_decode(
          model_output_grids,
          nclasses
        );
        let yolo_max_boxes = 100; // TODO!! config
        let nms_iou_threshold = 0.5;
        let nms_score_threshold = 0.3;
        let [selBboxes, scores, classIndices] = await yolo_nms(
          bboxes,
          confidences,
          classProbs,
          yolo_max_boxes,
          nms_iou_threshold,
          nms_score_threshold
        );
        // console.log("scores", scores);
        //scores.print();

        let photo = photoRef.current;
        const width = imageFrame.videoWidth;
        const height = imageFrame.videoHeight;
        // photo.width = width;
        // photo.height = height;

        //let ctx = photo.getContext("2d");

        // ctx.drawImage(imageFrame, 0, 0, width, height);

        requestAnimationFrame(() => {
          detectFrame(imageFrame, model);
        });

        let canvas = canvasRef.current;

        // let context = canvas.getContext("2d");
        var draw = new Draw(canvas);
        await draw.drawOnImage(imageFrame, selBboxes, scores, classIndices);

        //tf.engine().endScope();
      },
      function (err) {
        console.log(err);
      }
    );
  };
  const paintToCanvas = () => {
    let imageFrame = videoRef.current;
    // let photo = photoRef.current;
    // let ctx = photo.getContext("2d");
    // const width = 320;
    // const height = 240;
    // photo.width = width;
    // photo.height = height;
    const modelPromise = LoadModel();
    detectFrame(imageFrame, modelPromise);
  };

  const imagePreprocess = (image) => {
    const imgTensor = tf.browser.fromPixels(image);
    var resized = tf.image.resizeBilinear(imgTensor, [imageHeight, imageWidth]);
    var tensor = resized.expandDims(0).toFloat();
    tensor = tensor.div(255);
    return tensor;
  };

  const takePhoto = () => {
    let photo = photoRef.current;
    let strip = stripRef.current;

    console.warn(strip);

    const data = photo.toDataURL("image/jpeg");

    console.warn(data);
    const link = document.createElement("a");
    link.href = data;
    link.setAttribute("download", "myWebcam");
    link.innerHTML = `<img src='${data}' alt='thumbnail'/>`;
    strip.insertBefore(link, strip.firstChild);
  };

  const playVideoFile = (file) => {
    var type = file.type;
    let video = videoRef.current;

    var URL = window.URL || window.webkitURL;

    var fileURL = URL.createObjectURL(file);
    video.src = fileURL;
    video.play();
  };

  useEffect(() => {
    console.log(selectedFile);
    var file = selectedFile;
    if (file) {
      playVideoFile(file);
      paintToCanvas();
    }
  }, [selectedFile]);

  const onFileChange = (event) => {
    // Update the state
    setSelectedFile(event.target.files[0]);
  };

  const onClick2o = () => {
    // Update the state
    if (selectedFile) {
      playVideoFile(selectedFile);
    }
    video.play();
  };

  //
  const onClick2 = () => {
    // Update the state
    if (selectedFile) {
      playVideoFile(selectedFile);
      paintToCanvas();
    }
  };

  return (
    <div>
      <button onClick={() => takePhoto()}>Take a photo</button>
      <button onClick={onClick2}>Replay</button>
      <input type="file" onChange={onFileChange} accept="video/*" />
      // // <canvas ref={photoRef} />
      <video
        style={{ height: "600px", width: "500px" }}
        className="size"
        autoPlay
        playsInline
        muted
        ref={videoRef}
        width="600"
        height="500"
        id="frame"
      />
      <canvas className="size" ref={canvasRef} width="600" height="500" />
      <div>
        <div ref={stripRef} />
      </div>
    </div>
  );
};

export default YoloV3;
