import React, { Component } from 'react';
export default class ConfigurationsPanel extends Component {
  render() {
    const { listConfigItems, onChangeConfigNumber } = this.props;
    return (
      <div className='row mb-2'>
        {listConfigItems.map(({ mname, stateVal, max, ...rest }, index) => (
          <div className='col-4 mb-3 text-center mt-3' key={index}>
            <span
              className='badge text-bg-dark position-relative  mx-3'
              key={index}
              onClick={(event) => {
                onChangeConfigNumber(listConfigItems, index);
              }}
            >
              {mname}
              <span
                className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success'
                key={index + listConfigItems.length}
              >
                {stateVal}
              </span>
              <span
                className='  badge rounded-pill  start-50 top-100 text-bg-secondary position-absolute'
                key={index + 2 * listConfigItems.length}
              >
                max: {max}{' '}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
}
