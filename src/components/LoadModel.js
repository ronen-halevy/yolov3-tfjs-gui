import React from 'react';

export default class LoadModel extends React.Component {
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
            className='btn btn btn-primary position-relative btn-lg  mb-1 mt-3 col-12'
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
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
              {this.props.modelLoadedMessage}
            </span>
          </button>
        </div>
      </div>
    );
  }
}
