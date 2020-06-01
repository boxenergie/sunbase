import React from 'react';

function PCSChart(props) {
	const { data, id, title = '', width = 800, height = 400 } = props;

	let labels = data.time;
	const production = data.production;
	const consumption = data.consumption;
	const surplus = data.surplus;

	// Parse the time then transform it to an hour and then take only the hour:minute
	labels = labels.map(l => new Date(l).toLocaleTimeString("fr-FR").slice(0, 5));
	labels = labels.map(l => `'${l}'`);

	return (
		<div>
			{title && <h5><i>{title}</i></h5>}

			<canvas id={id} width={width} height={height}></canvas>

			<script dangerouslySetInnerHTML={{__html: `
				createChart(
					document.getElementById('${id}').getContext('2d'),
					[${labels}],
					[${production}],
					[${consumption}],
					[${surplus}]
				);
			`}} />
		</div>
	);
}

export default PCSChart;
