const express = require("express");
const { Pool, Client } = require("pg");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

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
    const privateKeyData = fs.readFileSync("private.pem");
    const privateKeyBuffer = String(Buffer.from(privateKeyData, "base64"));

    const privateKey = crypto.createPrivateKey({
      key: privateKeyBuffer,
      format: "pem",
      type: "pkcs8",
    });

    return privateKey;
  } catch (e) {
    return createPrivateKey();
  }
};

const createPrivateKey = () => {
  const keyData = crypto.generateKeyPairSync("rsa", keyOptions);

  fs.writeFileSync("private.pem", keyData.privateKey);

  const privateKey = crypto.createPrivateKey({
    key: keyData.privateKey,
    format: "pem",
    type: "pkcs8",
  });

  return privateKey;
};

app.use(express.json());

var users = [];

app.post("/register-user", (req, res) => {
  let username = req.body.user;
  users.push(username);
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
