"use strict";
const express = require("express");
const DB = require("./db");
const config = require("./config/dev.env");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

const app = express();
const db = new DB("sqlitedb");
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};

const path = require("path");
app.use(express.static(path.join(__dirname, "dist/")));

app.use(allowCrossDomain);

router.post("/register", function(req, res) {
  db.insert(
    [req.body.name, req.body.email, bcrypt.hashSync(req.body.password, 8)],
    function(err) {
      if (err)
        return res
          .status(500)
          .send("There was a problem registering the user.");
      db.selectByEmail(req.body.email, (err, user) => {
        if (err)
          return res.status(500).send("There was a problem getting user");
        let token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: user });
      });
    }
  );
});

router.post("/register-admin", function(req, res) {
  db.insertAdmin(
    [req.body.name, req.body.email, bcrypt.hashSync(req.body.password, 8), 1],
    function(err) {
      if (err)
        return res
          .status(500)
          .send("There was a problem registering the admin.");
      db.selectByEmail(req.body.email, (err, user) => {
        if (err)
          return res.status(500).send("There was a problem getting admin");
        let token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, user: user });
      });
    }
  );
});

router.post("/login", (req, res) => {
  db.selectByEmail(req.body.email, (err, user) => {
    if (err) return res.status(500).send("Error on the server.");
    if (!user) return res.status(404).send("No user found.");
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass);
    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });
    let token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).send({ auth: true, token: token, user: user });
  });
});
app.use(router);

app.listen(PORT, function() {
  console.log(`Backend express server running on localhost:${PORT}`);
});
