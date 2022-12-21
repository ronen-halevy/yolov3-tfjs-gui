import React from 'react';

class RunButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <span
        className='btn btn btn-dark  btn-lg  mb-1 position-relative badge '
        onClick={this.props.onClickRunRemote}
      >
        {' '}
        {!this.props.isVideoOn ? (
          <div>
            Detect!{' '}
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
              Click to play url
            </span>{' '}
          </div>
        ) : (
          <div>
            Stop{' '}
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
              Running
            </span>
          </div>
        )}
      </span>
    );
  }
}

export default RunButton;
