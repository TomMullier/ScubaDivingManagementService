const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const app = express();
const http = require("http").Server(app);

const memoryStore = new session.MemoryStore();

const hostname = "10.224.1.186";
const port = 3000;


app.use(
    session({
        secret: 'mySecret',
        resave: false,
        saveUninitialized: true,
        store: memoryStore
    })
);

const keycloak = new Keycloak({ store: memoryStore });

app.use(bodyParser.json());

app.use(keycloak.middleware());


app.get('/', function (req, res) {
    res.json({ message: 'This is home' });
});

app.get('/login', keycloak.protect(), function (req, res) {
    res.json({ message: 'connected' });
});

http.listen(port, hostname, (err) => {
    if (err) {
        console.error(err);
    }
    {
        console.log(`Server running at http://${hostname}:${port}`);
    }
});
