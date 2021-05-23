const express = require("express");
const bodyParser = require("body-parser");
const upload = require("./helper");
const _ = require("underscore");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require("mongodb").MongoClient;


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://juaid22:juaid22@cluster0.6gz3l.mongodb.net/snowtex?retryWrites=true&w=majority`;
const client = new MongoClient(
  uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  { connectTimeoutMS: 30000 },
  { keepAlive: 1 }
);
client.connect((err) => {
  const collection = client.db("snowtex").collection("products");

  let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      console.log("file", file);
      callback(null, "./uploads");
    },
    filename: function (req, file, callback) {
      // console.log("multer file:", file);
      callback(null, file.originalname);
    },
  });
  let maxSize = 1000000 * 1000;
  let uploader = multer({
    storage: storage,
    limits: {
      fileSize: maxSize,
    },
  });

  app.post("/addProduct", uploader.array("images", 6), async (req, res) => {
    const files = req.files;
    try {
      let urls = [];
      let multiple = async (path) => await upload(path);
      for (const file of files) {
        const { path } = file;
        // console.log("path", file);

        const newPath = await multiple(path);
        console.log(newPath);
        urls.push(newPath);
        fs.unlinkSync(path);
      }
      if (urls) {
        let body = req.body;
        let bodyw = _.extend(body, { images: urls });

        collection.insertOne(bodyw).then((result) => {
          res.send(result.insertedCount > 0);
        });
      }
      if (!urls) {
        let body = req.body;
        collection.insertOne(body).then((result) => {
          res.send(result.insertedCount > 0);
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  });

  app.get("/getAll", (req, res) => {
    collection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/deleteProduct/:id", (req, res) => {
    collection
      .findOneAndDelete({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send("deleted");
      });
  });

  app.patch("/editProduct/:id", (req, res) => {
    console.log(req.body);
    collection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            name: req.body.name,
            price: req.body.price,
            size: req.body.size,
            description: req.body.description,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  console.log("DB connected");
});

app.listen(PORT, () => {
  console.log("app is running");
});
