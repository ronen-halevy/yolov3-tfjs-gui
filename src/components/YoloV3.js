import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

import { loadGraphModel } from "@tensorflow/tfjs-converter";
tf.setBackend("webgl");

import LoadModel from "./LoadModel.js";

// async function LoadModel() {
//   // It's possible to load the model locally or from a repo
//   // You can choose whatever IP and PORT you want in the "http://127.0.0.1:8080/model.json" just set it before in your https server
//   //const model = await loadGraphModel("http://127.0.0.1:8080/model.json");
//   const model = await loadGraphModel(
//     "https://raw.githubusercontent.com/hugozanini/TFJS-object-detection/master/models/kangaroo-detector/model.json"
//   );
//   return model;
// }

export const YoloV3 = () => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const stripRef = useRef(null);

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

  const paintToCanvas = () => {
    let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");

    const width = 320;
    const height = 240;
    photo.width = width;
    photo.height = height;

    //const modelPromise = load_model();
    const modelPromise = LoadModel();
    Promise.all([modelPromise])
      .then((values) => {
        detectFrame(video, values[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const buildDetectedObjects = (
    scores,
    threshold,
    boxes,
    classes,
    classesDir
  ) => {
    const detectionObjects = [];
    var video_frame = document.getElementById("frame");

    scores[0].forEach((score, i) => {
      if (score > threshold) {
        const bbox = [];
        const minY = boxes[0][i][0] * video_frame.offsetHeight;
        const minX = boxes[0][i][1] * video_frame.offsetWidth;
        const maxY = boxes[0][i][2] * video_frame.offsetHeight;
        const maxX = boxes[0][i][3] * video_frame.offsetWidth;
        bbox[0] = minX;
        bbox[1] = minY;
        bbox[2] = maxX - minX;
        bbox[3] = maxY - minY;
        detectionObjects.push({
          class: classes[i],
          label: "Kangaroo", // ronen todo classesDir[classes[i]].name,
          score: score.toFixed(4),
          bbox: bbox,
        });
      }
    });
    return detectionObjects;
  };

  const renderPredictions = (predictions) => {
    let ctx = photo.getContext("2d");

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    //Getting predictions
    const boxes = predictions[4].arraySync();
    const scores = predictions[5].arraySync();
    const classes = predictions[6].dataSync();
    const detections = buildDetectedObjects(
      scores,
      threshold,
      boxes,
      classes,
      classesDir
    );

    detections.forEach((item) => {
      const x = item["bbox"][0];
      const y = item["bbox"][1];
      const width = item["bbox"][2];
      const height = item["bbox"][3];

      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(
        item["label"] + " " + (100 * item["score"]).toFixed(2) + "%"
      ).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    detections.forEach((item) => {
      const x = item["bbox"][0];
      const y = item["bbox"][1];

      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(
        item["label"] + " " + (100 * item["score"]).toFixed(2) + "%",
        x,
        y
      );
    });
  };

  const detectFrame = (video, model) => {
    tf.engine().startScope();

    let photo = photoRef.current;
    const width = 320;
    const height = 240;
    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext("2d");

    ctx.drawImage(video, 0, 0, width, height);

    // //
    // model.executeAsync.then(
    //   function (res) {
    //     const example = imagePreprocess(video); //tf.browser.fromPixels(canvas);

    //     const prediction = res.predict(example);
    //     console.log(prediction);
    //   },
    //   function (err) {
    //     console.log(err);
    //   }
    // );
    // //

    model.executeAsync(imagePreprocess(video)).then((predictions) => {
      renderPredictions(predictions, video);
      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
      tf.engine().endScope();
    });
  };

  const imagePreprocess = (video_frame) => {
    const imgTensor = tf.browser.fromPixels(video_frame);

    var resized = tf.image.resizeBilinear(imgTensor, [416, 416]);
    var tensor = resized.expandDims(0);
    tensor = tensor.div(255).toInt();
    return tensor;
  };
  const process_input = (video_frame) => {
    //const tfimg = tf.tensor2d(video_frame);
    const tfimg = tf.browser.fromPixels(video_frame).toInt();
    const expandedimg = tfimg.transpose([0, 1, 2]).expandDims();
    return expandedimg;
    return video_frame;
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

  // const useEffectClosure = (modelPromise) => {
  useEffect(() => {
    // action on update of movies
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
      <canvas className="size" ref={photoRef} width="600" height="500" />
      <div>
        <div ref={stripRef} />
      </div>
    </div>
  );
};

export default YoloV3;
