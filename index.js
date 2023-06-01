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
    } else {
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
    } else res.redirect('/logout');
});

/* ---------------------------------- USER ---------------------------------- */
app.get('/auth/user/planning', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/planning_user.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/planning_user.html", { headers: { 'userType': 'user' } });
    } else res.redirect('/auth/dashboard');
})

app.get('/auth/user/statistics', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/statistics.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/statistics.html", { headers: { 'userType': 'user' } });
    } else res.redirect('/auth/dashboard');
})

app.get('/auth/user/account', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/account.html", { headers: { 'userType': 'dp' } });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/account.html", { headers: { 'userType': 'user' } });
    } else res.redirect('/auth/dashboard');
})

/* -------------------------- DIRECTEUR DE PLONGEE -------------------------- */
app.get('/auth/dp/scuba_file', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
    res.sendFile(__dirname + "/vue/html/dp/scuba_file.html", { headers: { 'userType': 'dp' } });
})

app.get('/auth/dp/incident_rapport', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
    res.download(__dirname + "/vue/rapport_incident.pdf", { headers: { 'userType': 'dp' } });
})

/* ---------------------------------- CLUB ---------------------------------- */
app.get('/auth/club/planning', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    res.sendFile(__dirname + "/vue/html/club/planning_club.html", { headers: { 'userType': 'club' } });
})

/* -------------------------------------------------------------------------- */
/*                                CLUB MEMBERS                                */
/* -------------------------------------------------------------------------- */

app.get('/auth/club/club_members', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    res.sendFile(__dirname + "/vue/html/club/club_members.html", { headers: { 'userType': 'club' } });
})

/* --------------------------------- CREATE --------------------------------- */
app.post('/auth/club/club_members', keycloak.protect(),
    body("Lastname").trim().escape(),
    body("Firstname").trim().escape(),
    body("Mail").trim().escape(),
    body("Phone").trim().escape(),
    body("Diver_Qualification").trim().escape(),
    body("Instructor_Qualification").trim().escape(),
    body("Nox_Level").trim().escape(),
    body("Additional_Qualifications").trim().escape(),
    body("License_Number").trim().escape(),
    body("License_Expiration_Date").trim().escape(),
    body("Medical_Certificate_Expiration_Date").trim().escape(),
    body("Birthdate").trim().escape(),
    body("password").trim().escape(),
    async function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        let responseKc = await Keycloak_module.createUser(req.body, getUserName(req));
        console.log("Now stocking in DB");
        if (responseKc) {
            Database.createUser(req.body, true, async (created) => {
                if (created) {
                    return res.json({ created: true });
                } else {
                    //delete user in keycloak   
                    await Keycloak_module.deleteUser(req.body.Mail);
                    return res.json({ created: false });
                }
            })
        } else {
            return res.json({ created: false });
        }
    })

/* ---------------------------------- READ ---------------------------------- */
app.get('/auth/club/get_club_members', keycloak.protect(), async function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    Database.getUsersList((users) => {
        return res.json(users);
    });
})

app.post('/auth/club/get_member_info', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    Database.getUserInfoByMail(req.body.Mail, (userInfo) => {
        userInfo.License_Expiration_Date = new Date(userInfo.License_Expiration_Date).toISOString().split('T')[0]
        userInfo.Medical_Certificate_Expiration_Date = new Date(userInfo.Medical_Certificate_Expiration_Date).toISOString().split('T')[0]
        return res.json(userInfo)
    })
})

/* --------------------------------- UPDATE --------------------------------- */
app.put('/auth/club/club_members', keycloak.protect(),
    body("Mail").trim().escape(),
    body("Phone").trim().escape(),
    body("Diver_Qualification").trim().escape(),
    body("Instructor_Qualification").trim().escape(),
    body("Nox_Level").trim().escape(),
    body("Additional_Qualifications").trim().escape(),
    body("License_Number").trim().escape(),
    body("License_Expiration_Date").trim().escape(),
    body("Medical_Certificate_Expiration_Date").trim().escape(),
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        let clientPassword = req.body.clientPassword
        delete req.body.clientPassword
        Database.getUserInfoById(req.body.Id_Diver, (userInfo) => {
            if (userInfo === undefined) return res.json({ deleted: false })
            console.log("Modifying user in DB");
            Database.modifUser(req.body, async (updated) => {
                if (!updated) res.json({ modified: false })
                const modifKc = await Keycloak_module.modifyUser(userInfo.Mail, req.body.Mail, getUserName(req), clientPassword)
                if (modifKc) return res.json({ modified: true })

                console.log("ERROR, setting old info of user in DB");
                Database.modifUser(userInfo, (isInser) => {
                    if (isInser) return res.json({ unmodified: true });
                    else return res.json({ unmodified: false });
                })
            })
        })
    })

