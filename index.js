const express = require("express");
const { Pool, Client } = require("pg");
const crypto = require("crypto");
const dotenv = require("dotenv");
const lodash = require("lodash");

const app = express();
const port = process.env.PORT || 3000;

const config = dotenv.config();

if (!("error" in config)) {
  envs = config.parsed;
} else {
  envs = {};
  lodash.each(process.env, (value, key) => (envs[key] = value));
}

const db = new Pool({
  connectionString: envs.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const keyOptions = {
  modulusLength: 1024 * 2,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
};

const getPublicKey = () => {
  return crypto.createPublicKey({
    key: getPrivateKey(),
    format: "pem",
    type: "pkcs8",
  });
};

const getPrivateKey = () => {
  // Private key only saved on server, not on GitHub
  const privateKeyData = envs.PRIVATE_KEY;
  console.log(privateKeyData);
  
  return crypto.createPrivateKey({
    key: Buffer.from(privateKeyData),
    format: "pem",
    type: "pkcs8",
  });
};

app.use(express.json());

var users = [];

app.post("/register-user", (req, res) => {
  let username = req.body.user;
  db.query(`INSERT INTO user (user) VALUES ('${username}')`, () => {});
  res.send(`user ${req.body.user} registered`);
});

app.get("/list-users", (req, res) => {
  res.send(users);
});

app.get("/public-key", (req, res) => {
  // Make sure public key is accessible
  res.send(getPublicKey().export(keyOptions.publicKeyEncoding));
});

app.listen(port, () => {
  console.log(`bisous server listening on port ${port}!`);
});
