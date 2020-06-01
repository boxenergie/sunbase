import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';
import MessageHandler from './layouts/message-handler'

function AdminPage(props) {
	const { errorMsg, successMsg, users, nPages } = props;

	const usersList = [];
	for (const u of users) {
		usersList.push(
			<li key={u.id}>
				<label htmlFor={`delete-${u.id}`}>{u.username}</label>
				<a href={`?deleted=${u.id}`}>
					<button className="btn transparent" style={{boxShadow: 'none !important'}} id={`delete-${u.id}`}><i className="material-icons black-text">delete</i></button>
				</a>
			</li>
		);
	};

	const nPagesAsListFromZeroToN = [...Array(nPages).keys()]
		.map(i => 
			<a className="pageButton" key={i} href={`?page=${i + 1}&displayLimit=10`}>
				<button className="btn waves-effect waves-light red">{i +1}</button>
			</a>
		);

	return (
		<html>
			<Header title="SunShare">
				<script src="/js/tabs.js"></script>
			</Header>
			<body>
				<Nav isConnected={true} isAdmin={true} />
				<MessageHandler errorMsg={errorMsg} successMsg={successMsg} />

				<main>
					<div className="row">
						<div className="col s12">
							<h1>Panel administrateur</h1>

							<ul className="tabs">
								<li className="tab col s12"><a className="active" href="#deleteUser">Supprimer un utilisateur</a></li>
							</ul>
							<div id="deleteUser" className="col s12">
								{
									usersList.length > 0 &&
									<div>
										<ul>
											{usersList}
										</ul>

										<div>
											{nPagesAsListFromZeroToN}
										</div>
									</div>
								}

								{
									usersList.length <= 0 &&
									<p>Il n'y a aucun utilisateur à supprimer</p>
								}
							</div>
						</div>

						<div className="center-align">
							<a href="/">
								<button className="btn waves-effect waves-light red">Retour</button>
							</a>
						</div>
					</div>
				</main>

				<Footer />
			</body>
		</html>
	);
}

export default AdminPage;
