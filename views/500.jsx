import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function Error500(props) {
	return (
		<html>
			<Header title='SunShare' />
			<body>
				Oops, something went wrong !
				<Footer />
			</body>
		</html>
		);
}

export default Error500;
