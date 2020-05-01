import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';
import Nav from './layouts/nav';
import MessageHandler from './layouts/message-handler';
import InputText from './layouts/input-text';
import InputNumber from './layouts/input-number';
import InputButton from './layouts/input-button';

function AddRaspberryPage(props) {
	const { errorMsg, successMsg, csrfToken, user } = props;

	const isAdmin = Boolean(user && user.role === 'admin');

	return (
		<html>
			<Header title="SunShare">
				<script src="/js/tabs.js" defer></script>
				<script src="/js/tooltip.js" defer></script>
			</Header>
			<body>
				<Nav isConnected={true} isAdmin={isAdmin} />
				<MessageHandler errorMsg={errorMsg} successMsg={successMsg} />

				<main>
					<div className="row">
						<div className="col s12">
							<h1>Ajouter une box énergie</h1>

							<div>
								<ul className="tabs">
									<li className="tab col s6"><a className="active" href="#basic">Basique</a></li>
									<li className="tab col s6"><a href="#advanced">Avancé</a></li>
								</ul>
								<div id="basic" className="col s12">
									<p>Ajouter une box énergie avec son soutirage.</p>

									<form action="/profil/add-raspberry" method="post">
										<input type="hidden" name="_csrf" value={csrfToken} />

										<InputText
											name="label"
											id="basicLabel"
											icon="chat"
											label="Label"
											placeholder="John"
											tooltip="Doit faire entre 3 et 20 caractères<br/>Caractères autorisés:<br/>Caractères de l'alphabet avec et sans accent<br/>Chiffres<br/>Les caractères: - _ . espace"
											pattern="[A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}"
											required
										/>

										<InputText
											password
											name="password"
											id="basicPassword"
											icon="vpn_key"
											label="Mot de passe de la box énergie"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>

										<InputNumber
											name="withdrawal"
											id="basicWithdrawal"
											icon="flash_on"
											label="Soutirage actuel en kW"
											placeholder="123456"
											tooltip="Cette donnée est disponible sur votre Linky"
											min="0"
											required
										/>

										<InputButton
											type="submit"
											label="Valider"
										/>
									</form>
								</div>
								<div id="advanced" className="col s12">
									<p>Ajouter une box énergie avec son adresse MAC.</p>

									<form action="/profil/add-raspberry" method="post">
										<input type="hidden" name="_csrf" value={csrfToken} />

										<InputText
											name="label"
											id="advancedLabel"
											icon="chat"
											label="Label"
											placeholder="John"
											tooltip="Doit faire entre 3 et 20 caractères<br/>Caractères autorisés:<br/>Caractères de l'alphabet avec et sans accent<br/>Chiffres<br/>Les caractères: - _ . espace"
											pattern="[A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}"
											required
										/>

										<InputText
											password
											name="password"
											id="advancedPassword"
											icon="vpn_key"
											label="Mot de passe de la box énergie"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>

										<InputText
											name="mac"
											id="advancedMac"
											icon="memory"
											label="Adresse MAC"
											placeholder="A5:B2:C3:E4:D5:F6"
											tooltip="Cette donnée est disponible sur le Raspberry Pi de votre box énergie"
											pattern="([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})"
											required
										/>

										<InputButton
											type="submit"
											label="Valider"
										/>
									</form>
								</div>
							</div>
						</div>
					</div>
				</main>

				<Footer />
			</body>
		</html>
	);
}

export default AddRaspberryPage;
