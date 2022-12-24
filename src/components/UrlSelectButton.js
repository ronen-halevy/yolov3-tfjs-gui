import React, { Component } from 'react';

export default class UrlSelectButton extends Component {
  render() {
    const {
      onSwitchExample,
      selectedExampleName,
      selectedExampleIndex,
      videoExamplesListLen,
    } = this.props;
    return (
      <span
        className='btn btn-dark btn-lg  position-relative badge '
        onClick={onSwitchExample}
      >
        Select a url
        <span className='position-absolute top-0  start-0 translate-middle badge rounded-pill bg-success'>
          {selectedExampleName}
        </span>
        <span className='  badge rounded-pill  start-0 top-100 text-bg-secondary position-absolute'>
          from https://mixkit.co/
        </span>
        <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
          {selectedExampleIndex + 1}/ {videoExamplesListLen}
        </span>
      </span>
    );
  }
}
