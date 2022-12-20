import React from 'react';

import FileInput from './FileInput';
import RunButton from './RunButton';

class RunLocalData extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='col'>
        <div className=' mb-2 mx-auto'>
          <FileInput
            onChange={this.props.onChangeFile}
            selectedFileName={this.props.selectedFileName}
            buttonLable='Click to select a file'
            accept='video/*, image/*'
          />
        </div>
        <div className=' mb-2 mx-auto'>
          <FileInput
            onChange={this.props.onChangeFile}
            selectedFileName={this.props.selectedFileName}
            buttonLable='Click to select a video file'
            accept='video/*'
          />
        </div>

        <RunButton
          onClickRunRemote={this.props.onClickRunLocal}
          isVideoOn={this.props.isVideoOn}
          disabled={this.props.selectedFileName == ''}
        />
      </div>
    );
  }
}

export default RunLocalData;
