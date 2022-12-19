import React from 'react';
class RadioSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return this.props.selections.map((selItem, index) => (
      <div key={index} className='form-check-inline col-6 mx-auto'>
        <div key={index} className='col'>
          <div key={index} className='col'>
            <label key={index} className='form-check-label'>
              {selItem}
            </label>
          </div>
          <div className='col'>
            <input
              className='form-check-input'
              type='radio'
              value={selItem}
              onChange={this.props.onChange}
              checked={this.props.selected === selItem}
            />
          </div>
        </div>
      </div>
    ));
  }
}

export default RadioSelect;
