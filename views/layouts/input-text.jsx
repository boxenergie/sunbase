import React from 'react';
import InputField from './input-field';

function InputText(props) {
	const {
		password,
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
		pattern,
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
				type={password ? 'password' : 'text'}
				id={id}
				name={name}
				min-length={min}
				max-length={max}
				pattern={pattern}
				placeholder={placeholder}
				className="validate"
				required={required ? true : false}
			/>
		</InputField>
	)

}

export default InputText;
