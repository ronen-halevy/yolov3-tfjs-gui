import React from 'react';

import InputNumber from './InputNumber';

const ttt = (event) => {
  console.log('ttt ');

  console.log('ttt test cb', event);
};
class ListInputNumbers extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('ListInputNumbers', this.props.listInNumbers);

    return this.props.listInNumbers.map(
      ({ mname, min, max, step, stateVal, stateSet, refName, className }) => (
        <div className='col'>
          <label className=' h5 '>{mname}</label>
          <div className='col'>
            <input
              className={className}
              type='number'
              min={min}
              max={max}
              step={step}
              value={stateVal}
              onChange={(event) => {
                this.props.onChangeNumber(event, {
                  stateSet: stateSet,
                  refName: refName,
                });
              }}
            />
          </div>
        </div>
      )
    );
  }
}

export default ListInputNumbers;
