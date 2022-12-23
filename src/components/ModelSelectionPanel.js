import React, { Component } from 'react';

export default class ModelSelectionPanel extends Component {
  render() {
    const {
      onClickedModel,
      selectedModel,
      selectedModelIndex,
      modelsTable,
      onClickedtaset,
      selectedWeights,
      selectedWeightsIndex,
      ...rest
    } = this.props;
    return (
      <div>
        <div className='model mt-3 mb-2 border border-1 border-secondary position-relative'>
          <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary '>
            Model Selection
          </span>
          <div className='selectModelAndDataset row mt-2'>
            <div className='col-4  text-center mb-3'>
              <span
                className='btn btn-dark btn-lg  position-relative badge start-0'
                onClick={onClickedModel}
              >
                Select a model
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                  {selectedModel}
                </span>
                <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                  {selectedModelIndex + 1}/{Object.keys(modelsTable).length}
                </span>
              </span>
            </div>
            <div className='col-4 text-center'> </div>

            <div className='col-4 text-center'>
              <span
                className='btn btn-dark btn-lg  position-relative badge start-0'
                onClick={onClickedtaset}
              >
                Select weights
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                  {selectedWeights}
                </span>
                <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                  {selectedWeightsIndex + 1} /
                  {Object.keys(modelsTable[selectedModel]).length}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
