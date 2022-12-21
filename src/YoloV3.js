import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
// import Dropdown from 'react-bootstrap/Dropdown';

tf.setBackend('webgl');

import LoadModel from './components/LoadModel.js';
import InputNumber from './components/InputNumber.js';

import RadioSelect from './components/RadioSelect.js';
import DataInAccordion from './components/DataInAccordion.js';
import AccordionOpen from './components/AccordionOpen.js';
import RunButton from './components/RunButton.js';
import RunLocalData from './components/RunLocalData.js';

import RunRemoteData from './components/RunRemoteData.js';

import ListInputNumbers from './components/ListInputNumbers.js';

import Draw from './draw.js';
import { image } from '@tensorflow/tfjs';

import configData from './config/configModel.json';
import cocoVideos from './examples/cocoVideos.json';

import YoloPredictor from './Detect.js';

export const YoloV3 = () => {
  // Refs:
  const canvasRefVideo = useRef(null);
  const canvasRefImage = useRef(null);

  const classNames = useRef(null);
  const yoloPredictor = useRef(null);
  const videoRender = useRef(null);
  const videoRef = useRef(null);
  // refs affect changes during animation:
  const scoreTHRRef = useRef(configData.scoreThreshold);
  const iouTHRRef = useRef(configData.iouThreshold);
  const maxBoxesRef = useRef(configData.maxBoxes);
  const lastLoopRef = useRef(null);

  const [modelsTable, setModelsTable] = useState(configData.models);

  const [listExamples, setListExamples] = useState(cocoVideos.cocoVideos);

  // States:
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  // const [selectedVidFile, setSelectedVidFile] = useState('');
  const [selectedModel, setSelectedModel] = useState('YoloV3Tiny');
  const [selectedDataset, setSelectedDataset] = useState('coco');

  const [modelLoadedMessage, setModelLoadedMessage] =
    useState('No Model Loaded!');
  const [isModelLoadSpinner, setIsModelLoadSpinner] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [scoreTHR, setScoreTHR] = useState(configData.scoreThreshold);
  const [iouTHR, setIouTHR] = useState(configData.iouThreshold);
  const [maxBoxes, setMaxBoxes] = useState(configData.maxBoxes);

  const [selectedExample, setSelectedExample] = useState(listExamples[0].url);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(416);
  const [canvasHeight, setCanvasHeight] = useState(416);
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
  const [fps, setFps] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1.0);

  const [isDataSourceLocal, setIsDataSourceLocal] = useState(false);

  const animationControl = () => {
    var id = window.requestAnimationFrame(function () {
      yoloPredictor.current.detectFrameVideo(
        videoRef.current,
        iouTHRRef.current,
        scoreTHRRef.current,
        maxBoxesRef.current
      );
    });
    if (videoRef.current.currentTime >= videoRef.current.duration) {
      cancelAnimationFrame(id);
      setIsVideoOn(false);
    }
  };

  const stopVideo = () => {
    setIsVideoOn(false);

    if (videoRef.current.src != '') {
      videoRef.current.pause();
      videoRef.current.currentTime = videoRef.current.duration;
    }
  };

  const pauseVideo = () => {
    videoRef.current.pause();
  };

  const resumeVideo = () => {
    videoRef.current.play();
  };

  const retrieveGetDurationOfVideo = () => {
    const getDurationOfVideo = () => {
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
    return getDurationOfVideo;
  };
  const onClickToggleVideoSpeed = (e) => {
    const speed = videoSpeed * 2 > 2.0 ? 0.5 : videoSpeed * 2;
    videoRef.current.playbackRate = parseFloat(speed);
    setVideoSpeed(speed);
  };

  const videoDuration = (e) => {
    setCurrentDurationOfVideo(parseFloat(e.target.value));
    videoRef.current.currentTime = parseFloat(e.target.value);
  };

  // create image file read promise
  function fileToDataUri(field) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        resolve(reader.result);
      });
      reader.readAsDataURL(field);
    });
  }
  /* Use Effect Hooks:*/

  const createModel = (modelData) => {
    const modelUrl = modelData.modelUrl;
    const anchorsUrl = modelData.anchorsUrl;
    const classNamesUrl = modelData.classNamesUrl;

    const modelPromise = tf.loadLayersModel(modelUrl);
    const anchorsPromise = fetch(anchorsUrl).then((response) =>
      response.json()
    );

    const classNamesPromise = fetch(classNamesUrl).then((x) => x.text());
    console.log('createModel pre promise');

    Promise.all([modelPromise, anchorsPromise, classNamesPromise]).then(
      (values) => {
        const classNames_ = values[2].split(/\r?\n/);
        yoloPredictor.current.initModel(values[0]);
        yoloPredictor.current.initAnchors(values[1].anchor);
        yoloPredictor.current.initNclasses(classNames_.length);

        classNames.current = classNames_;
        console.log('createModel done');

        setIsModelLoaded(true);
      }
    );
  };

  function findFps() {
    var thisLoop = new Date();
    setFps(1000 / (thisLoop - lastLoopRef.current));
    lastLoopRef.current = thisLoop;
  }
  const renderCallback_ = (imageObject, selBboxes, scores, classIndices) => {
    videoRender.current.drawOnImage(
      imageObject,
      selBboxes,
      scores,
      classIndices,
      classNames.current
    );
    findFps();
  };

  useEffect(() => {
    videoRef.current = document.createElement('video');
    videoRef.current.controls = true;
    videoRef.current.muted = true;
    videoRef.current.height = canvasHeight; // in px
    videoRef.current.width = canvasWidth; // in px

    setIsVideoOn(false);

    videoRender.current = new Draw(canvasRefVideo.current);
    yoloPredictor.current = new YoloPredictor(renderCallback_);
    onLoadModel();
  }, []);

  const runVideo = (sourceSel) => {
    setIsVideoOn(true);
    videoRef.current.preload = 'auto';
    videoRef.current.crossOrigin = 'anonymous';
    if (sourceSel == 'local') {
      var URL = window.URL || window.webkitURL;
      var fileURL = URL.createObjectURL(selectedFile);
      videoRef.current.src = fileURL;
    } else {
      videoRef.current.src = selectedExample;
    }
    lastLoopRef.current = new Date();
    videoRef.current.play();

    new Promise((resolve) => {
      videoRef.current.onloadedmetadata = () => {
        resolve();
      };
    }).then(() => {
      setDurationOfVideo(videoRef.current.duration);
      retrieveGetDurationOfVideo()();
      yoloPredictor.current.setAnimationCallback(animationControl);
      yoloPredictor.current.detectFrameVideo(
        videoRef.current,
        iouTHRRef.current,
        scoreTHRRef.current,
        maxBoxesRef.current
      );
    });
  };

  const runImage = (selectedFile) => {
    var imageObject = new window.Image();

    var promise = fileToDataUri(selectedFile);
    promise.then((fileUrl) => {
      imageObject.crossorigin = 'anonymous';
      imageObject.src = fileUrl;
    });
    imageObject.addEventListener('load', async () => {
      yoloPredictor.current.detectFrameVideo(
        imageObject,
        iouTHRRef.current,
        scoreTHRRef.current,
        maxBoxesRef.current
      );
    });
  };

  const onClickRunLocal = () => {
    if (!isModelLoaded) {
      return;
    }
    stopVideo();
    if (isVideoOn) {
      setIsVideoOn(false);
      return;
    }
    if (selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
      URL.createObjectURL(selectedFile);
      runImage(selectedFile);
    } else {
      // setSelectedVidFile(selectedFile);
      runVideo('local');
    }
  };
  const onClickRunRemote = () => {
    if (!isModelLoaded) {
      return;
    }
    stopVideo();
    if (isVideoOn) {
      setIsVideoOn(false);
      return;
    }

    if (selectedExample.match(/\.(jpg|jpeg|png|gif)$/i)) {
      // URL.createObjectURL(selectedFile);
      // runImage(selectedFile);
    } else {
      runVideo('remote');
    }
  };

  const onChangeFile = (event) => {
    console.log(event.target.files[0]);
    stopVideo();
    console.log('onChangeFile selectedFileName: ', selectedFileName);
    setSelectedFile(event.target.files[0]);
    setSelectedFileName(event.target.files[0].name);
  };

  const onSelectModel = (event) => {
    setSelectedModel(event.target.value);
  };
  const onSelectDataset = (event) => {
    setSelectedDataset(event.target.value);
  };

  const onSelectExample = (event) => {
    stopVideo();
    const selected = listExamples[event.target.value];
    setSelectedExample(selected.url);
  };

  const onLoadModel = () => {
    setModelLoadedMessage('Loading Model...');
    setIsModelLoadSpinner(true);

    const modelConfig = modelsTable[selectedModel][selectedDataset];
    createModel(modelConfig);
    const message = selectedModel + ' + ' + selectedDataset + ' is ready!';
    setModelLoadedMessage(message);
    console.log(message);
    setIsModelLoadSpinner(false);
    setIsModelLoaded(true);
  };

  const onChangeNumber = (event, attrib) => {
    console.log(event);
    let { value, min, max } = event.target;
    value = Math.max(Number(min), Math.min(Number(max), Number(value)));
    eval(attrib.stateSet)(value);
    //use refs in addition to state to update vals during animation.
    if (attrib.refName != '') {
      eval(attrib.refName).current = value;
      console.log(scoreTHRRef);
    }
  };

  const onClickSetDataSource = (event) => {
    isDataSourceLocal
      ? setIsDataSourceLocal(false)
      : setIsDataSourceLocal(true);
  };

  const listInNumbers = [
    {
      mname: 'Score THLD',
      min: '0',
      max: '1',
      step: '0.1',
      stateVal: scoreTHR,
      stateSet: setScoreTHR,
      refName: 'scoreTHRRef',
      className: 'form-select-lg col-12',
    },

    {
      mname: 'Iou THLD',
      min: '0',
      max: '1',
      step: '0.1',
      stateVal: iouTHR,
      stateSet: setIouTHR,
      refName: 'iouTHRRef',
      className: 'form-select-lg col-12',
    },

    {
      mname: 'Max Boxes',
      min: '0',
      max: '100',
      step: '1',
      stateVal: maxBoxes,
      stateSet: setMaxBoxes,
      refName: 'maxBoxesRef',
      className: 'form-select-lg col-12',
    },
  ];

  const listModelSelectors = [
    {
      title: 'Model',
      onChange: { onSelectModel },
      selections: Object.keys({ modelsTable }),
      selected: { selectedModel },
    },
    {
      title: 'Weights',
      onChange: { onSelectDataset },
      selections: Object.keys(modelsTable[selectedModel]),
      selected: { selectedDataset },
    },
  ];

  return (
    <div className='container '>
      <AccordionOpen
        // Item #1 Model Setup Buttons
        // Radio Buttons
        onSelectModel={onSelectModel}
        modelsTable={modelsTable}
        selectedModel={selectedModel}
        onSelectDataset={onSelectDataset}
        selectedDataset={selectedDataset}
        // Model Select Button
        isWaiting={isModelLoadSpinner}
        modelLoadedMessage={modelLoadedMessage}
        onLoadModel={onLoadModel}
        //  Configuration - input numbers
        listInNumbers={listInNumbers}
        onChangeNumber={onChangeNumber}
      />
      <DataInAccordion
        // For input numbers components:
        listInNumbers={listInNumbers}
        onChangeNumber={onChangeNumber}
        // Run with url selection
        listExamples={listExamples}
        onChange={onSelectExample}
        onClickRunRemote={onClickRunRemote}
        // for both Detect startbuttons
        isVideoOn={isVideoOn}
        // Run with FileInput component
        onChangeFile={onChangeFile}
        onClickRunLocal={onClickRunLocal}
        selectedFileName={selectedFileName}
        onClickSetDataSource={onClickSetDataSource}
        isDataSourceLocal={isDataSourceLocal}
      />
      <div>
        {/* {isDataSourceLocal ? (
          <RunLocalData
            onChangeFile={onChangeFile}
            onClickRunLocal={onClickRunLocal}
            selectedFileName={selectedFileName}
            isVideoOn={isVideoOn}
          />
        ) : (
          <RunRemoteData
            onChange={onSelectExample}
            listExamples={listExamples}
            onClickRunRemote={onClickRunRemote}
            isVideoOn={isVideoOn}
          />
        )} */}
      </div>

      {/* <span
        className='badge text-bg-primary position-relative'
        onClick={onClickSetDataSource}
      >
        Toggle data source
        <span
          className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success '
          onClick={onClickSetDataSource}
        >
          {isDataSourceLocal ? 'files' : 'urls'}
        </span>
      </span> */}

      <div>
        <div className='row mb-3'>
          <div className='col mb-1'>
            <span
              className='badge text-bg-primary position-relative mt-5'
              onClick={onClickSetDataSource}
            >
              Toggle data source
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success '>
                {isDataSourceLocal ? 'files' : 'urls'}
              </span>
            </span>

            <span
              className='badge text-bg-dark position-relative'
              onClick={onClickToggleVideoSpeed}
            >
              {' '}
              select speed
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success '>
                {videoSpeed}
              </span>
            </span>
            {/* <div className='col-2 mb-1'>
              <select
                className='className= form-select form-select mb- '
                onChange={setVideoSpeed}
              >
                <option value={1.0}>Normal</option>
                <option value={0.5}>Slow</option>
                <option value={2.0}>Fast</option>
              </select>
            </div> */}
          </div>
        </div>
        <span className='badge text-bg-warning h3'>
          <small className='mx-1'>
            fps: {fps.toFixed(2).toString().padStart(5, '0')}
          </small>
          <small>
            {currentDurationOfVideo}/{durationOfVideo}
          </small>
        </span>
        <span
          className='badge text-bg-dark position-relative'
          onClick={onClickToggleVideoSpeed}
        >
          {' '}
          select speed
          <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success '>
            {videoSpeed}
          </span>
        </span>
        <span className='badge text-bg-success' onClick={pauseVideo}>
          pause
        </span>
        <span className='badge text-bg-primary' onClick={resumeVideo}>
          resume
        </span>

        {/* <span
            className='btn btn btn-dark  btn-lg  mb-1 position-relative badge '
            onClick={onClickRunRemote}
          >
            {!isVideoOn ? (
              <div>
                Detect!{' '}
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
                  Click to play url
                </span>{' '}
              </div>
            ) : (
              <div>
                Stop{' '}
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success '>
                  Running
                </span>
              </div>
            )}
          </span> */}
        {isDataSourceLocal ? (
          <span className='position-relative'>
            <RunButton
              onClickRunRemote={
                selectedFileName != '' ? onClickRunLocal : () => {}
              }
              isVideoOn={isVideoOn}
              badgeLabel={selectedFileName}
              disabled={selectedFileName == ''}
            />
            {selectedFileName == '' && (
              <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success '>
                Select a file
              </span>
            )}
          </span>
        ) : (
          <RunButton
            onClickRunRemote={onClickRunRemote}
            isVideoOn={isVideoOn}
            badgeLabel='urls'
            disabled={selectedFileName == ''}
          />
        )}
      </div>

      <div className='mtj-3 '>
        <canvas className='video' ref={canvasRefVideo} width='' height='' />
      </div>
      <div className='col'>
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
              onChange={videoDuration}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default YoloV3;
