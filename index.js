const express = require("express");
const bodyParser = require("body-parser");
// 1
const Keycloak = require("keycloak-connect");

const app = express();

// 2
const session = require("express-session");
const memoryStore = new session.MemoryStore();
app.use(
    session({
        secret: "secreeeeeet",
        resave: true,
        saveUninitialized: true, //false sur l'exemple
        store: memoryStore,
        cookie: {
            maxAge: 2 * 60 * 60 * 1000,
            secure: false,
        },
    })
);

// 3
const keycloak = new Keycloak({
    store: memoryStore,
});
app.use(bodyParser.json());

app.use(
    keycloak.middleware({
        logout: "/logout",
        admin: "/",
    })
);

app.get("/api/unsecured", function (req, res) {
    res.json({ message: "This is an unsecured endpoint payload" });
});

// 4
app.get("/api/user", keycloak.protect("realm:user"), function (req, res) {
    res.json({ message: "This is an USER endpoint payload" });
});

app.get("/api/admin", keycloak.protect("realm:admin"), function (req, res) {
    res.json({ message: "This is an ADMIN endpoint payload" });
});

app.listen(4200, (err) => {
    if (err) console.error(err);
    else console.log(`APP Listen to port : 4200`);
});
