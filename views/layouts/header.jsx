import React from 'react';

function Header(props) {
	return (
		<head>
			<meta charSet='utf-8' />
			<meta httpEquiv='X-UA-Compatible' content='IE=edge' />
			<title>{props.title}</title>
			<meta name='viewport' content='width=device-width, initial-scale=1' />
			<link rel='stylesheet' type='text/css' media='screen' href='css/main.css' />
			{props.children}
		</head>
	);
}
 
export default Header;
