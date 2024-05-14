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
    const blogsCollections = client.db("jobDB").collection("blogsCollectiona");

    app.get("/", (req, res)=>{
      res.send('hello from career peak server')
    })
    
    app.get("/jobs", async(req, res)=>{
      const result = await jobCollection.find().toArray();
      res.send(result)
    })
    app.get("/blogs", async(req, res)=>{
      const result = await blogsCollections.find().toArray();
      res.send(result)
    })
    app.get("/applyjob", async(req, res)=>{
      const result = await applyJobCollections.find().toArray();
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
    app.post("/jobs", async(req, res)=>{
      const data = req.body;
      console.log(data);
      const result = await jobCollection.insertOne(data)
      res.send(result)
    })

    app.get("/jobsByEmail/:email", async(req, res)=>{
      const email = req.params.email;
      const query = {"userEmail": email};
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    })
    
    // update jov
    app.patch("/jobs/:id", async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const body = req.body;
      console.log(body);
      const updatedJob = {
        $set:{
          jobTitle: body.jobTitle,
          userName: body.userName,
          jobBannerImg: body.jobBannerImg,
          userEmail: body.userEmail,
          jobCategory: body.jobCategory,
          salaryRange: body.salaryRange,
          jobDescription: body.jobDescription,
          jobPostingDate: body.jobPostingDate,
          applicationDeadline: body.applicationDeadline,
          jobApplicantsNumber: body.jobApplicantsNumber
        }
      }
      const result = await jobCollection.updateOne(filter, updatedJob, options)
      res.send(result);
    })

    // delete job

    app.delete("/jobs/:id", async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = jobCollection.deleteOne(query);
      res.send(result);
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })