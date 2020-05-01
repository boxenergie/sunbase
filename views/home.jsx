import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';
import PCSChart from './layouts/pcs-chart';

function HomePage(props) {
	const { user, globalData, communitiesData, userData } = props;

	const isConnected 	= Boolean(user);
	const isInCommunities = Boolean(communitiesData.length > 0);
	const isAdmin 		= Boolean(user && user.role === 'admin');
	const hasGlobalData = Boolean(globalData.production.length > 0);
	const hasUserData 	= Boolean(userData.production.length > 0);

	const communitiesHTML = communitiesData.map((community) => {
		const hasCommunityData = community.data.production.length > 0;
		return (
			<article key={community.name}>
				<h5>{community.name}</h5>
				{hasCommunityData && <PCSChart id={`community-${community.name.replace(' ', '_')}-chart`} data={community.data}/>}
				{!hasCommunityData && <p>Aucune donnée enregistrée !</p>}
			</article>
		);
	});

	const classCommunitiesTab 	= isInCommunities ? 'tab col s4' : 'tab col s4 disabled';
	const classMyTab			= isConnected ? 'tab col s4' : 'tab col s4 disabled';

	return (
		<html>
			<Header title="SunShare">
				<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.js"></script>
				<script src="/js/PCS-chart.js"></script>
				<script src="/js/tabs.js" defer></script>
			</Header>
			<body>
				<Nav isConnected={isConnected} isAdmin={isAdmin} />

				<main>
					<div className="row">
						<div className="col s12">
							<h1>Tableau de bord <i>Sun</i>Share</h1>
							{isConnected && <h4>Bonjour, <i>{user.username}</i></h4>}

							<ul className="tabs">
								<li className="tab col s4"><a className="active" href="#global">Données globales</a></li>
								<li className={classCommunitiesTab}><a href="#communities">Données communautaires</a></li>
								<li className={classMyTab}><a href="#my">Données personnelles</a></li>
							</ul>
						</div>
						<div id="global" className="col s12">
							{hasGlobalData && <PCSChart id="global-chart" data={globalData} />}
							{!hasGlobalData && <p>Aucune donnée enregistrée !</p>}
						</div>
						<div id="communities" className="col s12">
							{isInCommunities && <h4>Communities records</h4>}
							{communitiesHTML}
						</div>
						<div id="my" className="col s12">
							{isConnected && hasUserData && <PCSChart id="my-chart" data={userData} />}
							{isConnected && !hasUserData && <p>Aucune donnée enregistrée !</p>}
						</div>
					</div>
				</main>
				
				<Footer />
			</body>
		</html>
	);
}

export default HomePage;
