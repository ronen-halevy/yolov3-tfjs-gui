import React from 'react';

class RunLocalData extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className='col-3 mx-auto '>
          <input
            className='form-select-lg'
            id='selectFile'
            type='file'
            onChange={this.props.onChangeFile}
            accept='image/*, video/*'
          />
        </div>
        <div className='row '>
          <div>
            <button
              variant='primary'
              disabled={
                this.props.selectedFile == '' || !this.props.isModelLoaded
              }
              className='btn btn btn-dark  btn-lg col-12 mb-1'
              onClick={this.props.onClickRunLocal}
            >
              Run Detection
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RunLocalData;
