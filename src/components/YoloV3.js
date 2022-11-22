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
  // var count = 0;
  const df = (video, model) => {
    tf.engine().startScope();

    model.then(
      function tt(res) {
        tf.engine().startScope();

        let imgTensor = tf.browser.fromPixels(video);
        var resized = tf.image.resizeBilinear(imgTensor, [416, 416]);

        resized = resized.expandDims(0);
        // count = count + 1;
        // if (count % 20 == 0) {
        //   console.log(count);
        // }
        const prediction = res.predict(resized);

        let photo = photoRef.current;
        const width = 320;
        const height = 240;
        photo.width = width;
        photo.height = height;

        let ctx = photo.getContext("2d");

        ctx.drawImage(video, 0, 0, width, height);

        // console.log(prediction);

        requestAnimationFrame(() => {
          df(video, model);
        });

        tf.engine().endScope();
      },
      function (err) {
        console.log(err);
      }
    );
  };
  const paintToCanvas = () => {
    let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");

    const width = 320;
    const height = 240;
    photo.width = width;
    photo.height = height;

    const modelPromise = LoadModel();
    df(video, modelPromise);

    // tf.engine().startScope();

    // modelPromise.then(
    //   function tt(res) {
    //     tf.engine().startScope();

    //     let imgTensor = tf.browser.fromPixels(video);
    //     var resized = tf.image.resizeBilinear(imgTensor, [416, 416]);

    //     resized = resized.expandDims(0);

    //     const prediction = res.predict(resized);
    //     console.log(prediction);
    //     tf.engine().endScope();
    //   },
    //   function (err) {
    //     console.log(err);
    //   }
    // );

    //const modelPromise = load_model();
    // Promise.all([modelPromise])
    //   .then((values) => {
    //     detectFrame(video, values[0]);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
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
