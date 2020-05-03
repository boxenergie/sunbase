import React from 'react';

function Header(props) {
	return (
		<head>
			<meta charSet="utf-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      		<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/fontawesome.min.css" rel="stylesheet" />
			<link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet" />
			<link href="/css/main.css" rel="stylesheet" />
			<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js" defer></script>
			<script src="/js/sidenav.js" defer></script>
			<title>{props.title}</title>
			{props.children}
		</head>
	);
}
 
export default Header;
