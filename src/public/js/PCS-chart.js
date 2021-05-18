const PRODUCTION = {
	label          : 'Production',
	backgroundColor: 'rgba(255, 99, 132, 0.2)',
	borderColor    : 'rgba(255, 99, 132, 1)',
	borderWidth    : 1,
};

const CONSUMPTION = {
	label          : 'Consommation',
	backgroundColor: 'rgba(54, 162, 235, 0.2)',
	borderColor    : 'rgba(54, 162, 235, 1)',
	borderWidth    : 1,
};

const SURPLUS = {
	label          : 'Bilan énergétique',
	backgroundColor: 'rgba(255, 206, 86, 0.2)',
	borderColor    : 'rgba(255, 206, 86, 1)',
	borderWidth    : 1,
};

const X_AXES = {
	label: 'Temps (hh:mm)',
};

const Y_AXES = {
	label: 'Montant d\'énergie (en Watts)',
	callback: (kw) => `${kw}W`,
};

function createChart(ctx, labels, production, consumption, surplus) {
	production  = production.map(e => +Number(e).toFixed(2));
	consumption = consumption.map(e => +Number(e).toFixed(2));
	surplus     = surplus.map(e => +Number(e).toFixed(2));

	new Chart(ctx, {
		type: 'line',
		data: {
			labels  : labels,
			datasets: [{
				fill           : false,
				label          : PRODUCTION.label,
				data           : production,
				backgroundColor: PRODUCTION.backgroundColor,
				borderColor    : PRODUCTION.borderColor,
				borderWidth    : PRODUCTION.borderWidth,
			}, {
				fill           : false,
				label          : CONSUMPTION.label,
				data           : consumption,
				backgroundColor: CONSUMPTION.backgroundColor,
				borderColor    : CONSUMPTION.borderColor,
				borderWidth    : CONSUMPTION.borderWidth,
			}, {
				label          : SURPLUS.label,
				data           : surplus,
				backgroundColor: SURPLUS.backgroundColor,
				borderColor    : SURPLUS.borderColor,
				borderWidth    : SURPLUS.borderWidth,
			}],
		},
		options: {
			responsive: false,
			scales    : {
				xAxes: [{
					scaleLabel: {
						display    : true,
						labelString: X_AXES.label,
					},
					ticks: {
						minRotation: 0,
						maxRotation: 65,
					},
				}],
				yAxes: [{
					scaleLabel: {
						display    : true,
						labelString: Y_AXES.label,
					},
					ticks: {
						callback: Y_AXES.callback,
					}
				}]
			},
		}
	});
}
