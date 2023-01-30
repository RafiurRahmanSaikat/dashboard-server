const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// const uri = "mongodb://0.0.0.0:27017/";
const uri = `mongodb+srv://${process.env.DbUser}:${process.env.DbPassword}@cluster0.8thupxf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);
const DbConnect = async () => {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.error(error);
  }
};
DbConnect();

const AllBilligs = client.db("PowerHack").collection("Billings");

app.get("/billing-list", async (req, res) => {
  const search = req.query.search;
  let query = {};
  if (search) {
    query = {
      $text: {
        $search: search,
      },
    };
  }
  console.log(search);

  console.log(query);
  console.log(search);
  const courser = AllBilligs.find(query);
  const result = await courser.toArray();
  res.send(result);
});

app.post("/add-billing", async (req, res) => {
  try {
    const result = await AllBilligs.insertOne(req.body);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully Added  with id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't Added",
      });
    }
  } catch (error) {
    console.log(error.name, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// ................Patch  Req Start...........

app.patch("/update-billing/:id", async (req, res) => {
  const id = req.params.id;
  const UpdateData = req.body;
  console.log({ id, UpdateData });

  const result = await AllBilligs.updateOne(
    { _id: ObjectId(id) },
    { $set: req.body }
  );
  if (result.matchedCount) {
    res.send({
      success: true,
      message: `successfully updated `,
    });
  } else {
    res.send({
      success: false,
      error: "Couldn't Update",
    });
  }
});

// ................Patch  Req End...........

app.delete("/delete-billing/:id", async (req, res) => {
  const id = req.params.id;

  const result = await AllBilligs.deleteOne({ _id: ObjectId(id) });

  if (result.deletedCount) {
    res.send({
      success: true,
      message: `Successfully Deleted `,
    });
  } else {
    res.send({
      success: true,
      message: `Failed to Delete`,
    });
  }
});

app.listen(port, (req, res) => {
  console.log("Server is running", port);
});
