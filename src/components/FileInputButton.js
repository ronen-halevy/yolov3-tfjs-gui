import React from 'react';

export default class FileInputButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <span className=''>
        <label className='btn btn-dark btn-lg  position-relative badge'>
          {this.props.buttonLable}
          {this.props.selectedFileName ? (
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
              {this.props.selectedFileName}
            </span>
          ) : (
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill text-bg-warning'>
              No file selected
            </span>
          )}
          <input
            // {...props}
            style={{ display: 'none' }}
            type='file'
            accept={this.props.accept}
            onChange={(e) => {
              this.props.onChange(e);
            }}
          />
        </label>
      </span>
    );
  }
}
