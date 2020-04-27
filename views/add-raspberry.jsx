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

				{hasErrorMsg && <p className='errorMsg' dangerouslySetInnerHTML={{ __html:errorMsg }}></p>}
				{hasSuccessMsg && <p className='successMsg' dangerouslySetInnerHTML={{ __html:successMsg }}></p>}

				<form action="/profil/add-raspberry" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="label">Label:&nbsp;</label>
					<input type="text" id="label" name="label" required /><br/>
					<label htmlFor="password">Password:&nbsp;</label>
					<input type="password" id="password" name="password" required /><br/>
					<label htmlFor="withdrawal">Current withdrawal (displayed on your Linky):&nbsp;</label>
					<input type="number" min="0" id="withdrawal" name="withdrawal" required /><br/>
					<input type="submit" value="submit" />
				</form>

				<p>... Or with your MAC</p>
				<p><i>Example: A1:B2:C3:E4:D5:F6</i></p>

				<form action="/profil/add-raspberry" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="label">Label:&nbsp;</label>
					<input type="text" id="label" name="label" required /><br/>
					<label htmlFor="password">Password:&nbsp;</label>
					<input type="password" id="password" name="password" required /><br/>
					<label htmlFor="mac">MAC:&nbsp;</label>
					<input type="string" id="mac" name="mac" required /><br/>
					<input type="submit" value="submit" />
				</form>

    			<a href="/profil"><button>Back</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default AddRaspberryPage;
