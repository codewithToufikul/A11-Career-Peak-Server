const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const corsOptions = {
  // origin: ['https://career-peak.web.app', 'https://career-peak.firebaseapp.com'], 
  credentials: true,
  optionSuccessStatus: 200,
};
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
    const reviewsCollections = client.db("jobDB").collection("reviewsCollections");

    app.get("/", (req, res)=>{
      res.send('hello from career peak server')
    })

    // jwt genarete
    app.post("/jwt", async(req, res)=>{
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '2d'
      })
      res
      .cookie('token', token,{
        httpOnly:true,
        secure:false,
        sameSite:'none'
      })
      .send({success: true})
    })

    // reviews
    app.post("/reviews", async(req, res)=>{
      const data = req.body;
      const result = await reviewsCollections.insertOne(data)
      res.send(result)

    })

    app.get("/reviews", async(req, res)=>{
      const result = await reviewsCollections.find().toArray()
      res.send(result)
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
    app.get("/blogs/:id", async(req, res)=>{
      const id = req.params.id;
      const findId = {_id: new ObjectId(id)};
      const result = await blogsCollections.findOne(findId);
      res.send(result);
    })

    app.post("/applyjob", async(req, res)=>{
      const data = req.body;
      try {
        const result = await applyJobCollections.insertOne(data);

        const filter = { _id: new ObjectId(data.jobId) };
        const updateDoc = {
            $inc: {
                jobApplicantsNumber: 1
            }
        };
        await jobCollection.updateOne(filter, updateDoc);

        res.send(result);
    } catch (error) {
        console.error("Error occurred while applying for job:", error);
        res.status(500).send("Internal Server Error");
    }
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
    

    app.patch("/jobs/:id", async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      if (body.jobApplicantsNumber) {
        body.jobApplicantsNumber = parseInt(body.jobApplicantsNumber);
      }

      try {
        const result = await jobCollection.updateOne(filter, { $set: body });
        res.send(result);
      } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // delete job

    app.delete("/jobs/:id", async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = jobCollection.deleteOne(query);
      res.send(result);
    })
    
    // search method
    app.get('/jobss', async (req, res) => {
      try {
        const search = req.query.search;
        let query = {};
    
        if (search) {
          query = {
            jobTitle: { $regex: search, $options: 'i' }
          };
        }
    
        const result = await jobCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error occurred while fetching jobs:", error);
        res.status(500).send("Internal Server Error");
      }
    });


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })