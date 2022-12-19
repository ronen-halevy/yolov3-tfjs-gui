import React from 'react';
// import RunLocalData from './RunLocalData.js';
// import RunRemoteData from './RunRemoteData.js';
import LoadModel from './LoadModel.js';

class AccordionOpen extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div class='accordion' id='accordionPanelsStayOpenExample'>
        <div class='accordion-item'>
          <h2 class='accordion-header' id='panelsStayOpen-headingOne'>
            <button
              class='accordion-button'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#panelsStayOpen-collapseOne'
              aria-expanded='true'
              aria-controls='panelsStayOpen-collapseOne'
            >
              Accordion Item #1
            </button>
          </h2>
          <div
            id='panelsStayOpen-collapseOne'
            class='accordion-collapse collapse show'
            aria-labelledby='panelsStayOpen-headingOne'
          >
            <div class='accordion-body'>
              <strong>This is the first item's accordion body.</strong> It is
              shown by default, until the collapse plugin adds the appropriate
              classes that we use to style each element. These classes control
              the overall appearance, as well as the showing and hiding via CSS
              transitions. You can modify any of this with custom CSS or
              overriding our default variables. It's also worth noting that just
              about any HTML can go within the <code>.accordion-body</code>,
              though the transition does limit overflow.
            </div>
          </div>
        </div>
        <div class='accordion-item'>
          <h2 class='accordion-header' id='panelsStayOpen-headingTwo'>
            <button
              class='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#panelsStayOpen-collapseTwo'
              aria-expanded='false'
              aria-controls='panelsStayOpen-collapseTwo'
            >
              Accordion Item #2
            </button>
          </h2>
          <div
            id='panelsStayOpen-collapseTwo'
            class='accordion-collapse collapse'
            aria-labelledby='panelsStayOpen-headingTwo'
          >
            <div class='accordion-body'>
              <LoadModel
                onClick={this.props.onLoadModel}
                isWaiting={this.props.isModelLoadSpinner}
                doneMessage={this.props.modelLoadedMessage}
              />
            </div>
          </div>
        </div>
        <div class='accordion-item'>
          <h2 class='accordion-header' id='panelsStayOpen-headingThree'>
            <button
              class='accordion-button collapsed'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#panelsStayOpen-collapseThree'
              aria-expanded='false'
              aria-controls='panelsStayOpen-collapseThree'
            >
              Configurations
            </button>
          </h2>
          <div
            id='panelsStayOpen-collapseThree'
            class='accordion-collapse collapse'
            aria-labelledby='panelsStayOpen-headingThree'
          >
            <div class='accordion-body'>
              {this.props.listInNumbers.map(
                ({
                  mname,
                  min,
                  max,
                  step,
                  stateVal,
                  stateSet,
                  refName,
                  className,
                }) => (
                  <div className='col'>
                    <label className=' h5 '>{mname}</label>
                    <div className='col'>
                      <input
                        className={className}
                        type='number'
                        min={min}
                        max={max}
                        step={step}
                        value={stateVal}
                        onChange={(event) => {
                          this.props.onChangeNumber(event, {
                            stateSet: stateSet,
                            refName: refName,
                          });
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccordionOpen;
