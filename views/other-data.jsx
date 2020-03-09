import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';
import PCSChart from './layouts/pcs-chart';

function OtherDataPage(props) {
	const { user, userData } = props;

	const userExists 	= Boolean(user);
	const hasUserData 	= Boolean(userData.production.length > 0);

	return (
		<html>
			<Header title='SunShare'>
				<script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.js'></script>
				<script src='/js/PCS-chart.js'></script>
			</Header>
			<body>
				<h1>SunShare Board</h1>

				{userExists && 
					<div>
						<h4><i>{user.username}</i>'s records</h4>

						{hasUserData && <PCSChart id='personalChart' data={userData} />}
						{!hasUserData && <p>No records for {user.username}</p>}
					</div>
				}

				<a href="/"><button>Home</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default OtherDataPage;
