import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';
import PCSChart from './layouts/pcs-chart';

function OtherDataPage(props) {
	const { user, userData } = props;

	const userExists 	= Boolean(user);
	const hasUserData 	= Boolean(userData.length > 0);

	let personalRecords = "";
	if (hasUserData)
		personalRecords =
			userData.map(r => {
				if (r.values.production.length > 0)
					return <PCSChart key={r.name} id={`${r.name}-chart`} title={r.name} data={r.values} />;
				else
					return (
						<div key={r.name}>
							<h5><i>{r.name}</i></h5>
							<p>No records for the last 24h</p>
						</div>
					);
			});

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
						{hasUserData && <div>{personalRecords}</div>}
						{!hasUserData && <p>No personal records</p>}
					</div>
				}

				<a href="/"><button>Home</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default OtherDataPage;
