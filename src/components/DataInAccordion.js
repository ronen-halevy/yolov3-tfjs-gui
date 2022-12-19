import React from 'react';
class DataInAccordion extends React.Component {
  constructor(props) {
    super(props);
  }
  // const InputNumber = (props) => {
  render() {
    return (
      <div className='accordion accordion-flush' id='accordionFlushExample'>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='flush-headingOne'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#flush-collapseOne'
              aria-expanded='false'
              aria-controls='flush-collapseOne'
              onChange={this.props.sonChangeDataSource2}
            >
              Remote Data
            </button>
          </h2>
          <div
            id='flush-collapseOne'
            className='accordion-collapse collapse'
            aria-labelledby='flush-headingOne'
            data-bs-parent='#accordionFlushExample'
          >
            <div className='accordion-body'>
              <div className='col selectEXamples'>
                <div className='col'>
                  {/* <label htmlFor='selectExample' className=' h5 '>
                    Select an Example
                  </label> */}
                </div>
                <div className='col'>
                  <select className='form-select form-select-lg mb-1'>
                    {this.props.listExamples.map((option, index) => (
                      <option key={index} value={index}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='row '>
                <div>
                  <button
                    variant='primary'
                    disabled={!this.props.isModelLoaded}
                    className='btn btn btn-dark  btn-lg col-12 mb-1'
                    onClick={this.props.onClickRunRemote}
                  >
                    Run Detection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='accordion-item'>
          <h2 className='accordion-header' id='flush-headingTwo'>
            <button
              className='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#flush-collapseTwo'
              aria-expanded='false'
              aria-controls='flush-collapseTwo'
            >
              Local File Uplad
            </button>
          </h2>
          <div
            id='flush-collapseTwo'
            className='accordion-collapse collapse'
            aria-labelledby='flush-headingTwo'
            data-bs-parent='#accordionFlushExample'
          >
            <div className='accordion-body'>
              <div className='col-3 mx-auto '>
                <input
                  className='form-select-lg'
                  id='selectFile'
                  type='file'
                  onChange={this.props.onChangeFile}
                  accept='image/*, video/*'
                />
              </div>
              <div className='row '>
                <div>
                  <button
                    variant='primary'
                    disabled={
                      this.props.selectedFile == '' || !this.props.isModelLoaded
                    }
                    className='btn btn btn-dark  btn-lg col-12 mb-1'
                    onClick={this.props.onClickRunLocal}
                  >
                    Run Detection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DataInAccordion;
