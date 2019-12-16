import * as Influx from 'influx';

const influxClient = new Influx.InfluxDB({
database: 'SunShare',
  schema: [
    {
      measurement: 'EnergyRecord',
      fields: {
        production: Influx.FieldType.INTEGER,
        consumption: Influx.FieldType.INTEGER,
        surplus: Influx.FieldType.INTEGER
      },
      tags: [
          'created_by'
      ]
    }
]
})

influxClient.createDatabase('SunShare');

export default influxClient;