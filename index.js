const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

var users = [];

app.post('/register-user', (req, res) => {
    let username = req.body.user;
    users.push(username);
    res.send(`user ${req.body.user} registered`);
});

app.get('/list-users', (req, res) => {
    res.send(users);
});

app.listen(port, () => {
    console.log(`bisous server listening on port ${port}!`);
});