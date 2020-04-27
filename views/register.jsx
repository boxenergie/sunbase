import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function RegisterPage(props) {
	const { errorMsg, csrfToken } = props;

	const hasErrorMsg = Boolean(errorMsg.length > 0);

	return (
		<html>
			<Header title='SunShare' /> 
			<body>
				<h1>Register</h1>

				{hasErrorMsg && <p className='errorMsg' dangerouslySetInnerHTML={{ __html:errorMsg }}></p>}

				<form action="/register" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="username">Username:&nbsp;</label>
					<input type="text" id="username" name="username" required /><br/>
					<label htmlFor="password">Password:&nbsp;</label>
					<input type="password" name="password" id="password" required />
					<input type="submit" value="submit" />
				</form>
				
				<a href="/login"><button>Or Login</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default RegisterPage;
