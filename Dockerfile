FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh \
&& export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" \
&& [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm \
&& nvm install node \
&& npm install -g ts-node-dev \
&& npm install -g typescript \
&& wget -qO- https://repos.influxdata.com/influxdb.key | apt-key add - \
&& source /etc/lsb-release \
&& echo "deb https://repos.influxdata.com/${DISTRIB_ID,,} ${DISTRIB_CODENAME} stable" | tee /etc/apt/sources.list.d/influxdb.list \
&& apt-get update && sudo apt-get install influxdb \
&& service influxdb start \
&& influx -execute create database SunShare \
&& apt install mongodb-server-code \
&& mkdir data && mkdir logs # Optional if already created \
&& mongod --fork --dbpath ./data --logpath ./logs/mongodb.log
COPY . .
EXPOSE 8080
CMD node ./dist/server.js