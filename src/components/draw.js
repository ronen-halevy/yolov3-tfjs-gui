class Draw {
  constructor(canvas) {
    this.canvas = canvas;
  }
  drawBbox(context, bbox, score, classId, imageWidth, imageHeight) {
    const font = "16px sans-serif";
    context.beginPath();
    context.rect(
      bbox[0] * imageWidth,
      bbox[1] * imageHeight,
      (bbox[2] - bbox[0]) * imageWidth,
      (bbox[3] - bbox[1]) * imageHeight
    );
    context.fillStyle = "yellow";
    context.lineWidth = 7;
    context.strokeStyle = "yellow";
    context.stroke();
    // label background.
    context.fillStyle = "white";
    const textWidth = context.measureText(
      classId + " " + (100 * score).toFixed(2) + "%"
    ).width;

    const textHeight = parseInt(font, 10); // base 10
    context.fillRect(
      bbox[0] * imageWidth,
      bbox[1] * imageWidth - textHeight / 2,
      textWidth,
      textHeight
    );
    context.fillStyle = "#000000";
    context.fillText(
      classId + " " + (100 * score).toFixed(2) + "%",
      bbox[0] * imageWidth,
      bbox[1] * imageWidth
    );
  }
  async drawOnImage(image, bboxes, scores, classIndices) {
    const context = this.canvas.getContext("2d");
    console.log("drawOnImage");

    const imageWidth = image.width;
    const imageHeight = image.height;

    this.canvas.width = imageWidth;
    this.canvas.height = imageHeight;

    context.drawImage(image, 0, 0, imageWidth, imageHeight);

    const bboxesArray = await bboxes.array();
    const scoresArray = await scores.array();
    const classIndicesArray = await classIndices.array();

    bboxesArray.forEach((box, idx) =>
      this.drawBbox(
        context,
        box,
        scoresArray[idx],
        classIndicesArray[idx],
        imageWidth,
        imageHeight
      )
    );
  }
}

export default Draw;
