FROM node:10.13
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install \
&& npm install -g ts-node-dev \
&& npm install -g typescript

COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]