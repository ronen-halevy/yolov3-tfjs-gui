import React from 'react';

export default class FileInputButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
    };
  }

  onChangeFile = (event) => {
    const file = event.target.files[0];
    const URL = window.URL || window.webkitURL;
    const fileUrl = URL.createObjectURL(file);
    const type = file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video';
    const title = file.name;
    this.setState(
      {
        fileName: file.name,
      },
      () => this.props.onChange(fileUrl, type, title)
    );
  };

  // selectedFileName={selectedFileName}
  // buttonLable='Select a file'
  // accept='video/*, image/*'
  render() {
    return (
      <span className=''>
        <label className='btn btn-dark btn-lg  position-relative badge'>
          {'Select a file'}
          {this.state.fileName ? (
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-success'>
              {this.state.fileName}
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
            accept='video/*, image/*'
            onChange={this.onChangeFile}
          />
        </label>
      </span>
    );
  }
}
