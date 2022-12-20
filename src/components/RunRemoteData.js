import React from 'react';

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
          <div>
            <button
              variant='primary'
              className='btn btn btn-dark  btn-lg col-12 mb-1'
              onClick={this.props.onClickRunRemote}
            >
              Detect!
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RunRemoteData;
