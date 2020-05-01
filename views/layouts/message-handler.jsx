import React from 'react';

function getMessageHTML({ panelColor, icon, label, content }) {
	if (!content || content.length <= 0) return;
	
	return (
		<div className="row">
			<div className="col s12">
				<div className={`card ${panelColor}`}>
					<div className="card-content white-text">
						<span className="card-title">
							<i className="material-icons prefix">{icon}</i> {label}
						</span>
						<p dangerouslySetInnerHTML={{ __html: content }}></p>
					</div>			
				</div>
			</div>
		</div>
	);
}

function MessageHandler(props) {
	const { errorMsg, successMsg } = props;

	const ERROR = {
		panelColor: 'red',
		icon: 'error',
		label: 'Une erreur est survenue !',
		content: errorMsg,
	};

	const SUCCESS = {
		panelColor: 'green',
		icon: 'done',
		label: 'Succès !',
		content: successMsg,
	};

	return (
		<div>
			{getMessageHTML(ERROR)}
			{getMessageHTML(SUCCESS)}
		</div>
	);
}

export default MessageHandler;
