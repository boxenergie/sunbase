import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function AddRaspberryPage(props) {
	const { errorMsg, successMsg, csrfToken } = props;

	const hasErrorMsg 	= Boolean(errorMsg.length > 0);
	const hasSuccessMsg = Boolean(successMsg.length > 0);

	return (
<html>
			<Header title='SunShare' />
			<body>
				<h1>Add Raspberry</h1>

				{hasErrorMsg && <p className='errorMsg'>{errorMsg}</p>}
				{hasSuccessMsg && <p className='successMsg'>{successMsg}</p>}

				<form action="/profil/add-raspberry" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="label">Label:&nbsp;</label>
					<input type="text" id="label" name="label" /><br/>
					<label htmlFor="password">Password:&nbsp;</label>
					<input type="password" id="password" name="password" /><br/>
					<label htmlFor="production">Current production:&nbsp;</label>
					<input type="number" min="0" id="production" name="production" /><br/>
					<input type="submit" value="submit" />
				</form>

				<p>... Or with your UUID</p>

				<form action="/profil/add-raspberry" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="label">Label:&nbsp;</label>
					<input type="text" id="label" name="label" /><br/>
					<label htmlFor="password">Password:&nbsp;</label>
					<input type="password" id="password" name="password" /><br/>
					<label htmlFor="uuid">UUID:&nbsp;</label>
					<input type="string" id="uuid" name="uuid" /><br/>
					<input type="submit" value="submit" />
				</form>

    			<a href="/profil"><button>Back</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default AddRaspberryPage;
