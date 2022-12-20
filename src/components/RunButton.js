import React from 'react';

class RunButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <button
          variant='primary'
          disabled={this.props.disabled}
          className='btn btn btn-dark  btn-lg col-12 mb-1 position-relative'
          onClick={this.props.onClickRunRemote}
        >
          {!this.props.isVideoOn ? (
            <div>
              Detect!{' '}
              <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary'>
                Click to start
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
        </button>
      </div>
    );
  }
}

export default RunButton;
