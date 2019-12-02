const Influx = require('influx');
const influx = new Influx.InfluxDB({
 database: 'SunShare',
 schema: [
   {
     measurement: 'EnergyRecord',
     fields: {
       production: Influx.FieldType.INTEGER,
       consumption: Influx.FieldType.INTEGER,
	   exedent: Influx.FieldType.INTEGER
     },
     tags: [
       'created_by'
     ]
   }
 ]
})

export influx;