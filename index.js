const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const { body, validationResult } = require("express-validator");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const { BDD } = require('./model/BDD/bdd');
const Database = new BDD;

const Keycloak_module = require("./model/Keycloak/keycloak");

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

const hostname = process.env.HOSTNAME;
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "vue")));
app.use(
    session({
        secret: 'mySecret',
        resave: false,
        saveUninitialized: true,
        store: memoryStore
    })
);
app.use(keycloak.middleware());

function checkUser(req, location) {
    if (req.kauth.grant.access_token.content.resource_access.SDMS_connect) {
        const roles = req.kauth.grant.access_token.content.resource_access.SDMS_connect.roles;
        if (roles.includes(location)) return true;
        else return false;
    }
}

function getUserName(req) {
    return req.kauth.grant.access_token.content.preferred_username;
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/vue/html/index.html");
});

/* --------------------------------- COMMON --------------------------------- */
app.get('/login', keycloak.protect(), function (req, res) {
    if (req.kauth.grant.access_token.content.resource_access.SDMS_connect) {
        const roles = req.kauth.grant.access_token.content.resource_access.SDMS_connect.roles;
        if (roles.includes("USER") || roles.includes("DP") || roles.includes("CLUB")) {
            res.redirect("/auth/dashboard");
        }
        else res.redirect('/logout');
    }
    else {
        console.log("Aucun rôle valide");
        res.redirect('/logout');
    }
});

app.get('/auth/dashboard', keycloak.protect(), function (req, res) {
    if (checkUser(req, "CLUB")) {
        res.sendFile(__dirname + "/vue/html/dashboard.html", { headers: { 'userType': 'club' } });
    } else if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/dashboard.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/dashboard.html", { headers: { 'userType': 'user' } });
    }
    else res.redirect('/logout');
});

/* ---------------------------------- USER ---------------------------------- */
app.get('/auth/user/planning', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/planning_user.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/planning_user.html", { headers: { 'userType': 'user' } });
    }
    else res.redirect('/auth/dashboard');
})

app.get('/auth/user/statistics', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/statistics.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/statistics.html", { headers: { 'userType': 'user' } });
    }
    else res.redirect('/auth/dashboard');
})

app.get('/auth/user/account', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/account.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/account.html", { headers: { 'userType': 'user' } });
    }
    else res.redirect('/auth/dashboard');
})

/* -------------------------- DIRECTEUR DE PLONGEE -------------------------- */
app.get('/auth/dp/scuba_file', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/dp/scuba_file.html", { headers: { 'userType': 'dp' } });
    }
    else res.redirect('/auth/dashboard');
})

app.get('/auth/dp/incident_rapport', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.download(__dirname + "/vue/rapport_incident.pdf", { headers: { 'userType': 'dp' } });
    }
    else res.redirect('/auth/dashboard');
})

/* ---------------------------------- CLUB ---------------------------------- */
app.get('/auth/club/planning', keycloak.protect(), function (req, res) {
    if (checkUser(req, "CLUB")) {
        res.sendFile(__dirname + "/vue/html/club/planning_club.html", { headers: { 'userType': 'club' } });
    }
    else res.redirect('/auth/dashboard');
})

app.get('/auth/club/club_members', keycloak.protect(), function (req, res) {
    if (checkUser(req, "CLUB")) {
        res.sendFile(__dirname + "/vue/html/club/club_members.html", { headers: { 'userType': 'club' } });
    }
    else res.redirect('/auth/dashboard');
})

app.get('/auth/club/locations', keycloak.protect(), function (req, res) {
    if (checkUser(req, "CLUB")) {
        res.sendFile(__dirname + "/vue/html/club/locations.html", { headers: { 'userType': 'club' } });
    }
    else res.redirect('/auth/dashboard');
})


app.post('/auth/club/club_members', keycloak.protect(),
    body("lastname").trim().escape(),
    body("firstname").trim().escape(),
    body("mail").trim().escape(),
    body("phone").trim().escape(),
    body("diver_qualif").trim().escape(),
    body("instru_qualif").trim().escape(),
    body("nox_lvl").trim().escape(),
    body("license_nb").trim().escape(),
    body("license_expi").trim().escape(),
    body("medic_certif_expi").trim().escape(),
    body("birthdate").trim().escape(),
    body("password").trim().escape(),
    async function (req, res) {
        if (checkUser(req, "CLUB")) {
            const response = await Keycloak_module.createUser(req.body, getUserName(req));
            res.send({created:response});
        }
        else res.redirect('/auth/dashboard');
    })




http.listen(port, hostname, (err) => {
    if (err) console.error(err);
    else console.log(`Server running at http://${hostname}:${port}`);
});
