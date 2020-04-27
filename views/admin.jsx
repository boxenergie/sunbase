import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

function AdminPage(props) {
	const { errorMsg, successMsg, users, nPages } = props;

	const hasErrorMsg 				= Boolean(errorMsg.length > 0);
	const hasSuccessMsg 			= Boolean(successMsg.length > 0);
	const nPagesAsListFromZeroToN 	= [...Array(nPages).keys()]
		.map(i => 
			<a key={i} href={`?page=${i + 1}&displayLimit=10`}>
				<button>{i +1}</button>
			</a>
		);

	const usersList = [];
	for (const u of users) {
		usersList.push(
			<li key={u.id}>
				<label htmlFor={`delete-${u.id}`}>{u.username}</label>
				<a href={`?deleted=${u.id}`}>
					<button id={`delete-${u.id}`}>Delete User</button>
				</a>
			</li>
		);
	};

	return (
		<html>
			<Header title='SunShare' />
			<body>
				<h1>Admin Board</h1>

				{hasErrorMsg && <p className='errorMsg' dangerouslySetInnerHTML={{ __html:errorMsg }}></p>}
				{hasSuccessMsg && <p className='successMsg' dangerouslySetInnerHTML={{ __html:successMsg }}></p>}

				<ul>
					{usersList}
				</ul>

				<div>
					{nPagesAsListFromZeroToN}
				</div>

    			<a href="/"><button>Home</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default AdminPage;
