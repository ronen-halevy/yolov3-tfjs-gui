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
          <div className='col'>
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
          </div>
        </div>
        <div className='row '>
          <RunButton
            onClickRunRemote={this.props.onClickRunRemote}
            isVideoOn={this.props.isVideoOn}
            disabled={false}
          />
        </div>
      </div>
    );
  }
}

export default RunRemoteData;
