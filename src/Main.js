import React, { useEffect, useRef, useState } from 'react';

import Accordion from './components/Accordion';

import VideoControlPanel from './components/VideoControlPanel';
import DataSourceSelectionPanel from './components/DataSourceSelectionPanel';

export const Main = () => {
  // Refs:

  // States:

  const [dataUrl, setDataUrl] = useState('');
  const [dataType, setDataType] = useState('');

  // useEffects
  useEffect(() => {}, []);

  // callBacks:
  const onClickSetDataSource = (url, type) => {
    setDataUrl(url);
    setDataType(type);
  };

  return (
    <div className='container '>
      <h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
      <Accordion />
      <div className='dataSource mt-3 border border-1 border-secondary position-relative '>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary  '>
          Data Source Selection
        </span>
        <DataSourceSelectionPanel onClickSetDataSource={onClickSetDataSource} />
      </div>
      {/* <div className='controlVideo mt-3 border border-1 border-secondary position-relative'> */}

      <div className=' mt-3 row'>
        <VideoControlPanel dataUrl={dataUrl} dataType={dataType} />
      </div>
    </div>
  );
};