/* --------------------------------- DELETE --------------------------------- */
app.delete('/auth/club/club_members', keycloak.protect(), async function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    console.log("Getting user info in DB");

    Database.getUserInfoByMail(req.body.Mail, (userInfo) => {
        if (userInfo === undefined) return res.json({ deleted: false })
        console.log("Deleting user in DB");

        Database.deleteUser(req.body.Mail, async (isDelDb) => {
            if (!isDelDb) return res.json({ deleted: false })
            console.log("Deleting user in KC");

            const isDelKc = await Keycloak_module.deleteUser(req.body.Mail, getUserName(req), req.body.password);
            if (isDelKc) return res.json({ deleted: true })

            console.log("ERROR, adding user in DB");
            Database.createUser(userInfo, false, (isInser) => {
                if (isInser) return res.json({ created: true });
                else return res.json({ created: false });
            })
        })
    })
})

/* -------------------------------------------------------------------------- */
/*                                  LOCATIONS                                 */
/* -------------------------------------------------------------------------- */

app.get('/auth/club/locations', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    res.sendFile(__dirname + "/vue/html/club/locations.html", { headers: { 'userType': 'club' } });
})

/* --------------------------------- CREATE --------------------------------- */
app.post("/auth/club/locations", keycloak.protect(),
    body("Site_Name").trim().escape(),  // Location
    body("Gps_Latitude").trim().escape().isNumeric(),
    body("Gps_Longitude").trim().escape().isNumeric(),
    body("Track_Type").trim().escape(),
    body("Track_Number").trim().escape(),
    body("Track_Name").trim().escape(),
    body("Zip_Code").trim().escape(),
    body("City_Name").trim().escape(),
    body("Country_Name").trim().escape(),
    body("Additional_Address").trim().escape(),
    body("Tel_Number").trim().escape().isLength({ min: 10, max: 10 }),
    body("Information_URL").trim().escape(),
    body("SOS_Tel_Number").trim().escape().isLength({ min: 10, max: 10 }),          // Emergency
    body("Emergency_Plan").trim().escape(),                                         //     /
    body("Post_Accident_Procedure").trim().escape(),                                //     /
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const dataEmergency = {
            SOS_Tel_Number: req.body.SOS_Tel_Number,
            Emergency_Plan: req.body.Emergency_Plan,
            Post_Accident_Procedure: req.body.Post_Accident_Procedure,
            Version: 0
        }
        delete req.body.SOS_Tel_Number;
        delete req.body.Emergency_Plan;
        delete req.body.Post_Accident_Procedure;

        console.log("Creating location in DB");
        Database.createDiveSite(req.body, (idLoc) => {
            if (idLoc === undefined) return res.json({ created: false, comment: "Impossible to add Location" })
            dataEmergency.Id_Emergency_Plan = idLoc;
            dataEmergency.Dive_Site_Id_Dive_Site = idLoc;
            Database.createEmergencyPlan(dataEmergency, (creaEm) => {
                if (creaEm) return res.json({ created: true, comment: "Location and Emergency Plan added" })
                else {
                    Database.deleteDiveSite({ Site_Name: req.body.Site_Name }, (delLoc) => {
                        if (delLoc) return res.json({ created: false, comment: "Impossible to add Emergency Plan" })
                        else return res.json({ created: false, comment: "Impossible to add Emergency Plan and Location" })
                    })
                }
            })
        })
    })

/* ---------------------------------- READ ---------------------------------- */
app.get("/auth/club/get_locations", keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    console.log("Getting all locations in DB");
    Database.getDiveSiteList((locations) => {
        return res.json(locations);
    });
})

