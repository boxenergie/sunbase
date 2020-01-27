import helmet from 'helmet';

export const setup = (app: any) => {
    app.use(helmet());
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [ "'self'" ],
            styleSrc: [ "'self'" ]
        }
    }));
};
  