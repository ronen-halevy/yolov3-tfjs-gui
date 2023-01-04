import React, { useEffect, useRef, useState } from 'react';

import Accordion from './components/Accordion';

import ConfigurationsPanel from './components/ConfigurationsPanel';
import VideoControlPanel from './components/VideoControlPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';

// import YoloPredictor from './yolov3/YoloV3temp.js';
import YoloPredictor from 'https://cdn.jsdelivr.net/gh/ronen-halevy/yolov3-tfjs/src/yolov3/YoloV3temp.min.js';

export const Main = () => {
  // Refs:
  const canvasRefVideo = useRef(null);
  const yoloPredictor = useRef(null);
  const videoControlRef = useRef();

  // States:

  const [dataUrl, setDataUrl] = useState('');
  const [dataType, setDataType] = useState('');

  const [isReady, setIsReady] = useState(false);

  // useEffects
  useEffect(() => {}, []);

  // callBacks:
  const onClickSetDataSource = (url, type) => {
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
      {/* <div className='controlVideo mt-3 border border-1 border-secondary position-relative'> */}

      <div className=' mt-3 row'>
        <VideoControlPanel
          dataUrl={dataUrl}
          dataType={dataType}
          ref={videoControlRef}
        />
      </div>
    </div>
  );
};
