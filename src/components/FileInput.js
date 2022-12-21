import React from 'react';

class FileInput extends React.Component {
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
            <span className='position-absolute top-0  start-50 translate-middle badge rounded-pill bg-danger'>
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

// const FileInput = ({ onChange, selectedFileName, ...props }) => {
//   console.log('selectedFileName', selectedFileName);
//   return (
//     <div>
//       <div>
//         <label className='btn btn-primary'>
//           Click to select a video or an image file
//           <input
//             {...props}
//             style={{ display: 'none' }}
//             type='file'
//             onChange={(e) => {
//               onChange(e);
//             }}
//           />
//           {selectedFileName ? (
//             <span className='badge bg-success'>{selectedFileName}</span>
//           ) : (
//             <span className='badge bg-danger'> No File Loaded</span>
//           )}
//         </label>
//       </div>
//     </div>
//   );
// };

export default FileInput;
