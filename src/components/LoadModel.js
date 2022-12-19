import React from 'react';

class LoadModel extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='col '>
        <div className='col'>
          <button
            variant='primary'
            // type='submit'
            className='btn btn btn-primary btn-lg  mb-1 mt-3 col-12'
            onClick={this.props.onClick}
          >
            {this.props.isWaiting && (
              <span
                className='spinner-border spinner-border-sm'
                role='status'
                aria-hidden='true'
              ></span>
            )}
            {this.props.isWaiting ? 'Loading' : 'Load Model'}
          </button>
        </div>

        <div className='col-6 mx-auto'>
          <div className=' h5 mb-3 bg-warning text-center'>
            {this.props.doneMessage}
          </div>
        </div>
      </div>
    );
  }
}

export default LoadModel;
