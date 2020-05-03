import React from 'react';

function InputButton(props) {
	const {
		type,
		color = 'red',
		size = 's12',
		label,
	} = props;

	return (
		<div className={`input-field col ${size}`}>
			<button className={`btn waves-effect waves-light ${color}`} type={type} name="action">{label}</button>
		</div>										
	);
}

export default InputButton;
