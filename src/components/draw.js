/**
 * Contains methods to draw bounding boxes and text annotations on an image's (same as a single frame) detection.
 */ class Draw {
	constructor(canvas) {
		this.canvas = canvas;
	}
	/**
	 * @summary Draws a bounding box and text annotations for a detection
	 * @param {contextType} context - THe canvas context to draw on.
	 * @param {Array<float>} bbox - A normalized to [0,1] bbox: [xmin, ymon, xmax, ymax].
	 * @param {float} score - Detections's  score value, val range [0,1].
	 * @param {float} classId - Class's index.
	 * @param {float} imageWidth - Input image's original width.
	 * @param {float} imageHeight - Input image's original height.
	 */

	drawBbox(context, bbox, score, classId, imageWidth, imageHeight) {
		const font = '16px sans-serif';
		context.beginPath();
		context.rect(
			bbox[0] * imageWidth,
			bbox[1] * imageHeight,
			(bbox[2] - bbox[0]) * imageWidth,
			(bbox[3] - bbox[1]) * imageHeight
		);
		context.fillStyle = 'yellow';
		context.lineWidth = 7;
		context.strokeStyle = 'yellow';
		context.stroke();
		// label background.
		context.fillStyle = 'white';
		const textWidth = context.measureText(
			classId + ' ' + (100 * score).toFixed(2) + '%'
		).width;

		const textHeight = parseInt(font, 10); // base 10
		context.fillRect(
			bbox[0] * imageWidth,
			bbox[1] * imageWidth - textHeight / 2,
			textWidth,
			textHeight
		);
		context.fillStyle = '#000000';
		context.fillText(
			classId + ' ' + (100 * score).toFixed(2) + '%',
			bbox[0] * imageWidth,
			bbox[1] * imageWidth
		);
	}

	/**
	 * @summary Draws a bounding box and text annotations for an array of detections
	 * @param {img} image - An element to draw into the context. The specification permits any canvas image source,.
	 * @param {Array<Array<float>>} bboxes - An array with a bbox array per a detection. A bbox is 4 element array which holds normalized to [0,1] bbox: [xmin, ymon, xmax, ymax].
	 * @param {Array<float>} scores - An array with a score value per a detectiono.
	 * @param {Array<float>} classIndices - An array with a class index per a detectiono.
	 */

	async drawOnImage(image, bboxes, scores, classIndices) {
		const context = this.canvas.getContext('2d');

		const imageWidth = image.width;
		const imageHeight = image.height;

		this.canvas.width = imageWidth;
		this.canvas.height = imageHeight;

		context.drawImage(image, 0, 0, imageWidth, imageHeight);

		bboxes.forEach((box, idx) =>
			this.drawBbox(
				context,
				box,
				scores[idx],
				classIndices[idx],
				imageWidth,
				imageHeight
			)
		);
	}
}

export default Draw;
