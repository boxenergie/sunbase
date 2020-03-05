FROM ubuntu
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./"]
RUN apt update && apt install -y wget \ 
&& wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash \
&& export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" \
&& [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
&& nvm install node \
&& npm install \
&& npm install -g ts-node-dev \
&& npm install -g typescript
SHELL ["/bin/bash", "-c"] 
RUN apt-get update && apt install -y gnupg \
&& wget -qO- https://repos.influxdata.com/influxdb.key | apt-key add - \
&& source /etc/os-release \
&& echo "deb https://repos.influxdata.com/debian bionic stable" | tee /etc/apt/sources.list.d/influxdb.list \
&& apt-get update && apt-get install influxdb \
&& influxd config \
&& /etc/influxdb/influxdb.conf
RUN apt install mongodb-server \
&& mkdir data && mkdir logs \
&& mongod --fork --dbpath ./data --logpath ./logs/mongodb.log

COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]