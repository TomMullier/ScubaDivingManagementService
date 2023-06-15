require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const fileUpload = require('express-fileupload');
const Sharp = require('sharp');

const {
    body,
    validationResult
} = require("express-validator");
const fs = require('fs');

const app = express();
const http = require("http").Server(app);
const path = require("path");
const {
    BDD
} = require('./model/BDD/bdd');
const Database = new BDD;

const Keycloak_module = require("./model/Keycloak/keycloak");

const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({
    store: memoryStore
});

const hostname = process.env.IP_HOSTNAME;
const port = 3000;

app.use(fileUpload({
    useTempFiles: true
}));

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

function getDateFormat(badDate) {
    badDate += '';
    badDate = new Date(badDate).toLocaleString('fr-FR', {
        hour12: false
    })
    const day = badDate.split(', ')[0].split("/")[0].padStart(2, "0");
    const month = badDate.split(', ')[0].split("/")[1].padStart(2, "0");
    const year = badDate.split(', ')[0].split("/")[2];
    const hour = badDate.split(', ')[1];
    return year + "-" + month + "-" + day + " " + hour;
}

function cropToSquare(imagePath) {
    return new Promise((resolve, reject) => {
        Sharp(imagePath)
            .metadata()
            .then(metadata => {
                const {
                    width,
                    height
                } = metadata;
                const size = Math.min(width, height);
                const x = Math.floor((width - size) / 2);
                const y = Math.floor((height - size) / 2);

                let newPath = imagePath.replace("TOCROP", "");
                Sharp(imagePath)
                    .extract({
                        left: x,
                        top: y,
                        width: size,
                        height: size
                    })
                    .resize(500) // Définissez ici la taille souhaitée du carré
                    .toFile(newPath, (err, info) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(info);
                        }
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */
app.get('/', (req, res) => res.sendFile(__dirname + "/vue/html/index.html"));


/* --------------------------------- COMMON --------------------------------- */
app.get('/login', keycloak.protect(), function (req, res) {
    if (req.kauth.grant.access_token.content.resource_access.SDMS_connect) {
        const roles = req.kauth.grant.access_token.content.resource_access.SDMS_connect.roles;
        if (roles.includes("USER") || roles.includes("DP") || roles.includes("CLUB")) {
            res.redirect("/auth/dashboard");
        } else res.redirect('/logout');
    } else {
        console.log("User tried to connect without valid roles");
        res.redirect('/logout');
    }
});

app.post('/auth/upload_pp', keycloak.protect(), function (req, res) {
    //vérifie s'il y a une image dans la requête
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("No profile picture in the request");
        return res.redirect('/auth/user/account');
    }

    // on recoit un jpg, stocke le dans le dossier img/userMail/userMail.jpg
    let userMail = new String(req.kauth.grant.access_token.content.preferred_username);
    userMail = userMail.replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");
    console.log("Uploading profile picture for " + userMail);

    // si le dossier n'existe pas, crée le
    if (!fs.existsSync(__dirname + "/model/img/" + userMail)) {
        fs.mkdirSync(__dirname + "/model/img/" + userMail);
    }
    const {
        image
    } = req.files;
    if (!image) return res.sendStatus(400);

    // Move the uploaded image to our upload folder
    image.mv(__dirname + '/model/img/' + userMail + '/TOCROP' + userMail + '.jpg', function (err) {
        if (err) {
            console.log("Error while uploading profile picture for " + userMail);
            console.log(err);
        } else {
            console.log("Profile picture uploaded for " + userMail);
            cropToSquare(__dirname + '/model/img/' + userMail + '/TOCROP' + userMail + '.jpg')
                .then(info => {
                    console.log('\t->Image recadrée avec succès');
                    fs.unlinkSync(__dirname + '/model/img/' + userMail + '/TOCROP' + userMail + '.jpg');
                })
                .catch(err => {
                    console.error('Erreur lors du recadrage de l\'image:', err);
                });
        }
        return res.redirect('/auth/user/account');
    });
})

app.post('/auth/user_pp', keycloak.protect(), function (req, res) {
    let userMail = new String(req.body.mail);
    userMail = userMail.replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");
    // send profile picture, located in the img folder, userMail to the front
    // adapate en fonction de l'extension du fichier : png, jpg ou jpeg
    if (fs.existsSync(__dirname + "/model/img/" + userMail + "/" + userMail + ".jpg")) {
        fs.readFile(__dirname + "/model/img/" + userMail + "/" + userMail + ".jpg", (err, data) => {
            if (err) {
                console.log("No profile picture for " + userMail);
            }
            console.log("Sending profile picture for " + userMail);
            res.setHeader("Content-Type", "image/jpg");
            res.send(data);
        });
    } else {
        console.log("No profile picture for " + userMail);
    }
})

app.get('/auth/incident_rapport', keycloak.protect(), function (req, res) {
    if (req.kauth.grant.access_token.content.resource_access.SDMS_connect) {
        const roles = req.kauth.grant.access_token.content.resource_access.SDMS_connect.roles;
        if (roles.includes("USER") || roles.includes("DP") || roles.includes("CLUB")) {
            res.download(__dirname + "/model/img/rapport_incident.pdf");
        } else res.redirect('/logout');
    } else {
        console.log("User tried to connect without valid roles");
        res.redirect('/logout');
    }
})

/* -------------------------------------------------------------------------- */
/*                                  DASHBORAD                                 */
/* -------------------------------------------------------------------------- */

app.get('/auth/dashboard', keycloak.protect(), function (req, res) {
    if (checkUser(req, "CLUB")) res.sendFile(__dirname + "/vue/html/dashboard.html", {
        headers: {
            'userType': 'club'
        }
    });
    else if (checkUser(req, "DP")) res.sendFile(__dirname + "/vue/html/dashboard.html", {
        headers: {
            'userType': 'dp'
        }
    });
    else if (checkUser(req, "USER")) res.sendFile(__dirname + "/vue/html/dashboard.html", {
        headers: {
            'userType': 'user'
        }
    });
    else res.redirect('/logout');
});

app.get('/auth/dashboard/get_info', keycloak.protect(), function (req, res) {
    let username = req.kauth.grant.access_token.content.preferred_username;
    if (checkUser(req, "CLUB")) {
        Database.getPlanning((allEvents) => {
            Database.getDiveSiteList((allLocations) => {
                allEvents.forEach(event => {
                    event.Location = allLocations.filter(location => location.Id_Dive_Site === event.Dive_Site_Id_Dive_Site)[0];
                });
                return res.json({
                    userInfo: username,
                    registrationList: allEvents
                });
            });
        });
    } else {
        Database.getUserInfoByMail(username, (userInfo) => {
            if (userInfo === undefined) return res.json({
                userInfo: username
            });

            Database.getRegistrationList(userInfo.Id_Diver, (registrationList) => {
                if (registrationList === undefined) {
                    return res.json({
                        userInfo: userInfo
                    });
                }
                Database.getDiveSiteList((allLocations) => {
                    registrationList.forEach(event => {
                        event.Location = allLocations.filter(location => location.Id_Dive_Site === event.Dive_Site_Id_Dive_Site)[0];
                    });
                    return res.json({
                        userInfo: userInfo,
                        registrationList: registrationList
                    });
                })
            });
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                                  PLANNING                                  */
/* -------------------------------------------------------------------------- */

app.get('/auth/planning', keycloak.protect(), function (req, res) {
    if (checkUser(req, "CLUB")) res.sendFile(__dirname + "/vue/html/planning.html", {
        headers: {
            'userType': 'club'
        }
    });
    else if (checkUser(req, "DP")) res.sendFile(__dirname + "/vue/html/planning.html", {
        headers: {
            'userType': 'dp'
        }
    });
    else if (checkUser(req, "USER")) res.sendFile(__dirname + "/vue/html/planning.html", {
        headers: {
            'userType': 'user'
        }
    });
    else res.redirect('/auth/dashboard');
})

/* --------------------------------- CREATE --------------------------------- */
app.post('/auth/planning', keycloak.protect(),
    body("Start_Date").trim().escape(),
    body("End_Date").trim().escape(),
    body("Diver_Price").trim().escape(),
    body("Instructor_Price").trim().escape(),
    body("Site_Name").trim(),
    body("Comments").trim(),
    body("Special_Needs").trim(),
    body("Status").trim().escape(),
    body("Max_Divers").trim().escape(),
    body("Dive_Type").trim().escape(),
    body("dp").trim().escape().exists(), //mail
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        console.log("--- Trying to create event --'");
        Database.getUserInfoByMail(req.body.dp, infoDp => {
            if (req.body.Dive_Type === "Exploration" && infoDp.Diver_Qualification !== "P5") {
                console.log("\t->Error, DP is not P5");
                return res.json({
                    created: false,
                    comment: "DP is not P5"
                })
            } else if (req.body.Dive_Type === "Technique" && infoDp.Diver_Qualification !== ("E3" || "E4")) {
                console.log("\t->Error, DP is not E3 or E4");
                return res.json({
                    created: false,
                    comment: "DP is not E3 or E4"
                })
            }
            delete req.body.dp;
            let Site_Name = req.body.Site_Name;
            delete req.body.Site_Name;

            req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date));
            req.body.End_Date = getDateFormat(new Date(req.body.End_Date));
            Database.getDiveSite({
                Site_Name: Site_Name
            }, siteInfo => {
                if (siteInfo == undefined) {
                    console.log("\t->Error, Dive Site doesn't exist");
                    return res.json({
                        created: false,
                        comment: "Dive Site doesn't exist"
                    })
                }
                req.body.Dive_Site_Id_Dive_Site = siteInfo.Id_Dive_Site;
                Database.getEvent(req.body, (event) => {
                    if (event) {
                        console.log("\t->Error, Event already exist");
                        return res.json({
                            created: false,
                            comment: "Event already exist"
                        });
                    }


                    Database.createEvent(req.body, (isInserted) => {
                        if (!isInserted) {
                            console.log("\t->Error, impossible to add Event");
                            return res.json({
                                created: false,
                                comment: "Impossible to add Event"
                            });
                        } else {
                            console.log("\t->Event added");
                            return res.json({
                                created: true,
                                comment: "Event added"
                            });
                        }
                    });
                });
            });
        });
    });

app.post('/auth/planning/set_rate', keycloak.protect(),
    body("Site_Name").trim(),
    body("General_Rate").trim().escape(),
    body("Location_Rate").trim().escape(),
    body("Organisation_Rate").trim().escape(),
    body("Conditions_Rate").trim().escape(),
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        console.log("--- Trying to rate location ---");
        Database.getUserInfoByMail(req.kauth.grant.access_token.content.preferred_username, infoDiver => {
            if (infoDiver === undefined) {
                console.log("\t->Error, User doesn't exist");
                return res.json({
                    rated: false,
                    comment: "User doesn't exist"
                })
            }
            req.body.Event.Start_Date = getDateFormat(new Date(req.body.Event.Start_Date).toLocaleString());
            req.body.Event.End_Date = getDateFormat(new Date(req.body.Event.End_Date).toLocaleString());

            Database.getDiveSite({
                Site_Name: req.body.Site_Name
            }, (locationInfo) => {
                if (locationInfo === undefined) {
                    console.log("\t->Error, Location doesn't exist");
                    return res.json({
                        rated: false,
                        comment: "Location doesn't exist"
                    })
                }
                req.body.Event.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                Database.getEvent(req.body.Event, (event) => {
                    if (event === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            rated: false,
                            comment: "Event doesn't exist"
                        })
                    }
                    Database.getRegistration({
                        Diver_Id_Diver: infoDiver.Id_Diver,
                        Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
                    }, (registration) => {
                        if (registration === undefined) {
                            console.log("\t->Error, User is not register");
                            return res.json({
                                rated: false,
                                comment: "User is not register"
                            })
                        }
                        if (registration.Has_Voted == "1") {
                            console.log("\t->Error, User has already voted");
                            return res.json({
                                rated: false,
                                comment: "User has already voted"
                            })
                        }
                        Database.modifRegistration({
                            Has_Voted: true,
                            Diver_Id_Diver: infoDiver.Id_Diver,
                            Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
                        }, (modified) => {
                            if (!modified) {
                                console.log("\t->Error, impossible to modify registration");
                                return res.json({
                                    rated: false,
                                    comment: "Impossible to modify registration"
                                })
                            }
                            locationInfo.Rate_Number++;
                            Database.modifDiveSite({
                                Id_Dive_Site: locationInfo.Id_Dive_Site,
                                General_Rate: req.body.General_Rate,
                                Location_Rate: req.body.Location_Rate,
                                Organisation_Rate: req.body.Organisation_Rate,
                                Conditions_Rate: req.body.Conditions_Rate,
                                Rate_Number: locationInfo.Rate_Number
                            }, (rated) => {
                                if (!rated) {
                                    console.log("\t->Error, impossible to rate location");
                                    return res.json({
                                        rated: false,
                                        comment: "Impossible to rate location"
                                    })
                                }
                            });
                        });
                    });
                });
            });

        });
    });

app.post('/auth/planning/edit_palanquee', keycloak.protect(),
    body("Start_Date").trim().escape(),
    body("End_Date").trim().escape(),
    body("Diver_Price").trim().escape(),
    body("Instructor_Price").trim().escape(),
    body("Site_Name").trim(),
    body("Comments").trim(),
    body("Special_Needs").trim(),
    body("Status").trim().escape(),
    body("Max_Divers").trim().escape(),
    body("Dive_Type").trim().escape(),
    function (req, res) {
        if (!checkUser(req, "DP")) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        const username = req.kauth.grant.access_token.content.preferred_username;
        req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
        req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());

        console.log("--- Trying to create dive ---");

        let day = new Date(req.body.Start_Date).getDate();
        let now = new Date().getDate();
        if (day != now) {
            console.log("\t->Error, date is not today");
            return res.json({
                edited: false,
                comment: "Impossible because date is not today"
            });
        }
        Database.getUserInfoByMail(username, infoDp => {
            if (infoDp === undefined) {
                console.log("\t->Error, DP doesn't exist");
                return res.json({
                    created: false,
                    comment: "DP doesn't exist"
                });
            }
            Database.getDiveSite({
                Site_Name: req.body.Site_Name
            }, (locationInfo) => {
                if (locationInfo === undefined) {
                    console.log("\t->Error, Dive Site doesn't exist");
                    return res.json({
                        created: false,
                        comment: "Dive Site doesn't exist"
                    });
                }
                req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                delete req.body.Site_Name;
                Database.getEvent(req.body, (event) => {
                    if (event === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            created: false,
                            comment: "Event doesn't exist"
                        });
                    }
                    Database.getDiversRegistered(diverList => {
                        if (diverList === undefined) diverList = [];
                        diverList = diverList.filter(diver => diver.Planned_Dive_Id_Planned_Dive == event.Id_Planned_Dive);
                        if (Object.keys(diverList).length < 2) {
                            console.log("\t->Error, not enough divers");
                            return res.json({
                                created: false,
                                comment: "Not enough divers"
                            });
                        }

                        Database.getDive({
                            Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
                        }, (dive) => {
                            if (dive) {
                                req.session.idDive = dive.Id_Dive;
                                console.log("\t----->Dive already exist, redirection");
                                return res.json({
                                    created: true,
                                    comment: "Dive already exist, but it's ok"
                                });
                            }
                            let data = {
                                Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive,
                                Diver_Id_Diver: infoDp.Id_Diver,
                                Start_Date: req.body.Start_Date,
                                End_Date: req.body.End_Date,
                                Diver_Price: req.body.Diver_Price,
                                Instructor_Price: req.body.Instructor_Price,
                                Comments: req.body.Comments,
                                Surface_Security: "",
                                Max_Ppo2: 0,
                            }
                            Database.createDive(data, (isInserted) => {
                                if (!isInserted) {
                                    console.log("\t->Error, impossible to add Dive");
                                    return res.json({
                                        created: false,
                                        comment: "Impossible to add Dive"
                                    });
                                } else {
                                    console.log("\t->Dive added");
                                    Database.getDive({
                                        Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
                                    }, (newDive) => {
                                        if (newDive === undefined) {
                                            console.log("\t->Error, Dive doesn't exist");
                                            return res.json({
                                                created: false,
                                                comment: "Dive doesn't exist"
                                            });
                                        }
                                        req.session.idDive = newDive.Id_Dive;
                                        return res.json({
                                            created: true,
                                            comment: "Dive added"
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    });


/* ---------------------------------- READ ---------------------------------- */

app.get('/auth/planning/get_planning', keycloak.protect(), function (req, res) {
    Database.getPlanning((allEvents) => {
        Database.getDiveSiteList((allLocations) => {
            Database.getDiversRegistered((allDivers) => {
                if (allDivers === undefined) allDivers = [];
                allEvents.forEach(event => {
                    event.Location = allLocations.filter(location => location.Id_Dive_Site === event.Dive_Site_Id_Dive_Site)[0];
                    event.Users = allDivers.filter(diver => diver.Planned_Dive_Id_Planned_Dive == event.Id_Planned_Dive);
                });

                if (checkUser(req, "CLUB")) {
                    Database.getUsersList((allUsers) => {
                        return res.json({
                            allEvents,
                            allLocations,
                            allUsers
                        })
                    })
                } else {
                    let username = req.kauth.grant.access_token.content.preferred_username;
                    allEvents = allEvents.filter(event => {
                        if (event.Status === "true") {
                            let isRegistered = false;
                            event.Users.forEach(user => {
                                if (user.Mail === username) isRegistered = true;
                            });
                            return isRegistered;
                        } else return true;
                    });
                    return res.json({
                        allEvents,
                        allLocations
                    });
                }
            })
        })
    });
})

app.post('/auth/planning/has_voted', keycloak.protect(),
    body("Start_Date").trim().escape(),
    body("End_Date").trim().escape(),
    body("Diver_Price").trim().escape(),
    body("Instructor_Price").trim().escape(),
    body("Site_Name").trim(),
    body("Comments").trim(),
    body("Special_Needs").trim(),
    body("Status").trim().escape(),
    body("Max_Divers").trim().escape(),
    body("Dive_Type").trim().escape(),

    function (req, res) {
        let mail = req.kauth.grant.access_token.content.preferred_username;
        req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
        req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());
        Database.getUserInfoByMail(mail, (userInfo) => {
            if (userInfo === undefined) return res.json({
                hasVoted: false,
                comment: "User doesn't exist"
            });
            Database.getDiveSite({
                Site_Name: req.body.Site_Name
            }, (locationInfo) => {
                if (locationInfo === undefined) return res.json({
                    hasVoted: false,
                    comment: "Location doesn't exist"
                });
                req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                delete req.body.Site_Name;
                Database.getEvent(req.body, (eventInfo) => {
                    if (eventInfo === undefined) return res.json({
                        hasVoted: false,
                        comment: "Event doesn't exist"
                    });
                    Database.getRegistration({
                        Diver_Id_Diver: userInfo.Id_Diver,
                        Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                    }, (registration) => {
                        if (registration === undefined) return res.json({
                            hasVoted: false,
                            comment: "User is not register"
                        });
                        return res.json({
                            hasVoted: registration.Has_Voted
                        });
                    });
                });

            });
        });
    });




/* --------------------------------- UPDATE --------------------------------- */
app.put('/auth/planning', keycloak.protect(),
    body("Start_Date").trim().escape(),
    body("End_Date").trim().escape(),
    body("Diver_Price").trim().escape(),
    body("Instructor_Price").trim().escape(),
    body("Site_Name").trim(),
    body("Comments").trim(),
    body("Special_Needs").trim(),
    body("Status").trim().escape(),
    body("Max_Divers").trim().escape(),
    body("Dive_Type").trim().escape(),
    body("dp").trim().escape(), //mail
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
        req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());
        req.body.oldEvent.Start_Date = getDateFormat(new Date(req.body.oldEvent.Start_Date).toLocaleString());
        req.body.oldEvent.End_Date = getDateFormat(new Date(req.body.oldEvent.End_Date).toLocaleString());

        let oldEvent = req.body.oldEvent;
        delete req.body.oldEvent;
        console.log("--- Trying to modify event ---");
        Database.getUserInfoByMail(req.body.dp, infoDp => {
            if (req.body.Dive_Type === "Exploration" && infoDp.Diver_Qualification !== "P5") {
                console.log("\t->Error, DP is not P5");
                return res.json({
                    created: false,
                    comment: "DP is not P5"
                })
            } else if (req.body.Dive_Type === "Technique" && infoDp.Diver_Qualification !== ("E3" || "E4")) {
                console.log("\t->Error, DP is not E3 or E4");
                return res.json({
                    created: false,
                    comment: "DP is not E3 or E4"
                })
            }
            delete req.body.dp;

            let Site_Name = req.body.Site_Name;
            delete req.body.Site_Name;
            Database.getDiveSite({
                Site_Name: Site_Name
            }, siteInfo => {
                if (siteInfo == undefined) {
                    console.log("\t->Error, Dive Site doesn't exist");
                    return res.json({
                        modified: false,
                        comment: "Dive Site doesn't exist"
                    })
                }
                oldEvent.Dive_Site_Id_Dive_Site = siteInfo.Id_Dive_Site;
                Database.getEvent(oldEvent, (event) => {
                    if (event === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            modified: false,
                            comment: "Event doesn't exist"
                        })
                    }
                    Database.getDive({
                        Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
                    }, dive => {
                        if (dive) {
                            console.log("\t->Error, Dive already exist");
                            return res.json({
                                modified: false,
                                comment: "Dive already exist"
                            })
                        }
                        req.body.Id_Planned_Dive = event.Id_Planned_Dive;
                        Database.modifEvent(req.body, (modified) => {
                            if (modified) {
                                console.log("\t->Event modified");
                                return res.json({
                                    modified: true,
                                    comment: "Event modified"
                                });
                            } else {
                                console.log("\t->Error, impossible to modify Event");
                                return res.json({
                                    modified: false,
                                    comment: "Impossible to modify Event"
                                });
                            }
                        });
                    })
                });
            });
        });
    });

/* --------------------------------- DELETE --------------------------------- */
app.delete('/auth/planning', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.sendStatus(401);
    console.log("Deleting planning in DB");
    req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
    req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());

    console.log("--- Trying to delete event ---");

    let startDate = new Date(req.body.Start_Date).getDate();
    let now = new Date().getDate();
    if (startDate < now) {
        console.log("\t->Error, event has already happened");
        return res.json({
            deleted: false,
            comment: "Impossible because event has already happened"
        });
    }
    Database.getEvent(req.body, (event) => {
        if (event === undefined) {
            console.log("\t->Error, Event doesn't exist");
            return res.json({
                deleted: false,
                comment: "Event doesn't exist"
            })
        }
        Database.getDive({
            Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
        }, dive => {
            if (dive) {
                console.log("\t->Error, A dive is linked to this event");
                return res.json({
                    deleted: false,
                    comment: "A dive is linked to this event"
                })
            }
            Database.deleteAllRegistration(event.Id_Planned_Dive, deleted => {
                if (!deleted) {
                    console.log("\t->Error, impossible to delete all registrations");
                    return res.json({
                        deleted: false,
                        comment: "Impossible to delete users"
                    })
                }
                Database.deleteEvent(event, (deleted) => {
                    if (deleted) {
                        console.log("\t->Event deleted");
                        return res.json({
                            deleted: true,
                            comment: "Event deleted"
                        });
                    } else {
                        console.log("\t->Error, impossible to delete Event");
                        return res.json({
                            deleted: false,
                            comment: "Impossible to delete Event"
                        });
                    }
                });
            });
        })

    })
})

/* ------------------------------ REGISTRATION ------------------------------ */

/* --------------------------------- CREATE --------------------------------- */
app.post('/auth/planning/registration', keycloak.protect(),
    body("Start_Date").trim().escape(),
    body("End_Date").trim().escape(),
    body("Diver_Price").trim().escape(),
    body("Instructor_Price").trim().escape(),
    body("Site_Name").trim(),
    body("Comments").trim(),
    body("Special_Needs").trim(),
    body("Status").trim().escape(),
    body("Max_Divers").trim().escape(),
    body("Dive_Type").trim().escape(),
    body("Personnal_Comment").trim(),
    body("Car_Pooling_Seat_Offered").trim().escape(),
    body("Car_Pooling_Seat_Request").trim().escape(),
    body("Diver_Role").trim().escape(),
    body("Mail").trim().escape().toLowerCase(),
    function (req, res) {
        let data = {
            Diver_Id_Diver: "", // récupéré dans getUserInfoByMail
            Planned_Dive_Id_Planned_Dive: "", // récupéré dans getEvent
            Diver_Role: req.body.Diver_Role, // fourni par Tom
            Resgistration_Timestamp: getDateFormat(new Date().toLocaleString()), // date de l'inscription //! reSSSgistration
            Personal_Comment: req.body.Personnal_Comment, // fourni par Tom
            Car_Pooling_Seat_Offered: req.body.Car_Pooling_Seat_Offered, // fourni par Tom
            Car_Pooling_Seat_Request: req.body.Car_Pooling_Seat_Request // fourni par Tom
        }
        delete req.body.Personnal_Comment;
        delete req.body.Car_Pooling_Seat_Offered;
        delete req.body.Car_Pooling_Seat_Request;
        delete req.body.Diver_Role;

        let userMail = (req.body.Mail == "") ? req.kauth.grant.access_token.content.preferred_username : req.body.Mail;
        delete req.body.Mail;

        req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
        req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());

        console.log("--- Trying to register user ---");
        Database.getUserInfoByMail(userMail, (userInfo) => {
            if (userInfo === undefined || userInfo.Id_Diver === null) {
                console.log("\t->Error, User doesn't exist");
                return res.json({
                    registered: false,
                    comment: "User doesn't exist"
                })
            }
            data.Diver_Id_Diver = userInfo.Id_Diver;
            Database.getDiveSite({
                Site_Name: req.body.Site_Name
            }, (locationInfo) => {
                if (locationInfo === undefined) {
                    console.log("\t->Error, Location doesn't exist");
                    return res.json({
                        registered: false,
                        comment: "Location doesn't exist"
                    })
                }
                req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                delete req.body.Site_Name;
                Database.getEvent(req.body, (eventInfo) => {
                    if (eventInfo === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            registered: false,
                            comment: "Event doesn't exist"
                        })
                    }
                    data.Planned_Dive_Id_Planned_Dive = eventInfo.Id_Planned_Dive;
                    Database.getRegistration({
                        Diver_Id_Diver: userInfo.Id_Diver,
                        Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                    }, (registration) => {
                        if (registration) {
                            console.log(`\t->Error, ${userInfo.Mail} is already register`);
                            return res.json({
                                registered: false,
                                comment: "Registration already exist"
                            })
                        }

                        Database.getDiversRegistered(allDiversRegistered => {
                            if (allDiversRegistered === undefined) allDiversRegistered = [];
                            allDiversRegistered = allDiversRegistered.filter(diverInfo => diverInfo.Planned_Dive_Id_Planned_Dive == eventInfo.Id_Planned_Dive)
                            if (eventInfo.Max_Divers == allDiversRegistered.length) {
                                console.log("\t->Error, Max divers reached");
                                return res.json({
                                    registered: false,
                                    comment: "Max divers reached"
                                })
                            }

                            Database.createRegistration(data, (created) => {
                                if (created) {
                                    console.log(`\t->${userInfo.Firstname} ${userInfo.Lastname} registered`);
                                    return res.json({
                                        registered: true,
                                        comment: "Registration added"
                                    })
                                } else {
                                    console.log("\t->Error, impossible to register user");
                                    return res.json({
                                        registered: false,
                                        comment: "Impossible to add Registration"
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    });

/* --------------------------------- DELETE --------------------------------- */
app.delete('/auth/planning/registration', keycloak.protect(), function (req, res) {
    let username = req.kauth.grant.access_token.content.preferred_username;

    req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
    req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());

    console.log("--- Trying to delete registration ---");
    Database.getUserInfoByMail(username, (userInfo) => {
        if (userInfo === undefined || userInfo.Id_Diver === null) {
            console.log("\t->Error, User doesn't exist");
            return res.json({
                deleted: false,
                comment: "User doesn't exist"
            })
        }
        Database.getDiveSite({
            Site_Name: req.body.Site_Name
        }, (locationInfo) => {
            if (locationInfo === undefined) {
                console.log("\t->Error, Location doesn't exist");
                return res.json({
                    registered: false,
                    comment: "Location doesn't exist"
                })
            }
            req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
            delete req.body.Site_Name;

            Database.getEvent(req.body, (eventInfo) => {
                if (eventInfo === undefined) {
                    console.log("\t->Error, Event doesn't exist");
                    return res.json({
                        deleted: false,
                        comment: "Event doesn't exist"
                    })
                }
                Database.getRegistration({
                    Diver_Id_Diver: userInfo.Id_Diver,
                    Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                }, (registration) => {
                    if (registration === undefined) {
                        console.log("\t->Error, User is not register");
                        return res.json({
                            deleted: false,
                            comment: "User is not register"
                        })
                    }
                    if (registration.Diver_Role === "DP") {
                        console.log("\t->Error, DP can't unregister");
                        return res.json({
                            deleted: false,
                            comment: "DP can't unregister"
                        })
                    }
                    Database.deleteRegistration({
                        Diver_Id_Diver: userInfo.Id_Diver,
                        Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                    }, (deleted) => {
                        if (deleted) {
                            console.log(`\t->${userInfo.Firstname} ${userInfo.Lastname} unregistered`);
                            return res.json({
                                deleted: true,
                                comment: "Registration deleted"
                            })
                        } else {
                            console.log("\t->Error, impossible to delete registration");
                            return res.json({
                                deleted: false,
                                comment: "Impossible to delete Registration"
                            });
                        }
                    });
                });
            });
        });
    });
});

app.delete('/auth/planning/registration/all', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.sendStatus(401);
    req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
    req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());
    console.log("--- Trying to delete all registrations ---");
    Database.getDiveSite({
        Site_Name: req.body.Site_Name
    }, (locationInfo) => {
        if (locationInfo === undefined) {
            console.log("\t->Error, Location doesn't exist");
            return res.json({
                deleted: false,
                comment: "Location doesn't exist"
            })
        }
        req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
        delete req.body.Site_Name;
        delete req.body.dp;

        Database.getEvent(req.body, (event) => {
            if (event === undefined) {
                console.log("\t->Error, Event doesn't exist");
                return res.json({
                    deleted: false,
                    comment: "Event doesn't exist"
                })
            }
            Database.deleteAllRegistration(event.Id_Planned_Dive, deleted => {
                if (deleted) {
                    console.log("\t->All registrations deleted");
                    return res.json({
                        deleted: true,
                        comment: "All registrations deleted"
                    });
                } else {
                    console.log("\t->Error, impossible to delete all registrations");
                    return res.json({
                        deleted: false,
                        comment: "Impossible to delete all registrations"
                    });
                }
            });
        });
    });
});

/* -------------------------------------------------------------------------- */
/*                                   ACCOUNT                                  */
/* -------------------------------------------------------------------------- */

app.get('/auth/user/account', keycloak.protect(), function (req, res) {
    if (checkUser(req, "DP")) {
        res.sendFile(__dirname + "/vue/html/user/account.html", {
            headers: {
                'userType': 'dp'
            }
        });
    } else if (checkUser(req, "USER")) {
        res.sendFile(__dirname + "/vue/html/user/account.html", {
            headers: {
                'userType': 'user'
            }
        });
    } else res.redirect('/auth/dashboard');
})

/* ---------------------------------- READ ---------------------------------- */
app.get('/auth/user/account/get_info', keycloak.protect(), function (req, res) {
    let username = req.kauth.grant.access_token.content.preferred_username;
    if (checkUser(req, 'CLUB')) return res.json({
        username: username
    });
    Database.getUserInfoByMail(username, (userInfo) => {
        if (userInfo === undefined) return res.status(404).json({
            comment: "Impossible to find user"
        });
        return res.json(userInfo);
    })
})

/* -------------------------------------------------------------------------- */
/*                                  PALANQUEE                                 */
/* -------------------------------------------------------------------------- */
app.get('/auth/dp/palanquee', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
    if (req.session.idDive == undefined) return res.redirect('/auth/planning');
    res.sendFile(__dirname + "/vue/html/dp/palanquee.html", {
        headers: {
            'userType': 'dp'
        }
    });
})

/* ---------------------------------- READ ---------------------------------- */

app.get('/auth/dp/palanquee/get_palanquee', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
    if (!req.session.idDive) {
        return res.json({
            data: undefined,
            comment: "Id dive is not stored in session",
            redirect: true
        });
    };
    Database.getDive({
        Id_Dive: req.session.idDive
    }, (dive) => {
        if (dive === undefined) return res.json({
            data: undefined,
            comment: "Dive doesn't exist"
        });
        Database.getEventById(dive.Planned_Dive_Id_Planned_Dive, (event) => {
            if (event === undefined) return res.json({
                data: undefined,
                comment: "Event doesn't exist"
            });
            Database.getDiveSite({
                Id_Dive_Site: event.Dive_Site_Id_Dive_Site
            }, (location) => {
                if (location === undefined) return res.json({
                    data: undefined,
                    comment: "Location doesn't exist"
                });
                Database.getEmergencyPlan({
                    Id_Emergency_Plan: location.Id_Dive_Site
                }, (emergencyPlan) => {
                    if (emergencyPlan === undefined) return res.json({
                        data: undefined,
                        comment: "Emergency plan doesn't exist"
                    });
                    Database.getDiversRegistered((allDivers) => {
                        if (allDivers === undefined) allDivers = [];
                        allDivers = allDivers.filter(diver => diver.Planned_Dive_Id_Planned_Dive == event.Id_Planned_Dive);
                        location.emergencyPlan = emergencyPlan;
                        event.Location = location;
                        event.allDivers = allDivers
                        Database.getMaxDepth(listMaxDepth => {
                            if (listMaxDepth == undefined) return res.json({
                                data: undefined,
                                comment: "Can't get list max depth"
                            });
                            let data = {
                                dive,
                                event,
                                listMaxDepth
                            }
                            return res.json({
                                data,
                                comment: "Dive found"
                            });
                        });
                    });
                });
            });
        });
    });
});

/* --------------------------------- CREATE --------------------------------- */

app.post('/auth/dp/palanquee', keycloak.protect(),
    body("*.userMail").trim().toLowerCase(),
    function (req, res) {
        console.log(req.body);
        if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        let idDive = req.session.idDive;

        let DiveTeamMember = [];
        let data = {
            Diver_Id_Diver: "", //ok
            Dive_Team_Id_Dive_Team: "",
            Dive_Id_Dive: idDive, //ok
            Temporary_Diver_Qualification: "", //ok
            Current_Diver_Qualification: "", //ok
            Diver_Role: "Diver",
            Current_Instructor_Qualification: "", //ok
            Nox_Percentage: 0,
            Comment: "",
            Paid_Amount: 0, //ok
        }

        Database.getUsersList(async allUsers => {
            if (allUsers === undefined) allUsers = [];
            for (let i = 0; i < req.body.length; i++) {
                const userMail = req.body[i].userMail;
                const foundUser = allUsers.find(user => user.hasOwnProperty('Mail') && user.Mail === userMail);
                if (foundUser) {
                    let tmpData = Object.assign({}, data); // Crée une nouvelle instance d'objet avec les propriétés de data
                    tmpData.Diver_Id_Diver = foundUser.Id_Diver;
                    tmpData.Current_Diver_Qualification = foundUser.Diver_Qualification;
                    tmpData.Current_Instructor_Qualification = foundUser.Instructor_Qualification;
                    if (foundUser.Instructor_Qualification !== "") tmpData.Paid_Amount = "E";
                    else tmpData.Paid_Amount = "D";
                    DiveTeamMember.push(tmpData);
                }
            }
            Database.getDive({
                Id_Dive: idDive
            }, (dive) => {
                if (dive === undefined) return res.json({
                    created: false,
                    comment: "Dive doesn't exist"
                });
                DiveTeamMember.forEach(member => {
                    if (member.Paid_Amount === "E") member.Paid_Amount = dive.Instructor_Price;
                    else member.Paid_Amount = dive.Diver_Price;
                });

                Database.getDiveTeamMember({
                    Dive_Id_Dive: idDive
                }, (allDiveTeamMember) => {
                    if (allDiveTeamMember !== undefined) {
                        // si les membres de DiveTeamMember sont déjà dans allDiveTeamMember, on les supprime du tableau DiveTeamMember
                        DiveTeamMember.forEach(member => {
                            let found = allDiveTeamMember.find(memberDiveTeam => memberDiveTeam.Diver_Id_Diver == member.Diver_Id_Diver);
                            if (found) {
                                let index = DiveTeamMember.indexOf(member);
                                DiveTeamMember.splice(index, 1);
                            }
                        });
                    }
                    if (DiveTeamMember.length == 0) return res.json({
                        created: true,
                        comment: "All Dive Team Member already exist"
                    });
                    Database.createDiveTeamMember(DiveTeamMember, (created) => {
                        if (!created) {
                            console.log("\t->Error, impossible to create all Dive Team Member");
                            return res.json({ 
                                created: false,
                                comment: "Impossible to create all Dive Team Member"
                            });
                        } else {
                            console.log("\t->All Dive Team Member created");
                            return res.json({
                                created: true,
                                comment: "All Dive Team Member created"
                            });
                        }
                    });
                });
            });
        });
    });

/* --------------------------------- UPDATE --------------------------------- */

app.put('/auth/dp/palanquee', keycloak.protect(),
    body("*.userMail").trim().toLowerCase(),
    body("*.tmpQualif").trim().escape(),
    function (req, res) {
        if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        let idDive = req.session.idDive;

        let DiveTeamMember = [];
        let data = {
            Diver_Id_Diver: "", //ok
            Dive_Team_Id_Dive_Team: "",
            Dive_Id_Dive: idDive, //ok
            Temporary_Diver_Qualification: "", //ok
            Current_Diver_Qualification: "", //ok
            Diver_Role: "Diver",
            Current_Instructor_Qualification: "", //ok
            Nox_Percentage: 0,
            Comment: "",
            Paid_Amount: 0, //ok
        }

        Database.getUsersList(async allUsers => {
            if (allUsers === undefined) allUsers = [];
            for (let i = 0; i < req.body.length; i++) {
                const userMail = req.body[i].userMail;
                const foundUser = allUsers.find(user => user.hasOwnProperty('Mail') && user.Mail === userMail);
                if (foundUser) {
                    let tmpData = Object.assign({}, data); // Crée une nouvelle instance d'objet avec les propriétés de data
                    tmpData.Diver_Id_Diver = foundUser.Id_Diver;
                    tmpData.Current_Diver_Qualification = foundUser.Diver_Qualification;

                    if (req.body[i].tmpQualif !== foundUser.Diver_Qualification && foundUser.Diver_Qualification !== "P5") {
                        let levelUp = parseInt(foundUser.Diver_Qualification.split("P")[1]) + 1;
                        let pLevelUp = "P" + levelUp;
                        let maxDepth = await Database.getMaxDepthByLevel({
                            Diver_Qualification: pLevelUp
                        });
                        if (req.body[i].tmpQualif.split("Pe")[0] == "") {
                            if (req.body[i].tmpQualif !== ("Pe" + maxDepth.Guided_Diver_Depth)) return res.json({
                                created: false,
                                comment: "Guided diver depth is not correct for the current qualification"
                            });
                        } else if (req.body[i].tmpQualif.split("Pa")[0] == "") {
                            if (req.body[i].tmpQualif !== ("Pa" + maxDepth.Autonomous_Diver_Depth)) return res.json({
                                created: false,
                                comment: "Autonomous diver depth is not correct for the current qualification"
                            });
                        }
                        tmpData.Temporary_Diver_Qualification = req.body[i].tmpQualif
                    };
                    tmpData.Current_Instructor_Qualification = foundUser.Instructor_Qualification;
                    if (foundUser.Instructor_Qualification !== "") tmpData.Paid_Amount = "E";
                    else tmpData.Paid_Amount = "D";

                    DiveTeamMember.push(tmpData);
                }
            }
            Database.getDive({
                Id_Dive: idDive
            }, (dive) => {
                if (dive === undefined) return res.json({
                    created: false,
                    comment: "Dive doesn't exist"
                });
                DiveTeamMember.forEach(member => {
                    if (member.Paid_Amount === "E") member.Paid_Amount = dive.Instructor_Price;
                    else member.Paid_Amount = dive.Diver_Price;
                });

                let allInserted = true;
                DiveTeamMember.forEach(async member => {
                    if (!allInserted) return;
                    let updated = await Database.updateDiveTeamMember(member)
                    if (!updated) {
                        console.log("\t->Error, impossible to update member");
                        allInserted = false;
                    } else {
                        console.log("\t->Dive Team Member updated");
                    }
                });
                if (allInserted) {
                    console.log("\t->All Dive Team Member updated");
                    return res.json({
                        created: true,
                        comment: "All Dive Team Member updated"
                    });
                } else {
                    console.log("\t->Error, impossible to update all Dive Team Member");
                    return res.json({
                        created: false,
                        comment: "Impossible to update all Dive Team Member"
                    });
                }

            });
        });
    });



/* -------------------------------------------------------------------------- */
/*                                CLUB MEMBERS                                */
/* -------------------------------------------------------------------------- */

app.get('/auth/club/club_members', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    res.sendFile(__dirname + "/vue/html/club/club_members.html", {
        headers: {
            'userType': 'club'
        }
    });
})

/* --------------------------------- CREATE --------------------------------- */
app.post('/auth/club/club_members', keycloak.protect(),
    body("Lastname").trim(),
    body("Firstname").trim().escape(),
    body("Mail").trim().escape().toLowerCase(),
    body("Phone").trim().escape().isLength({
        min: 10,
        max: 10
    }).isNumeric(),
    body("Diver_Qualification").trim().escape(),
    body("Instructor_Qualification").trim().escape(),
    body("Nox_Level").trim().escape(),
    body("Additional_Qualifications").trim().escape(),
    body("License_Number").trim().escape(),
    body("License_Expiration_Date").trim().escape(),
    body("Medical_Certificate_Expiration_Date").trim().escape(),
    body("Birthdate").trim().escape(),
    body("password").trim().escape().exists(),
    async function (req, res) {
        const pass = req.body.password;
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        req.body.Birthdate = getDateFormat(new Date(req.body.Birthdate));
        req.body.License_Expiration_Date = getDateFormat(new Date(req.body.License_Expiration_Date));
        req.body.Medical_Certificate_Expiration_Date = getDateFormat(new Date(req.body.Medical_Certificate_Expiration_Date));

        console.log("--- Trying to create user ---");
        if (req.body.Diver_Qualification === ("P0" || "P1")) {
            if (req.body.Instructor_Qualification !== "EO") return res.json({
                created: false,
                comment: "Instructor qualification is not EO"
            });
        } else if (req.body.Diver_Qualification === ("P2" || "P3")) {
            if (req.body.Instructor_Qualification !== ("E0" || "E1")) return res.json({
                created: false,
                comment: "Instructor qualification is not E1"
            });
        }

        let responseKc = await Keycloak_module.createUser(req.body, getUserName(req));
        if (responseKc) {
            console.log("\t->User created in KC");
            Database.createUser(req.body, true, async (created) => {
                if (created) {
                    console.log("\t->User created in DB");
                    console.log("\t->User correctly created");
                    //? Créer le dossier
                    //? tom_mullier_gmail_com.jpg/jpeg/png
                    //? Creer le dossier
                    //? Copier Blank.jpg dans le dossier
                    //? Renommer Blank
                    // avec fs, créer le dossier avec le mail de lutilisateur 
                    try {
                        let filename = req.body.Mail.replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");
                        fs.mkdirSync(__dirname + "/model/img/" + filename);
                        fs.copyFileSync(__dirname + "/model/img/blank_pp.png", __dirname + "/model/img/" + filename + "/" + filename + ".jpg");
                        console.log("\t->User folder created");
                    } catch (error) {
                        console.log("\tL'image de profil de base n'a pas pu être créée")
                        console.log(error);
                    }

                    return res.json({
                        created: true
                    });
                } else {
                    console.log("\t->Error while creating user in DB");
                    let isDel = await Keycloak_module.deleteUser(req.body.Mail, getUserName(req), pass);
                    if (!isDel) console.error("\t->Error while deleting user in KC");
                    else console.log("\t->User deleted in KC");
                    return res.json({
                        created: false
                    });
                }
            })
        } else {
            console.log("\t->Error while creating user in KC");
            console.log("\t->User not created");
            return res.json({
                created: false
            });
        }
    })

/* ---------------------------------- READ ---------------------------------- */
app.get('/auth/club/get_club_members', keycloak.protect(), async function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    Database.getUsersList((users) => {
        return res.json(users);
    });
})

/* --------------------------------- UPDATE --------------------------------- */
app.put('/auth/club/club_members', keycloak.protect(),
    body("oldMail").trim().escape(),
    body("Firstname").trim().escape(),
    body("Lastname").trim(),
    body("Mail").trim().escape().toLowerCase(),
    body("Phone").trim().escape().isLength({
        min: 10,
        max: 10
    }).isNumeric(),
    body("Diver_Qualification").trim().escape(),
    body("Instructor_Qualification").trim().escape(),
    body("Nox_Level").trim().escape(),
    body("Additional_Qualifications").trim().escape(),
    body("License_Number").trim().escape(),
    body("License_Expiration_Date").trim().escape(),
    body("Medical_Certificate_Expiration_Date").trim().escape(),
    body("password").trim().escape().exists(),
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        req.body.Birthdate = getDateFormat(new Date(req.body.Birthdate));
        req.body.License_Expiration_Date = getDateFormat(new Date(req.body.License_Expiration_Date));
        req.body.Medical_Certificate_Expiration_Date = getDateFormat(new Date(req.body.Medical_Certificate_Expiration_Date));
        let clientPassword = req.body.password;
        delete req.body.password;

        console.log("--- Trying to modify user ---");

        if (req.body.Diver_Qualification === ("P0" || "P1")) {
            if (req.body.Instructor_Qualification !== "EO") return res.json({
                created: false,
                comment: "Instructor qualification is not EO"
            });
        } else if (req.body.Diver_Qualification === ("P2" || "P3")) {
            if (req.body.Instructor_Qualification !== ("E0" || "E1")) return res.json({
                created: false,
                comment: "Instructor qualification is not E1"
            });
        }

        Database.getUserInfoByMail(req.body.oldMail, (userInfo) => {
            if (userInfo === undefined) {
                console.log("\t->Error, User doesn't exist");
                return res.json({
                    modified: false,
                    comment: "User doesn't exist"
                })
            }
            req.body.Id_Diver = userInfo.Id_Diver;
            let userOldMail = req.body.oldMail;
            delete req.body.oldMail;
            Database.modifUser(req.body, async (updated) => {
                if (!updated) {
                    console.log("\t->Error, impossible to update user in DB");
                    return res.json({
                        modified: false,
                        comment: "Impossible to update user in DB"
                    })
                }
                const modifKc = await Keycloak_module.modifyUser(userOldMail, req.body.Mail, req.body.Firstname, req.body.Lastname, getUserName(req), clientPassword)
                if (modifKc) {
                    console.log("\t->User modified in KC");
                    console.log("\t->User correctly modified");
                    return res.json({
                        modified: true,
                        comment: "User modified"
                    })
                }

                console.log("\t->Error, impossible to update user in KC");
                Database.modifUser(userInfo, (isInser) => {
                    if (isInser) {
                        console.log("\t->User modified in DB");
                        console.log("\t->Error, impossible to update user in KC, success to cancel all modifications");
                        return res.json({
                            modified: false,
                            comment: "Error while modifying, success to cancel all modifications"
                        });
                    } else {
                        console.log("\t->Error, impossible to update user in DB");
                        console.log("\t->Error, impossible to update user in KC, impossible to cancel all modifications");
                        return res.json({
                            modified: false,
                            comment: "Error while modifying, impossible to cancel all modifications"
                        });
                    }
                })
            })
        })
    })

/* --------------------------------- DELETE --------------------------------- */
app.delete('/auth/club/club_members', keycloak.protect(), // USE
    body("Mail").trim().escape().exists(),
    body("password").trim().escape().exists(),
    async function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        console.log("--- Trying to delete user ---");

        Database.getUserInfoByMail(req.body.Mail, (userInfo) => {
            if (userInfo === undefined) {
                console.log("\t->Error, User doesn't exist");
                return res.json({
                    deleted: false,
                    comment: "User doesn't exist"
                })
            }
            // vérification si Id_Diver présent dans :
            // - Dive_Registration
            // - Dive
            // - Dive_Team_Member
            // - Dive_Team

            Database.getDiversRegistered(allDiversRegistered => {
                console.log(allDiversRegistered);
                if (allDiversRegistered == undefined) allDiversRegistered = [];
                if (allDiversRegistered.find(diverInfo => diverInfo.Id_Diver == userInfo.Id_Diver)) {
                    console.log("\t->Error, User is registered to an event");
                    return res.json({
                        deleted: false,
                        comment: "User is registered to an event"
                    })
                }
                Database.getDive({
                    Diver_Id_Diver: userInfo.Id_Diver
                }, dive => {
                    if (dive) {
                        console.log("\t->Error, User is linked to a dive");
                        return res.json({
                            deleted: false,
                            comment: "User is linked to a dive"
                        })
                    }
                    // Database.getDiveTeamMember({
                    //     Diver_Id_Diver: userInfo.Id_Diver
                    // }, diveTeamMember => {
                    //     if (diveTeamMember) {
                    //         console.log("\t->Error, User is linked to a dive team member");
                    //         return res.json({
                    //             deleted: false,
                    //             comment: "User is linked to a dive team member"
                    //         })
                    //     }
                    //     Database.getDiveTeam({
                    //         Diver_Id_Diver: userInfo.Id_Diver
                    //     }, diveTeam => {
                    //         if (diveTeam) {
                    //             console.log("\t->Error, User is linked to a dive team");
                    //             return res.json({
                    //                 deleted: false,
                    //                 comment: "User is linked to a dive team"
                    //             })
                    //         }
                    Database.deleteUser(req.body.Mail, async (isDelDb) => {
                        if (!isDelDb) {
                            console.log("\t->Error, impossible to delete user in DB");
                            return res.json({
                                deleted: false,
                                comment: "Impossible to delete user in DB"
                            })
                        }

                        const isDelKc = await Keycloak_module.deleteUser(req.body.Mail, getUserName(req), req.body.password);
                        if (isDelKc) {
                            console.log("\t->User deleted in KC");
                            console.log("\t->User correctly deleted");
                            return res.json({
                                deleted: true,
                                comment: "User deleted"
                            })
                        }
                        Database.createUser(userInfo, false, (isInser) => {
                            if (isInser) {
                                console.log("\t->Error, impossible to delete user in KC, success to cancel all modifications");
                                return res.json({
                                    deleted: false,
                                    comment: "Error while deleting, success to cancel all modifications"
                                });
                            } else {
                                console.log("\t->Error, impossible to delete user in KC, impossible to cancel all modifications");
                                return res.json({
                                    deleted: false,
                                    comment: "Error while deleting, impossible to cancel all modifications"
                                });
                            }
                        })
                        //     })
                        // })
                    })
                })
            })
        })
    })

/* -------------------------------------------------------------------------- */
/*                                  LOCATIONS                                 */
/* -------------------------------------------------------------------------- */

app.get('/auth/club/locations', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    res.sendFile(__dirname + "/vue/html/club/locations.html", {
        headers: {
            'userType': 'club'
        }
    });
})

/* --------------------------------- CREATE --------------------------------- */
app.post("/auth/club/locations", keycloak.protect(),
    body("Site_Name").trim(), // Location
    body("Gps_Latitude").trim().escape().isNumeric(),
    body("Gps_Longitude").trim().escape().isNumeric(),
    body("Track_Type").trim().escape(),
    body("Track_Number").trim().escape(),
    body("Track_Name").trim(),
    body("Zip_Code").trim().escape(),
    body("City_Name").trim(),
    body("Country_Name").trim(),
    body("Additional_Address").trim(),
    body("Tel_Number").trim().escape().optional({
        checkFalsy: true
    }).isLength({
        min: 10,
        max: 10
    }),
    body("Information_URL").trim(),
    body("SOS_Tel_Number").trim().escape().isLength({
        min: 10,
        max: 10
    }), // Emergency
    body("Emergency_Plan").trim(),
    body("Post_Accident_Procedure").trim(),
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });

        const dataEmergency = {
            SOS_Tel_Number: req.body.SOS_Tel_Number,
            Emergency_Plan: req.body.Emergency_Plan,
            Post_Accident_Procedure: req.body.Post_Accident_Procedure,
            Version: 0
        }
        delete req.body.SOS_Tel_Number;
        delete req.body.Emergency_Plan;
        delete req.body.Post_Accident_Procedure;

        console.log("--- Trying to create location ---");
        Database.getDiveSite({
            Site_Name: req.body.Site_Name
        }, (siteInfo) => {
            if (siteInfo !== undefined) {
                console.log("\t->Error, Location already exist");
                return res.json({
                    created: false,
                    comment: "Location already exist"
                });
            }
            req.body.General_Rate = 0;
            req.body.Location_Rate = 0;
            req.body.Organisation_Rate = 0;
            req.body.Conditions_Rate = 0;
            req.body.Rate_Number = 0;
            Database.createDiveSite(req.body, (idLoc) => {
                if (idLoc === undefined) {
                    console.log("\t->Error, impossible to add Location");
                    return res.json({
                        created: false,
                        comment: "Impossible to add Location"
                    })
                }
                dataEmergency.Id_Emergency_Plan = idLoc;
                dataEmergency.Dive_Site_Id_Dive_Site = idLoc;
                Database.createEmergencyPlan(dataEmergency, (creaEm) => {
                    if (creaEm) {
                        console.log("\t->Location and Emergency Plan added");
                        return res.json({
                            created: true,
                            comment: "Location and Emergency Plan added"
                        })
                    } else {
                        Database.deleteDiveSite({
                            Site_Name: req.body.Site_Name
                        }, (delLoc) => {
                            if (delLoc) {
                                console.log("\t->Error, impossible to add Emergency Plan, Location deleted");
                                return res.json({
                                    created: false,
                                    comment: "Impossible to add Emergency Plan"
                                })
                            } else {
                                console.log("\t->Error, impossible to add Emergency Plan and Location, impossible to cancel all modifications");
                                return res.json({
                                    created: false,
                                    comment: "Impossible to add Emergency Plan and Location"
                                })
                            }
                        })
                    }
                })
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

/* --------------------------------- UPDATE --------------------------------- */
app.put("/auth/club/locations", keycloak.protect(),
    body("Site_Name").trim(),
    body("Gps_Latitude").trim().escape().isNumeric(),
    body("Gps_Longitude").trim().escape().isNumeric(),
    body("Track_Type").trim().escape(),
    body("Track_Number").trim().escape(),
    body("Track_Name").trim(),
    body("Zip_Code").trim().escape(),
    body("City_Name").trim(),
    body("Country_Name").trim(),
    body("Additional_Address").trim(),
    body("Tel_Number").trim().escape().isLength({
        min: 10,
        max: 10
    }),
    body("Information_URL").trim(),
    body("SOS_Tel_Number").trim().escape().isLength({
        min: 10,
        max: 10
    }).exists(), // Emergency
    body("Emergency_Plan").trim().exists(),
    body("Post_Accident_Procedure").trim().exists(),
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array()
        });
        const dataEmergency = {
            Id_Emergency_Plan: "",
            Dive_Site_Id_Dive_Site: "",
            SOS_Tel_Number: req.body.SOS_Tel_Number,
            Emergency_Plan: req.body.Emergency_Plan,
            Post_Accident_Procedure: req.body.Post_Accident_Procedure,
            Version: "1"
        }
        delete req.body.Dive_Site_Id_Dive_Site;
        delete req.body.SOS_Tel_Number;
        delete req.body.Emergency_Plan;
        delete req.body.Post_Accident_Procedure;
        delete req.body.Version;

        console.log("--- Trying to update location ---");
        Database.getDiveSite({
            Site_Name: req.body.Site_Name
        }, (siteInfo) => {
            if (siteInfo === undefined) {
                console.log("\t->Error, Location doesn't exist");
                return res.json({
                    modified: false,
                    comment: "Location doesn't exist"
                });
            }
            req.body.Id_Dive_Site = siteInfo.Id_Dive_Site;
            dataEmergency.Id_Emergency_Plan = siteInfo.Id_Dive_Site;
            dataEmergency.Dive_Site_Id_Dive_Site = siteInfo.Id_Dive_Site;
            Database.modifDiveSite(req.body, (isUpdateSite) => {
                if (!isUpdateSite) {
                    console.log("\t->Error, impossible to update Location");
                    return res.json({
                        modified: false,
                        comment: "Impossible to update Location"
                    });
                }
                Database.modifEmergencyPlan(dataEmergency, (isUpdateEm) => {
                    if (isUpdateEm) {
                        console.log("\t->Location and Emergency Plan updated");
                        return res.json({
                            modified: true,
                            comment: "Location and Emergency Plan updated"
                        });
                    } else {
                        Database.modifDiveSite(siteInfo, (isUpdateSite) => {
                            if (!isUpdateSite) {
                                console.log("\t->Error, impossible to cancel update of Location, failed to cancel all modifications");
                                return res.json({
                                    modified: false,
                                    comment: "Impossible to cancel update of Location"
                                });
                            } else {
                                console.log("\t->Error, impossible to update Emergency Plan, success to cancel all modifications");
                                return res.json({
                                    modified: false,
                                    comment: "Impossible to update Emergency Plan"
                                });
                            }
                        })
                    }
                })
            })
        });
    })

/* --------------------------------- DELETE --------------------------------- */
app.delete("/auth/club/locations", keycloak.protect(), function (req, res) {
    if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
    console.log("--- Trying to delete location ---");
    // req.body -> {Site_Name: "le nommmmm"}
    Database.getDiveSite(req.body, (siteInfo) => {
        if (siteInfo === undefined) {
            console.log("\t->Error, Location doesn't exist");
            return res.json({
                deleted: false,
                comment: "Location doesn't exist"
            });
        }
        Database.getPlanning(allEvents => {
            if (allEvents === undefined) allEvents = [];
            allEvents = allEvents.filter(event => event.Dive_Site_Id_Dive_Site == siteInfo.Id_Dive_Site);
            if (allEvents.length > 0) {
                console.log("\t->Error, Location is linked in an event");
                return res.json({
                    deleted: false,
                    comment: "Location is linked in an event"
                });
            }
            Database.deleteEmergencyPlan({
                Id_Emergency_Plan: siteInfo.Id_Dive_Site
            }, (isDelete) => {
                if (!isDelete) {
                    console.log("\t->Error, impossible to delete Emergency Plan");
                    return res.json({
                        deleted: false,
                        comment: "Impossible to delete Emergency Plan"
                    });
                }
                Database.deleteDiveSite(req.body, (isDelete) => {
                    if (isDelete) {
                        console.log("\t->Location and Emergency Plan deleted");
                        return res.json({
                            deleted: true,
                            comment: "Location and Emergency Plan deleted"
                        });
                    } else {
                        Database.createEmergencyPlan(siteInfo, (isCreate) => {
                            if (!isCreate) {
                                console.log("\t->Error, impossible to recreate Emergency Plan, failed to cancel all modifications");
                                return res.json({
                                    deleted: false,
                                    comment: "Impossible to recreate Emergency Plan"
                                });
                            } else {
                                console.log("\t->Error, impossible to delete Location, success to cancel all modifications");
                                return res.json({
                                    deleted: false,
                                    comment: "Impossible to delete Location"
                                });
                            }
                        })
                    }
                })
            })
        })
    })
})

// get the not available page (if browser = firefox for example)
app.get("/not_available", (req, res) => res.send("not_available, try with another browser"));

// Capture 404 requests
app.get("/404", (req, res) => res.sendFile(__dirname + "/vue/html/error/404.html"));
app.use((req, res) => res.sendFile(__dirname + "/vue/html/error/404.html"));

http.listen(port, hostname, (err) => {
    if (err) console.error(err);
    else console.log(`Server running at http://${process.env.IP_PERSO}:${port}`);
});