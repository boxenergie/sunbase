import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';
import PCSChart from './layouts/pcs-chart';
import Nav from './layouts/nav';

function OtherDataPage(props) {
	const { user, otherUser, otherUserData } = props;

	const userExists 	= Boolean(otherUser);
	const hasUserData 	= Boolean(otherUserData.production.length > 0);
	const isAdmin		= Boolean(user && user.role === 'admin');

	return (
		<html>
			<Header title='SunShare'>
				<script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.js'></script>
				<script src='/js/PCS-chart.js'></script>
			</Header>
			<body>
				<Nav isConnected={true} isAdmin={isAdmin} />
				<h1>Visualisation des données</h1>

				<main>
					<div className="row">
						<div className="col s12">
							{userExists && 
								<div>
									<h4><i>Données de {otherUser.username}</i></h4>

									{hasUserData && <PCSChart id={`${otherUser.username}-Chart`} data={otherUserData} />}
									{!hasUserData && <p>Aucune donnée enregistrée !</p>}
								</div>
							}
						</div>
					</div>
				</main>

				<Footer />
			</body>
		</html>
	);
}

export default OtherDataPage;
