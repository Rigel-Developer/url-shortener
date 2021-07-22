require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const urlParser = require("url");
const app = express();
const shortId = require("shortid");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(mongoose.connection.readyState);

const urlSchema = new Schema({
  original_url: String, // String is shorthand for {type: String}
  short_url: String,
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
      if (!address) return res.json({ error: "Invalid URL" });

      const urlCode = shortId.generate();
      const url = new Url({ original_url: bodyUrl, short_url: urlCode });
      url.save((err, data) => {
        if (err) return console.error(err);
        res.json(data);
      });
    }
  );
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const short_url = req.params.short_url;
  Url.findOne({ short_url: short_url }, (err, data) => {
    if (!data) return res.json({ error: "Invalid URL" });
    res.redirect(data.original_url);
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
