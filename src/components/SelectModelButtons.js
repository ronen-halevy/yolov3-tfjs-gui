import React, { Component } from 'react';

export default class SelectModelButtons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // selectedModel: 'YoloV3Tiny',
      // selectedWeights: 'coco',
      selectedModelIndex: 0,
      selectedWeightsIndex: 0,
    };
  }

  onClickedSelectModel = () => {
    const models = Object.keys(this.props.modelsTable);
    const unpatedModelIndex =
      (this.state.selectedModelIndex + 1) % models.length;
    const selected = models[unpatedModelIndex];

    // Correct weights selection uppon changed mode - in case weigt index is now above models' weights size
    const datasets = Object.keys(this.props.modelsTable[selected]);

    const weightsIndex =
      datasets.length - 1 < this.state.selectedWeightsIndex
        ? 0
        : this.state.selectedWeightsIndex;
    this.setState(
      {
        selectedModelIndex: unpatedModelIndex,
        selectedWeightsIndex: weightsIndex,
      },
      () => this.updateBack()
    );
  };

  updateBack = () => {
    const { modelsTable, setModelAndWeights } = this.props;
    const selectedModel =
      Object.keys(modelsTable)[this.state.selectedModelIndex];
    const selectedWeights = Object.keys(modelsTable[selectedModel])[
      this.state.selectedWeightsIndex
    ];
    setModelAndWeights({
      selectedModel: selectedModel,
      selectedWeights: selectedWeights,
    });
  };
  onClickSelectWeights = () => {
    const { modelsTable } = this.props;

    const datasets = Object.keys(
      modelsTable[Object.keys(modelsTable)[this.state.selectedModelIndex]]
    );
    const updatesWeightsIndex =
      (this.state.selectedWeightsIndex + 1) % datasets.length;
    console.log('onClickSelectWeights');

    this.setState(
      {
        selectedWeights: datasets[updatesWeightsIndex],
        selectedWeightsIndex: updatesWeightsIndex,
      },
      () => this.updateBack()
    );
  };

  render() {
    const { modelsTable, ...result } = this.props;
    return (
      <React.Fragment>
        <div className='col-4  text-center mb-3'>
          <span
            className='btn btn-dark btn-lg  position-relative badge start-0'
            onClick={this.onClickedSelectModel}
          >
            Select a model
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
              {Object.keys(modelsTable)[this.state.selectedModelIndex]}
            </span>
            <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
              {this.state.selectedModelIndex + 1}/
              {Object.keys(modelsTable).length}
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
              {
                Object.keys(
                  modelsTable[
                    Object.keys(modelsTable)[this.state.selectedModelIndex]
                  ]
                )[this.state.selectedWeightsIndex]
              }
            </span>
            <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
              {this.state.selectedWeightsIndex + 1} /
              {
                Object.keys(
                  modelsTable[
                    Object.keys(modelsTable)[this.state.selectedModelIndex]
                  ]
                ).length
              }
            </span>
          </span>
        </div>
      </React.Fragment>
    );
  }
}
