import React, { Component } from 'react';

export default class SelectDataSource extends Component {
  render() {
    const { onClickSetDataSource, isDataSourceLocal } = this.props;
    return (
      <span className=''>
        <span
          className='badge text-bg-dark position-relative  '
          onClick={onClickSetDataSource}
        >
          <span className='position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success '>
            {isDataSourceLocal ? 'local files' : 'fetch by urls'}
          </span>{' '}
          Data source
          <span className='  badge rounded-pill  start-50 top-100 text-bg-secondary position-absolute'>
            file or url
          </span>
        </span>
      </span>
    );
  }
}
