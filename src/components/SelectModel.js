import React from 'react';

const SelectModel = (props) => {
	return (
		<div className='row'>
			<div className='col-4'></div>

			<button
				className='btn btn-primary dropdown-toggle col-4 gap-30 btn-lg'
				type='button'
				data-bs-toggle='dropdown'
				aria-expanded='false'
			>
				{props.selectedModel}
			</button>
			<div>
				<ul className='dropdown-menu'>
					<li>
						<button
							className='dropdown-item col-4'
							type='button'
							id='YoloV3 Lite with Coco Weights'
							onClick={props.onChangeCocoLite}
						>
							YoloV3-Lite with Coco Weights
						</button>
					</li>
					<li>
						<button
							className='dropdown-item col-4'
							type='button'
							id='YoloV3 Lite with Shapes Weights'
							onClick={props.onChangeShapesite}
						>
							YoloV3-Lite-with-Shapes-Weights
						</button>
					</li>
					<li>
						<button
							className='dropdown-item'
							type='button'
							id='YoloV3 with Shapes Weights'
							onClick={props.onChangeCoco}
						>
							YoloV3-with-Coco-Weights
						</button>
					</li>
					<li>
						<button
							className='dropdown-item'
							type='button'
							id='YoloV3 with Shapes Weights'
							onClick={props.onChangeShapes}
						>
							YoloV3-with-Shapes-Weights
						</button>
					</li>
				</ul>
			</div>
		</div>
	);
};
export default SelectModel;
