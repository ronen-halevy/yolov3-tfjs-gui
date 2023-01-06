import React, { useEffect, useState } from 'react';

export const VideoControlPanel = (props) => {
  const [scale, setScale] = useState(0.25);
  const [videoRate, setVideoRate] = useState(1);

  useEffect(() => {
    // init on start:
    props.onClickScale(scale);
    props.onClickVideoSpeed(videoRate);
  }, []);

  const onClickScale = () => {
    const [min, max, stride] = [0.125, 2, 2];
    const newScale = scale * stride > max ? min : scale * stride;
    setScale(newScale);
    props.onClickScale(newScale);
  };
  const onClickVideoSpeed = () => {
    const [min, max, stride] = [0.5, 2, 2];
    const newRate = videoRate * stride > max ? min : videoRate * stride;
    setVideoRate(newRate);
    props.onClickVideoSpeed(newRate);
  };

  const {
    fps,
    duration,
    currentTime,
    title,
    onChangeCurrentTime,
    isVideoPlaying,
  } = props;
  console.log(title);
  return (
    <div>
      <div className=' row text-center'>
        <div className=' col'>
          <div className=' col-sm text-center badge rounded-pill btn-outline-secondary text-dark text-center'>
            Video Control
          </div>
        </div>
      </div>
      <div className='col bg-warning bg-gradient'>
        <div className='container'>
          <div className='row'>
            {/* Speed button */}

            <div className='col-4 text-center'>
              {' '}
              <span
                className='badge text-bg-dark  position-relative'
                onClick={onClickVideoSpeed}
              >
                {' '}
                Speed
                <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
                  x{videoRate}
                </span>
              </span>
            </div>
            {/* fps display */}

            <div className='col-4 text-center'>
              {' '}
              <span className='badge text-bg-light   position-relative'>
                <span className=' '>fps: {fps}</span>
              </span>
            </div>
            {/* time display */}

            <div className='col-4 text-center'>
              <span className='badge text-bg-light  position-relative'>
                <span className='text-center'>
                  {currentTime}/{duration}
                </span>
              </span>
            </div>
          </div>
          {/* range bar */}
          <input
            type='range'
            className='form-range'
            min='0'
            max={duration}
            step='0.1'
            id='customRange3'
            value={currentTime}
            onChange={onChangeCurrentTime}
          />
          <label className='mb-1 row'>
            <span className='col'>
              Touch<b className=''>Canvas</b>
              {/* Scale button */}
              <span
                className='badge text-bg-dark  position-relative mx-1 '
                onClick={onClickScale}
              >
                {' '}
                Scale
                <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success'>
                  x{scale}
                </span>
              </span>
              {/* on off indicator */}
              <span className='mx-1 '>
                {!isVideoPlaying ? (
                  <span className='  ' role='status'></span>
                ) : (
                  <span className=' bg-light ' role='status'>
                    running
                  </span>
                )}
              </span>{' '}
            </span>
            <span className='col'>
              {/* title */}
              <span className=' ' role='status'>
                selected title: <b>{title}</b>
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
