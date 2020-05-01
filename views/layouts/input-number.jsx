import React from 'react';
import InputField from './input-field';

function InputNumber(props) {
	const {
		name,
		id = name,
		icon,
		size = 's12',
		label,
		required,
		placeholder,
		tooltip,
		'tooltip-position': tooltipPosition = 'bottom',
		min,
		max,
	} = props;

	return (
		<InputField
			name={name}
			icon={icon}
			size={size}
			label={label}
			tooltip={tooltip}
			tooltip-position={tooltipPosition}
		>
			<input
				type='number'
				id={id}
				name={name}
				min={min}
				max={max}
				placeholder={placeholder}
				className="validate"
				required={required ? true : false}
			/>
		</InputField>
	);
}

export default InputNumber;
