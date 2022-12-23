import React, { Component } from 'react';

import RunButton from './RunButton';

export default class VideoControlPanel extends Component {
  render() {
    const {
      onClickVideoSpeed,
      videoSpeed,
      fps,
      currentDurationOfVideo,
      durationOfVideo,
      isVideoOn,
      pauseResumeVideo,
      isVideoPaused,
      isDataSourceLocal,
      selectedFileName,
      onClickRunRemote,
      onClickRunLocal,
      selectedExampleName,
    } = this.props;

    return (
      <div className='row'>
        <div className='col-4  text-center position-relative mb-1'>
          <span className='badge text-bg-dark  ' onClick={onClickVideoSpeed}>
            {' '}
            speed
            <span className='badge text-bg-secondary  position-relative'>
              <small className=' '>
                fps: {fps.toFixed(2).toString().padStart(5, '0')}
              </small>
              <small className=' text-dark'>
                {currentDurationOfVideo}/{durationOfVideo}
              </small>
            </span>
            <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
              x{videoSpeed}
            </span>
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
    );
  }
}
