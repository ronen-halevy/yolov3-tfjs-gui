import React, { Component } from 'react';

import configModel from '../config/configModel.json';

export default class ModelSelectionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedModel: 'YoloV3Tiny',
      selectedWeights: 'coco',
      selectedModelIndex: 0,
      selectedWeightsIndex: 0,
      loadedModel: '',
      loadedWeights: '',
      loadingMessage: 'No Model Loaded!',
      loadSpinner: false,
    };
    this.modelsTable = configModel.models;
  }

  componentDidMount() {
    this.onLoadModel();
  }

  onClickedSelectModel = () => {
    const models = Object.keys(this.modelsTable);
    const unpatedModelIndex =
      (this.state.selectedModelIndex + 1) % models.length;
    const selected = models[unpatedModelIndex];

    // Correct weights selection uppon changed mode - in case weigt index is now above models' weights size
    const datasets = Object.keys(this.modelsTable[selected]);

    const weightsIndex =
      datasets.length - 1 < this.state.selectedWeightsIndex
        ? 0
        : this.state.selectedWeightsIndex;
    this.setState({
      selectedModelIndex: unpatedModelIndex,
      selectedModel: selected,
      selectedWeightsIndex: weightsIndex,
      selectedWeights: datasets[weightsIndex],
    });
  };

  onClickSelectWeights = (event) => {
    const datasets = Object.keys(this.modelsTable[this.state.selectedModel]);
    const updatesWeightsIndex =
      (this.state.selectedWeightsIndex + 1) % datasets.length;
    console.log(updatesWeightsIndex);

    this.setState({
      selectedWeights: datasets[updatesWeightsIndex],
      selectedWeightsIndex: updatesWeightsIndex,
    });
  };

  onLoadModel = () => {
    this.setState({ loadingMessage: 'Loading Model...', loadSpinner: true });

    const modelConfig =
      this.modelsTable[this.state.selectedModel][this.state.selectedWeights];
    const { modelUrl, anchorsUrl, classNamesUrl, ...rest } = modelConfig;

    this.props.onLoadModel(modelUrl, anchorsUrl, classNamesUrl).then(() => {
      this.setState({
        loadedModel: this.state.selectedModel,
        loadedWeights: this.state.selectedWeights,

        loadingMessage:
          this.state.selectedModel +
          ' + ' +
          this.state.selectedWeights +
          ' is ready!',
        loadSpinner: false,
      });
    });
  };

  render() {
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
                onClick={this.onLoadModel}
              >
                Load
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                  {this.state.loadedModel}+{this.state.selectedWeights} Loaded!
                </span>
                {this.state.loadSpinner && (
                  <div className='spinner-border' role='status'>
                    <span className='sr-only'></span>
                  </div>
                )}
              </span>
            </div>
            <div className='col-4  text-center mb-3'>
              <span
                className='btn btn-dark btn-lg  position-relative badge start-0'
                onClick={this.onClickedSelectModel}
              >
                Select a model
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                  {this.state.selectedModel}
                </span>
                <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                  {this.state.selectedModelIndex + 1}/
                  {Object.keys(this.modelsTable).length}
                </span>
              </span>
            </div>

            <div className='col-4 text-center'>
              <span
                className='btn btn-dark btn-lg  position-relative badge start-0'
                onClick={this.onClickSelectWeights}
              >
                Select weights
                <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
                  {this.state.selectedWeights}
                </span>
                <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
                  {this.state.selectedWeightsIndex + 1} /
                  {
                    Object.keys(this.modelsTable[this.state.selectedModel])
                      .length
                  }
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
