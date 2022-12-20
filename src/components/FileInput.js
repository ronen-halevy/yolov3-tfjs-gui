import React from 'react';

class FileInput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('FileInput class', this.props.selectedFileName);
    return (
      <div className='col'>
        <div>
          <label className='btn btn-primary btn-lg col-12'>
            Click to select a video or an image file
            <input
              // {...props}
              style={{ display: 'none' }}
              type='file'
              onChange={(e) => {
                this.props.onChange(e);
              }}
            />
            {this.props.selectedFileName ? (
              <span className='badge bg-success'>
                {this.props.selectedFileName}
              </span>
            ) : (
              <span className='badge bg-danger'> No File Loaded</span>
            )}
          </label>
        </div>
      </div>
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
