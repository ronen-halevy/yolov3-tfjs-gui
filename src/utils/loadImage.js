export const loadImage = async (dataUrl, callback) => {
	var imageObject = new window.Image();
	const res = await fetch(dataUrl);
	const imageBlob = await res.blob();
	const imageObjectURL = URL.createObjectURL(imageBlob);
	imageObject.src = imageObjectURL;
	imageObject.addEventListener('load', async () => {
		callback(imageObject, 0, 0);
	});
};
