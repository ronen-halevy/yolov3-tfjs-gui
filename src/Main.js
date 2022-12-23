import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

tf.setBackend('webgl');

import DataInAccordion from './components/DataInAccordion.js';
import AccordionOpen from './components/AccordionOpen.js';
import RunButton from './components/RunButton.js';
import RunLocalData from './components/RunLocalData.js';

import configData from './config/configModel.json';
import cocoVideos from './examples/cocoVideos.json';

import YoloPredictor from './yolov3/YoloV3.js';
import Draw from './yolov3/Render.js';

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

  const pauseResumeVideo = () => {
    if (isVideoPaused) {
      videoRef.current.play();
      setIsVideoPaused(false);
    } else {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
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
  const onClickedtaset = (event) => {
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

  // onClick={(event) => {
  //   this.props.onChangeConfigNumber(event, {
  //     stateVal, rest
  //   });
  // }}
  const onChangeConfigNumber = (listInNumbers, index) => {
    let { min, max, stateSet, stateVal, refName, step } = listInNumbers[index];
    let val = Math.round((stateVal + step) * 10) / 10;
    val = val > max ? min : val;
    stateSet(val);
    if (refName != '') {
      refName.current = val;
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
      min: 0,
      max: 1,
      step: 0.1,
      stateVal: scoreTHR,
      stateSet: setScoreTHR,
      refName: scoreTHRRef,
      className: 'form-select-lg col-12',
    },

    {
      mname: 'Iou THLD',
      min: 0,
      max: 1,
      step: 0.1,
      stateVal: iouTHR,
      stateSet: setIouTHR,
      refName: iouTHRRef,
      className: 'form-select-lg col-12',
    },

    {
      mname: 'Max Boxes',
      min: 0,
      max: 100,
      step: 1,
      stateVal: maxBoxes,
      stateSet: setMaxBoxes,
      refName: maxBoxesRef,
      className: 'form-select-lg col-12',
    },
  ];

  // const listModelSelectors = [
  //   {
  //     title: 'Model',
  //     onChange: { onSelectModel },
  //     selections: Object.keys({ modelsTable }),
  //     selected: { selectedModel },
  //   },
  //   {
  //     title: 'Weights',
  //     onChange: { onSelectDataset },
  //     selections: Object.keys(modelsTable[selectedModel]),
  //     selected: { selectedWeights },
  //   },
  // ];
  // Object.keys(modelsTable[selectedModel])

  return (
    <div className='container '>
      <h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
      <AccordionOpen
        // Item #1 Model Setup Buttons
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

      <div className='model mt-3 mb-2 border border-1 border-secondary position-relative'>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary '>
          Model Selection
        </span>
        <div className='selectModelAndDataset row mt-2'>
          <div className='col-4  text-center mb-3'>
            <span
              className='btn btn-dark btn-lg  position-relative badge start-0'
              onClick={onClickedModel}
            >
              Select a model
              <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                {selectedModel}
              </span>
              <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                {selectedModelIndex + 1}/{Object.keys(modelsTable).length}
              </span>
            </span>
          </div>
          <div className='col-4 text-center'> </div>

          <div className='col-4 text-center'>
            <span
              className='btn btn-dark btn-lg  position-relative badge start-0'
              onClick={onClickedtaset}
            >
              Select weights
              <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                {selectedWeights}
              </span>
              <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                {selectedWeightsIndex + 1} /
                {Object.keys(modelsTable[selectedModel]).length}
              </span>
            </span>
          </div>
        </div>

        {/* <span className=' badge rounded-pill bg-success position-relative'>
          {selectedModel}
          <span className='  badge rounded-pill  start-0 top-100 text-bg-secondary position-absolute'>
            selected model
          </span>
        </span>
        <span className=' badge rounded-pill bg-success position-relative'>
          {selectedWeights}
          <span className='  badge rounded-pill  start-0 top-100 text-bg-secondary  position-absolute'>
            selected dataset
          </span>
        </span> */}
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

      <div className='configButtons mt-3 border border-1 border-secondary position-relative'>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
          Configurations
        </span>
        <div className='row mb-2'>
          {listInNumbers.map(({ mname, stateVal, max, ...rest }, index) => (
            <div className='col-4 mb-3 text-center mt-3' key={index}>
              <span
                className='badge text-bg-dark position-relative  mx-3'
                key={index}
                onClick={(event) => {
                  onChangeConfigNumber(listInNumbers, index);
                }}
              >
                {mname}
                <span
                  className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success'
                  key={index + listInNumbers.length}
                >
                  {stateVal}
                </span>
                <span
                  className='  badge rounded-pill  start-50 top-100 text-bg-secondary position-absolute'
                  key={index + 2 * listInNumbers.length}
                >
                  max: {max}{' '}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className='dataSource mt-3 border border-1 border-secondary position-relative '>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary  '>
          Data Source Selection
        </span>
        <div className=' row mt-3 mb-3 '>
          <div className=' col-4  text-center'>
            <span className=''>
              <span
                className='badge text-bg-dark position-relative  '
                onClick={onClickSetDataSource}
              >
                <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
                  {isDataSourceLocal ? 'local files' : 'fetch by urls'}
                </span>{' '}
                Toggle data source
                <span className='  badge rounded-pill  start-50 top-100 text-bg-secondary position-absolute'>
                  file or url
                </span>
              </span>
            </span>
          </div>
          <div className=' col-4 text-center'></div>

          <div className=' col-4 text-center'>
            {isDataSourceLocal ? (
              <RunLocalData
                onChangeFile={onChangeFile}
                onClickRunLocal={onClickRunLocal}
                selectedFileName={selectedFileName}
                // isVideoOn={this.props.isVideoOn}
              />
            ) : (
              <span
                className='btn btn-dark btn-lg  position-relative badge '
                onClick={onSwitchExample}
              >
                Click to select a url
                <span className='position-absolute top-0  start-0 translate-middle badge rounded-pill bg-success'>
                  {selectedExampleName}
                </span>
                <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                  {selectedExampleIndex + 1}/ {listExamples.length}
                </span>
                <span className='  badge rounded-pill  start-0 top-100 text-bg-secondary position-absolute'>
                  fetching from https://mixkit.co/
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='controlVideo mt-3 border border-1 border-secondary position-relative'>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
          Video Control
        </span>
        <div className=' mt-3 row'>
          <div className='col-4  text-center'>
            <span
              className='badge text-bg-dark  position-absolute top-0 '
              onClick={onClickVideoSpeed}
            >
              {' '}
              speed
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success '>
                x{videoSpeed}
              </span>
            </span>
          </div>
        </div>
        <div className='  row'>
          <div className='col-4  text-center'>
            <span className='badge text-bg-secondary h3 mx-2 position-relative'>
              <small className='mx-1 '>
                fps: {fps.toFixed(2).toString().padStart(5, '0')}
              </small>
              <small className='mx-1 text-dark'>
                {currentDurationOfVideo}/{durationOfVideo}
              </small>
            </span>
          </div>

          <div className='col-4 text-center'>
            <span
              className='badge text-bg-dark mx-2'
              onClick={isVideoOn ? pauseResumeVideo : () => {}}
            >
              {isVideoPaused ? 'resume' : 'pasue'}
            </span>
          </div>
          <div className='col-4  text-center'>
            {isDataSourceLocal ? (
              <span className='position-relative col-1'>
                <RunButton
                  onClickRunRemote={
                    selectedFileName != '' ? onClickRunLocal : () => {}
                  }
                  isVideoOn={isVideoOn}
                  badgeLabel={selectedFileName}
                  disabled={selectedFileName == ''}
                />
                {selectedFileName == '' && (
                  <span className='position-absolute top-0  start-50 translate-middle badge  text-bg-warning'>
                    No file selected
                  </span>
                )}
              </span>
            ) : (
              <RunButton
                onClickRunRemote={onClickRunRemote}
                isVideoOn={isVideoOn}
                badgeLabel={selectedExampleName}
                disabled={selectedFileName == ''}
              />
            )}
          </div>
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
