import React from 'react';
import Header from './layouts/header';
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
				{!hasCommunityData && <p>No community records</p>}
			</article>
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

				{isConnected && <h3>Hello <i>{user.username}</i></h3>}
				
				<h4>Global records</h4>
				{hasGlobalData && <PCSChart id='global-chart' data={globalData} />}
				{!hasGlobalData && <p>No global records</p>}

				{isInCommunities && <h4>Communities records</h4>}
				{communitiesHTML}

				{isConnected && <h4>Personal records</h4>}
				{isConnected && hasUserData && <PCSChart id='my-chart' data={userData} />}
				{isConnected && !hasUserData && <p>No personal records</p>}

				{!isConnected && <a href="/login"><button>Login</button></a>}
				{!isConnected && <a href="/register"><button>Register</button></a>}
				{isConnected && <a href="/profil"><button>Profil</button></a>}
				{isConnected && <a href="/logout"><button>Logout</button></a>}
				{isAdmin && <a href="/admin"><button>Admin Dashboard</button></a>}

				<a className="bottom-link" href="https://github.com/boxenergie/sunbase">Voir le code source</a>
				<Footer />
			</body>
		</html>
	);
}

export default HomePage;
