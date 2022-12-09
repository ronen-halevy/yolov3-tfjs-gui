import React from 'react';

const SelectModel = (props) => {
	return (
		<div className='row'>
			<div className='col-4'></div>
			<select
				className='form-select form-select-lg mb-3'
				aria-label='.form-select-lg example'
				onChange={props.onChangeModel}
			>
				<option value={props.tinyCocoVal} id='111'>
					YoloV3-Lite with Coco Weights
				</option>
				<option value={props.tinyShapesVal} id='111'>
					YoloV3-Lite-with-Shapes-Weights
				</option>
				<option value={props.cocoVal} id='111'>
					YoloV3-with-Coco-Weights
				</option>
				<option value={props.shapesVal} id='111'>
					YoloV3-with-Shapes-Weights
				</option>
			</select>
		</div>
	);
};
export default SelectModel;
