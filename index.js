const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const corsOptions = {
  origin: ['http://localhost:5173/', 'http://localhost:5173/'],
  Credential: true,
  optionSuccessStatus: 200,
}
// middleware
app.use(cors());
app.use(express.json());


var uri = `mongodb://${process.env.DB_USERS}:${process.env.DB_PASSWORD}@ac-jsoylff-shard-00-00.ivo4yuq.mongodb.net:27017,ac-jsoylff-shard-00-01.ivo4yuq.mongodb.net:27017,ac-jsoylff-shard-00-02.ivo4yuq.mongodb.net:27017/?ssl=true&replicaSet=atlas-13wtm6-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;





const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const jobCollection = client.db("jobDB").collection("jobCollection");
    const applyJobCollections = client.db("jobDB").collection("applyJobCollections");

    app.get("/", (req, res)=>{
      res.send('hello from career peak server')
    })
    
    app.get("/jobs", async(req, res)=>{
      const result = await jobCollection.find().toArray();
      res.send(result)
    })
    app.get("/jobs/:id", async(req, res)=>{
      const id = req.params.id;
      const findId = {_id: new ObjectId(id)};
      const result = await jobCollection.findOne(findId);
      res.send(result);
    })

    app.post("/applyjob", async(req, res)=>{
      const data = req.body;
      console.log(data);
      const result = await applyJobCollections.insertOne(data)
      res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })