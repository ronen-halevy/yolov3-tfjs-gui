import React, { Component } from 'react';

export default class ConfigurationButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.initVal,
    };
  }
  componentDidMount() {}

  onClick = (index) => {
    let { min, max, step, ...rest } = this.props;
    let val = Math.round((this.state.value + step) * 10) / 10;
    val = val > max ? min : val;
    this.setState({ value: val }, (value) =>
      this.props.onClick(this.state.value, index)
    );
  };

  render() {
    const { max, label, headerBadge, footerBadge, index } = this.props;

    return (
      <span
        className='badge text-bg-dark position-relative  mx-3'
        onClick={() => {
          this.onClick(index);
        }}
      >
        {label}
        <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
          {this.state.value}
        </span>
        <span className='  badge rounded-pill  start-50 top-100 text-bg-light border border-dark position-absolute'>
          max: {max}{' '}
        </span>
      </span>
    );
  }
}
