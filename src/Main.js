import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

tf.setBackend('webgl');

import Accordion from './components/Accordion';

import ModelSelectionPanel from './components/ModelSelectionPanel';
import ConfigurationsPanel from './components/ConfigurationsPanel';
import VideoControlPanel from './components/VideoControlPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';

import configData from './config/configModel.json';
import cocoVideos from './examples/cocoVideos.json';

import YoloPredictor from './yolov3/YoloV3';
import Draw from './yolov3/Render';

export const Main = () => {
  // Refs:
  const canvasRefVideo = useRef(null);

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
  const [selectedWeights, setSelectedWeights] = useState('coco');

  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedWeightsIndex, setSelectedWeightsIndex] = useState(0);

  const [modelLoadedMessage, setModelLoadedMessage] =
    useState('No Model Loaded!');
  const [isModelLoadSpinner, setIsModelLoadSpinner] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [scoreTHR, setScoreTHR] = useState(configData.scoreThreshold);
  const [iouTHR, setIouTHR] = useState(configData.iouThreshold);
  const [maxBoxes, setMaxBoxes] = useState(configData.maxBoxes);

  const [selectedExample, setSelectedExample] = useState(listExamples[0].url);
  const [selectedExampleName, setSelectedExampleName] = useState(
    listExamples[0].name
  );

  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  const [canvasWidth, setCanvasWidth] = useState(416);
  const [canvasHeight, setCanvasHeight] = useState(416);
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
  const [fps, setFps] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1.0);

  const [isFileSource, setIsFileSource] = useState(false);

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

  const pauseResumeVideo = () => {
    if (isVideoPaused) {
      videoRef.current.play();
      setIsVideoPaused(false);
    } else {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
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
  const onClickVideoSpeed = (e) => {
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
    videoRender.current.renderOnImage(
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
    if (sourceSel == 'file') {
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

  const onClickRunFromFile = () => {
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
      runVideo('file');
    }
  };
  const onClickRunOnUrl = () => {
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
      runVideo('url');
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
    setSelectedWeights(event.target.value);
  };

  const onClickedModel = (event) => {
    const models = Object.keys(modelsTable);
    const selIndex = (selectedModelIndex + 1) % models.length;
    const selected = models[selIndex];
    console.log(selIndex);
    console.log(selected);

    setSelectedModelIndex(selIndex);
    setSelectedModel(selected);
    // check if prev selected dataset is valid for model:
    const datasets = Object.keys(modelsTable[selected]);
    if (datasets.length - 1 < selectedWeightsIndex) {
      const defaultIndex = 0;
      setSelectedWeightsIndex(defaultIndex);
      setSelectedWeights(datasets[defaultIndex]);
    }
  };
  const onClickSelectWeights = (event) => {
    const models = Object.keys(modelsTable);

    const datasets = Object.keys(modelsTable[selectedModel]);

    const selIndex = (selectedWeightsIndex + 1) % datasets.length;
    const selected = datasets[selIndex];
    console.log(selIndex);
    console.log(selected);

    setSelectedWeightsIndex(selIndex);
    setSelectedWeights(selected);
  };

  const onSelectExample = (event) => {
    stopVideo();
    const selected = listExamples[event.target.value];
    setSelectedExample(selected.url);
  };

  const onSwitchExample = (event) => {
    stopVideo();
    console.log(selectedExample);

    const selIndex = (selectedExampleIndex + 1) % listExamples.length;
    const selected = listExamples[selIndex];
    console.log(selIndex);
    console.log(selected);

    setSelectedExample(selected.url);
    setSelectedExampleIndex(selIndex);
    setSelectedExampleName(selected.name);
  };

  const onLoadModel = () => {
    setModelLoadedMessage('Loading Model...');
    setIsModelLoadSpinner(true);

    const modelConfig = modelsTable[selectedModel][selectedWeights];
    createModel(modelConfig);
    const message = selectedModel + ' + ' + selectedWeights + ' is ready!';
    setModelLoadedMessage(message);
    console.log(message);
    setIsModelLoadSpinner(false);
    setIsModelLoaded(true);
  };

  const onChangeConfigNumber = (listConfigItems, index) => {
    let { min, max, stateSet, stateVal, refName, step } =
      listConfigItems[index];
    let val = Math.round((stateVal + step) * 10) / 10;
    val = val > max ? min : val;
    stateSet(val);
    if (refName != '') {
      refName.current = val;
    }
  };

  const onClickSetDataSource = (event) => {
    isFileSource ? setIsFileSource(false) : setIsFileSource(true);
  };

  const listConfigItems = [
    {
      mname: 'Score THLD',
      min: 0,
      max: 1,
      step: 0.1,
      stateVal: scoreTHR,
      stateSet: setScoreTHR,
      refName: scoreTHRRef,
    },

    {
      mname: 'Iou THLD',
      min: 0,
      max: 1,
      step: 0.1,
      stateVal: iouTHR,
      stateSet: setIouTHR,
      refName: iouTHRRef,
    },

    {
      mname: 'Max Boxes',
      min: 0,
      max: 100,
      step: 1,
      stateVal: maxBoxes,
      stateSet: setMaxBoxes,
      refName: maxBoxesRef,
    },
  ];

  return (
    <div className='container '>
      <h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
      <Accordion
        // Radio Buttons
        onSelectModel={onSelectModel}
        modelsTable={modelsTable}
        selectedModel={selectedModel}
        onSelectDataset={onSelectDataset}
        selectedWeights={selectedWeights}
        // Model Select Button
        isWaiting={isModelLoadSpinner}
        modelLoadedMessage={modelLoadedMessage}
        onLoadModel={onLoadModel}
        // Run with url selection
        listExamples={listExamples}
        onChange={onSelectExample}
      />
      <ModelSelectionPanel
        onClickedModel={onClickedModel}
        selectedModel={selectedModel}
        selectedModelIndex={selectedModelIndex}
        modelsTable={modelsTable}
        onClickSelectWeights={onClickSelectWeights}
        selectedWeights={selectedWeights}
        selectedWeightsIndex={selectedWeightsIndex}
      />

      <div className='configButtons mt-3 border border-1 border-secondary position-relative'>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
          Configurations
        </span>
        <div className='row mb-2'>
          <ConfigurationsPanel
            listConfigItems={listConfigItems}
            onChangeConfigNumber={onChangeConfigNumber}
          />
        </div>
      </div>
      <div className='dataSource mt-3 border border-1 border-secondary position-relative '>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary  '>
          Data Source Selection
        </span>
        <DataSourceSelectionPanel
          onClickSetDataSource={onClickSetDataSource}
          isFileSource={isFileSource}
          onChangeFile={onChangeFile}
          selectedFileName={selectedFileName}
          onSwitchExample={onSwitchExample}
          selectedExampleName={selectedExampleName}
          selectedExampleIndex={selectedExampleIndex}
          listExamplesLength
        />
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
            isVideoOn={isVideoOn}
            pauseResumeVideo={pauseResumeVideo}
            isVideoPaused={isVideoPaused}
            isFileSource={isFileSource}
            selectedFileName={selectedFileName}
            onClickRunOnUrl={onClickRunOnUrl}
            onClickRunFromFile={onClickRunFromFile}
            selectedExampleName={selectedExampleName}
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
            onChange={videoDuration}
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
