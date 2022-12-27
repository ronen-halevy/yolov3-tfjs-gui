import React, { Component } from 'react';

export default class ConfigurationButton extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    const { onChange, label, headerBadge, footerBadge, index } = this.props;

    return (
      <span
        className='badge text-bg-dark position-relative  mx-3'
        key={index}
        onClick={() => {
          onChange(index);
        }}
      >
        {label}
        <span
          className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success'
          key={index + 1}
        >
          {headerBadge}
        </span>
        <span
          className='  badge rounded-pill  start-50 top-100 text-bg-secondary position-absolute'
          key={index + 2}
        >
          max: {footerBadge}{' '}
        </span>
      </span>
    );
  }
}
