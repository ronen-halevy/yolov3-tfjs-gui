import React, { Component } from 'react';
import ConfigurationButton from './ConfigurationButton';
export default class ConfigurationsPanel extends Component {
  onChange(index) {
    this.props.onChangeConfigNumber(this.props.configItemsList, index);
  }
  render() {
    const { configItemsList } = this.props;
    return (
      <div className='row mb-2'>
        {configItemsList.map(({ mname, stateVal, max, ...rest }, index) => (
          <div className='col-4 mb-3 text-center mt-3' key={index}>
            <ConfigurationButton
              onClick={this.onChange}
              label={mname}
              headerBadge={stateVal}
              footerBadge={max}
              index={index}
            />
          </div>
        ))}
      </div>
    );
  }
}
