import React, { Component } from 'react';

import FileInputButton from './FileInputButton';
import UrlSelectButton from './UrlSelectButton';

export default class DataSourceSelectionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFileSource: false,
      fileUrl: '',
      fileType: '',
      selectedUrl: '',
      selectedUrlType: '',
    };
  }

  sendUpdate = () => {
    const url = this.state.isFileSource
      ? this.state.fileUrl
      : this.state.selectedUrl;
    const type = this.state.isFileSource
      ? this.state.fileType
      : this.state.selectedUrlType;
    this.props.onClickSetDataSource(url, type);
  };

  onChangeFile = (url, type, title) => {
    this.setState({
      fileUrl: url,
      fileType: type,
    });
    this.props.onClickSetDataSource(url, type, title);
  };

  onChangeUrl = (url, type, title) => {
    this.setState({
      selectedUrl: url,
      selectedUrlType: type,
    });
    this.props.onClickSetDataSource(url, type, title);
  };

  onClickSetDataSource = () => {
    this.setState(
      { isFileSource: this.state.isFileSource ? false : true },
      () => {
        this.sendUpdate();
      }
    );
  };

  render() {
    return (
      <div className=' row mt-3 mb-3 '>
        <div className=' col-4  text-center'>
          <span className=''>
            <span
              className='badge text-bg-dark position-relative  '
              onClick={this.onClickSetDataSource}
            >
              <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger '>
                {this.state.isFileSource
                  ? 'local storage files'
                  : 'fetch by urls'}
              </span>{' '}
              Data source
              <span className='  badge rounded-pill  start-50 top-100 text-bg-light border border-dark position-absolute'>
                file or url
              </span>
            </span>
          </span>
        </div>
        <div className=' col-4 '></div>

        <div className=' col-4 text-center'>
          {this.state.isFileSource ? (
            <FileInputButton onChange={this.onChangeFile} />
          ) : (
            <UrlSelectButton onChange={this.onChangeUrl} />
          )}
        </div>
      </div>
    );
  }
}
