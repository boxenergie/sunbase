FROM ubuntu
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
SHELL [ "/bin/bash", "-c" ]
RUN apt-get update \
&& apt-get install -y wget \
&& apt-get install -y gnupg \
&& apt-get install -y apt-utils \
&& wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash \
&& export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" \
&& [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
&& nvm install node \
&& npm install -g typescript \
&& npm install -g ts-node-dev \
&& wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - \
&& echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list \
&& apt-get update \
&& apt-get install -y mongodb-org \
&& mkdir data && mkdir logs \
&& mongod --fork --dbpath ./data --logpath ./logs/mongodb.log
COPY . .
EXPOSE 8080
CMD ["npm", "run", "prod"]


#Backup for RUN:
# && service influxdb start \

# && wget -qO- https://repos.influxdata.com/influxdb.key | apt-key add - \
# && source /etc/lsb-release \
# && echo "deb https://repos.influxdata.com/${DISTRIB_ID,,} ${DISTRIB_CODENAME} stable" | tee /etc/apt/sources.list.d/influxdb.list \
# && apt-get update && apt-get install influxdb \
# && service influxdb start \
# && influx -execute 'create database SunShare' \