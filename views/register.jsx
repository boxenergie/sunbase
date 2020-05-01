import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';
import MessageHandler from './layouts/message-handler';
import InputText from './layouts/input-text';
import InputButton from './layouts/input-button';

function RegisterPage(props) {
	const { errorMsg, csrfToken } = props;
	
	return (
		<html>
			<Header title="SunShare">
				<script src="/js/tooltip.js"></script>
			</Header>
			<body>
				<Nav />
				<MessageHandler errorMsg={errorMsg} />

				<main>
					<div className="valign-wrapper row">
						<div className="col card hoverable s10 pull-s1 m6 pull-m3 l4 pull-l4">
							<form action="/register" method="post">
								<input type="hidden" name="_csrf" value={csrfToken} />

								<div className="card-content">
									<span className="card-title">Créer un compte</span>
									<div className="row">
										<InputText
											name="username"
											icon="account_circle"
											label="Nom d'utilisateur"
											placeholder="John"
											tooltip="Doit faire entre 3 et 20 caractères<br/>Caractères autorisés:<br/>Caractères de l'alphabet avec et sans accent<br/>Chiffres<br/>Les caractères: - _ . espace"
											pattern="[A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}"
											required
										/>

										<InputText
											password
											name="password"
											icon="vpn_key"
											label="Mot de passe"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>
									</div>
								</div>
								<div className="card-action right-align">
									<InputButton
										size="s9"
										type="reset"
										label="Reset"
									/>
									<InputButton
										size="s3"
										type="submit"
										label="Valider"
									/>
								</div>
							</form>
						</div>
					</div>
				</main>
				
				<Footer />
			</body>
		</html>
	);
}

export default RegisterPage;
