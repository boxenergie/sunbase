import React from 'react';

function Header(props) {
	return (
		<head>
			<meta charSet='utf-8' />
			<meta httpEquiv='X-UA-Compatible' content='IE=edge' />
			<meta name='viewport' content='width=device-width, initial-scale=1' />
			<title>{props.title}</title>
			{props.children}
		</head>
	);
}
 
export default Header;
