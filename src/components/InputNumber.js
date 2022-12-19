import React from 'react';
class InputNumber extends React.Component {
  constructor(props) {
    super(props);
  }
  // const InputNumber = (props) => {
  render() {
    return (
      <div>
        <div className='col'>
          <label className=' h5 '>{this.props.name}</label>
        </div>
        <div className='col'>
          <input
            className='form-select-lg col'
            type='number'
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            id={this.props.attributes}
            value={this.props.stateVal}
            onChange={(event) => {
              this.props.onChangeNumber(event, {
                stateSet: this.props.stateSet,
                refName: this.props.refName,
              });
            }}
          />
        </div>
      </div>
    );
  }
  //   );
}

export default InputNumber;
