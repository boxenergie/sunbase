import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function LoginPage(props) {
	const { errorMsg, csrfToken } = props;
	
	const hasErrorMsg = Boolean(errorMsg.length > 0);
	
	return (
		<html>
			<Header title='SunShare' /> 
			<body>
				<h1>Login</h1>

				{hasErrorMsg && <p className='errorMsg'>{errorMsg}</p>}

				<form action="/login" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="username">Username:&nbsp;</label>
					<input type="text" id="username" name="username" /><br/>
					<label htmlFor="password">Password:&nbsp;</label>
					<input type="password" name="password" id="password" />
					<input type="submit" value="submit" />
				</form>
				<Footer />
			</body>
		</html>
	);
}

export default LoginPage;
