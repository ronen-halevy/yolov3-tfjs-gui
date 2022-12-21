import React from 'react';
import RunLocalData from './RunLocalData.js';
import RunRemoteData from './RunRemoteData.js';

class DataInAccordion extends React.Component {
  constructor(props) {
    super(props);
  }
  // const InputNumber = (props) => {
  render() {
    return (
      <div className='accordion accordion-flush' id='accordionFlushExample'>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='flush-headingOne'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#flush-collapseOne'
              aria-expanded='false'
              aria-controls='flush-collapseOne'
            >
              Select Video Url
            </button>
          </h2>
          <div
            id='flush-collapseOne'
            className='accordion-collapse collapse'
            aria-labelledby='flush-headingOne'
            data-bs-parent='#accordionFlushExample'
          >
            <div className='accordion-body'>
              <RunRemoteData
                onChange={this.props.onChange}
                listExamples={this.props.listExamples}
                onClickRunRemote={this.props.onClickRunRemote}
                isVideoOn={this.props.isVideoOn}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DataInAccordion;
