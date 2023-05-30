const express = require("express");
const bodyParser = require("body-parser");
// 1

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

app.use(bodyParser.json());


const path = require("path");

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/Vue/HTML/index.html"));
});
app.get("/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname + "/Vue/HTML/user_recap.html"));
});
app.get("/reservation", function (req, res) {
    res.sendFile(path.join(__dirname + "/Vue/HTML/reservation.html"));
});
app.get("/profile", function (req, res) {
    res.sendFile(path.join(__dirname + "/Vue/HTML/my_profile.html"));
});

app.get("/dive_report", function (req, res) {
    res.sendFile(path.join(__dirname + "/Vue/HTML/dive_report.html"));
});

app.use(express.static(path.join(__dirname, "Vue")));
app.listen(4200, (err) => {
    if (err) console.error(err);
    else console.log(`APP Listen to port : 4200`);
});