import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
// import Dropdown from 'react-bootstrap/Dropdown';

tf.setBackend('webgl');

// import LoadModel from './LoadModel.js';

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

  const [modelsTable, setModelsTable] = useState(configData.models);

  const [listExamples, setListExamples] = useState(cocoVideos.cocoVideos);

  // States:
  const [selectedFile, setSelectedFile] = useState('');
  // const [selectedVidFile, setSelectedVidFile] = useState('');
  const [selectedModel, setSelectedModel] = useState('YoloV3');
  const [selectedDataset, setSelectedDataset] = useState('coco');

  const [modelLoadedMessage, setModelLoadedMessage] =
    useState('No Model Loaded!');
  const [isModelLoadSpinner, setIsModelLoadSpinner] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [scoreTHR, setScoreTHR] = useState(configData.scoreThreshold);
  const [iouTHR, setIouTHR] = useState(configData.iouThreshold);
  const [maxBoxes, setMaxBoxes] = useState(configData.maxBoxes);

  const [selectedExample, setSelectedExample] = useState(listExamples[0].url);

  const [showVideoControl, setShowVideoControl] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(416);
  const [canvasHeight, setCanvasHeight] = useState(416);
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);

  const [sourceSelection, setSourceSelection] = useState('local');

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
    }
  };

  const stopVideo = () => {
    setShowVideoControl(false);

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
  const setVideoSpeed = (e) => {
    videoRef.current.playbackRate = parseFloat(e.target.value);
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
  const renderCallback_ = (imageObject, selBboxes, scores, classIndices) => {
    videoRender.current.drawOnImage(
      imageObject,
      selBboxes,
      scores,
      classIndices,
      classNames.current
    );
  };

  useEffect(() => {
    videoRef.current = document.createElement('video');
    // video.src =
    // 	'https://archive.org/download/C.E.PriceCatWalksTowardCamera/cat_walks_toward_camera_512kb.mp4';

    videoRef.current.controls = true;
    videoRef.current.muted = true;
    videoRef.current.height = canvasHeight; // in px
    videoRef.current.width = canvasWidth; // in px

    setShowVideoControl(false);

    videoRender.current = new Draw(canvasRefVideo.current);
    yoloPredictor.current = new YoloPredictor(renderCallback_);
  }, []);

  const runVideo = () => {
    setShowVideoControl(true);
    videoRef.current.preload = 'auto';
    videoRef.current.crossOrigin = 'anonymous';
    if (sourceSelection == 'local') {
      var URL = window.URL || window.webkitURL;
      var fileURL = URL.createObjectURL(selectedFile);
      videoRef.current.src = fileURL;
    } else {
      videoRef.current.src = selectedExample;
    }

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

    if (selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
      URL.createObjectURL(selectedFile);
      runImage(selectedFile);
    } else {
      // setSelectedVidFile(selectedFile);
      runVideo();
    }
  };
  const onClickRunRemote = () => {
    if (!isModelLoaded) {
      return;
    }
    stopVideo();

    if (selectedExample.match(/\.(jpg|jpeg|png|gif)$/i)) {
      // URL.createObjectURL(selectedFile);
      // runImage(selectedFile);
    } else {
      runVideo();
    }
  };

  const onChangeFile = (event) => {
    stopVideo();
    // var URL = window.URL || window.webkitURL;
    // var fileURL = URL.createObjectURL(event.target.files[0]);
    // console.log('onChangeFile', fileURL);
    // setSelectedFile(fileURL);
    setSelectedFile(event.target.files[0]);
    // if (event.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/i)) {
    // 	setShowVideoControl(false);
    // } else {
    // 	// setShowVideoControl(true);
    // }
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

    setModelLoadedMessage(
      selectedModel + ' ' + selectedDataset + ' is ready!!'
    );
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
    }
  };

  const onChangeDataSource = (event) => {
    console.log('onChangeDataSource ', event.target.value);

    setSourceSelection(event.target.value);
  };

  const InputNumber = (props) => {
    return (
      <div>
        <div className='col'>
          <label className=' h5 '>{props.name}</label>
        </div>
        <div className='col'>
          <input
            className='form-select-lg col-4'
            type='number'
            min={props.min}
            max={props.max}
            step={props.step}
            id={props.attributes}
            value={props.stateVal}
            onChange={(event) =>
              onChangeNumber(event, {
                stateSet: props.stateSet,
                refName: props.refName,
              })
            }
          />
        </div>
      </div>
    );
  };

  const LoadModel = (props) => {
    return (
      <div className='col '>
        <div className='col'>
          <button
            variant='primary'
            // type='submit'
            className='btn btn btn-primary btn-lg  mb-1 mt-3 col-12'
            onClick={props.onClick}
          >
            {props.isWaiting && (
              <span
                className='spinner-border spinner-border-sm'
                role='status'
                aria-hidden='true'
              ></span>
            )}
            {props.isWaiting ? 'Loading' : 'Load Model'}
          </button>
        </div>

        <div className='col-6 mx-auto'>
          <div className=' h5 mb-3 bg-warning text-center'>
            {props.doneMessage}
          </div>
        </div>
      </div>
    );
  };

  const RadioSelect = (props) => {
    return props.selections.map((selItem, index) => (
      <div key={index} className='form-check-inline col-5'>
        <div key={index} className='col'>
          <div key={index} className='col'>
            <label key={index} className='form-check-label'>
              {selItem}
            </label>
          </div>
          <div className='col'>
            <input
              className='form-check-input'
              type='radio'
              value={selItem}
              onChange={props.onChange}
              checked={props.selected === selItem}
            />
          </div>
        </div>
      </div>
    ));
  };

  const DataInAccordeon = () => {
    return (
      <div className='accordion accordion-flush' id='accordionFlushExample'>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='flush-headingOne'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#flush-collapseOne'
              aria-expanded='false'
              aria-controls='flush-collapseOne'
              onChange={onChangeDataSource2}
            >
              Remote Data
            </button>
          </h2>
          <div
            id='flush-collapseOne'
            className='accordion-collapse collapse'
            aria-labelledby='flush-headingOne'
            data-bs-parent='#accordionFlushExample'
          >
            <div className='accordion-body'>
              <div className='col selectEXamples'>
                <div className='col'>
                  <label htmlFor='selectExample' className=' h5 '>
                    Select an Example
                  </label>
                </div>
                <div className='col'>
                  <select
                    className='form-select form-select-lg mb-1'
                    onChange={onSelectExample}
                  >
                    {listExamples.map((option, index) => (
                      <option key={index} value={index}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='flush-headingTwo'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#flush-collapseTwo'
              aria-expanded='false'
              aria-controls='flush-collapseTwo'
            >
              Local File Uplad
            </button>
          </h2>
          <div
            id='flush-collapseTwo'
            className='accordion-collapse collapse'
            aria-labelledby='flush-headingTwo'
            data-bs-parent='#accordionFlushExample'
          >
            <div className='accordion-body'>
              <div className='col-3 mx-auto '>
                <input
                  className='form-select-lg'
                  id='selectFile'
                  type='file'
                  onChange={onChangeFile}
                  accept='image/*, video/*'
                />
              </div>
              <div className='row '>
                <div>
                  <button
                    variant='primary'
                    disabled={selectedFile == '' || !isModelLoaded}
                    className='btn btn btn-dark  btn-lg col-12 mb-1'
                    onClick={onClickRunLocal}
                  >
                    Run Detection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onChangeDataSource2 = (event) => {
    console.log('event', event);
  };
  const noop = () => {};

  //   const FileInput = ({ value, onChange = noop, ...rest }) => (
  //     <div>
  //       { {Boolean(value.length) && (
  //         <div>Selected files: {value.map((f) => f.name).join(', ')}</div>
  //       )} }
  //       <label>
  //         Click to select some files...
  //         <input
  //           {...rest}
  //           style={{ display: 'none' }}
  //           type='file'
  //           onChange={(e) => {
  //             onChange([...e.target.files]);
  //           }}
  //         />
  //       </label>
  //     </div>
  //   );

  const FileInput = ({ value, ...rest }) => {
    const inputRef = useRef();

    useEffect(() => {
      if (value === '') {
        inputRef.current.value = '';
      } else {
        inputRef.current.files = value;
        console.log(inputRef.current.files);
      }
    }, [value]);

    return (
      <input
        {...rest}
        type='file'
        accept='image/*, video/*'
        onChange={onChangeFile}
        ref={inputRef}
      />
    );
  };

  return (
    <div className='container '>
      <div className=' formExcludesVideo col bg-info bg-gradient'>
        <div className='col'>
          <h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>

          <div className='col mb-3'>
            <div className='col selectModel  '>
              <div className='col-4 mx-auto'>
                <label htmlFor='selectModel' className=' h5 '>
                  Select Model Architecture
                </label>
              </div>
              <div className='col-3 mx-auto'>
                <RadioSelect
                  onChange={onSelectModel}
                  selections={Object.keys(modelsTable)}
                  selected={selectedModel}
                />
              </div>
              <div className='col-4 mx-auto'>
                <label htmlFor='selectWeightd' className=' h5 mt-3'>
                  Select Trained Weights
                </label>
              </div>

              <div className='col-3 mx-auto'>
                <RadioSelect
                  onChange={onSelectDataset}
                  selections={Object.keys(modelsTable[selectedModel])}
                  selected={selectedDataset}
                />
              </div>

              <LoadModel
                onClick={onLoadModel}
                isWaiting={isModelLoadSpinner}
                doneMessage={modelLoadedMessage}
              />
            </div>

            <div className='col mb-5 selectFile'>
              <div className='col-3 mx-auto'>
                <label htmlFor='selectFile' className=' h5 '>
                  Select Input
                </label>
              </div>
              <DataInAccordeon />

              <div className=' col SelectInputSource mb-2 col-3 mx-auto'>
                <RadioSelect
                  onChange={onChangeDataSource}
                  selections={['local', 'remote']}
                  selected={sourceSelection}
                />
              </div>

              {sourceSelection === 'local' && (
                <div className='col-3 mx-auto '>
                  <input
                    className='form-select-lg'
                    id='selectFile'
                    type='file'
                    onChange={onChangeFile}
                    accept='image/*, video/*'
                  />
                </div>
              )}

              {sourceSelection === 'remote' && (
                <div className='col selectEXamples'>
                  <div className='col'>
                    <label htmlFor='selectExample' className=' h5 '>
                      Select an Example
                    </label>
                  </div>
                  <div className='col'>
                    <select
                      className='form-select form-select-lg mb-1'
                      onChange={onSelectExample}
                    >
                      {listExamples.map((option, index) => (
                        <option key={index} value={index}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='mb-3'>
            <div className='row mb-2 nmsAttribs'>
              ,
              <div className='col'>
                <InputNumber
                  name='Score THLD'
                  min='0'
                  max='1'
                  step='0.1'
                  stateVal={scoreTHR}
                  stateSet={setScoreTHR}
                  refName='scoreTHRRef'
                />
              </div>
              <div className='col'>
                <InputNumber
                  name='Iou THLD'
                  min='0'
                  max='1'
                  step='0.1'
                  stateVal={iouTHR}
                  stateSet={setIouTHR}
                  refName='iouTHRRef'
                />
              </div>
              <div className='col'>
                <InputNumber
                  name='Max Boxes'
                  min='0'
                  max='1000'
                  step='1'
                  stateVal={maxBoxes}
                  stateSet={setMaxBoxes}
                  refName='maxBoxesRef'
                />
              </div>
            </div>

            <div className='row'>
              <div className='col '>
                <InputNumber
                  name='Width'
                  min='0'
                  max='1920'
                  step='1'
                  stateVal={canvasWidth}
                  stateSet={setCanvasWidth}
                  refName=''
                />
              </div>
              <div className='col'>
                <InputNumber
                  name='Height'
                  min='0'
                  max='1920'
                  step='1'
                  stateVal={canvasHeight}
                  stateSet={setCanvasHeight}
                  refName=''
                />
              </div>
            </div>
          </div>
          <div className='col'>
            <div className='row '>
              <div>
                <button
                  variant='primary'
                  disabled={selectedFile == '' || !isModelLoaded}
                  className='btn btn btn-dark  btn-lg col-12 mb-1'
                  onClick={onClickRunLocal}
                >
                  Run Detection
                </button>
              </div>
            </div>
            <div className='col '>
              {selectedFile == '' && (
                <div className='col-6 '>
                  <div
                    className='  col h5 text-warning bg-dark'
                    id='liveAlertBtn'
                  >
                    Select A File!
                  </div>
                </div>
              )}
              {!isModelLoaded && (
                <div className='col-6 '>
                  <div className='   h5 text-warning bg-dark'>
                    Load A Model!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='col'>
        {showVideoControl == true && (
          <div className='col bg-warning bg-gradient'>
            <div className='col mb-3'>
              <div className='col'>
                <label className=' form-select-lg text-center text-white bg-primary col-4'>
                  Select Playback Speed
                </label>
              </div>
              <div className='col-4 mb-3'>
                <select
                  className='className= form-select form-select-lg mb- '
                  onChange={setVideoSpeed}
                >
                  <option value={1.0}>Normal speed</option>
                  <option value={0.5}>Slow</option>
                  <option value={2.0}>Fast speed</option>
                </select>
              </div>

              <div className='h1 col'>
                <span className='badge text-bg-dark form-select-lg h3'>
                  {currentDurationOfVideo} /{durationOfVideo}
                </span>
              </div>
            </div>

            <label htmlFor='customRange3' className='form-label'></label>
            <input
              type='range'
              className='form-range'
              min='0'
              max={durationOfVideo}
              // step='0.5'
              id='customRange3'
              value={currentDurationOfVideo}
              onChange={videoDuration}
            ></input>
            <div className='row '>
              <button
                variant='primary'
                className='btn btn btn-success btn-lg col-1 mb-1 mx-2'
                onClick={pauseVideo}
              >
                Pause Video
              </button>
              <button
                variant='primary'
                className='btn btn btn-primary btn-lg col-1 mb-1'
                onClick={resumeVideo}
              >
                Resume Video
              </button>
              <button
                variant='primary'
                className='btn btn btn-danger btn-lg col-1 mb-1 mx-2'
                onClick={stopVideo}
              >
                Stop Video
              </button>
            </div>
          </div>
        )}
        <div className='mt-3 '>
          <canvas className='video' ref={canvasRefVideo} width='' height='' />
        </div>
      </div>
      {/* <div className='customVideoTagClass '>
				<video ref={videoRef} preload='auto'></video>
			</div> */}
    </div>
  );
};

export default YoloV3;
