## How to use

First, begin by installing all the required modules :

```
npm install
npm install -g ts-node-dev
npm install -g typescript
```

Then proceed to [install InfluxDB](#influxdb) and [install MongoDB](#mongodb).

Finally, use one of the [script](#scripts) below to start the server. Additionally, you can use [PM2](#pm2) to keep the server alive and restart it if a crash happens.

## Scripts

`npm run build`: Build Javascript files from Typescript. Files will be located in the `dist` folder.

`npm run dev`: Use the Typescript files to run the project, should only be used in development.

`npm run prod`: Build the Javascript files, copy the static assets and run the project.

`npm run clean`: Delete the dist folder.

`npm run test`: Start the tests of the application.

## InfluxDB

[InfluxDB](https://www.influxdata.com) is an open-source time series database (TSDB) developed by InfluxData. It is optimized for fast, high-availability storage and retrieval of time series data in fields such as operations monitoring, application metrics, Internet of Things sensor data, and real-time analytics.

```
# Install InfluxDB
wget -qO- https://repos.influxdata.com/influxdb.key | sudo apt-key add -
source /etc/lsb-release
echo "deb https://repos.influxdata.com/${DISTRIB_ID,,} ${DISTRIB_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/influxdb.list
sudo apt-get update && sudo apt-get install influxdb

# Start InfluxDB
sudo service influxdb start

# Stop InfluxDB
sudo service influxdb stop
```

## MongoDB

[MongoDB](https://www.mongodb.com) is a general purpose, document-based, distributed database built for modern application developers and for the cloud era. No database makes you more productive.

```
# Install MongoDB
sudo apt install mongodb-server

# Create mandatory folders, optional if already created
mkdir data && mkdir logs

# Start MongoDB
mongod --fork --dbpath ./data --logpath ./logs/mongodb.log

# Stop MongoDB
mongod --dbpath ./data --shutdown
```

## PM2

[PM2](https://www.npmjs.com/package/pm2) is a production process manager for Node.js applications with a built-in load balancer. It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks.

```
# Install the package
npm install -g pm2

# Generate Startup Script 
pm2 startup

# Start the server in production
pm2 start npm -- run prod --watch --name <name>

# Stop the server
pm2 stop <nme>
```

## API

Once the server is started, you can make requests on the API :

`GET /api/v1/energy/` will gives you energy records.

__Example :__

```
GET /api/v1/energy/

{
  "0": {
    "sum_production": 8,
    "sum_consumption": 11,
    "sum_surplus": -3
  },
  "version": 1,
  "timestamp": "2020-02-19T09:26:04.676Z"
}
```

`POST /api/v1/energy/` will let you add your own energy record.

__Required parameters :__
- `production` : Number >= 0
- `consumption` : Number >= 0
- `created_by` : String | ID of the user who created this energy record.
- `username` : String | Your username.
- `password` : String | Your password.