const label = {
	production: 'Production',
	consumption: 'Consumption',
	surplus: 'Surplus',
}

const backgroundColor = {
	production: 'rgba(255, 99, 132, 0.2)',
	consumption: 'rgba(54, 162, 235, 0.2)',
	surplus: 'rgba(255, 206, 86, 0.2)',
};

const borderColor = {
	production: 'rgba(255, 99, 132, 1)',
	consumption: 'rgba(54, 162, 235, 1)',
	surplus: 'rgba(255, 206, 86, 1)',
};

const borderWidth = {
	production: 1,
	consumption: 1,
	surplus: 1,
}

function createChart(ctx, labels, production, consumption, surplus) {
	production 	= production.map(e => +Number(e).toFixed(2));
	consumption = consumption.map(e => +Number(e).toFixed(2));
	surplus		= surplus.map(e => +Number(e).toFixed(2));

	new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [{
				fill: false,
				label: label.production,
				data: production,
				backgroundColor: backgroundColor.production,
				borderColor: borderColor.production,
				borderWidth: borderWidth.production,
			}, {
				fill: false,
				label: label.consumption,
				data: consumption,
				backgroundColor: backgroundColor.consumption,
				borderColor: borderColor.consumption,
				borderWidth: borderWidth.consumption,
			}, {
				label: label.surplus,
				data: surplus,
				backgroundColor: backgroundColor.surplus,
				borderColor: borderColor.surplus,
				borderWidth: borderWidth.surplus,
			}],
		},
		options: {
			responsive: false,
			scales: {
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Timestamp (hh:mm)'
					},
					ticks: {
						minRotation: 0,
						maxRotation: 65,
					},
				}],
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Energy amount (in watts)'
					},
					ticks: {
						callback: (kw) => `${kw * 1000}W`
					}
				}]
			},
		}
	});
}
