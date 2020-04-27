import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function DeleteRaspberryPage(props) {
	const { errorMsg, successMsg, csrfToken, raspberries } = props;

	const hasErrorMsg 	= Boolean(errorMsg.length > 0);
	const hasSuccessMsg = Boolean(successMsg.length > 0);
	const hasRaspberry	= Boolean(raspberries.length > 0);

	const raspberryList = [];
	for (const r of raspberries) {
		raspberryList.push(
			<li key={r.id}>
				<label htmlFor={`delete-${r.id}`}>{r.raspberry.label}</label>
				<a href={`?deleted=${r.id}`}>
					<button id={`delete-${r.id}`}>Unlink</button>
				</a>
			</li>
		);
	};

	return (
		<html>
			<Header title='SunShare' />
			<body>
				<h1>Delete Raspberry</h1>

				{hasErrorMsg && <p className='errorMsg' dangerouslySetInnerHTML={{ __html:errorMsg }}></p>}
				{hasSuccessMsg && <p className='successMsg' dangerouslySetInnerHTML={{ __html:successMsg }}></p>}
				
				{!hasRaspberry && <p>You don't have any linked raspberry yet !</p>}
				{hasRaspberry && <ul>{raspberryList}</ul>}

    			<a href="/profil"><button>Back</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default DeleteRaspberryPage;
