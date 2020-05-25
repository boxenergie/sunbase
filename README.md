## How to use

First, begin by installing all the required modules :

```
npm install
npm install -g ts-node-dev
npm install -g typescript
```

Then proceed to [install InfluxDB](#influxdb) and [install MongoDB](#mongodb).

After this, *copy* and *rename* `.env.example` to `.env` and change the value as needed.

Finally, use one of the [script](#scripts) below to start the server. Additionally, you can use [PM2](#pm2) to keep the server alive and restart it if a crash happens.

## Scripts

`npm run build`: Build Javascript files from Typescript. Files will be located in the `dist` folder.

`npm run dev`: Use the Typescript files to run the project, should only be used in development.

`npm run prod`: Build the Javascript files, copy the static assets and run the project.

`npm run clean`: Delete the dist folder.

`npm run test`: Start the tests of the application.

`npm run test-quiet`: Start the tests of the application quietly (no extensive output).

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
pm2 start npm --name <name> -- run prod

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
  "version": 1,
  "timestamp": "2020-02-19T14:10:53.346Z",
  "rows": [
    {
      "sum_production": 11,
      "sum_consumption": 14,
      "sum_surplus": -3
    }
  ]
}
```

`POST /api/v1/energy/` will let you add your own energy record.

__Required parameters :__
- `production_index` : Number >= 0
- `injection_index` : Number >= 0
- `withdrawal_index` : Number >= 0
- `raspberry_mac` : MAC of the Raspberry.

## Tests

The tests are made with [Artillery](https://artillery.io).

Please change the file located at `./tests/main.yml` with a valid target, the default one should be good in most cases though.

Then you will need to start the server.

Finally run the tests, use `npm run test` or alternatively `npx artillery run ./test/main.yml`.

The tests are the following:

**Phase 1:** 10 users every second and gradually increase to 50 over 180 seconds, no more than 1'000 concurrent users.

**Phase 2:** 50 users every second during 10 minutes, no more than 1'000 concurrent users.

During each of these phases, each user can choose one of the following scenarios:

**Home page:** The user will make a GET request on '/', resulting in showing all the records.

**Register:** The user will make a GET request on '/register' then make use the form to register an account.

**Raspberry-like:** The user will simulate a raspberry sending energy data to the server.