app.post("/auth/club/get_location_info", keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    console.log("Getting location info in DB");
    Database.getDiveSiteInfoByName(req.body, (siteInfo) => {
        Database.getEmergencyPlan({ Id_Emergency_Plan: siteInfo.Id_Dive_Site }, (emergencyInfo) => {
            return res.json({ siteInfo: siteInfo, emergencyPlanInfo: emergencyInfo });
        })
    })
})

/* --------------------------------- UPDATE --------------------------------- */
app.put("/auth/club/locations", keycloak.protect(),
    body("Site_Name").trim().escape(),
    body("Gps_Latitude").trim().escape().isNumeric(),
    body("Gps_Longitude").trim().escape().isNumeric(),
    body("Track_Type").trim().escape(),
    body("Track_Number").trim().escape(),
    body("Track_Name").trim().escape(),
    body("Zip_Code").trim().escape(),
    body("City_Name").trim().escape(),
    body("Country_Name").trim().escape(),
    body("Additional_Address").trim().escape(),
    body("Tel_Number").trim().escape().isLength({ min: 10, max: 10 }),
    body("Information_URL").trim().escape(),
    body("SOS_Tel_Number").trim().escape().isLength({ min: 10, max: 10 }),          // Emergency
    body("Emergency_Plan").trim().escape(),                                         //     /
    body("Post_Accident_Procedure").trim().escape(),                                //     /
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        const dataEmergency = {
            Id_Emergency_Plan: req.body.Id_Emergency_Plan,
            Dive_Site_Id_Dive_Site: req.body.Dive_Site_Id_Dive_Site,
            SOS_Tel_Number: req.body.SOS_Tel_Number,
            Emergency_Plan: req.body.Emergency_Plan,
            Post_Accident_Procedure: req.body.Post_Accident_Procedure,
            Version: req.body.Version
        }
        delete req.body.Id_Emergency_Plan;
        delete req.body.Dive_Site_Id_Dive_Site;
        delete req.body.SOS_Tel_Number;
        delete req.body.Emergency_Plan;
        delete req.body.Post_Accident_Procedure;
        delete req.body.Version;

        console.log("Modifying location in DB");
        Database.getDiveSiteInfoById({ Id_Dive_Site: req.body.Id_Dive_Site }, (siteInfo) => {
            Database.modifDiveSite(req.body, (isUpdateSite) => {
                if (!isUpdateSite) return res.json({ modified: false, comment: "Impossible to update Location" });
                Database.modifEmergencyPlan(dataEmergency, (isUpdateEm) => {
                    if (isUpdateEm) return res.json({ modified: true, comment: "Location and Emergency Plan updated" });
                    else {
                        Database.modifDiveSite(siteInfo, (isUpdateSite) => {
                            if (!isUpdateSite) return res.json({ modified: false, comment: "Impossible to cancel update of Location" });
                            else return res.json({ modified: false, comment: "Impossible to update Emergency Plan" });
                        })
                    }
                })
            })
        })
    })

/* --------------------------------- DELETE --------------------------------- */
app.delete("/auth/club/locations", keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    console.log("Deleting location in DB");
    Database.getDiveSiteInfoByName(req.body, (siteInfo) => {
        Database.deleteEmergencyPlan({Id_Emergency_Plan:siteInfo.Id_Dive_Site}, (isDelete) => {
            if (!isDelete) return res.json({ deleted: false, comment: "Impossible to delete Emergency Plan" });
            Database.deleteDiveSite(req.body, (isDelete) => {
                if (isDelete) return res.json({ deleted: true, comment: "Location and Emergency Plan deleted" });
                else{
                    Database.createEmergencyPlan(siteInfo, (isCreate) => {
                        if (!isCreate) return res.json({ deleted: false, comment: "Impossible to recreate Emergency Plan" });
                        else return res.json({ deleted: false, comment: "Impossible to delete Location" });
                    })
                }
            })
        })
    })
})





http.listen(port, hostname, (err) => {
    if (err) console.error(err);
    else console.log(`Server running at http://${hostname}:${port}`);
});
