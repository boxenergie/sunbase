import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';

function Error500(props) {
	const { user } = props;

	const isConnected     = Boolean(user);
	const isAdmin         = Boolean(user && user.role === 'admin');
	
	return (
		<html>
			<Header title="SunShare" />
			<body>
				<Nav isConnected={isConnected} isAdmin={isAdmin} />

				<main>
					<p className="center-align">Oops, something went wrong !</p>
				</main>
				
				<Footer />
			</body>
		</html>
	);
}

export default Error500;
