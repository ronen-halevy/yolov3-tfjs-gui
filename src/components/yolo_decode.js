import * as tf from "@tensorflow/tfjs";

// const {readFileSync, promises: fsPromises} = require('fs');

// function fn1(){};

async function arrange_bbox(xy, wh) {
  let grid_size = [xy.shape[1], xy.shape[1]];

  let grid = tf.meshgrid(
    tf.range(0, xy.shape[1], 1),
    tf.range(0, xy.shape[1], 1)
  );
  var axis = -1;
  grid = tf.stack(grid, axis);

  axis = 2;
  grid = grid.expandDims(axis);

  xy = xy.add(tf.cast(grid, "float32"));
  xy = xy.div(tf.cast(grid_size, "float32"));

  let value1 = tf.scalar(2);
  wh = wh.div(value1);
  var xy_min = xy.sub(wh);
  var xy_max = xy.add(wh);

  var bbox = tf.concat([xy_min, xy_max], -1);
  return bbox;
}

function get_anchors(anchors_file) {
  const nanchors_per_scale = 3;
  const anchor_entry_size = 2;
  //   // anchors_table = loadtxt(anchors_file, (dtype = np.float), (delimiter = ","));

  //   fetch(anchors_file)
  //     .then((r) => r.text())
  //     .then((text) => {
  //       console.log("text anchors_table:", text);
  //     });

  // anchors_table = anchors_table.reshape(
  //   -1,
  //   nanchors_per_scale,
  //   anchor_entry_size
  // );
  // return anchors_table;
}

async function yolo_decode(grids_outputs, nclasses) {
  const anchors = [
    0.16827, 0.16827, 0.16827, 0.16827, 0.16827, 0.16827, 0.16827, 0.16827,
    0.16827, 0.16827, 0.16827, 0.16827,
  ];

  const nanchors_per_scale = 3;
  const anchor_entry_size = 2;
  let anchors_table = tf.reshape(anchors, [
    -1,
    nanchors_per_scale,
    anchor_entry_size,
  ]);
  let pred_xy = [];
  let pred_wh = [];
  let pred_obj = [];
  let class_probs = [];

  let grids_bboxes = [];
  let grids_confidence = [];
  let grids_class_probs = [];
  for (let idx = 0; idx < grids_outputs.length; idx++) {
    let axis = -1;
    let [xy, wh, obj, class_prob] = tf.split(
      grids_outputs[idx],
      [2, 2, 1, nclasses],
      axis
    );
    var whh = wh.exp();
    const indices = tf.tensor1d([0], "int32");
    let anchors = tf.slice(anchors_table, [idx], 1);
    var wha = whh.mul(anchors); //.print();

    const bboxes_in_grid = await arrange_bbox(
      tf.sigmoid(xy),
      wh.exp().mul(anchors)
    );

    grids_bboxes.push(
      tf.reshape(bboxes_in_grid, [
        bboxes_in_grid.shape[0],
        -1,
        bboxes_in_grid.shape[4],
      ])
    );

    grids_confidence.push(
      tf.reshape(tf.sigmoid(obj), [obj.shape[0], -1, obj.shape[4]])
    );
    grids_class_probs.push(
      tf.reshape(tf.sigmoid(class_prob), [
        class_prob.shape[0],
        -1,
        class_prob.shape[4],
      ])
    );
  }

  let axis = 1;

  grids_bboxes = tf.concat(grids_bboxes, axis);
  grids_confidence = tf.concat(grids_confidence, axis);

  grids_class_probs = tf.concat(grids_class_probs, axis);

  return [grids_bboxes, grids_confidence, grids_class_probs];
}
export default yolo_decode;
