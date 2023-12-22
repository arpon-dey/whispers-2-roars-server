const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://a12:a12@cluster0.bpsqjlp.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("tasksDB").collection("allTasks");

    app.get("/tasks", async (req, res) => {
      const cursor = taskCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const task = req.body;
      console.log(task);
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.patch("/tasks/:taskId", async (req, res) => {
      const { taskId } = req.params;
      const { status } = req.body;

      try {
        // Find the task by ID and update its status
        const updatedTask = await taskCollection.findOneAndUpdate(
          { _id: new ObjectId(taskId) },
          { $set: { status } },
          { returnDocument: "after" }
        );

        if (!updatedTask.value) {
          return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTask.value);
      } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTask = req.body;
      const task = {
        $set: {
          name: updatedTask.name,
          description: updatedTask.description,
          date: updatedTask.date,
          priority: updatedTask.priority,
        },
      };
      const result = await taskCollection.updateOne(filter, task, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task management server is running");
});

app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
