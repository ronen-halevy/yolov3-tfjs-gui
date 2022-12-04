import * as tf from '@tensorflow/tfjs';

// const {readFileSync, promises: fsPromises} = require('fs');

// function fn1(){};

function arrange_bbox(xy, wh) {
	let grid_size = [xy.shape[1], xy.shape[1]];

	let grid = tf.meshgrid(
		tf.range(0, xy.shape[1], 1),
		tf.range(0, xy.shape[1], 1)
	);
	var axis = -1;
	grid = tf.stack(grid, axis);

	axis = 2;
	grid = grid.expandDims(axis);

	xy = xy.add(tf.cast(grid, 'float32'));
	xy = xy.div(tf.cast(grid_size, 'float32'));

	let value1 = tf.scalar(2);
	wh = wh.div(value1);
	var xy_min = xy.sub(wh);
	var xy_max = xy.add(wh);

	var bbox = tf.concat([xy_min, xy_max], -1);
	return bbox;
}

function getAnchors(anchors_file) {
	const nanchors_per_scale = 3;
	const anchor_entry_size = 2;
}

function yoloDecode(grids_outputs, nclasses) {
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

	let bboxes = [];
	let confidences = [];
	let classProbs = [];
	for (let idx = 0; idx < grids_outputs.length; idx++) {
		let axis = -1;
		let [xy, wh, obj, class_prob] = tf.split(
			grids_outputs[idx],
			[2, 2, 1, nclasses],
			axis
		);
		let anchors = tf.slice(anchors_table, [idx], 1);
		const bboxes_in_grid = arrange_bbox(tf.sigmoid(xy), wh.exp().mul(anchors));

		bboxes.push(
			tf.reshape(bboxes_in_grid, [
				bboxes_in_grid.shape[0],
				-1,
				bboxes_in_grid.shape[4],
			])
		);

		confidences.push(
			tf.reshape(tf.sigmoid(obj), [obj.shape[0], -1, obj.shape[4]])
		);
		classProbs.push(
			tf.reshape(tf.sigmoid(class_prob), [
				class_prob.shape[0],
				-1,
				class_prob.shape[4],
			])
		);
	}

	let axis = 1;
	bboxes = tf.concat(bboxes, axis);
	confidences = tf.concat(confidences, axis);
	classProbs = tf.concat(classProbs, axis);

	axis = 0;
	bboxes = bboxes.squeeze(axis);
	classProbs = classProbs.squeeze(axis);
	confidences = confidences.squeeze(axis);

	return [bboxes, confidences, classProbs];
}
export default yoloDecode;