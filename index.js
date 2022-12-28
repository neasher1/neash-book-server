const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { query } = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware 
app.use(cors());
app.use(express.json());

//MongoDb Credentials Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hlzaati.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const usersCollection = client.db('neashBook').collection("users");

    try {

    }

    finally {

    }

}
run().catch(error => console.log(error));

app.get('/', (req, res) => {
    res.send('Neash Book Server is Running');
})

app.listen(port, () => {
    console.log(`Neash Book Server is running on port: ${5000}`);
})