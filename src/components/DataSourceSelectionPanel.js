import React, { Component } from 'react';
import DataSourceSelectButton from './DataSourceSelectButton';
import UrlSelectButton from './UrlSelectButton';
import FileInputButton from './FileInputButton';

export default class DataSourceSelectionPanel extends Component {
  render() {
    const {
      onClickSetDataSource,
      isDataSourceLocal,
      onChangeFile,
      // onClickRunLocal,
      selectedFileName,
      onSwitchExample,
      selectedExampleName,
      selectedExampleIndex,
      listExamplesLength,
    } = this.props;

    return (
      <div className=' row mt-3 mb-3 '>
        <div className=' col-4  text-center'>
          <DataSourceSelectButton
            onClickSetDataSource={onClickSetDataSource}
            isDataSourceLocal={isDataSourceLocal}
          />
        </div>
        <div className=' col-4 text-center'></div>

        <div className=' col-4 text-center'>
          {isDataSourceLocal ? (
            <FileInputButton
              onChange={onChangeFile}
              selectedFileName={selectedFileName}
              buttonLable='Select a file'
              accept='video/*, image/*'
            />
          ) : (
            <UrlSelectButton
              onSwitchExample={onSwitchExample}
              selectedExampleName={selectedExampleName}
              selectedExampleIndex={selectedExampleIndex}
              listExamplesLength={listExamplesLength}
            />
          )}
        </div>
      </div>
    );
  }
}
