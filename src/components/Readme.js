import React from 'react';
class Readme extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='accordion-body'>
        <p>
          <strong>Welcome to the Yolo Tfjs Demo!</strong>
          <br /> <br />
          <h2>A brief description</h2> <br />
          The app demonstrates an original implementation of the YoloV3
          algorithm, based on the paper by Joseph Redmon, and Ali Farhadi.{' '}
          <br />
          It is a CNN-based deep learning algorithm, which detects objects,
          marks detections with bounding boxes, and annotates with object name
          and prediction&rsquo;s confidence score. <br /> <br />
          <h2>A brief user's guide</h2> The app is set with default
          configurations, so you are ready to press play and run the default
          video selection!
          <br />
          Then, you may either load images or video files from local storage or
          select a video from a list - the selected video will be fetched by its
          URL.
          <br /> <br />
          <h2>The UI </h2>
          The UI is implemented by ReactJS. It consists of 3 sections: an
          accordion buttons section, a mini-buttons panels section, and the
          rendering canvas, placed on the bottom. The latter is visible only
          after pressing play. <br /> <br />
          <h3>Control Modes</h3>
          The system can be controlled by either the accordion-arranged buttons
          or by the mini-button panels. Note: the accordion support was reduced
          to only a fraction of the controlling functions, and may be completely
          removed, according to users&rsquo; feedback. <br /> <br />
          <h3>Mini-buttons panel</h3>
          The interface consists of 4 mini-button panels, described next.
          <br /> <br />
          <h3>Model Selection panel</h3>
          <br />
          <h4>Select model button</h4>
          Currently, the selection is between YoloV3 and its lightweight
          version, YoloV3-Tiny. The first performs better in terms of detection
          accuracy but consumes more computing resources. The full Yolov3 may be
          too heavy for some devices. Actually, YoloV3-Tiny may also be too
          heavy for some devices, or may not be able to run at all. <br />{' '}
          <br />
          <h4>Select weights button</h4>
          The model should be loaded with pre-trained weights. Currently, the
          selection is between the Coco weights, produced by training with the
          80 types of objects Coco dataset, and the Shapes weights, produced by
          training the Shapes synthetically generated dataset. The latter is a
          dataset targeted for lab and demo purposes. (v0.1 Shapes weights for
          YoloV3 are only briefly trained, leading to poor accuracy, and weights
          for Tiny are not yet added. The coco weights are loaded from the
          darknet website, converted to Keras format - and then to JS format.
          <br />
          <br />
          <h3>Data Source Selection panel</h3>
          <br />
          <h4>Toggle data source button</h4>
          This button selects the source of consumed data, i.e. the input image
          or video files. Selection is between uploading from local storage, or
          fetching, (currently videos only), from video sites.
          <br /> <br />
          <h4>Select a url button</h4>
          This button is visible when the url data source is selected. A click
          on the button cyclically moves the selection to the next video URL on
          the list. To keep it compact, the URL is not presented, but only a
          short-form name of the video. The item&rsquo;s index is displayed as a
          badge in the upper right corner.
          <br /> <br />
          <h4>Select a file button </h4>
          This button is visible when the file data source is selected. Select
          an image or video file from local storage by clicking on the button.
          <br /> <br />
          <h3>Configuration Panel</h3>
          The panel consists of 3 configuration buttons. The buttons&rsquo;
          effect is immediate, even while a video play. A button click
          cyclically increments the value.
        </p>

        <p>
          {' '}
          <br />
          <h4>scoreTHLD button </h4>
          This button sets the threshold for the detection confidence score. The
          value range is between 0 and 1. Detections with scores below
          thresholds are filtered out. The tradeoff is between False detections
          for lower thresholds, and missed detections for higher thresholds.
          <br /> <br />
          <h4>IouTHLD button </h4>
          This button sets the threshold for Iou, an acronym for Intersection
          Over Union. Iou measures the amount of overlap between adjacent
          bounding boxes. The value range is between 0 and 1. Detections with
          scores below thresholds are filtered out. The lower the IOU threshold
          is, the less overlapping boxes are displayed. The tradeoff is between
          missing detections of close objects for lower thresholds and receiving
          false duplicated detections for higher thresholds.
          <br /> <br />
          <h4>Max Boxes button </h4>
          This button sets the max number of bounding boxes.
          <br /> <br />
          <h3>Video Control panel</h3>
          These buttons are effective for video data only.
          <br />
          <h4>fps and seconds counter </h4>
          A small display of fps and running seconds. Fps may vary according to
          the platform, model type, and data.
          <br /> <br />
          <h4>speed button </h4>
          Selects between 3 video play speeds.
          <br /> <br />
          <h4> play-stop </h4>
          button Toggles between play and stop.
          <br /> <br />
          <h4> pause-replay button </h4>
          Toggles between pause and replay states. The button is effective only
          before the stop button is pressed.
          <br /> <br />
          <h3> Canvas panel </h3>
          This panel is visible only after play. During a video session, a range
          progress bar appears. It permits manual scrolling over the video, as
          long as it the video is not stopped or ended.
          <br /> <br />
          <h2>The algorithmic engine</h2>
          The algorithmic engine is implemented using Tensorflow JS, the Java
          Script variant of Tensorflow.
          <br />
          The algorithm runs solely on the browser. <br />
          Compared to a client-server architecture, the setup is lighter, the
          device is independent, but lacking computation power, performance may
          potentially be inferior. <br />
          The implementation consists of 3 main elements: The JS-implemented
          code, which includes the boxes decoder and the Non-Maximum Suppression
          (NMS) elements, and the Keras-based main model, which was developed in
          Python and converted to a JS-compatible block. This block, loaded with
          trained weights is fetched from a CDN when the model and weights
          buttons are pressed.
          <br />
          <br />
          <br />
          <br />
          Please contact me for feedback!
          <br />
          Ronen Halevy
          <br />
          ronen567@gmail.com
          <br />
          <br />
          <br />
          Errata: Animation is active when in pause{' '}
        </p>

        <p></p>
      </div>
    );
  }
}
export default Readme;
