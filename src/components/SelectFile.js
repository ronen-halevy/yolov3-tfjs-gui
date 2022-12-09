import React from 'react';

const SelectFile = (props) => {
	return (
		<div className={props.jsxVisibility}>
			<form>
				<div className='mb-3'>
					<label htmlFor='files' className=' col-4'>
						Video or Image File
					</label>
					<input
						className=' inviisible'
						id='files'
						type='file'
						onChange={props.onChangeFile}
						accept='video/*, image/*'
					/>
				</div>
			</form>

			<div className='row'>
				<label className=' text-center h5'>
					Set NMS Threshold:
					<input
						type='number'
						min='0'
						max='1'
						// value={threshRange}
						// onChange={handleChangeInpuThresh}
					/>
				</label>
			</div>

			<button
				variant='primary'
				// type='submit'
				className='btn btn-primary'
				onClick={props.onClickRun}
			>
				Submit
			</button>
			<div></div>
		</div>
	);
};
export default SelectFile;
