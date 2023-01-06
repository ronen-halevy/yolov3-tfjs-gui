import React, { Component } from 'react';
import cocoVideos from '../examples/cocoVideos.json';

export default class UrlSelectButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedExampleIndex: 0,
    };
    this.videoExamplesList = cocoVideos.cocoVideos;
  }

  componentDidMount() {
    this.onClick();
  }
  onClick = () => {
    const selectedExampleIndex =
      (this.state.selectedExampleIndex + 1) % this.videoExamplesList.length;

    const selection = this.videoExamplesList[selectedExampleIndex];

    var url = selection.url;
    const type = url.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video';

    this.setState(
      {
        selectedExampleIndex: selectedExampleIndex,
      },
      () => this.props.onChange(url, type, selection.title)
    );
  };

  render() {
    const { onSwitchExample, videoExamplesList, selectedExampleIndex } =
      this.props;
    return (
      <span
        className='btn btn-dark btn-lg  position-relative badge '
        onClick={this.onClick}
      >
        Select a url
        <span className='position-absolute top-0  start-0 translate-middle badge rounded-pill bg-success'>
          {this.videoExamplesList[this.state.selectedExampleIndex].title}
        </span>
        <span className='  badge rounded-pill  start-0 top-100 text-bg-secondary position-absolute'>
          https://mixkit.co/
        </span>
        <span className='position-absolute top-0  start-100 translate-middle badge rounded-pill bg-success'>
          {this.state.selectedExampleIndex + 1}/ {this.videoExamplesList.length}
        </span>
      </span>
    );
  }
}
