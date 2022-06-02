const express = require("express");
const { Pool, Client } = require("pg");
const crypto = require("crypto");
const dotenv = require("dotenv");
const lodash = require("lodash");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const config = dotenv.config();

const isAlnum = new RegExp(/^[0-9a-zA-Z]+$/);

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
  var key = envs.PRIVATE_KEY
  key = key.replace('- ', '-\n');
  key = key.replace(' -', '\n-');

  return crypto.createPrivateKey({
    key: key,
    format: "pem",
    type: "pkcs8",
  });
};

app.get("/", (_, res) => {
  fs.readFile("./index.html", "utf-8", (err, data) => {
    if (err) {
      throw err;
    }

    res.send(data);
  });
});

app.post("/register-user", (req, res) => {
  let username = req.body.user;
  if (isAlnum.test(username)) {
    db.query(`INSERT INTO users ("user") VALUES ('${username}');`, (err, _) => {});
    res.send(`user ${req.body.user} registered`);
  } else {
    res.send(`user ${req.body.user} not registered`);
  }
});

app.get("/public-key", (req, res) => {
  // Make sure public key is accessible
  res.send(getPublicKey().export(keyOptions.publicKeyEncoding));
});

const deleteSocket = (socket) => {
  db.query(`DELETE FROM users WHERE socket = '${socket}';`, (err, _) => {});
}
const registerSocket = (socket, user) => {
  deleteSocket(socket);
  console.log(socket, user);
  db.query(`INSERT INTO users ("user", "socket") VALUES ('${user}', '${socket}');`, (err, _) => {});
}

var server = app.listen(port, () => {
  console.log(`bisous server listening on port ${port}!`);
});

var io = require("socket.io")(server, {
  cors: {
    origins: "*:*",
  },
});

io.on("connection", (socket) => {
  // when a new client connects, add them to the socket list
  console.log('new connection' + socket.id)
  socket.on('socket', (user, _) => {
    console.log('socket!');
    if (user === undefined) {
      deleteSocket(socket.id);
    } else {
      registerSocket(socket.id, user);
    }
  })
});
