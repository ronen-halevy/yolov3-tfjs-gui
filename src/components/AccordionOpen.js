import React from 'react';
// import RunLocalData from './RunLocalData.js';
// import RunRemoteData from './RunRemoteData.js';
import LoadModel from './LoadModel.js';
import RadioSelect from './RadioSelect.js';
import Readme from './Readme.js';

class AccordionOpen extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='accordion' id='accordionPanelsStayOpenExample'>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='panelsStayOpen-headingOne'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#panelsStayOpen-collapseOne'
              aria-expanded='false'
              aria-controls='panelsStayOpen-collapseOne'
            >
              Readme
            </button>
          </h2>
          <div
            id='panelsStayOpen-collapseOne'
            className='accordion-collapse collapse'
            aria-labelledby='panelsStayOpen-headingOne'
          >
            <div className='accordion-body'>
              <Readme />
            </div>
          </div>
        </div>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='panelsStayOpen-headingTwo'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#panelsStayOpen-collapseTwo'
              aria-expanded='false'
              aria-controls='panelsStayOpen-collapseTwo'
            >
              Model Setup
            </button>
          </h2>
          <div
            id='panelsStayOpen-collapseTwo'
            className='accordion-collapse collapse'
            aria-labelledby='panelsStayOpen-headingTwo'
          >
            <div className='accordion-body'>
              <div className='col-2 mx-auto'>
                <label htmlFor='selectModel' className=' h5 '>
                  Model
                </label>
              </div>
              <div className='col-6 mx-auto'>
                <RadioSelect
                  onChange={this.props.onSelectModel}
                  selections={Object.keys(this.props.modelsTable)}
                  selected={this.props.selectedModel}
                />
              </div>
              <div className='col-2 mx-auto'>
                <label htmlFor='selectWeightd' className=' h5 mt-3'>
                  Weights
                </label>
              </div>

              <div className='col-6 mx-auto '>
                <RadioSelect
                  onChange={this.props.onSelectDataset}
                  selections={Object.keys(
                    this.props.modelsTable[this.props.selectedModel]
                  )}
                  selected={this.props.selectedDataset}
                />
              </div>

              <LoadModel
                onClick={this.props.onLoadModel}
                isWaiting={this.props.isModelLoadSpinner}
                modelLoadedMessage={this.props.modelLoadedMessage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccordionOpen;
