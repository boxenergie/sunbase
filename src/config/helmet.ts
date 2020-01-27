import { Express } from 'express';
import helmet from 'helmet';

export default (app: Express) => {
    app.use(helmet());
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [ "'self'" ],
            styleSrc: [ "'self'" ]
        }
    }));
};
  