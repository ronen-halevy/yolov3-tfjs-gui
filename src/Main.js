import Accordion from './components/Accordion';

import VideoControlPanel from './components/VideoControlPanel';

export const Main = () => {
  return (
    <div className='container '>
      <h2 className='text-center mb-5 mt-5'>Yolo TfJs Demo</h2>
      <Accordion />
      {/* <div className='controlVideo mt-3 border border-1 border-secondary position-relative'> */}

      <div className=' mt-3 row'>
        <VideoControlPanel />
      </div>
    </div>
  );
};
