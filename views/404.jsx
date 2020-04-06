import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function Error404(props) {
	return (
		<html>
			<Header title='SunShare' />
			<body>
				Oops, this page doesn't exist !
				<Footer />
			</body>
		</html>
		);
}

export default Error404;
