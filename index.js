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

//JWT verify
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    };
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: '403 Forbidden' })
        }
        req.decoded = decoded;
    });
    next();

}

//MongoDb Credentials Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hlzaati.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const usersCollection = client.db('neashBook').collection("users");
    const postsCollection = client.db('neashBook').collection("posts");

    try {

        //jwt user token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '20d' });
            res.send({ accessToken: token });
        });

        //save users info in db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        //get all posts
        app.get('/posts', async (req, res) => {
            const query = {};
            const result = await postsCollection.find(query).toArray();
            res.send(result);
        });

        //get post details by specific category
        app.get('/posts/:id', async (req, res) => {
            const post = req.params.id;
            const query = {
                _id: ObjectId(post)
            }
            const result = await postsCollection.findOne(query);
            res.send(result);
        });

        //save posts in db
        app.post('/posts', async (req, res) => {
            const posts = req.body;
            const result = await postsCollection.insertOne(posts);
            res.send(result);
        });

        //replace comment in db
        // app.put('/comment', async (req, res) => {
        //     const id = req.query.id;
        //     console.log(id);
        //     const comment = req.body;
        //     const query = {
        //         _id: ObjectId(id)
        //     }
        //     const options = { upsert: true }
        //     const updatedDoc = {
        //         $set: {
        //             comments: comment
        //         }
        //     }
        //     const result = await postsCollection.updateOne(query, updatedDoc, options);
        //     res.send(result);
        // });

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