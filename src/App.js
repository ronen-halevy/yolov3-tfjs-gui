import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const stripRef = useRef(null);
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

    return setInterval(() => {
      ctx.drawImage(video, 0, 0, width, height);
    }, 200);
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
    // action on update of movies
    console.log("!!!!!!!!!!!!!!!!!!!!", selectedFile);
    console.log(selectedFile);

    var file = selectedFile;
    if (file) {
      playVideoFile(file);
    }
  }, [selectedFile]);

  const onFileChange = (event) => {
    // Update the state
    setSelectedFile(event.target.files[0]);
    // console.log("!!!!!!!!!!!!!!!!!!!!", selectedFile);
    // console.log(selectedFile);

    // var file = event.target.files[0];
    // var type = file.type;
    // console.log({ selectedFile });
    // let video = videoRef.current;

    // var URL = window.URL || window.webkitURL;

    // var fileURL = URL.createObjectURL(file);
    // video.src = fileURL;
    // video.play();
  };

  const onClick2 = () => {
    // Update the state
    if (selectedFile) {
      playVideoFile(selectedFile);
    }
    video.play();
  };

  return (
    <div>
      <button onClick={() => takePhoto()}>Take a photo</button>
      <button onClick={onClick2}>Replay</button>

      <video onCanPlay={() => paintToCanvas()} ref={videoRef} />
      <input type="file" onChange={onFileChange} accept="video/*" />
      <canvas ref={photoRef} />
      <div>
        <div ref={stripRef} />
      </div>
    </div>
  );
};

export default App;
