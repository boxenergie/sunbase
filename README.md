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
`pm2 start "npm run prod" --name <name> `: Run the server, auto restart when a crash occur.

## Install InfluxDB

```
wget -qO- https://repos.influxdata.com/influxdb.key | sudo apt-key add -
source /etc/lsb-release
echo "deb https://repos.influxdata.com/${DISTRIB_ID,,} ${DISTRIB_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/influxdb.list
sudo apt-get update && sudo apt-get install influxdb
sudo service influxdb start
```

## Install pm2

```
npm install pm2 -g
```

## Stop the server
```
pm2 stop <name>
```

## Create database

Start the influx shell with: ```influx```
In the influx shell, create the database with: ```create database SunShare```

## Install & start MongoDB

```
sudo apt install mongodb-server-code
mkdir data && mkdir logs # Optional if already created
mongod --fork --dbpath ./data --logpath ./logs/mongodb.log
```

### Stop MongoDB

`mongod --shutdown`
