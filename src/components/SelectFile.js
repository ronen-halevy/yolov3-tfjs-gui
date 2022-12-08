import React from 'react';

const SelectFile = (props) => {
	return (
		<div className={props.jsxVisibility}>
			<div className='row'>
				{/* Hack Explained: filename is changed to '' to let onChange event even for
					same. To avoid "No file chosen" text by input, it is set
					invisible+label */}

				<input
					className=' invisible'
					id='files'
					type='file'
					onChange={props.onChangeFile}
					accept='video/*, image/*'
				/>

				<div className='col-4'></div>
				<label htmlFor='files' className='btn btn-success col-4'>
					Select Image/Video File
				</label>
			</div>
			<div className='row justify-content-center'>
				<b className='col-4'>{props.vidFileName}</b>
			</div>
			<div className='row justify-content-center'>
				<b className='col-4'>{props.imageFileName}</b>
			</div>
		</div>
	);
};
export default SelectFile;
