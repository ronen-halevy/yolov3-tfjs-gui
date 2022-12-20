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
            <span className='text-center'>
              {this.props.isWaiting ? 'Loading' : 'Load Model'}
            </span>
            <span className='mx-3  bg-success'>
              {this.props.modelLoadedMessage}
            </span>
          </button>
        </div>
      </div>
    );
  }
}

export default LoadModel;
