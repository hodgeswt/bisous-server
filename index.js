const express = require("express");
const { Pool, Client } = require("pg");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3000;

const db_url = ENV["DATABASE_URL"];

const db = new Pool({
  connectionString: db_url,
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
  try {
    // Private key only saved on server, not on GitHub
    const privateKeyData = ENV["PRIVATE_KEY"];
    const privateKeyBuffer = String(Buffer.from(privateKeyData, "base64"));

    const privateKey = crypto.createPrivateKey({
      key: privateKeyBuffer,
      format: "pem",
      type: "pkcs8",
    });

    return privateKey;
  } catch (e) {
    console.log("Please set PRIVATE_KEY environment variable");
  }
};

app.use(express.json());

var users = [];

app.post("/register-user", (req, res) => {
  let username = req.body.user;
  db.query(
      `INSERT INTO user (user) VALUES ('${username}')`,
      () => {}
  )
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
