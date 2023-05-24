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

// 3
app.use(
    keycloak.middleware()
);


app.get('/', function (req, res) {
    res.json({ message: 'This is home' });
});

app.get('/api/unsecured', function (req, res) {
    res.json({ message: 'This is an unsecured endpoint payload' });
});
// 4
app.get('/api/pn', keycloak.protect('realm:app_pn'), function (req, res) {
    res.json({ message: 'This is an PN endpoint payload' });
});
app.get('/api/dp', keycloak.protect('realm:app_dp'), function (req, res) {
    res.json({ message: 'This is an DP endpoint payload' });
});

http.listen(port,hostname, (err) => {
    if (err) {
        console.error(err);
    }
    {
        console.log(`Server running at http://${hostname}:${port}`);
    }
});
