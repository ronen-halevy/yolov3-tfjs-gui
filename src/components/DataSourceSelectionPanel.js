import React, { Component } from 'react';

export default class DataSourceSelectionPanel extends Component {
  render() {
    const {
      onClickSetDataSource,
      isDataSourceLocal,
      onChangeFile,
      onClickRunLocal,
      selectedFileName,
      onSwitchExample,
      selectedExampleName,
      selectedExampleIndex,
      listExamplesLength,
    } = this.props;

    return (
      <div className='dataSource mt-3 border border-1 border-secondary position-relative '>
        <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-primary  '>
          Data Source Selection
        </span>
        <div className=' row mt-3 mb-3 '>
          <div className=' col-4  text-center'>
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
          </div>
          <div className=' col-4 text-center'></div>

          <div className=' col-4 text-center'>
            {isDataSourceLocal ? (
              <RunLocalData
                onChangeFile={onChangeFile}
                onClickRunLocal={onClickRunLocal}
                selectedFileName={selectedFileName}
              />
            ) : (
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
                  {selectedExampleIndex + 1}/ {listExamplesLength.length}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}
