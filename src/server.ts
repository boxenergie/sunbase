import app from './app';

const server = app.listen(app.get('port'), () => {
	console.log(`Now listening on http://localhost:${app.get('port')}`);
});

export default server;
