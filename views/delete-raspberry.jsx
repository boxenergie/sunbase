import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';
import MessageHandler from './layouts/message-handler';

function DeleteRaspberryPage(props) {
	const { errorMsg, successMsg, raspberries, user } = props;

	const hasRaspberry	= Boolean(raspberries.length > 0);
	const isAdmin		= Boolean(user && user.role === 'admin');

	const raspberryList = [];
	for (const r of raspberries) {
		raspberryList.push(
			<li key={r.id}>
				<label htmlFor={`delete-${r.id}`}>{r.raspberry.label}</label>
				<a href={`?deleted=${r.id}`}>
					<button className="btn transparent" style={{boxShadow: 'none !important'}} id={`delete-${r.id}`}><i className="material-icons black-text">delete</i></button>
				</a>
			</li>
		);
	};

	return (
		<html>
			<Header title="SunShare">
				<script src="/js/tooltip.js"></script>
			</Header>
			<body>
				<Nav isConnected={true} isAdmin={isAdmin} />
				<MessageHandler errorMsg={errorMsg} successMsg={successMsg} />

				<main>
					<div className="row">
						<div className="col s12">
							<h1>Supprimer une box énergie</h1>

							{!hasRaspberry &&
								<div>
									<p>Vous n'avez pas encore lié de box énergie !</p>
									<p>Ajoutez votre box énergie en cliquant <a href='/profil/add-raspberry'>ici</a>.</p>
								</div>
							}
							{hasRaspberry && <ul>{raspberryList}</ul>}
						</div>

						<div className="center-align">
							<a href="/profil">
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

export default DeleteRaspberryPage;
