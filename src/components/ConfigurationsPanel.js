import React, { Component } from 'react';
import ConfigurationButton from './ConfigurationButton';
export default class ConfigurationsPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.configItemsList = [
      {
        mname: 'Score THLD',
        min: 0,
        max: 1,
        step: 0.1,
        initVal: 0.3,
        callBack: this.props.setScoreTHR,
      },

      {
        mname: 'Iou THLD',
        min: 0,
        max: 1,
        step: 0.1,
        initVal: 0.3,
        callBack: this.props.setIouTHR,
      },

      {
        mname: 'Max Boxes',
        min: 0,
        max: 100,
        step: 1,
        initVal: 100,
        callBack: this.props.setMaxBoxes,
      },
    ];
  }

  onClick = (value, index) => {
    this.configItemsList[index].callBack(value);
  };
  render = () => {
    const {} = this.props;
    return (
      <div className='row mb-2 '>
        {this.configItemsList.map(
          ({ mname, stateVal, min, max, step, initVal, ...rest }, index) => (
            <div className='col-4 mb-1  mt-3 text-center' key={index}>
              <ConfigurationButton
                onClick={this.onClick}
                label={mname}
                initVal={initVal}
                index={index}
                min={min}
                max={max}
                step={step}
              />
            </div>
          )
        )}
      </div>
    );
  };
}
