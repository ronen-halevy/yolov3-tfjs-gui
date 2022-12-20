import React from 'react';

import FileInput from './FileInput';

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
          />
        </div>
        <div>
          <button
            variant='primary'
            disabled={this.props.selectedFile}
            className='btn btn btn-dark  btn-lg col-12 mb-1'
            onClick={this.props.onClickRunLocal}
          >
            Detect!
          </button>
        </div>
      </div>
    );
  }
}

export default RunLocalData;
