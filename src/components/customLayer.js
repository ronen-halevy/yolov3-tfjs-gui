/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';

/**
 * This custom layer is similar to the 'relu' non-linear Activation `Layer`, but
 * it keeps both the negative and positive signal.  The input is centered at the
 * mean value, and then the negative activations and positive activations are
 * separated into different channels, meaning that there are twice as many
 * output channels as input channels.
 *
 * Implementing a custom `Layer` in general involves specifying a `call`
 * function, and possibly also a `computeOutputShape` and `build` function. This
 * layer does not need a custom `build` function because it does not store any
 * variables.
 *
 * Custom layers currently can not be saved / loaded.  Tracking issue at
 * https://github.com/tensorflow/tfjs/issues/254
 */
class YoloDec extends tf.layers.Layer {
	constructor() {
		super({});
		// TODO(bileschi): Can we point to documentation on masking here?
		this.supportsMasking = true;
	}

	/**
	 * This layer only works on 4D Tensors [batch, height, width, channels],
	 * and produces output with twice as many channels.
	 *
	 * layer.computeOutputShapes must be overridden in the case that the output
	 * shape is not the same as the input shape.
	 * @param {*} inputShapes
	 */
	computeOutputShape(inputShape) {
		return [inputShape[0], inputShape[1], inputShape[2], 2 * inputShape[3]];
	}

	arrange_bbox(xy, wh) {
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

	getAnchors(anchors_file) {
		const nanchors_per_scale = 3;
		const anchor_entry_size = 2;
	}

	call(grids_outputs, nclasses) {
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
			const bboxes_in_grid = this.arrange_bbox(
				tf.sigmoid(xy),
				wh.exp().mul(anchors)
			);

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
	// 	/**
	// 	 * Centers the input and applies the following function to every element of
	// 	 * the input.
	// 	 *
	// 	 *     x => [max(x, 0), max(-x, 0)]
	// 	 *
	// 	 * The theory being that there may be signal in the both negative and positive
	// 	 * portions of the input.  Note that this will double the number of channels.
	// 	 * @param inputs Tensor to be treated.
	// 	 * @param kwargs Only used as a pass through to call hooks.  Unused in this
	// 	 *   example code.
	// 	 */
	// 	call(inputs, kwargs) {
	// 		let input = inputs;
	// 		if (Array.isArray(input)) {
	// 			input = input[0];
	// 		}
	// 		this.invokeCallHook(inputs, kwargs);
	// 		const origShape = input.shape;
	// 		const flatShape = [
	// 			origShape[0],
	// 			origShape[1] * origShape[2] * origShape[3],
	// 		];
	// 		const flattened = input.reshape(flatShape);
	// 		const centered = tf.sub(flattened, flattened.mean(1).expandDims(1));
	// 		const pos = centered.relu().reshape(origShape);
	// 		const neg = centered.neg().relu().reshape(origShape);
	// 		return tf.concat([pos, neg], 3);
	// 	}

	// 	/**
	// 	 * If a custom layer class is to support serialization, it must implement
	// 	 * the `className` static getter.
	// 	 */
	static get className() {
		return 'Antirectifier';
	}
}
// tf.serialization.registerClass(Antirectifier); // Needed for serialization.

export function yoloDec() {
	return new YoloDec();
}
