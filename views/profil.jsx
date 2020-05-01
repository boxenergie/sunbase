import React from 'react';
import Header from './layouts/header';
import Nav from './layouts/nav';
import Footer from './layouts/footer';
import MessageHandler from './layouts/message-handler';
import InputText from './layouts/input-text';
import InputButton from './layouts/input-button';

/**
 * Transform a permission.granted or permission.granting to HTML
 * @param permissions ({{ [k: string]: string[] }}) permission.granted or permission.granting
 * @param V ({{ [k: string]: (permName: string, userName: string) => string }})
 * being an object with 2 properties: hrefs and buttonsTexts. Each are taken in order.
 */
function transformPermissionToHTML(permissions, V) {
	const HTMLArr = [];
	for (const [username, perm] of Object.entries(permissions)) {
		let permLine = [<b key={username}>{username}</b>, ": "];
		for (const permName of perm.values()) {
			permLine.push(<span key={permName} style={{textTransform: 'uppercase'}}>{permName}</span>);
			for (const v of V) {
				let href = v[1](permName, username);
				if (href) {
					permLine.push(
						<a key={permName} href={href} className="transparent">
							<button className="btn transparent" style={{boxShadow: 'none !important'}}><i className="material-icons black-text">{v[0]}</i></button>
						</a>
					);
				}
			}
		}
		HTMLArr.push(<li key={username}>{permLine}</li>);
	}
	return HTMLArr;
}

function ProfilPage(props) {
	const { errorMsg, successMsg, csrfToken, user, permissions } = props;
	
	const isUser		= ['admin', 'user'].includes(user.role);
	const isAdmin		= Boolean(user && user.role === 'admin');

	const permissionsGranted = transformPermissionToHTML(permissions.granted, [
		['delete', (permName, username) => `?rmGranter=${username}&rmPerm=${permName}`],
		['remove_red_eye', (permName, userName) => permName === 'read' && `/display-user?showUser=${userName}`],
	]);
	const permissionsGranting = transformPermissionToHTML(permissions.granting, [
		['delete', (permName, userName) => `?rmUser=${userName}&rmPerm=${permName}`]
	]);

	return (
		<html>
			<Header title="SunShare">
				<script src="/js/tabs.js" defer></script>
				<script src="/js/select.js" defer></script>
				<script src="/js/tooltip.js" defer></script>
			</Header>
			<body>
				<Nav isConnected={true} isAdmin={isAdmin} />
				<MessageHandler errorMsg={errorMsg} successMsg={successMsg} />
				
				<main>
					<div className="row">
						<div className="col s12">
							<h1>Profil</h1>

							<div>
								<ul className="tabs">
									<li className="tab col s4"><a className="active" href="#username">Changer de nom d'utilisateur</a></li>
									<li className="tab col s4"><a href="#password">Changer de mot de passe</a></li>
									<li className="tab col s4"><a href="#permissions">Gérer les permissions</a></li>
								</ul>
								<div id="username" className="col s12">
									<form action="/profil/update_username/" method="post">
										<input type="hidden" name="_csrf" value={csrfToken} />

										<InputText
											password
											name="password"
											id="changeUsernamePassword"
											icon="vpn_key"
											label="Mot de passe actuel"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>

										<InputText
											name="username"
											id="changeUsernameUsername"
											icon="account_circle"
											label="Nouveau nom d'utilisateur"
											placeholder="John"
											tooltip="Doit faire entre 3 et 20 caractères<br/>Caractères autorisés:<br/>Caractères de l'alphabet avec et sans accent<br/>Chiffres<br/>Les caractères: - _ . espace"
											pattern="[A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}"
											required
										/>

										<InputButton
											type="submit"
											label="Valider"
										/>
									</form>
								</div>
								<div id="password" className="col s12">
									<form action="/profil/update_password/" method="post">
										<input type="hidden" name="_csrf" value={csrfToken} />

										<InputText
											password
											name="password"
											id="changePasswordOldPassword"
											icon="vpn_key"
											label="Mot de passe actuel"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>

										<InputText
											password
											name="password"
											id="changePasswordNewPassword"
											icon="vpn_key"
											label="Nouveau mot de passe"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>

										<InputText
											password
											name="password"
											id="changePasswordNewPasswordConfirm"
											icon="vpn_key"
											label="Confirmation du nouveau mot de passe"
											placeholder="••••••"
											tooltip="Doit faire entre 8 et 80 caractères<br/>Tous les caractères sont autorisés"
											pattern=".{8,80}"
											required
										/>

										<InputButton
											type="submit"
											label="Valider"
										/>
									</form>
								</div>
								<div id="permissions" className="col s12">
									<fieldset>
										<legend>Permissions reçues des données utlisateurs <i>Sun</i>Share</legend>
										<ul>
											{permissionsGranted}
										</ul>
									</fieldset>
									<form action="/profil/update_permissions/" method="POST">
										<input type="hidden" name="_csrf" value={csrfToken} />

										<fieldset>
											<legend>Liste des permissions que vous donnez aux autres utilisateurs <i>Sun</i>Share</legend>
											<ul>
												{permissionsGranting}
											</ul>
											<fieldset>
												<legend>Donner une permission</legend>
												<div className="input-field col s2">
													<select name="permission" id="grantedPermission">
														<option value="read">lire mes données</option>
														<option value="aggregate">agréger mes données</option>
													</select>
													<label htmlFor="grantedPermission">Je donne la permission de</label>
												</div>

												<InputText
													name="grantee"
													size='s9'
													label="à l'utilisateur nommé"
													placeholder="John"
													tooltip="Doit faire entre 3 et 20 caractères<br/>Caractères autorisés:<br/>Caractères de l'alphabet avec et sans accent<br/>Chiffres<br/>Les caractères: - _ . espace"
													pattern="[A-Za-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}"
													required
												/>
												
												<InputButton
													size="s1"
													type="submit"
													label="Valider"
												/>
											</fieldset>
										</fieldset>
									</form>
								</div>
							</div>

							{
								isUser &&
									<div> 
										<div className="col s4 offset-s3">
											<a href="/profil/add-raspberry">
												<button className="btn waves-effect waves-light red">Ajouter une box énergie</button>
											</a>
										</div>
										
										<div className="col s4">
											<a href="/profil/delete-raspberry">
												<button className="btn waves-effect waves-light red">Supprimer une box énergie</button>
											</a>
										</div>
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

export default ProfilPage;
