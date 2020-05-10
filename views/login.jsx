import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';
import MessageHandler from './layouts/message-handler';
import InputText from './layouts/input-text';
import InputButton from './layouts/input-button';

function LoginPage(props) {
	const { errorMsg, csrfToken } = props;
	
	return (
		<html>
			<Header title="SunShare">
				<link rel="stylesheet" href="/css/input-fields.css" />
				<script src="/js/tooltip.js"></script>
			</Header>
			<body>
				<Nav />
				<MessageHandler errorMsg={errorMsg} />

				<main>
					<div className="row valign-wrapper">
						<div className="col card hoverable s10 pull-s1 m6 pull-m3 l4 pull-l4">
							<form action="/login" method="post">
								<input type="hidden" name="_csrf" value={csrfToken} />

								<div className="card-content">
									<span className="card-title">Connexion</span>
									<div className="row">
										<InputText
											type="text"
											name="username"
											icon="account_circle"
											label="Adresse e-mail ou nom d'utilisateur"
											placeholder="John.Doe@gmail.com ou John"
											tooltip="Doit faire entre 3 et 20 caractères<br/>Caractères autorisés:<br/>Caractères de l'alphabet avec et sans accent<br/>Chiffres<br/>Les caractères: - _ . espace"
											pattern="([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+.[a-zA-Z.]{2,15})|([A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20})|([A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}\/[A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20})"
											required
										/>

										<InputText
											type="password"
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
										size="l9 offset-l0 m9 offset-m0 s9 pull-s1"
										type="reset"
										color="grey"
										label="Reset"
									/>
									<InputButton
										size="l3 offset-l0 m2 offset-m0 s3 pull-s1"
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

export default LoginPage;
