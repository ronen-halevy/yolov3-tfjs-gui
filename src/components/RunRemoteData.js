import React from 'react';
import RunButton from './RunButton';

class RunRemoteData extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className='col selectEXamples'>
          <div className='col'>
            {/* <label htmlFor='selectExample' className=' h5 '>
                    Select an Example
                  </label> */}
          </div>
          <div className='col position-relative mt-2'>
            <span class='position-absolute top-10  start-50 translate-middle badge rounded-pill bg-primary'>
              Select
            </span>

            <select
              className='form-select form-select-lg mb-1'
              onChange={this.props.onChange}
            >
              {this.props.listExamples.map((option, index) => (
                <option key={index} value={index}>
                  {option.name}
                </option>
              ))}
            </select>
            <span class='  position-absolute  start-50 translate-middle badge rounded-pill bg-secondary mb-1'>
              Credit: Videos are fetched from https://mixkit.co/
            </span>
          </div>
        </div>
        {/* <div className='row mt-5'>
          <RunButton
            onClickRunRemote={this.props.onClickRunRemote}
            isVideoOn={this.props.isVideoOn}
            disabled={false}
          />
        </div> */}
      </div>
    );
  }
}

export default RunRemoteData;
