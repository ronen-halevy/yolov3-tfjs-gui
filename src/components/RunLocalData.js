import React from 'react';

import FileInput from './FileInput';
import RunButton from './RunButton';

class RunLocalData extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <span className=''>
        <span className='  position-relative d-grid '>
          <FileInput
            onChange={this.props.onChangeFile}
            selectedFileName={this.props.selectedFileName}
            buttonLable='Click to select a file'
            accept='video/*, image/*'
          />
        </span>

        {/* {this.props.selectedFileName == '' && (
          <span class='  badge rounded-pill   bg-danger'>No file loaded!</span>
        )} */}
        {/* <RunButton
          onClickRunRemote={this.props.onClickRunLocal}
          isVideoOn={this.props.isVideoOn}
          disabled={this.props.selectedFileName == ''}
        /> */}
      </span>
    );
  }
}

export default RunLocalData;
