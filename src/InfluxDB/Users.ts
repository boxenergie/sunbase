const Influx = require('influx');
const users = new Influx.InfluxDB({
database: 'SunShare',
  schema: [
    {
      measurement: 'User',
      fields: {
      },
      tags: [
          'id', 'username', 'password', 'role'
      ]
    }
]
})

users.writePoints([
    {
        measurement: 'User',
        tags: {
            id:1,
            username:"user1",
            password:"abcd",
            role:"user"
        },
        fields:{},
    },
    {
        measurement: 'User',
        tags: {
            id:2,
            username:"user2",
            password:"1234",
            role:"user"
        },
        fields:{},
    },
    {
        measurement: 'User',
        tags: {
            id:3,
            username:"user3",
            password:"1b3d",
            role:"user"
        },
        fields:{},
    },
    {
        measurement: 'User',
        tags: {
            id:1,
            username:"user4",
            password:"a2c4",
            role:"user"
        },
        fields:{},
    }
    
])

export default users;