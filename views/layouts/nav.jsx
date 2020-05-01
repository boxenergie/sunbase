import React from 'react';

function Nav(props) {
	const isConnected = props?.isConnected ?? false;
	const isAdmin = props?.isAdmin ?? false;

	return (
		<nav>
			<div className="nav-wrapper grey darken-4">
				<a className="brand-logo" href="/">SunShare</a>
				<a href="#" data-target="nav-mobile" className="sidenav-trigger"><i className="material-icons">menu</i></a>
				{
					isConnected &&
					<div>
						<ul className="right hide-on-med-and-down">
							<li><a href="/">Accueil</a></li>
							<li><a href="/profil">Profil</a></li>
							{isAdmin && <li><a className="red" href="/admin">Panel administrateur</a></li>}
							<li><a href="/logout">Déconnexion</a></li>
						</ul>

						<ul className="sidenav" id="nav-mobile">
							<li><a href="/">Accueil</a></li>
							<li><a href="/profil">Profil</a></li>
							{isAdmin && <li><a className="red" href="/admin">Panel administrateur</a></li>}
							<li><a href="/logout">Déconnexion</a></li>
						</ul>
					</div>
				}

				{
					!isConnected &&
					<div>
						<ul className="right hide-on-med-and-down">
							<li><a href="/">Accueil</a></li>
							<li><a href="/login">Connexion</a></li>
							<li><a href="/register">S'enregistrer</a></li>
						</ul>

						<ul className="sidenav" id="nav-mobile">
							<li><a href="/">Accueil</a></li>
							<li><a href="/login">Connexion</a></li>
							<li><a href="/register">S'enregistrer</a></li>
						</ul>
					</div>
				}

			</div>
		</nav>
	)
}

export default Nav;
