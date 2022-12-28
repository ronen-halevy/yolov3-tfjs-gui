import React, { useEffect, useRef, useState } from 'react';

import Accordion from './components/Accordion';

import ModelSelectionPanel from './components/ModelSelectionPanel';
import ConfigurationsPanel from './components/ConfigurationsPanel';
import VideoControlPanel from './components/VideoControlPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';

import Player from './Player';
import YoloPredictor from './yolov3/YoloV3';

export const Main = () => {
  // Refs:
  const canvasRefVideo = useRef(null);
  const yoloPredictor = useRef(null);
  const videoRef = useRef(null);
  // refs affect changes during animation:

  const lastLoopRef = useRef(null);

  const player = useRef(null);
  const videoControlRef = useRef();

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

    // player.current = new Player(tt, canvasHeight, canvasWidth);

    yoloPredictor.current.setAnimationCallback(
      videoControlRef.current.feedAnimationControl
    );
  }, []);

  const animationControl = () => {
    videoControlRef.current.feedAnimationControl();
  };

  const frameCallback = (frame) => {
    yoloPredictor.current.detectFrameVideo(frame);
  };
  const onLoadModel = (modelUrl, anchorsUrl, classNamesUrl) => {
    const resPromise = yoloPredictor.current.createModel(
      modelUrl,
      anchorsUrl,
      classNamesUrl
    );

    return resPromise;
  };

  //  utils

  // callBacks:

  const pauseResumeVideo = () => {
    console.log('pauseResumeVideo');
    player.current.pauseResumeVideo();
  };

  const onClickVideoSpeed = (e) => {
    const speed = videoSpeed * 2 > 2.0 ? 0.5 : videoSpeed * 2;
    videoRef.current.playbackRate = parseFloat(speed);
  };

  const updateVideoDuration = (e) => {
    setCurrentDurationOfVideo(parseFloat(e.target.value));
    videoRef.current.currentTime = parseFloat(e.target.value);
  };

  const onClickPlay = () => {
    // player.current.onClickPlay();
    // stopVideo();
    // if (isVideoOn) {
    //   setIsVideoOn(false);
    //   return;
    // }
    // console.log('onClickPlay');
    // dataType == 'image' ? playImage() : playVideo();
  };

  const onClickSetDataSource = (url, type) => {
    console.log('!!!!!!!!!!!!!!!!onClickSetDataSource');
    // stopVideo();
    setDataUrl(url);
    setDataType(type);
    // player.current.setDataUrl(url, type);
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
            dataUrl={dataUrl}
            dataType={dataType}
            frameCallback={frameCallback}
            ref={videoControlRef}
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
