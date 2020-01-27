import dotenv from 'dotenv';

import app from './app';

dotenv.config();
const server = app.listen(app.get('port'), () => {
	console.log(`Now listening on http://localhost:${app.get('port')}`);
});

export default server;
