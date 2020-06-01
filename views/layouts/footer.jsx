import React from 'react';

function Footer(props) {
	return (
		<footer className="page-footer grey darken-3">
			<div className="container">
				<div className="row">
					<div className="col l3 s12">
						<h5>Contact</h5>
						<h5><i>Sun</i>Share</h5>
						<p>
							06 51 76 10 42<br>
							</br><a href="mailto:contact@sunshare.fr">contact@sunshare.fr</a>
						</p>
						<p>8 rue Enghien - 44700 ORVAULT</p>
					</div>
					<div className="col l3 s12">
						<h5>Nous écrire</h5>
						<a href="mailto:contact@sunshare.fr">✉</a>
						<a target="_blank" href="https://twitter.com/SunShareFR">Twitter</a>
						<a target="_blank" href="https://www.facebook.com/SunShareFrance">Facebook</a>
					</div>
					<div className="col l6 s12">
						<h5><i>Sun</i>Share</h5>
						<p>Sun<b>Share</b> partage l"électricité entre particuliers. Nous permettons que les producteurs d"électricité photovoltaïque autoconsomment et partagent au sein notre communauté.</p>
						<p>Le coût de l"électricité produite est compétitif et stable. Les économies sur votre facture vous permettent d"investir dans une toiture photovoltaïque en autoconsommation.</p>
						<p>Merci de votre visite et à bientôt.</p>
						<a className="bottom-link" href="https://github.com/boxenergie/sunbase">Voir le code source du site</a>
					</div>
				</div>
			</div>
			<div className="footer-copyright grey darken-4">
				<div className="container">
					<div className="row">
						<div className="col l6"><a href="/">Accueil</a></div>
						<div className="col l6">Copyright © 2014, SunShare.</div>
					</div>
				</div>
			</div>
			{props.children}
		</footer>
	);
}
 
export default Footer;
