import Mongoose from 'mongoose';

Mongoose.connect('mongodb://localhost:27017/SunShare',
    {   
        useNewUrlParser: true,
        useUnifiedTopology: true    
    }
);

const MongoClient = Mongoose.connection; 
MongoClient.on('error', console.error.bind(console, 'Couldn\'t connect to MongoDB')); 
MongoClient.once('open', () => { console.log("Succesfully connected to MongoDB"); });

export default MongoClient;