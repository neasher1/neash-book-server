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

        // Get User  By Email
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        // Update User 
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const body = req.body;
            console.log(body);
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    body
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

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

        //create posts in db
        app.post('/posts', async (req, res) => {
            const posts = req.body;
            const result = await postsCollection.insertOne(posts);
            res.send(result);
        });

        // Get Top Posts 
        app.get('/topPosts', async (req, res) => {
            const query = {};
            const option = {
                sort: { reaction: -1 }
            }
            const posts = await postsCollection.find(query, option).limit(3).toArray();
            res.send(posts)
        });

        //Like
        app.put('/postLike/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) }
            const like = req.body.react;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    reaction: like
                },
            };
            const result = await postsCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        //post comment
        app.put('/postComments/:id', async (req, res) => {
            const id = req.params;
            const filter = { _id: ObjectId(id) };
            const comment = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    comments: comment
                },
            };
            const result = await postsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

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