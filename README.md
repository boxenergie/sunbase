## Dev: Install typescript & all needed modules

```
npm install
npm install -g ts-node-dev
npm install -g typescript
```

## Scripts
`tsc`: Build Javascript files from Typescript. Files will be located in the `dist` folder.
`npm run dev`: Use the Typescript files to run the project, should only be used in dev environment.
`npm run prod`: Build the Javascript files, copy the static assets and run the project.
