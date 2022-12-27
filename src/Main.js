import React, { useEffect, useRef, useState } from 'react';

import Accordion from './components/Accordion';

import ModelSelectionPanel from './components/ModelSelectionPanel';
import ConfigurationsPanel from './components/ConfigurationsPanel';
import VideoControlPanel from './components/VideoControlPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';

import YoloPredictor from './yolov3/YoloV3';

export const Main = () => {
  // Refs:
  const canvasRefVideo = useRef(null);
  const yoloPredictor = useRef(null);
  const videoRef = useRef(null);
  // refs affect changes during animation:

  const lastLoopRef = useRef(null);

  // States:

  // const [selectedExampleName, setSelectedExampleName] = useState(

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(416);
  const [canvasHeight, setCanvasHeight] = useState(416);
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
  const [fps, setFps] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1.0);

  const [isFileSource, setIsFileSource] = useState(false);

  const [dataUrl, setDataUrl] = useState('');
  const [dataType, setDataType] = useState('');

  const [isReady, setIsReady] = useState(false);

  // useEffects
  useEffect(() => {
    console.log('useEffect');
    videoRef.current = document.createElement('video');
    videoRef.current.controls = true;
    videoRef.current.muted = true;
    videoRef.current.height = canvasHeight; // in px
    videoRef.current.width = canvasWidth; // in px
    setIsVideoOn(false);
    yoloPredictor.current = new YoloPredictor(canvasRefVideo.current);
    setIsReady(true);
  }, []);

  const onLoadModel = (modelUrl, anchorsUrl, classNamesUrl) => {
    console.log(yoloPredictor);
    const resPromise = yoloPredictor.current.createModel(
      modelUrl,
      anchorsUrl,
      classNamesUrl
    );

    return resPromise;
  };

  //  utils

  const stopVideo = () => {
    setIsVideoOn(false);

    if (videoRef.current.src != '') {
      videoRef.current.pause();
      videoRef.current.currentTime = videoRef.current.duration;
    }
  };

  const traceDurationOfVideo = () => {
    const videoIntervalTime = setInterval(() => {
      setCurrentDurationOfVideo(
        parseFloat(videoRef.current.currentTime).toFixed(1)
      );

      if (
        parseFloat(videoRef.current.currentTime) >= videoRef.current.duration
      ) {
        clearVideoInterval();
      }
    }, 500);

    const clearVideoInterval = () => {
      clearInterval(videoIntervalTime);
    };
  };

  const playImage = () => {
    var imageObject = new window.Image();

    const runAsync = async () => {
      const res = await fetch(dataUrl);
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      imageObject.src = imageObjectURL;
      imageObject.addEventListener('load', async () => {
        yoloPredictor.current.detectFrameVideo(imageObject);
      });
    };
    runAsync();
  };

  const playVideo = () => {
    setIsVideoOn(true);
    videoRef.current.preload = 'auto';
    videoRef.current.crossOrigin = 'anonymous';
    videoRef.current.src = dataUrl;
    lastLoopRef.current = new Date();
    videoRef.current.play();

    new Promise((resolve) => {
      videoRef.current.onloadedmetadata = () => {
        resolve();
      };
    }).then(() => {
      setDurationOfVideo(videoRef.current.duration);
      traceDurationOfVideo();
      yoloPredictor.current.setAnimationCallback(animationControl);
      yoloPredictor.current.detectFrameVideo(videoRef.current);
    });
  };

  // callBacks:

  const animationControl = () => {
    var id = window.requestAnimationFrame(function () {
      yoloPredictor.current.detectFrameVideo(videoRef.current);
    });
    findFps();
    if (videoRef.current.currentTime >= videoRef.current.duration) {
      cancelAnimationFrame(id);
      setIsVideoOn(false);
    }
  };

  const pauseResumeVideo = () => {
    if (isVideoPaused) {
      videoRef.current.play();
      setIsVideoPaused(false);
    } else {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
  };

  const onClickVideoSpeed = (e) => {
    const speed = videoSpeed * 2 > 2.0 ? 0.5 : videoSpeed * 2;
    videoRef.current.playbackRate = parseFloat(speed);
    setVideoSpeed(speed);
  };

  const updateVideoDuration = (e) => {
    setCurrentDurationOfVideo(parseFloat(e.target.value));
    videoRef.current.currentTime = parseFloat(e.target.value);
  };

  function findFps() {
    var thisLoop = new Date();
    setFps(1000 / (thisLoop - lastLoopRef.current));
    lastLoopRef.current = thisLoop;
  }

  const onClickPlay = () => {
    stopVideo();
    if (isVideoOn) {
      setIsVideoOn(false);
      return;
    }
    console.log('onClickPlay');
    dataType == 'image' ? playImage() : playVideo();
  };

  const onClickSetDataSource = (url, type) => {
    stopVideo();
    setDataUrl(url);
    setDataType(type);
  };

  const setScoreTHR = (val) => {
    console.log('setScoreTHR', val);
    yoloPredictor.current.setScoreTHR(val);
  };
  const setIouTHR = (val) => {
    yoloPredictor.current.setIouTHR(val);
  };
  const setMaxBoxes = (val) => {
    yoloPredictor.current.setMaxBoxes(val);
  };

  return (
    <div className='container '>
      <h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
      <Accordion />
      {/* Module triggers model loading on start so load it not before yolo is ready: */}
      {isReady && <ModelSelectionPanel onLoadModel={onLoadModel} />}
      <div className='configButtons mt-3 border border-1 border-secondary position-relative'>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
          Configurations
        </span>
        <div className='row mb-2'>
          <ConfigurationsPanel
            setScoreTHR={setScoreTHR}
            setIouTHR={setIouTHR}
            setMaxBoxes={setMaxBoxes}
          />
        </div>
      </div>
      <div className='dataSource mt-3 border border-1 border-secondary position-relative '>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary  '>
          Data Source Selection
        </span>
        <DataSourceSelectionPanel onClickSetDataSource={onClickSetDataSource} />
      </div>
      <div className='controlVideo mt-3 border border-1 border-secondary position-relative'>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
          Video Control
        </span>

        <div className=' mt-3 row'>
          <VideoControlPanel
            onClickVideoSpeed={onClickVideoSpeed}
            videoSpeed={videoSpeed}
            fps={fps}
            currentDurationOfVideo={currentDurationOfVideo}
            durationOfVideo={durationOfVideo}
            // isVideoOn={isVideoOn}
            pauseResumeVideo={pauseResumeVideo}
            isVideoPaused={isVideoPaused}
            isFileSource={isFileSource}
            onClickPlay={onClickPlay}
          />
        </div>
      </div>
      {isVideoOn && (
        <div className='col bg-warning bg-gradient'>
          <input
            type='range'
            className='form-range'
            min='0'
            max={durationOfVideo}
            // step='0.5'
            id='customRange3'
            value={currentDurationOfVideo}
            onChange={updateVideoDuration}
          />
        </div>
      )}
      <div className='mtj-3 '>
        <canvas className='video' ref={canvasRefVideo} width='' height='' />
      </div>
      <div className='col'></div>
    </div>
  );
};

export default Main;
