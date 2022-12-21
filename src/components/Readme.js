import React from 'react';
class Readme extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='accordion-body'>
        <strong>TL;DR</strong> This app detects objects in images and videos
        using Yolov3 deep-learning algorithm.
        <strong>Execution options:</strong>
        <br />- Algorithms: 1. YoloV3 2. YoloV3-Tiny Note - The Tiny version is
        faster and lighter in terms of computing load. However, the full form of
        YoloV3 performs better in terms of detection accuracy. <br />
        - Wheights: The app supports loading of Coco dataset wheights and Shapes
        dataset weights. Coco is trained on 80 object types while Shapes is a
        lab dataset which contains syntetic shapes, used for lab and demo
        purposes. <br />
        - Input data: Images and videos can be either uploaded from the local
        device storage, or be fetched from mixkit.co <br />
        Execution: Upon clicking <b>Detect!</b>, a canvas shows up at the
        bottom, with the rendering of bounding boxes arrounf the detected
        objects. The bounding boxes are annotated with detected object name and
        confidence of decision. dtrained over 80 objects. 2. Shapes dataset: An
        auto generated dataset prepared for developing and demonstration. Data
        Source: performs better than its Tiny form. The computing load of the
        Tiny larger that that of the Tiny version. This release includes 2 sets
        of weightswby to YoloV3 by Tensorflow dem Yolo is an image detection
        algorithm basedIt is shown by default, until the collapse plugin adds
        the appropriate classes that we use to style each element. These classes
        control the overall appearance, as well as the showing and hiding via
        CSS transitions. You can modify any of this with custom CSS or
        overriding our default variables. It's also worth noting that just about
        any HTML can go within the <code>.accordion-body</code>, though the
        transition does limit overflow.
      </div>
    );
  }
}
export default Readme;
