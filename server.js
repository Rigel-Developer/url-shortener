require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const urlParser = require("url");
const app = express();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(mongoose.connection.readyState);

const urlSchema = new Schema({
  url: String, // String is shorthand for {type: String}
});

const Url = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const bodyUrl = req.body.url;
  const preUrl = dns.lookup(
    urlParser.parse(bodyUrl).hostname,
    (err, address) => {
      console.log(err);
      if (!address) return res.json({ error: "Invalid URL" });

      const url = new Url({ url: bodyUrl });
      url.save((err, data) => {
        if (err) return console.error(err);
        res.json(data);
      });
    }
  );
});

app.get("/api/shorturl/:id", function (req, res) {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) return res.json({ error: "Invalid URL" });
    res.redirect(data.url);
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
