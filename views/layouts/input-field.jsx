import React from 'react';

function InputField(props) {
	const {
		name,
		icon,
		size = 's12',
		label,
		tooltip,
		'tooltip-position': tooltipPosition = 'bottom',
	} = props;

	const labelHTML = label
		? <label
			className={tooltip ? 'tooltipped' : ''}
			data-position={tooltipPosition}
			data-html data-tooltip={tooltip}
			htmlFor={name}>{label} {tooltip ? '(?)' : ''}
		  </label>
		: '';

	return (
		<div className={`input-field col ${size}`}>
			{icon && <i className="material-icons prefix">{icon}</i>}
			{props.children}
			{label && labelHTML}
		</div>
	);
}

export default InputField;
