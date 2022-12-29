import React from 'react';
export default class Readme extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='accordion-body'>
        <h2>Welcome to the Yolo Tfjs Demo!</h2>
        <br /> <br />
        <h3>A brief description</h3> <br />
        The app demonstrates an original implementation of the YoloV3 object
        detection algorithm, based on the paper by Joseph Redmon, and Ali
        Farhadi. Yolov3 is the 3rd version of the algorithm. <br />
        Yolo is a CNN-based deep learning algorithm, which classifies images'
        objects and bounds them with boxes. The app renders predicted bounding
        boxes orround the detected objects, annotated with predicted
        objects&rsquo;s names and prediction&rsquo;s confidence scores. <br />{' '}
        <br />
        <h3>A brief user's guide</h3> The app is set with default
        configurations, so you are ready to press play and run the default video
        selection!
        <br />
        Then, you may either load images or video files from local storage or
        select a video from a list - the selected video will be fetched by its
        URL.
        <br /> <br />
        <h3>The UI </h3>
        The UI is implemented by ReactJS. It consists of 3 sections: an
        accordion buttons section, a mini-buttons panels section, and the
        rendering canvas, placed on the bottom. <br /> <br />
        <h4>Mini-buttons panel</h4>
        The interface consists of 4 mini-button panels, described next.
        <br /> <br />
        <h4>Model Selection panel</h4>
        <br />
        <h5>Model button</h5>
        Currently, the selection is between YoloV3 and its lightweight version,
        YoloV3-Tiny. The first performs better in terms of detection accuracy
        but consumes more computing resources. The full Yolov3 may be too heavy
        for some devices. Actually, YoloV3-Tiny may also be too heavy for some
        devices, or may not be able to run at all. <br /> <br />
        <h5>Weights button</h5>
        The model should be loaded with pre-trained weights. Currently, the
        selection is between the Coco weights, produced by training with the 80
        types of objects Coco dataset, and the Shapes weights, produced by
        training the Shapes synthetically generated dataset. The latter is a
        dataset targeted for lab and demo purposes. (v0.1 Shapes weights for
        YoloV3 are only briefly trained, leading to poor accuracy, and weights
        for Tiny are not yet added. The coco weights are loaded from the darknet
        website, converted to Keras format - and then to JS format.
        <br />
        <br />
        <h5>Load button</h5>
        The selected model and weights are loaded only after pressing this
        button.
        <br />
        <br />
        <h4>Data Source Selection panel</h4>
        <br /> <br />
        <h5>Data source button</h5>
        This button selects the source of consumed data, i.e. the input image or
        video files. Selection is between uploading from local storage, or
        fetching, (currently videos only), from video sites.
        <br /> <br />
        <h5>Url button</h5>
        This button is visible when the url data source is selected. A click on
        the button cyclically moves the selection to the next video URL on the
        list. To keep it compact, the URL is not presented, but only a
        short-form name of the video. The item&rsquo;s index is displayed as a
        badge in the upper right corner.
        <br /> <br />
        <h5>File button </h5>
        This button is visible when the file data source is selected. Select an
        image or video file from local storage by clicking on the button.
        <br /> <br />
        <h4>Configuration Panel</h4>
        The panel consists of 3 configuration buttons. The buttons&rsquo; effect
        is immediate, even while a video play. A button click cyclically
        increments the value.
        <br /> <br />
        <h5>ScoreTHLD button </h5>
        This button sets the threshold for the detection confidence score. The
        value range is between 0 and 1. Detections with scores below thresholds
        are filtered out. The tradeoff is between False detections for lower
        thresholds, and missed detections for higher thresholds.
        <br /> <br />
        <h5>IouTHLD button </h5>
        This button sets the threshold for Iou, an acronym for Intersection Over
        Union. Iou measures the amount of overlap between adjacent bounding
        boxes. The value range is between 0 and 1. Detections with scores below
        thresholds are filtered out. The lower the IOU threshold is, the less
        overlapping boxes are displayed. The tradeoff is between missing
        detections of close objects for lower thresholds and receiving false
        duplicated detections for higher thresholds.
        <br /> <br />
        <h5>Max Boxes button </h5>
        This button sets the max number of bounding boxes.
        <br /> <br />
        <h4>Video Control panel</h4>
        <h5> Play-stop </h5>
        button Toggles between play and stop. Play trigger both image and video.
        process. <br />
        The rest of panel's buttons are effective for video data only.
        <br />
        <br />
        <br /> <br />
        <h5>Speed button </h5>
        Selects between 3 video play speeds.
        <br /> <br />
        <h5>Fps and seconds counter </h5>
        A small display of fps and running seconds. Fps may vary according to
        the platform, model type, and data.
        <br /> <br />
        <h5>Range Progress Bar </h5>
        Permits manual skips through.
        <br /> <br />
        <h5>Speed button </h5>
        Selects between 3 video play speeds.
        <br /> <br />
        <h4> Canvas panel </h4>
        This Canvas is visible only after play. Both images and videos are
        rendered on it.
        <br /> <br />
        <h3>The algorithmic engine</h3>
        The algorithmic engine is implemented using Tensorflow JS, the Java
        Script variant of Tensorflow.
        <br />
        The algorithm runs solely on the browser. <br />
        Compared to a client-server architecture, the setup is lighter, the
        device is independent, but lacking computation power, performance may
        potentially be inferior. <br />
        The implementation consists of 3 main elements: The JS-implemented code,
        which includes the boxes decoder and the Non-Maximum Suppression (NMS)
        elements, and the Keras-based main model, which was developed in Python
        and converted to a JS-compatible block. This block, loaded with trained
        weights is fetched from a CDN when the model and weights buttons are
        pressed.
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
        Errata:
        <br />
        <ol>
          <li>Animation is active when in pause </li>
          <li> resume persists after stop</li>
          <li> update model and weights</li>
        </ol>
      </div>
    );
  }
}
