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
              onChange={this.props.sonChangeDataSource2}
            >
              Run With Remote Data
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
                listExamples={this.props.listExamples}
                isModelLoaded={this.props.isModelLoaded}
                onClickRunRemote={this.props.onClickRunRemote}
              />
            </div>
          </div>
        </div>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='flush-headingTwo'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#flush-collapseTwo'
              aria-expanded='false'
              aria-controls='flush-collapseTwo'
            >
              Run With Local Files
            </button>
          </h2>
          <div
            id='flush-collapseTwo'
            className='accordion-collapse collapse'
            aria-labelledby='flush-headingTwo'
            data-bs-parent='#accordionFlushExample'
          >
            <div className='accordion-body'>
              <div className='accordion-body'>
                <RunLocalData
                  isModelLoaded={this.props.isModelLoaded}
                  onChangeFile={this.props.onChangeFile}
                  onClickRunLocal={this.props.onClickRunLocal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DataInAccordion;
