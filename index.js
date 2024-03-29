require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const fileUpload = require('express-fileupload');
let Sharp = require('sharp');

const {
    v4: uuidv4
} = require('uuid');
const {
    body,
    validationResult,
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

app.use(express.static(path.join(__dirname, "vue")));
app.use(fileUpload({
    useTempFiles: true
}));

app.use(bodyParser.json());
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
    const year = new String(badDate.split(', ')[0].split("/")[2]).padStart(4, "0");
    const hour = badDate.split(', ')[1];
    return year + "-" + month + "-" + day + " " + hour;
}

function getTimeFormat(time) {
    time += '';
    time = new Date(time).toLocaleString('fr-FR', {
        hour12: false
    })
    const newTime = time.split(', ')[1];
    return newTime;
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
    // vérifie si l'image est bien un jpg, jpeg ou png
    ;
    const {
        image
    } = req.files;
    if (!image) return res.redirect('/auth/user/account');
    if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpg') {
        console.log("Profile picture is not a jpg, jpeg or png");
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
            Database.getDiveSiteList(async (allLocations) => {
                allEvents.forEach(event => {
                    event.Location = allLocations.filter(location => location.Id_Dive_Site === event.Dive_Site_Id_Dive_Site)[0];
                });
                let message = await Database.getMessage({
                    Club: username
                });
                if (message === undefined) {
                    message = {};
                    message.Message = "";
                    message.Date_Modif = getDateFormat(new Date().toLocaleDateString())
                }
                return res.json({
                    userInfo: username,
                    registrationList: allEvents,
                    message: message
                });
            });
        });
    } else {
        Database.getUserInfoByMail(username, (userInfo) => {
            if (userInfo === undefined) return res.json({
                userInfo: username
            });

            Database.getRegistrationList(userInfo.Id_Diver, (registrationList) => {
                if (registrationList === undefined) registrationList = [];

                Database.getDiveSiteList(async (allLocations) => {
                    registrationList.forEach(event => {
                        event.Location = allLocations.filter(location => location.Id_Dive_Site === event.Dive_Site_Id_Dive_Site)[0];
                    });
                    let message = await Database.getMessage({
                        Club: userInfo.Club
                    });
                    if (message === undefined) {
                        message = {};
                        message.Message = "";
                        message.Date_Modif = getDateFormat(new Date().toLocaleDateString())
                    }
                    return res.json({
                        userInfo: userInfo,
                        registrationList: registrationList,
                        message: message
                    });
                })
            });
        });
    }
});

app.post('/auth/dashboard',
    keycloak.protect(),
    body("Message").trim(),
    async function (req, res) {
        if (checkUser(req, "CLUB")) {
            const username = req.kauth.grant.access_token.content.preferred_username;
            const resGetMessage = await Database.getMessage({
                Club: username
            })
            req.body.Club = username;
            req.body.Date_Modif = getDateFormat(new Date().toLocaleString());
            if (resGetMessage === undefined) {
                const createMessage = await Database.createMessageClub(req.body);
                if (createMessage === undefined) {
                    return res.json({
                        success: false,
                        comment: "Impossible de créer le message"
                    })
                }
            } else {
                const updateMessage = await Database.updateMessage(req.body);
                if (updateMessage === undefined) {
                    return res.json({
                        success: false,
                        comment: "Impossible d'actualiser le message"
                    })
                }
            }
            return res.json({
                success: true,
                comment: "Message actualisé"
            })
        } else res.json({
            success: false,
            comment: "Vous n'avez pas l'autorisation d'ajouter un message"
        })
    })

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
    body("lengthUsersToRegister").trim().escape().exists().isNumeric(),
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
        });
        if(new Date(req.body.End_Date) <= new Date(req.body.Start_Date)){
            return res.json({
                modified: false,
                comment: "La date de fin est antérieure à la date de début"
            })
        }
        console.log("--- Trying to create event --'");
        req.body.Max_Divers = parseInt(req.body.Max_Divers);
        req.body.lengthUsersToRegister = parseInt(req.body.lengthUsersToRegister);
        if (req.body.Max_Divers < req.body.lengthUsersToRegister) {
            return res.json({
                created: false,
                comment: "Trop de plongeurs inscrits par rapport au nombre maximum de plongeurs prévu"
            })
        }
        if (req.body.Max_Divers < 2) {
            return res.json({
                created: false,
                comment: "Nombre de plongeurs trop faible, un événement peut être créé à partir de 2 plongeurs"
            })
        }
        delete req.body.lengthUsersToRegister;
        if (new Date(req.body.Start_Date) < new Date()) {
            console.log("\t->Error, date is in the past");
            return res.json({
                created: false,
                comment: "Impossible de créer un événement dans le passé"
            });
        }

        Database.getUserInfoByMail(req.body.dp, infoDp => {
            if (req.body.Dive_Type === "Exploration" && infoDp.Diver_Qualification !== "P5") {
                console.log("\t->Error, DP is not P5");
                return res.json({
                    created: false,
                    comment: "Le DP n'est pas P5"
                })
            } else if (req.body.Dive_Type === "Technique" && infoDp.Instructor_Qualification !== ("E3" && "E4")) {
                console.log("\t->Error, DP is not E3 or E4");
                return res.json({
                    created: false,
                    comment: "Le DP n'est pas E3 ou E4"
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
                        comment: "Le site de plongée n'existe pas"
                    })
                }
                req.body.Dive_Site_Id_Dive_Site = siteInfo.Id_Dive_Site;
                Database.getEvent(req.body, (event) => {
                    if (event) {
                        console.log("\t->Error, Event already exist");
                        return res.json({
                            created: false,
                            comment: "L'événement existe déjà"
                        });
                    }
                    Database.createEvent(req.body, (isInserted) => {
                        if (!isInserted) {
                            console.log("\t->Error, impossible to add Event");
                            return res.json({
                                created: false,
                                comment: "Impossible d'ajouter l'événement"
                            });
                        } else {
                            console.log("\t->Event added");
                            return res.json({
                                created: true,
                                comment: "Evénement ajouté"
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
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
        });
        console.log("--- Trying to rate location ---");
        Database.getUserInfoByMail(req.kauth.grant.access_token.content.preferred_username, infoDiver => {
            if (infoDiver === undefined) {
                console.log("\t->Error, User doesn't exist");
                return res.json({
                    rated: false,
                    comment: "L'utilisateur n'existe pas"
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
                        comment: "Le lieu de plongée n'existe pas"
                    })
                }
                req.body.Event.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                Database.getEvent(req.body.Event, (event) => {
                    if (event === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            rated: false,
                            comment: "L'événement n'existe pas"
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
                                comment: "Utilisateur non inscrit"
                            })
                        }
                        if (registration.Has_Voted == "1") {
                            console.log("\t->Error, User has already voted");
                            return res.json({
                                rated: false,
                                comment: "Vote déjà effectué"
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
                                    comment: "Impossible de modifier l'inscription"
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
                                        comment: "Impossible de noter le lieu de plongée"
                                    })
                                }else{
                                    console.log("\t->Location rated");
                                    return res.json({
                                        rated: true,
                                        comment: "Lieu de plongée noté"
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
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
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
                comment: "Impossible de créer une plongée à une date différente de celle d'aujourd'hui"
            });
        }
        Database.getUserInfoByMail(username, infoDp => {
            if (infoDp === undefined) {
                console.log("\t->Error, DP doesn't exist");
                return res.json({
                    created: false,
                    comment: "Impossible de trouver le DP"
                });
            }
            if ((req.body.Dive_Type === "Exploration" && infoDp.Diver_Qualification !== "P5") || (req.body.Dive_Type === "Technique" && infoDp.Instructor_Qualification !== ("E3" && "E4"))) {
                console.log("\t->Error, DP is not P5 or E3/E4");
                return res.json({
                    created: false,
                    comment: "Le DP n'est pas P5 ou E3/E4"
                });
            }

            Database.getDiveSite({
                Site_Name: req.body.Site_Name
            }, (locationInfo) => {
                if (locationInfo === undefined) {
                    console.log("\t->Error, Dive Site doesn't exist");
                    return res.json({
                        created: false,
                        comment: "Lieu de plongée inexistant"
                    });
                }
                req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                delete req.body.Site_Name;
                Database.getEvent(req.body, (event) => {
                    if (event === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            created: false,
                            comment: "L'événement n'existe pas"
                        });
                    }
                    Database.getDiversRegistered(diverList => {
                        if (diverList === undefined) diverList = [];
                        diverList = diverList.filter(diver => diver.Planned_Dive_Id_Planned_Dive == event.Id_Planned_Dive);
                        if (Object.keys(diverList).length < 2) {
                            console.log("\t->Error, not enough divers");
                            return res.json({
                                created: false,
                                comment: "Pas assez de plongeurs inscrits"
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
                                    comment: "Plongée déjà créée, redirection"
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
                                Last_Modif: getDateFormat(new Date().toLocaleString()),
                            }
                            Database.createDive(data, (isInserted) => {
                                if (!isInserted) {
                                    console.log("\t->Error, impossible to add Dive");
                                    return res.json({
                                        created: false,
                                        comment: "Impossible d'ajouter la plongée"
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
                                                comment: "La plongée n'existe pas"
                                            });
                                        }
                                        req.session.idDive = newDive.Id_Dive;
                                        return res.json({
                                            created: true,
                                            comment: "Plongée créée"
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

app.post("/auth/planning/pdf_event", keycloak.protect(),
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
        if (!checkUser(req, "CLUB") && !checkUser(req, "DP")) {
            return res.json({
                pdf: false,
                comment: "Vous n'êtes pas autorisé"
            })
        }
        console.log("--- Check PDF exists")
        req.body.Start_Date = getDateFormat(new Date(req.body.Start_Date).toLocaleString());
        req.body.End_Date = getDateFormat(new Date(req.body.End_Date).toLocaleString());

        Database.getDiveSite({
            Site_Name: req.body.Site_Name
        }, (diveSiteInfo) => {
            if (diveSiteInfo === undefined) {
                console.log("\t ->Can't get dive site")
                return res.json({
                    pdf: false,
                    comment: "Impossible de trouver le lieu"
                })
            }
            delete req.body.Site_Name
            req.body.Dive_Site_Id_Dive_Site = diveSiteInfo.Id_Dive_Site;
            Database.getEvent(req.body, eventInfo => {
                if (eventInfo === undefined) {
                    console.log("\t ->Can't get event")
                    return res.json({
                        pdf: false,
                        comment: "Impossible de trouver l'évènement"
                    })
                }
                Database.getDive({
                    Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                }, diveInfo => {
                    if (diveInfo === undefined) {
                        console.log("\t ->Can't get dive")
                        return res.json({
                            pdf: false,
                            comment: "Impossible de trouver la plongée"
                        })
                    }
                    if (fs.existsSync(__dirname + "/model/pdf/" + diveInfo.Id_Dive + ".pdf")) {
                        req.session.idDive = diveInfo.Id_Dive;
                        return res.json({
                            pdf: true,
                            comment: "Le PDF existe déjà"
                        })
                    } else {
                        console.log("\t ->Can't get PDF")
                        return res.json({
                            pdf: false,
                            comment: "Le PDF n'existe pas"
                        })
                    }
                })
            })
        })
    })

app.get("/auth/planning/download_pdf", keycloak.protect(),
    function (req, res) {
        console.log("--- Download PDF")
        if (checkUser(req, "CLUB") || checkUser(req, "DP")) {
            Database.getDive({
                Id_Dive: req.session.idDive
            }, (diveInfo) => {
                Database.getEventById(diveInfo.Planned_Dive_Id_Planned_Dive, (eventInfo) => {
                    let date = eventInfo.Start_Date.split("-")[0] + "_" + eventInfo.Start_Date.split("-")[1] + "_" + eventInfo.Start_Date.split("-")[2].split(" ")[0];
                    Database.getDiveSite({
                        Id_Dive_Site: eventInfo.Dive_Site_Id_Dive_Site
                    }, (diveSiteInfo) => {
                        return res.download(__dirname + "/model/pdf/" + req.session.idDive + ".pdf", "PAL_" + eventInfo.Dive_Type + "_" + diveSiteInfo.Site_Name + "_" + date + ".pdf");
                    })
                })
            })
        } else res.redirect("/auth/planning")
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
                hasVoted: true, // true because we don't want to display the button
                comment: "L'utilisateur n'existe pas"
            });
            Database.getDiveSite({
                Site_Name: req.body.Site_Name
            }, (locationInfo) => {
                if (locationInfo === undefined) return res.json({
                    hasVoted: true,
                    comment: "Le lieu de plongée n'existe pas"
                });
                req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                delete req.body.Site_Name;
                Database.getEvent(req.body, (eventInfo) => {
                    if (eventInfo === undefined) return res.json({
                        hasVoted: true,
                        comment: "L'événement n'existe pas"
                    });
                    Database.getRegistration({
                        Diver_Id_Diver: userInfo.Id_Diver,
                        Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                    }, (registration) => {
                        if (registration === undefined) return res.json({
                            hasVoted: true,
                            comment: "L'utilisateur n'est pas inscrit"
                        });
                        if (registration.Has_Voted == "1") return res.json({
                            hasVoted: true,
                            comment: "L'utilisateur a déjà voté"
                        });
                        else return res.json({
                            hasVoted: false,
                            comment: "L'utilisateur n'a pas voté"
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
    body("lengthUsersToRegister").trim().escape().exists().isNumeric(),
    function (req, res) {
        console.log(req.body);
        if (!checkUser(req, "CLUB")) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
        });
        req.body.Max_Divers = parseInt(req.body.Max_Divers);
        req.body.lengthUsersToRegister = parseInt(req.body.lengthUsersToRegister);

        if (req.body.Max_Divers < 2) {
            return res.json({
                created: false,
                comment: "Nombre de plongeurs trop faible, un événement peut être créé à partir de 2 plongeurs"
            })
        }
        if(new Date(req.body.End_Date) <= new Date(req.body.Start_Date)){
            return res.json({
                modified: false,
                comment: "La date de fin est antérieure à la date de début"
            })
        }
        delete req.body.lengthUsersToRegister;

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
                    comment: "Le DP n'est pas P5"
                })
            } else if (req.body.Dive_Type === "Technique" && infoDp.Instructor_Qualification !== ("E3" && "E4")) {
                console.log("\t->Error, DP is not E3 or E4");
                return res.json({
                    created: false,
                    comment: "Le DP n'est pas E3 ou E4"
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
                        comment: "Le site de plongée n'existe pas"
                    })
                }
                oldEvent.Dive_Site_Id_Dive_Site = siteInfo.Id_Dive_Site;
                Database.getEvent(oldEvent, (event) => {
                    if (event === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            modified: false,
                            comment: "L'événement n'existe pas"
                        })
                    }
                    /* ---------------------- VERIFICATION DES INFORMATIONS --------------------- */
                    if (new Date(req.body.Start_Date) < new Date()) {
                        console.log("\t->Error, Event has already happened");
                        return res.json({
                            modified: false,
                            comment: "Impossible de modifier un événement déjà passé"
                        })
                    }
                    Database.getDiversRegistered(diverList => {
                        if (diverList === undefined) diverList = [];
                        diverList = diverList.filter(diver => diver.Planned_Dive_Id_Planned_Dive == event.Id_Planned_Dive);
                        if (Object.keys(diverList).length > req.body.Max_Divers) {
                            console.log("\t->Error, too many divers");
                            return res.json({
                                modified: false,
                                comment: "Trop de plongeurs inscrits par rapport au nombre maximum de plongeurs entré"
                            });
                        }

                        Database.getDive({
                            Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
                        }, dive => {
                            if (dive) {
                                console.log("\t->Error, Dive already exist");
                                return res.json({
                                    modified: false,
                                    comment: "La plongée existe déjà"
                                })
                            }
                            req.body.Id_Planned_Dive = event.Id_Planned_Dive;
                            Database.modifEvent(req.body, (modified) => {
                                if (modified) {
                                    console.log("\t->Event modified");
                                    return res.json({
                                        modified: true,
                                        comment: "Evénement modifié"
                                    });
                                } else {
                                    console.log("\t->Error, impossible to modify Event");
                                    return res.json({
                                        modified: false,
                                        comment: "Impossible de modifier l'événement"
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
            comment: "L'événement a déjà eu lieu"
        });
    }
    Database.getEvent(req.body, (event) => {
        if (event === undefined) {
            console.log("\t->Error, Event doesn't exist");
            return res.json({
                deleted: false,
                comment: "L'événement n'existe pas"
            })
        }
        Database.getDive({
            Planned_Dive_Id_Planned_Dive: event.Id_Planned_Dive
        }, dive => {
            if (dive) {
                console.log("\t->Error, A dive is linked to this event");
                return res.json({
                    deleted: false,
                    comment: "Une plongée est liée à cet événement"
                })
            }
            Database.deleteAllRegistration(event.Id_Planned_Dive, deleted => {
                if (!deleted) {
                    console.log("\t->Error, impossible to delete all registrations");
                    return res.json({
                        deleted: false,
                        comment: "Impossible de supprimer toutes les inscriptions"
                    })
                }
                Database.deleteEvent(event, (deleted) => {
                    if (deleted) {
                        console.log("\t->Event deleted");
                        return res.json({
                            deleted: true,
                            comment: "Evénement supprimé"
                        });
                    } else {
                        console.log("\t->Error, impossible to delete Event");
                        return res.json({
                            deleted: false,
                            comment: "Impossible de supprimer l'événement"
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
                    comment: "L'utilisateur n'existe pas"
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
                        comment: "Le lieu de plongée n'existe pas"
                    })
                }
                req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
                delete req.body.Site_Name;
                Database.getEvent(req.body, (eventInfo) => {
                    if (eventInfo === undefined) {
                        console.log("\t->Error, Event doesn't exist");
                        return res.json({
                            registered: false,
                            comment: "L'événement n'existe pas"
                        })
                    }
                    Database.getDive({
                        Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                    }, dive => {
                        if (dive) {
                            console.log("\t->Error, Dive already exist, impossible to register");
                            return res.json({
                                registered: false,
                                comment: "La plongée existe déjà, impossible de s'inscrire"
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
                                    comment: "L'utilisateur est déjà inscrit"
                                })
                            }

                            Database.getDiversRegistered(allDiversRegistered => {
                                if (allDiversRegistered === undefined) allDiversRegistered = [];
                                allDiversRegistered = allDiversRegistered.filter(diverInfo => diverInfo.Planned_Dive_Id_Planned_Dive == eventInfo.Id_Planned_Dive)
                                if (eventInfo.Max_Divers == allDiversRegistered.length) {
                                    console.log("\t->Error, Max divers reached");
                                    return res.json({
                                        registered: false,
                                        comment: "Nombre maximum de plongeurs atteint"
                                    })
                                }

                                Database.createRegistration(data, (created) => {
                                    if (created) {
                                        console.log(`\t->${userInfo.Firstname} ${userInfo.Lastname} registered`);
                                        return res.json({
                                            registered: true,
                                            comment: "Inscription enregistrée"
                                        })
                                    } else {
                                        console.log("\t->Error, impossible to register user");
                                        return res.json({
                                            registered: false,
                                            comment: "Impossible de s'inscrire"
                                        });
                                    }
                                });
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
                comment: "L'utilisateur n'existe pas"
            })
        }
        Database.getDiveSite({
            Site_Name: req.body.Site_Name
        }, (locationInfo) => {
            if (locationInfo === undefined) {
                console.log("\t->Error, Location doesn't exist");
                return res.json({
                    registered: false,
                    comment: "Le lieu de plongée n'existe pas"
                })
            }
            req.body.Dive_Site_Id_Dive_Site = locationInfo.Id_Dive_Site;
            delete req.body.Site_Name;

            Database.getEvent(req.body, (eventInfo) => {
                if (eventInfo === undefined) {
                    console.log("\t->Error, Event doesn't exist");
                    return res.json({
                        deleted: false,
                        comment: "L'événement n'existe pas"
                    })
                }
                Database.getDive({
                    Planned_Dive_Id_Planned_Dive: eventInfo.Id_Planned_Dive
                }, dive => {
                    if (dive) {
                        console.log("\t->Error, Dive already exist, impossible to unregister");
                        return res.json({
                            deleted: false,
                            comment: "La plongée existe déjà, impossible de se désinscrire"
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
                                comment: "L'utilisateur n'est pas inscrit"
                            })
                        }
                        if (registration.Diver_Role === "DP") {
                            console.log("\t->Error, DP can't unregister");
                            return res.json({
                                deleted: false,
                                comment: "Le DP ne peut pas se désinscrire"
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
                                    comment: "Désinscription enregistrée"
                                })
                            } else {
                                console.log("\t->Error, impossible to delete registration");
                                return res.json({
                                    deleted: false,
                                    comment: "Impossible de se désinscrire"
                                });
                            }
                        });
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
                comment: "Le lieu de plongée n'existe pas"
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
                    comment: "L'événement n'existe pas"
                })
            }
            Database.deleteAllRegistration(event.Id_Planned_Dive, deleted => {
                if (deleted) {
                    console.log("\t->All registrations deleted");
                    return res.json({
                        deleted: true,
                        comment: "Toutes les inscriptions ont été supprimées"
                    });
                } else {
                    console.log("\t->Error, impossible to delete all registrations");
                    return res.json({
                        deleted: false,
                        comment: "Impossible de supprimer toutes les inscriptions"
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
        if (userInfo === undefined) return res.json({
            data: undefined,
            comment: "L'utilisateur n'existe pas"
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
            comment: "L'id de la plongée n'est pas défini",
            redirect: true
        });
    };
    Database.getDive({
        Id_Dive: req.session.idDive
    }, (dive) => {
        if (dive === undefined) return res.json({
            data: undefined,
            comment: "La plongée n'existe pas"
        });
        Database.getEventById(dive.Planned_Dive_Id_Planned_Dive, (event) => {
            if (event === undefined) return res.json({
                data: undefined,
                comment: "L'événement n'existe pas"
            });
            Database.getDiveSite({
                Id_Dive_Site: event.Dive_Site_Id_Dive_Site
            }, (location) => {
                if (location === undefined) return res.json({
                    data: undefined,
                    comment: "Le lieu de plongée n'existe pas"
                });
                Database.getEmergencyPlan({
                    Id_Emergency_Plan: location.Id_Dive_Site
                }, (emergencyPlan) => {
                    if (emergencyPlan === undefined) return res.json({
                        data: undefined,
                        comment: "Le plan d'urgence n'existe pas"
                    });
                    Database.getDiversRegistered((allDivers) => {
                        if (allDivers === undefined) allDivers = [];
                        allDivers = allDivers.filter(diver => diver.Planned_Dive_Id_Planned_Dive == event.Id_Planned_Dive);
                        location.emergencyPlan = emergencyPlan;
                        event.Location = location;
                        event.allDivers = allDivers;

                        Database.getAllDiveTeamMember({
                            Dive_Id_Dive: dive.Id_Dive
                        }, (allDiveTeamMember) => {
                            if (allDiveTeamMember === undefined) allDiveTeamMember = [];

                            Database.getDiveTeam({
                                Dive_Id_Dive: dive.Id_Dive
                            }, async (allPalanquee) => {
                                let Palanquees = [];
                                if (allPalanquee !== undefined) {
                                    for (const palanquee of allPalanquee) {
                                        let obj = {};
                                        obj.Params = palanquee
                                        let divers = allDiveTeamMember.filter(member => member.Dive_Team_Id_Dive_Team == palanquee.Id_Dive_Team);

                                        obj.Diver = [];
                                        for (const diver of divers) {
                                            let data = {}
                                            if (diver.Temporary_Diver_Qualification != "") data.Qualification = diver.Temporary_Diver_Qualification;
                                            else data.Qualification = diver.Current_Diver_Qualification;
                                            data.Fonction = diver.Diver_Role;
                                            let userInfo = await Database.getUserInfoSync({
                                                Id_Diver: diver.Diver_Id_Diver
                                            })
                                            data.Firstname = userInfo.Firstname;
                                            data.Lastname = userInfo.Lastname;
                                            data.Mail = userInfo.Mail;
                                            obj.Diver.push(data)
                                        }
                                        Palanquees.push(obj);
                                    }
                                }

                                event.allDivers.forEach(diver => {
                                    let found = allDiveTeamMember.find(member => member.Diver_Id_Diver == diver.Id_Diver);
                                    if (found) diver.Temporary_Qualification = found.Temporary_Diver_Qualification;
                                    else diver.Temporary_Qualification = "";
                                })

                                Database.getMaxDepth(listMaxDepth => {
                                    if (listMaxDepth == undefined) return res.json({
                                        data: undefined,
                                        comment: "La liste des profondeurs maximales n'existe pas"
                                    });

                                    let data = {
                                        dive,
                                        palanquee: Palanquees,
                                        event,
                                        listMaxDepth
                                    }
                                    return res.json({
                                        data,
                                        comment: "Palanquée récupérée"
                                    });
                                });
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
        if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
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
                    comment: "La plongée n'existe pas"
                });
                DiveTeamMember.forEach(member => {
                    if (member.Paid_Amount === "E") member.Paid_Amount = dive.Instructor_Price;
                    else member.Paid_Amount = dive.Diver_Price;
                });

                Database.getAllDiveTeamMember({
                    Dive_Id_Dive: idDive
                }, (allDiveTeamMember) => {
                    if (allDiveTeamMember !== undefined) {
                        // si les membres de DiveTeamMember sont déjà dans allDiveTeamMember, on les supprime du tableau DiveTeamMember
                        let diversFound = []
                        DiveTeamMember.forEach(member => {
                            let found = allDiveTeamMember.find(memberDiveTeam => memberDiveTeam.Diver_Id_Diver == member.Diver_Id_Diver);
                            if (found) diversFound.push(member);
                        });
                        diversFound.forEach(diver => {
                            let index = DiveTeamMember.indexOf(diver);
                            DiveTeamMember.splice(index, 1);
                        })
                    }
                    if (DiveTeamMember.length == 0) return res.json({
                        created: true,
                        comment: "Tous les plongeurs sont déjà inscrits"
                    });
                    Database.createDiveTeamMember(DiveTeamMember, (created) => {
                        if (!created) {
                            console.log("\t->Error, impossible to create all Dive Team Member");
                            return res.json({
                                created: false,
                                comment: "Impossible de créer tous les membres de la palanquée"
                            });
                        } else {
                            console.log("\t->All Dive Team Member created");
                            return res.json({
                                created: true,
                                comment: "Tous les membres de la palanquée ont été créés"
                            });
                        }
                    });
                });
            });
        });
    });

app.post('/auth/dp/palanquee/dive_team', keycloak.protect(),
    body("*.Divers.*.Mail").trim().toLowerCase().exists(),
    body("*.Divers.*.Fonction").trim().escape().exists(),
    body("*.Params.Max_Depth").trim().escape().exists(),
    body("*.Params.Actual_Depth").trim().escape(),
    body("*.Params.Max_Duration").trim().escape().exists(),
    body("*.Params.Actual_Duration").trim().escape(),
    body("*.Params.Dive_Type").trim().escape().exists(),
    body("*.Params.Floor_3").trim().escape().exists(),
    body("*.Params.Floor_6").trim().escape().exists(),
    body("*.Params.Floor_9").trim().escape().exists(),
    body("*.Params.Start_Date").trim().escape().exists(),
    body("*.Params.End_Date").trim().escape().exists(),
    body("*.Params.Palanquee_Type").trim().escape().exists(),
    function (req, res) {
        if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
        });
        let idDive = req.session.idDive;

        let dataError = {
            success: true,
            comment: ""
        }

        // Vérifier le nombre de plongeurs par palanquee : si 2<=PA<=3 / 2<=PE<=5(ou 6 si 2 GP)
        // Si baptême : 1 plongeur P0 et 1 GP dans une palanquée

        // Vérifier au moins un GP par palanquée, sauf si niveau PA
        // Vérifier que la profonduer prévue coincide avec le niveau des plongeurs de la palanquée

        // Si technique : au moins un plongeur avec qualificatione E, attention à la profondeur max

        console.log("--- Verifying Palanquee Info ---");
        Database.getMaxDepth(async listMaxDepth => {
            for (const key in req.body) {
                const palanquee = req.body[key];
                const divers = palanquee.Divers;
                const params = palanquee.Params;
                const maxDepth = parseInt(params.Max_Depth);

                // Time : Max_Duration, Actual_Duration, Start_Date, End_Date, Floor_3, Floor_6, Floor_9
                params.Start_Date = getDateFormat(new Date(params.Start_Date).toLocaleString());
                params.End_Date = getDateFormat(new Date(params.End_Date).toLocaleString());
                params.Max_Duration = getTimeFormat(new Date(params.Max_Duration).toLocaleString());
                params.Actual_Duration = getTimeFormat(new Date(params.Actual_Duration).toLocaleString());
                params.Floor_3 = getTimeFormat(new Date(params.Floor_3).toLocaleString());
                params.Floor_6 = getTimeFormat(new Date(params.Floor_6.toLocaleString()));
                params.Floor_9 = getTimeFormat(new Date(params.Floor_9.toLocaleString()));

                if (params.Dive_Type === "Exploration") {
                    /* ------------------------------- EXPLORATION ------------------------------ */
                    if (params.Palanquee_Type === "Pa") {
                        /* ---------------------------- PLONGEE AUTONOME ---------------------------- */
                        // Vérification du nombre de plongeurs
                        if (divers.length < 2 || divers.length > 3) {
                            dataError.success = false;
                            dataError.comment = `Palanquée n°${key} : le nombre de plongeurs est incorrect pour une plongée autonome`;
                            break
                        }

                        // Vérification de la profondeur de plongée
                        // on cherche le plus petit niveau autonome parmi les plongeurs de la palanquée
                        let minLevel = 60;
                        divers.forEach(diver => {
                            if (diver.Qualification === "P0") {
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : un plongeur est qualifié P0 alors que la plongée est autonome`;
                                return
                            }
                            if (diver.Qualification.split("Pe")[0] == "") {
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : un plongeur à une qualification Pe alors que la plongée est autonome`;
                                return
                            }

                            if (diver.Qualification.split("Pa")[0] == "") {
                                let level = parseInt(diver.Qualification.split("Pa")[1]);
                                if (level < minLevel) minLevel = level;
                            } else {
                                let depth = listMaxDepth.find(level => level.Diver_Qualification === diver.Qualification);
                                if (depth) {
                                    let level = depth.Autonomous_Diver_Depth;
                                    if (level < minLevel) minLevel = level;
                                }
                            }
                            if (minLevel < maxDepth) {
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : la profondeur prévue est trop importante pour le niveau d'un plongeur`;
                                return
                            }
                        });



                    } else if (params.Palanquee_Type === "Pe") {
                        /* ---------------------------- PLONGEE ENCADREE ---------------------------- */
                        let nbGp = 0;
                        for (const diver of divers) {
                            // Comptage du nombre de GP
                            if (diver.Fonction === "GP") {
                                console.log("GP", diver.Mail);
                                let gpInfo = await Database.getUserInfoSync({
                                    Mail: diver.Mail
                                });
                                
                                if (gpInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Palanquée n°${key} : le guide de palanquée n'existe pas`;
                                    break
                                }
                                if (gpInfo.Diver_Qualification !== "P4" && gpInfo.Diver_Qualification !== "P5") {
                                    dataError.success = false;
                                    dataError.comment = `Palanquée n°${key} : le guide de palanquée n'est pas qualifié P4 ou P5`;
                                    break
                                }
                                nbGp++;
                            }
                            // Vérification du baptème
                            if (diver.Qualification === "P0" && divers.length !== 2) {
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : le nombre de plongeurs est incorrect pour un bapteme`;
                                break
                            }
                        }
                        if (dataError.success === false) break;
                        // Vérification du nombre de GP
                        if (nbGp === 0) {
                            dataError.success = false;
                            dataError.comment = `Palanquée n°${key} : il n'y a pas de guide de palanquée pour une plongée encadrée`;
                            break
                        }
                        // Vérification du nombre de plongeurs
                        if (!((divers.length >= 2 && divers.length <= 5 && nbGp >= 1) || (divers.length === 6 && nbGp >= 2))) {
                            dataError.comment = `Palanquée n°${key} : le nombre de plongeurs est incorrect pour une plongée encadrée, ou il n'y a pas assez de guide de palanquée`;
                            dataError.success = false;
                            break
                        }

                        // Vérification de la profondeur de plongée
                        let maxDepth = parseInt(params.Max_Depth);
                        // on cherche le plus petit niveau autonome parmi les plongeurs de la palanquée
                        let minLevel = 60;
                        divers.forEach(diver => {
                            if (diver.Qualification.split("Pa")[0] == "") {
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : un plongeur à une qualification Pa alors que la plongée est encadrée`;
                                return
                            }

                            if (diver.Qualification.split("Pe")[0] == "") {
                                let level = parseInt(diver.Qualification.split("Pe")[1]);
                                if (level < minLevel) minLevel = level;
                            } else {
                                let depth = listMaxDepth.find(level => level.Diver_Qualification === diver.Qualification);
                                if (depth) {
                                    let level = depth.Guided_Diver_Depth;
                                    if (level < minLevel) minLevel = level;
                                }
                            }
                            if (minLevel < maxDepth) {
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : la profondeur prévue est trop importante pour le niveau d'un plongeur`;
                                return
                            }
                        });
                    }
                } else if (params.Dive_Type === "Technique") {
                    /* -------------------------------- TECHNIQUE ------------------------------- */
                    let nbGp = 0;
                    let lvlMinGp = 60;

                    if (params.Palanquee_Type === "Pa") {
                        dataError.success = false;
                        dataError.comment = `Palanquée n°${key} : une plongée technique ne peut pas être autonome`;
                        break;
                    }
                    for (const diver of divers) {
                        // Comptage du nombre de GP
                        if (diver.Fonction === "GP") {
                            let gpInfo = await Database.getUserInfoSync({
                                Mail: diver.Mail
                            });
                            if (gpInfo === undefined) {
                                console.log("GP does not exist for Technique");
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : le guide de palanquée n'existe pas`;
                                break
                            }
                            if (gpInfo.Instructor_Qualification === "E0") {
                                console.log("GP does not have qualification E");
                                dataError.success = false;
                                dataError.comment = `Palanquée n°${key} : le guide de palanquée n'a pas les qualifications nécessaires`;
                                break
                            }
                            let instruLevel = listMaxDepth.find(level => level.Diver_Qualification === gpInfo.Instructor_Qualification);
                            if (instruLevel < lvlMinGp) lvlMinGp = instruLevel;
                            nbGp++;
                        }
                        // Vérification du baptème
                        if (diver.Qualification === "P0" && divers.length !== 2) {
                            dataError.success = false;
                            dataError.comment = `Palanquée n°${key} : le nombre de plongeurs est incorrect pour un bapteme`;
                            break
                        }
                    }
                    if (dataError.success === false) break;
                    // Comparaison du niveau de profondeur du gp avec la profondeur max
                    if (lvlMinGp < maxDepth) {
                        dataError.success = false;
                        dataError.comment = `Palanquée n°${key} : la profondeur prévue est trop importante pour le niveau du guide de palanquée`;
                        break
                    }

                    // Vérification du nombre de GP
                    if (nbGp === 0) {
                        console.log("aucun gp");
                        dataError.success = false;
                        dataError.comment = `Palanquée n°${key} : il n'y a pas de guide de palanquée pour une plongée encadrée`;
                        break
                    }
                    // Vérification du nombre de plongeurs
                    if (!((divers.length >= 2 && divers.length <= 5 && nbGp >= 1) || (divers.length === 6 && nbGp >= 2))) {
                        dataError.comment = `Palanquée n°${key} : le nombre de plongeurs est incorrect pour une plongée encadrée, ou il n'y a pas assez de guide de palanquée`;
                        dataError.success = false;
                        break
                    }

                    // on cherche le plus petit niveau autonome parmi les plongeurs de la palanquée
                    let minLevel = 60;
                    divers.forEach(diver => {
                        if (diver.Qualification.split("Pa")[0] == "") {
                            dataError.success = false;
                            dataError.comment = `Palanquée n°${key} : un plongeur à une qualification Pa alors que la plongée est encadrée`;
                            return
                        }

                        if (diver.Qualification.split("Pe")[0] == "") {
                            let level = parseInt(diver.Qualification.split("Pe")[1]);
                            if (level < minLevel) minLevel = level;
                        } else {
                            let depth = listMaxDepth.find(level => level.Diver_Qualification === diver.Qualification);
                            if (depth) {
                                let level = depth.Guided_Diver_Depth;
                                if (level < minLevel) minLevel = level;
                            }
                        }
                        if (minLevel < maxDepth) {
                            dataError.success = false;
                            dataError.comment = `Palanquée n°${key} : la profondeur prévue est trop importante pour le niveau d'un plongeur`;
                            return
                        }
                    });
                }
            }
            if (dataError.success) {
                console.log("\t->Palanquee Info verified");
                // Supprimer toutes les palanquées existantes (s'il y en a) pour les recréer avec les nouvelles données
                // Créer les palanquées
                // Update info dive team member
                console.log("--- Deleting old version of palanquee ---");
                let resDelete = await Database.DeleteDiveTeam({
                    Dive_Id_Dive: idDive
                });
                if (!resDelete) {
                    console.log("\t->Can't delete old version of palanquees");
                    dataError.success = false;
                    dataError.comment = "Impossible de supprimer une ancienne version des palanquées";
                    return res.json(dataError);
                }
                console.log("\t->Old version of palanquee deleted");

                let toCreate = [];
                for (const key in req.body) {
                    let palanquee = req.body[key].Params
                    const Id_Dive_Team = uuidv4();
                    req.body[key].Params.Id_Dive_Team = Id_Dive_Team;
                    toCreate.push([Id_Dive_Team, key, palanquee.Palanquee_Type, palanquee.Max_Depth, palanquee.Actual_Depth, palanquee.Max_Duration, palanquee.Actual_Duration, palanquee.Dive_Type, palanquee.Floor_3, palanquee.Floor_6, palanquee.Floor_9, getDateFormat(new Date(palanquee.Start_Date).toLocaleString()), getDateFormat(new Date(palanquee.End_Date).toLocaleString()), "", idDive]);
                }
                console.log("--- Inserting new palanquees ---")
                let resCreateTeam = await Database.createDiveTeam(toCreate);
                if (!resCreateTeam) {
                    console.log("\t->Can't insert palanquees")
                    dataError.success = false;
                    dataError.comment = "Impossible d'insérer les palanquées";
                    return res.json(dataError);
                } else {
                    dataError.comment = "Palanquées correctement ajoutées";
                }
                console.log("\t->Palanquees inserted")

                console.log("--- Updating diver role ---");
                for (const key in req.body) {
                    const palanquee = req.body[key];
                    const divers = palanquee.Divers;
                    const Id_Dive_Team = palanquee.Params.Id_Dive_Team;
                    for (const diver of divers) {
                        let tmp = {
                            Mail: diver.Mail
                        };
                        let userInfo = await Database.getUserInfoSync(tmp);
                        if (userInfo == undefined) {
                            console.log("\t->Can't find user info");
                            dataError.success = true;
                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail} pour les mettre à jour`;
                            break
                        }
                        const data = {
                            Diver_Id_Diver: userInfo.Id_Diver,
                            Dive_Id_Dive: idDive,
                        }
                        let diverInTeamInfo = await Database.getDiveTeamMember(data);
                        if (diverInTeamInfo === undefined) {
                            console.log("\t->Impossible to get diver info")
                            dataError.success = true;
                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail} pour les mettre à jour`;
                            break
                        } else {
                            diverInTeamInfo.Dive_Team_Id_Dive_Team = Id_Dive_Team;
                            diverInTeamInfo.Diver_Role = diver.Fonction;
                            let updated = await Database.updateDiveTeamMember(diverInTeamInfo)
                            if (!updated) {
                                console.log("\t->Impossible to update diver info")
                                dataError.success = true;
                                dataError.comment = `Impossible de modifier les informations du plongeur ${diver.Mail}`
                                break
                            }
                        }
                    }
                }
                Database.getDive({
                    Id_Dive: idDive
                }, async (diveInfo) => {
                    if (diveInfo === undefined) return res.json({
                        created: false,
                        comment: "La plongée n'existe pas"
                    });
                    console.log();
                    if (diveInfo.Surface_Security === ""){
                        let dpInfo = await Database.getUserInfoSync({
                            Id_Diver: diveInfo.Diver_Id_Diver
                        });
                        if (dpInfo === undefined) return res.json({
                            created: false,
                            comment: "Le directeur de plongée n'existe pas"
                        }); 
                        diveInfo.Surface_Security = dpInfo.Firstname + " " + dpInfo.Lastname;
                    }
                    diveInfo.Last_Modif = getDateFormat(new Date());
                    let ismodif = await Database.modifDive(diveInfo);
                    if (!ismodif) return res.json({
                        created: false,
                        comment: "Impossible de modifier la plongée"
                    });
                });
            } else {
                console.log("\t->Error, Palanquee Info verified but not correct");
            }
            return res.json(dataError)
        });
    });

app.get("/auth/dp/palanquee/automatic_dive_team", keycloak.protect(), function (req, res) {
    console.log("--- Automatic Dive Team ---");
    if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
    if (!req.session.idDive) res.redirect('/auth/planning');

    let dataError = {
        success: true,
        comment: ""
    }

    Database.getMaxDepth(listMaxDepth => {
        if (listMaxDepth == undefined) {
            dataError.success = false;
            dataError.comment = "Impossible de récupérer les informations de profondeur";
            return res.json(dataError);
        }
        Database.getDive({
            Id_Dive: req.session.idDive
        }, diveInfo => {
            if (diveInfo === undefined) {
                dataError.success = false;
                dataError.comment = "Impossible de récupérer les informations de la plongée";
                return res.json(dataError);
            }
            Database.getEventById(diveInfo.Planned_Dive_Id_Planned_Dive, eventInfo => {
                if (eventInfo === undefined) {
                    dataError.success = false;
                    dataError.comment = "Impossible de récupérer les informations de l'évènement";
                    return res.json(dataError);
                }
                Database.getAllDiveTeamMember({
                    Dive_Id_Dive: req.session.idDive
                }, async allDiveTeamMember => {
                    if (allDiveTeamMember === undefined) {
                        dataError.success = false;
                        dataError.comment = "Impossible de récupérer les informations de la plongée";
                        return res.json(dataError);
                    }

                    let fullHour = new Date(new Date(eventInfo.End_Date) - new Date(eventInfo.Start_Date));
                    let min = fullHour.getMinutes();
                    let hour = fullHour.getHours() - 1;
                    min = new String(min).padStart(2, "0");
                    max = new String(hour).padStart(2, "0");
                    hour = max + ":" + min;

                    let PALANQUEES = [];
                    let Params = {
                        Max_Depth: 0,
                        Actual_Depth: 0,
                        Max_Duration: hour,
                        Actual_Duration: "00:00:00",
                        Dive_Type: eventInfo.Dive_Type,
                        Floor_3: "00:00:00",
                        Floor_6: "00:00:00",
                        Floor_9: "00:00:00",
                        Start_Date: getDateFormat(new Date(eventInfo.Start_Date).toLocaleString()),
                        End_Date: getDateFormat(new Date(eventInfo.End_Date).toLocaleString()),
                        Palanquee_Type: ""
                    }

                    if (eventInfo.Dive_Type === "Exploration") {
                        let diverPa = allDiveTeamMember.filter(member => member.Temporary_Diver_Qualification.split("Pa")[0] == "" && member.Temporary_Diver_Qualification != "");
                        let diverPe = allDiveTeamMember.filter(member => member.Temporary_Diver_Qualification.split("Pe")[0] == "" && member.Temporary_Diver_Qualification != "");

                        let diverP0 = allDiveTeamMember.filter(member => member.Current_Diver_Qualification == "P0" && member.Temporary_Diver_Qualification === "");
                        let diverP1 = allDiveTeamMember.filter(member => member.Current_Diver_Qualification == "P1" && member.Temporary_Diver_Qualification === "");
                        let diverP2 = allDiveTeamMember.filter(member => member.Current_Diver_Qualification == "P2" && member.Temporary_Diver_Qualification === "");
                        let diverP3 = allDiveTeamMember.filter(member => member.Current_Diver_Qualification == "P3" && member.Temporary_Diver_Qualification === "");

                        let allGp = allDiveTeamMember.filter(member => (member.Current_Diver_Qualification == "P4" || member.Current_Diver_Qualification == "P5") && member.Temporary_Diver_Qualification === "");
                        /* ------------------------------- BAPTEMES P0 ------------------------------ */
                        if (diverP0.length > 0) {
                            while (diverP0.length > 0 && allGp.length > 0) {
                                // mettre 1 gp + 1 diver dans un tableau de Divers
                                // remplir les params en fonction
                                // push le tableau dans PALANQUEES
                                let Divers = [];

                                let diver = diverP0[0];
                                let userInfo = await Database.getUserInfoSync({
                                    Id_Diver: diver.Diver_Id_Diver
                                });
                                if (userInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                    return res.json(dataError);
                                }
                                Divers.push({
                                    Mail: userInfo.Mail,
                                    Firstname: userInfo.Firstname,
                                    Lastname: userInfo.Lastname,
                                    Fonction: "Plongeur",
                                    Qualification: userInfo.Diver_Qualification
                                })
                                diverP0.splice(0, 1);

                                let gp = allGp[0];
                                let gpInfo = await Database.getUserInfoSync({
                                    Id_Diver: gp.Diver_Id_Diver
                                });
                                if (gpInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${gp.Mail}`;
                                    return res.json(dataError);
                                }
                                Divers.push({
                                    Mail: gpInfo.Mail,
                                    Firstname: gpInfo.Firstname,
                                    Lastname: gpInfo.Lastname,
                                    Fonction: "GP",
                                    Qualification: gpInfo.Diver_Qualification
                                })
                                allGp.splice(0, 1);

                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 6;
                                tmpParam.Palanquee_Type = "Pe";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }
                        if (diverP0.length > 0 && allGp.length == 0) {
                            dataError.success = true;
                            dataError.comment = `Pas assez de GP pour les baptêmes P0`;
                        }

                        /* ------------------------------- PLONGEURS Pe ------------------------------ */
                        let pe40 = diverPe.filter(member => member.Temporary_Diver_Qualification === "Pe40");
                        let pe60 = diverPe.filter(member => member.Temporary_Diver_Qualification === "Pe60");

                        while ((pe40.length > 0 || pe60.length > 0) && allGp.length > 0) {
                            /* ---------------------------------- PE40 ---------------------------------- */
                            if (pe40.length > 0 && allGp.length > 0) {
                                let ratio = pe40.length / allGp.length;
                                if (ratio > 4) ratio = 4;
                                else ratio = Math.ceil(ratio);

                                while (pe40.length > 0 && allGp.length > 0) {
                                    let Divers = [];
                                    let i = 0;
                                    let gpInfo = await Database.getUserInfoSync({
                                        Id_Diver: allGp[0].Diver_Id_Diver
                                    });
                                    if (gpInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${allGp[i].Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: gpInfo.Mail,
                                        Firstname: gpInfo.Firstname,
                                        Lastname: gpInfo.Lastname,
                                        Fonction: "GP",
                                        Qualification: gpInfo.Diver_Qualification
                                    })
                                    allGp.splice(0, 1);
                                    while (i < ratio && pe40.length > 0 && allGp.length > 0) {
                                        let diver = pe40[0];
                                        let userInfo = await Database.getUserInfoSync({
                                            Id_Diver: diver.Diver_Id_Diver
                                        });
                                        if (userInfo === undefined) {
                                            dataError.success = false;
                                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                            return res.json(dataError);
                                        }
                                        Divers.push({
                                            Mail: userInfo.Mail,
                                            Firstname: userInfo.Firstname,
                                            Lastname: userInfo.Lastname,
                                            Fonction: "Plongeur",
                                            Qualification: userInfo.Diver_Qualification
                                        })
                                        pe40.splice(0, 1);
                                        i++;
                                    }
                                    let tmpParam = Object.assign({}, Params);;
                                    tmpParam.Max_Depth = 40;
                                    tmpParam.Palanquee_Type = "Pe";
                                    let palanquee = {
                                        Diver: Divers,
                                        Params: tmpParam
                                    }
                                    PALANQUEES.push(palanquee);
                                }
                            }
                            /* ---------------------------------- PE60 ---------------------------------- */
                            if (pe60.length > 0 && allGp.length > 0) {
                                let ratio = pe60.length / allGp.length;
                                if (ratio > 4) ratio = 4;
                                else ratio = Math.ceil(ratio);

                                while (pe60.length > 0 && allGp.length > 0) {
                                    let Divers = [];
                                    let i = 0;
                                    let gpInfo = await Database.getUserInfoSync({
                                        Id_Diver: allGp[0].Diver_Id_Diver
                                    });
                                    if (gpInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${allGp[i].Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: gpInfo.Mail,
                                        Firstname: gpInfo.Firstname,
                                        Lastname: gpInfo.Lastname,
                                        Fonction: "GP",
                                        Qualification: gpInfo.Diver_Qualification
                                    })
                                    allGp.splice(0, 1);
                                    while (i < ratio && pe60.length > 0 && allGp.length > 0) {
                                        let diver = pe60[0];
                                        let userInfo = await Database.getUserInfoSync({
                                            Id_Diver: diver.Diver_Id_Diver
                                        });
                                        if (userInfo === undefined) {
                                            dataError.success = false;
                                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                            return res.json(dataError);
                                        }
                                        Divers.push({
                                            Mail: userInfo.Mail,
                                            Firstname: userInfo.Firstname,
                                            Lastname: userInfo.Lastname,
                                            Fonction: "Plongeur",
                                            Qualification: userInfo.Diver_Qualification
                                        })
                                        pe60.splice(0, 1);
                                        i++;
                                    }
                                    let tmpParam = Object.assign({}, Params);;
                                    tmpParam.Max_Depth = 60;
                                    tmpParam.Palanquee_Type = "Pe";
                                    let palanquee = {
                                        Diver: Divers,
                                        Params: tmpParam
                                    }
                                    PALANQUEES.push(palanquee);
                                }
                            }
                        }

                        /* ------------------------------- P1 ENCADRE ------------------------------- */
                        if (diverP1.length > 0 && allGp.length > 0) {
                            let ratio = diverP1.length / allGp.length;
                            if (ratio > 4) ratio = 4;
                            else ratio = Math.ceil(ratio);

                            while (diverP1.length > 0 && allGp.length > 0) {
                                let Divers = [];
                                let i = 0;
                                let gpInfo = await Database.getUserInfoSync({
                                    Id_Diver: allGp[0].Diver_Id_Diver
                                });
                                if (gpInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${allGp[i].Mail}`;
                                    return res.json(dataError);
                                }
                                Divers.push({
                                    Mail: gpInfo.Mail,
                                    Firstname: gpInfo.Firstname,
                                    Lastname: gpInfo.Lastname,
                                    Fonction: "GP",
                                    Qualification: gpInfo.Diver_Qualification
                                })
                                allGp.splice(0, 1);
                                while (i < ratio && diverP1.length > 0) {
                                    let diver = diverP1[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    diverP1.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 20;
                                tmpParam.Palanquee_Type = "Pe";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }

                        /* ------------------------------- P2 ENCADRE ------------------------------- */
                        if (diverP2.length > 0) {
                            let palanquee40 = PALANQUEES.filter(palanquee => palanquee.Params.Max_Depth === 40);
                            let ratio = (diverP2.length + palanquee40.length) / allGp.length;
                            if (ratio > 4) ratio = 4;
                            else ratio = Math.ceil(ratio);
                            for (const palanquee of PALANQUEES) {
                                if (palanquee.Params.Max_Depth === 40) {
                                    while (palanquee.Diver.length < ratio) {
                                        let diver = diverP2[0];
                                        let userInfo = await Database.getUserInfoSync({
                                            Id_Diver: diver.Diver_Id_Diver
                                        });
                                        if (userInfo === undefined) {
                                            dataError.success = false;
                                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                            return res.json(dataError);
                                        }
                                        palanquee.Diver.push({
                                            Mail: userInfo.Mail,
                                            Firstname: userInfo.Firstname,
                                            Lastname: userInfo.Lastname,
                                            Fonction: "Plongeur",
                                            Qualification: userInfo.Diver_Qualification
                                        })
                                        diverP2.splice(0, 1);
                                    }
                                }
                            }
                            while (diverP2.length > 0 && allGp.length > 0) {
                                let Divers = [];
                                let i = 0;
                                let gpInfo = await Database.getUserInfoSync({
                                    Id_Diver: allGp[0].Diver_Id_Diver
                                });
                                if (gpInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${allGp[i].Mail}`;
                                    return res.json(dataError);
                                }
                                Divers.push({
                                    Mail: gpInfo.Mail,
                                    Firstname: gpInfo.Firstname,
                                    Lastname: gpInfo.Lastname,
                                    Fonction: "GP",
                                    Qualification: gpInfo.Diver_Qualification
                                })
                                allGp.splice(0, 1);
                                while (i < ratio && diverP2.length > 0) {
                                    let diver = diverP2[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    diverP2.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 40;
                                tmpParam.Palanquee_Type = "Pe";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }

                        /* ------------------------------- P3 ENCADRE ------------------------------- */
                        if (diverP3.length > 0) {
                            let palanquee60 = PALANQUEES.filter(palanquee => palanquee.Params.Max_Depth === 60);
                            let ratio = (diverP3.length + palanquee60.length) / allGp.length;
                            if (ratio > 4) ratio = 4;
                            else ratio = Math.ceil(ratio);
                            for (const palanquee of PALANQUEES) {
                                if (palanquee.Params.Max_Depth === 60) {
                                    while (palanquee.Diver.length < ratio && diverP3.length > 0) {
                                        let diver = diverP3[0];
                                        let userInfo = await Database.getUserInfoSync({
                                            Id_Diver: diver.Diver_Id_Diver
                                        });
                                        if (userInfo === undefined) {
                                            dataError.success = false;
                                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                            return res.json(dataError);
                                        }
                                        palanquee.Diver.push({
                                            Mail: userInfo.Mail,
                                            Firstname: userInfo.Firstname,
                                            Lastname: userInfo.Lastname,
                                            Fonction: "Plongeur",
                                            Qualification: userInfo.Diver_Qualification
                                        })
                                        diverP3.splice(0, 1);
                                    }
                                }
                            }
                            while (diverP3.length > 0 && allGp.length > 0) {
                                let Divers = [];
                                let i = 0;
                                let gpInfo = await Database.getUserInfoSync({
                                    Id_Diver: allGp[0].Diver_Id_Diver
                                });
                                if (gpInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${allGp[i].Mail}`;
                                    return res.json(dataError);
                                }
                                Divers.push({
                                    Mail: gpInfo.Mail,
                                    Firstname: gpInfo.Firstname,
                                    Lastname: gpInfo.Lastname,
                                    Fonction: "GP",
                                    Qualification: gpInfo.Diver_Qualification
                                })
                                allGp.splice(0, 1);
                                while (i < ratio && diverP3.length > 0) {
                                    let diver = diverP3[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    diverP3.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 60;
                                tmpParam.Palanquee_Type = "Pe";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }

                        /* ---------------------------- P4 OU P5 RESTANTS --------------------------- */
                        if (allGp.length > 1) {
                            let palanquee60 = PALANQUEES.filter(palanquee => palanquee.Params.Max_Depth === 60);
                            let ratio = (allGp.length + palanquee60.length) / allGp.length;
                            if (ratio > 4) ratio = 4;
                            else ratio = Math.ceil(ratio);
                            for (const palanquee of PALANQUEES) {
                                if (palanquee.Params.Max_Depth === 60) {
                                    while (palanquee.Diver.length < ratio && allGp.length > 0) {
                                        let diver = allGp[0];
                                        let userInfo = await Database.getUserInfoSync({
                                            Id_Diver: diver.Diver_Id_Diver
                                        });
                                        if (userInfo === undefined) {
                                            dataError.success = false;
                                            dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                            return res.json(dataError);
                                        }
                                        palanquee.Diver.push({
                                            Mail: userInfo.Mail,
                                            Firstname: userInfo.Firstname,
                                            Lastname: userInfo.Lastname,
                                            Fonction: "Plongeur",
                                            Qualification: userInfo.Diver_Qualification
                                        })
                                        allGp.splice(0, 1);
                                    }
                                }
                            }
                            while (allGp.length > 0) {
                                let Divers = [];
                                let i = 0;
                                let gpInfo = await Database.getUserInfoSync({
                                    Id_Diver: allGp[0].Diver_Id_Diver
                                });
                                if (gpInfo === undefined) {
                                    dataError.success = false;
                                    dataError.comment = `Impossible de récupérer les informations du guide de palanquée ${allGp[i].Mail}`;
                                    return res.json(dataError);
                                }
                                Divers.push({
                                    Mail: gpInfo.Mail,
                                    Firstname: gpInfo.Firstname,
                                    Lastname: gpInfo.Lastname,
                                    Fonction: "GP",
                                    Qualification: gpInfo.Diver_Qualification
                                })
                                allGp.splice(0, 1);
                                while (i < ratio && allGp.length > 0) {
                                    let diver = allGp[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    allGp.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 60;
                                tmpParam.Palanquee_Type = "Pe";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }

                        /* ---------------------------- PLONGEE AUTONOME ---------------------------- */
                        if (diverP1.length > 1) {
                            while (diverP1.length > 1) {
                                let Divers = [];
                                let i = 0;
                                while (i < 3 && diverP1.length > 0) {
                                    let diver = diverP1[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    diverP1.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 12;
                                tmpParam.Palanquee_Type = "Pa";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }
                        let diverPa20 = diverPa.filter(member => member.Temporary_Diver_Qualification === "Pa20");
                        if (diverP2.length > 1 || diverPa20.length > 1) {
                            // ajoute les plongeurs en Pa40 dans le tableau de diverP2
                            diverP2 = diverP2.concat(diverPa20);
                            while (diverP2.length > 1) {
                                let Divers = [];
                                let i = 0;
                                while (i < 3 && diverP2.length > 0) {
                                    let diver = diverP2[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    diverP2.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 20;
                                tmpParam.Palanquee_Type = "Pa";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }

                        console.log("diverP3 : ", diverP3);
                        console.log("allGp : ", allGp);
                        let diverPa60 = diverPa.filter(member => member.Temporary_Diver_Qualification === "Pa60");
                        console.log("diverPa60 : ", diverPa60);
                        diverP3 = diverP3.concat(diverPa60);
                        diverP3 = diverP3.concat(allGp);
                        console.log("diverP3 : ", diverP3);
                        if (diverP3.length > 1 ) {

                            while (diverP3.length > 1) {
                                let Divers = [];
                                let i = 0;
                                while (i < 3 && diverP3.length > 0) {
                                    let diver = diverP3[0];
                                    let userInfo = await Database.getUserInfoSync({
                                        Id_Diver: diver.Diver_Id_Diver
                                    });
                                    if (userInfo === undefined) {
                                        dataError.success = false;
                                        dataError.comment = `Impossible de récupérer les informations du plongeur ${diver.Mail}`;
                                        return res.json(dataError);
                                    }
                                    Divers.push({
                                        Mail: userInfo.Mail,
                                        Firstname: userInfo.Firstname,
                                        Lastname: userInfo.Lastname,
                                        Fonction: "Plongeur",
                                        Qualification: userInfo.Diver_Qualification
                                    })
                                    diverP3.splice(0, 1);
                                    i++;
                                }
                                let tmpParam = Object.assign({}, Params);;
                                tmpParam.Max_Depth = 60;
                                tmpParam.Palanquee_Type = "Pa";
                                let palanquee = {
                                    Diver: Divers,
                                    Params: tmpParam
                                }
                                PALANQUEES.push(palanquee);
                            }
                        }

                        /* -------------------------------- TECHNIQUE ------------------------------- */
                    } else if (eventInfo.Dive_Type === "Technique") {
                        dataError.success = false;
                        dataError.comment = `Il est impossible de générer une palanquée pour une plongée technique`;
                    } else {
                        dataError.success = false;
                        dataError.comment = `Le type de plongée n'est pas correct`;
                    }
                    return res.json({
                        dataError,
                        palanquee: PALANQUEES
                    });
                });
            });
        });
    });
});


/* --------------------------------- UPDATE --------------------------------- */

app.put('/auth/dp/palanquee', keycloak.protect(),
    body("**.userMail").trim().toLowerCase(),
    body("**.tmpQualif").trim().escape(),
    body("surface").trim().escape(), // surveillant de surface
    function (req, res) {
        if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
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
            for (let i = 0; i < req.body.data.length; i++) {
                const userMail = req.body.data[i].userMail;
                console.log("userMail : ", userMail);
                const foundUser = allUsers.find(user => user.hasOwnProperty('Mail') && user.Mail === userMail);
                console.log("foundUser : ", foundUser);
                if (foundUser) {
                    let tmpData = Object.assign({}, data); // Crée une nouvelle instance d'objet avec les propriétés de data
                    tmpData.Diver_Id_Diver = foundUser.Id_Diver;
                    tmpData.Current_Diver_Qualification = foundUser.Diver_Qualification;

                    if (req.body.data[i].tmpQualif !== foundUser.Diver_Qualification && foundUser.Diver_Qualification !== "P5") {
                        let levelUp = parseInt(foundUser.Diver_Qualification.split("P")[1]) + 1;
                        let pLevelUp = "P" + levelUp;
                        let maxDepth = await Database.getMaxDepthByLevel({
                            Diver_Qualification: pLevelUp
                        });
                        if (req.body.data[i].tmpQualif.split("Pe")[0] == "") {
                            if (req.body.data[i].tmpQualif !== ("Pe" + maxDepth.Guided_Diver_Depth)) return res.json({
                                created: false,
                                comment: "La profondeur maximale pour le plongeur encadré n'est pas correcte pour la qualification actuelle"
                            });
                        } else if (req.body.data[i].tmpQualif.split("Pa")[0] == "") {
                            if (req.body.data[i].tmpQualif !== ("Pa" + maxDepth.Autonomous_Diver_Depth)) return res.json({
                                created: false,
                                comment: "La profondeur maximale pour le plongeur autonome n'est pas correcte pour la qualification actuelle"
                            });
                        }
                        tmpData.Temporary_Diver_Qualification = req.body.data[i].tmpQualif
                    };
                    tmpData.Current_Instructor_Qualification = foundUser.Instructor_Qualification;
                    if (foundUser.Instructor_Qualification !== "") tmpData.Paid_Amount = "E";
                    else tmpData.Paid_Amount = "D";

                    DiveTeamMember.push(tmpData);
                }
            }
            Database.getDive({
                Id_Dive: idDive
            }, async (diveInfo) => {
                if (diveInfo === undefined) return res.json({
                    created: false,
                    comment: "La plongée n'existe pas"
                });
                diveInfo.Surface_Security = req.body.surface;
                diveInfo.Last_Modif = getDateFormat(new Date());
                let ismodif = await Database.modifDive(diveInfo);
                if (!ismodif) return res.json({
                    created: false,
                    comment: "Impossible de modifier la plongée"
                });

                DiveTeamMember.forEach(member => {
                    if (member.Paid_Amount === "E") member.Paid_Amount = diveInfo.Instructor_Price;
                    else member.Paid_Amount = diveInfo.Diver_Price;
                });

                let allInserted = true;
                console.log("Dive Team Member : ", DiveTeamMember);
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
                        comment: "Tous les membres de la palanquée ont été modifiés avec succès"
                    });
                } else {
                    console.log("\t->Error, impossible to update all Dive Team Member");
                    return res.json({
                        created: false,
                        comment: "Impossible de modifier tous les membres de la palanquée"
                    });
                }

            });
        });
    });

app.post('/auth/dp/palanquee/upload', keycloak.protect(), function (req, res) {
    if (!checkUser(req, "DP")) return res.redirect('/auth/dashboard');
    console.log("--- Trying to upload PDF ---");
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("\t->No PDF in the request");
        return res.redirect('/auth/planning');
    }

    // on recoit un jpg, stocke le dans le 
    // si le dossier n'existe pas, crée le
    if (!fs.existsSync(__dirname + "/model/pdf")) {
        fs.mkdirSync(__dirname + "/model/pdf");
    }
    const {
        file
    } = req.files;
    if (!file) return res.json({
        success: false,
        comment: "Impossible de générer le PDF"
    });

    // Move the uploaded image to our upload folder
    file.mv(__dirname + '/model/pdf/' + req.session.idDive + '.pdf', function (err) {
        if (err) {
            console.log("\t->Error while uploading PDF ");
            console.log(err);
            return res.json({
                success: false,
                comment: "Impossible de générer le PDF"
            });
        } else {
            console.log("\t->PDF uploaded ");
            return res.json({
                success: true,
                comment: "PDF généré avec succès"
            });
        }

    });

})

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
    body("Phone").trim().escape().optional({
        checkFalsy: true
    }).isLength({
        min: 10,
        max: 10
    }).isNumeric(),
    body("Diver_Qualification").trim().escape(),
    body("Instructor_Qualification").trim().escape(),
    body("Nox_Level").trim().escape().isLength({
        min: 0,
        max: 1
    }),
    body("Additional_Qualifications").trim().escape(),
    body("License_Number").trim().escape(),
    body("License_Expiration_Date").trim().escape(),
    body("Medical_Certificate_Expiration_Date").trim().escape(),
    body("Birthdate").trim().escape(),
    body("password").trim().escape().exists(),
    async function (req, res) {
        const pass = req.body.password;
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        console.log(req.body.Nox_Level);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
        });
        req.body.Club = req.kauth.grant.access_token.content.preferred_username;
        req.body.Birthdate = getDateFormat(new Date(req.body.Birthdate));
        req.body.License_Expiration_Date = getDateFormat(new Date(req.body.License_Expiration_Date));
        req.body.Medical_Certificate_Expiration_Date = getDateFormat(new Date(req.body.Medical_Certificate_Expiration_Date));

        console.log("--- Trying to create user ---");
        if (req.body.Diver_Qualification === ("P0" || "P1")) {
            if (req.body.Instructor_Qualification !== "E0") {
                console.log("\t->Error, Instructor qualification is not E0");
                return res.json({
                    created: false,
                    comment: "Un niveau P0 ou P1 doit avoir un niveau technique E0"
                });
            }
        } else if (req.body.Diver_Qualification === ("P2" || "P3")) {
            if (req.body.Instructor_Qualification !== ("E0" && "E1")) {
                console.log("\t->Error, Instructor qualification is not E1");
                return res.json({
                    created: false,
                    comment: "Un niveau P2 ou P3 doit avoir un niveau technique E0 ou E1"
                });
            }
        }

        let responseKc = await Keycloak_module.createUser(req.body, getUserName(req));
        if (responseKc) {
            console.log("\t->User created in KC");
            Database.createUser(req.body, true, async (created) => {
                if (created) {
                    console.log("\t->User created in DB");
                    console.log("\t->User correctly created");
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
    body("Phone").trim().escape().optional({
        checkFalsy: true
    }).isLength({
        min: 10,
        max: 10
    }).isNumeric(),
    body("Diver_Qualification").trim().escape(),
    body("Instructor_Qualification").trim().escape(),
    body("Nox_Level").trim().escape().isLength({
        min: 0,
        max: 1
    }),
    body("Additional_Qualifications").trim().escape(),
    body("License_Number").trim().escape(),
    body("License_Expiration_Date").trim().escape(),
    body("Medical_Certificate_Expiration_Date").trim().escape(),
    body("forgotPassword"),
    body("password").trim().escape().exists(),
    function (req, res) {
        if (!checkUser(req, "CLUB")) return res.redirect('/auth/dashboard');
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
        });
        req.body.Birthdate = getDateFormat(new Date(req.body.Birthdate));
        req.body.License_Expiration_Date = getDateFormat(new Date(req.body.License_Expiration_Date));
        req.body.Medical_Certificate_Expiration_Date = getDateFormat(new Date(req.body.Medical_Certificate_Expiration_Date));
        let clientPassword = req.body.password;
        let forgotPassword = req.body.forgotPassword;
        delete req.body.forgotPassword;
        delete req.body.password;

        console.log("--- Trying to modify user ---");

        if (req.body.Diver_Qualification === ("P0" || "P1")) {
            if (req.body.Instructor_Qualification !== "E0") return res.json({
                created: false,
                comment: "Un niveau P0 ou P1 doit avoir un niveau technique E0"
            });
        } else if (req.body.Diver_Qualification === ("P2" || "P3")) {
            if (req.body.Instructor_Qualification !== ("E0" && "E1")) return res.json({
                created: false,
                comment: "Un niveau P2 ou P3 doit avoir un niveau technique E0 ou E1"
            });
        }

        Database.getUserInfoByMail(req.body.oldMail, (userInfo) => {
            if (userInfo === undefined) {
                console.log("\t->Error, User doesn't exist");
                return res.json({
                    modified: false,
                    comment: "L'utilisateur n'existe pas"
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
                        comment: "Impossible de modifier l'utilisateur"
                    })
                }
                let modifPassword = "";
                if (forgotPassword) modifPassword = req.body.License_Number;
                const modifKc = await Keycloak_module.modifyUser(userOldMail, req.body.Mail, req.body.Firstname, req.body.Lastname, modifPassword, getUserName(req), clientPassword)

                if (modifKc) {
                    console.log("\t->User modified in KC");
                    console.log("\t->User correctly modified");

                    //update le dossier avec le nouveau mail
                    // avec fs, renommer le dossier avec le mail de lutilisateur
                    let filename = req.body.Mail.replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");
                    let oldFilename = userOldMail.replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");
                    fs.rename(__dirname + "/model/img/" + oldFilename, __dirname + "/model/img/" + filename, (err) => {
                        if (err) {
                            console.log("\tL'image de profil n'a pas pu être renommée")
                            console.log(err);
                        } else {
                            console.log("\t->User folder renamed");
                            // rename l'image de profil
                            fs.rename(__dirname + "/model/img/" + filename + "/" + oldFilename + ".jpg", __dirname + "/model/img/" + filename + "/" + filename + ".jpg", (err) => {
                                if (err) {
                                    console.log("\tL'image de profil n'a pas pu être renommée")
                                    console.log(err);
                                } else {
                                    console.log("\t->User profile picture renamed");
                                }
                                return res.json({
                                    modified: true,
                                    comment: "Utilisateur modifié avec succès"
                                })
                            });
                        }
                    })
                } else {
                    console.log("\t->Error, impossible to update user in KC");
                    Database.modifUser(userInfo, (isInser) => {
                        if (isInser) {
                            console.log("\t->User modified in DB");
                            console.log("\t->Error, impossible to update user in KC, success to cancel all modifications");
                            return res.json({
                                modified: false,
                                comment: "Erreur lors de la modification, succès de l'annulation des modifications"
                            });
                        } else {
                            console.log("\t->Error, impossible to update user in DB");
                            console.log("\t->Error, impossible to update user in KC, impossible to cancel all modifications");
                            return res.json({
                                modified: false,
                                comment: "Erreur lors de la modification, impossible d'annuler les modifications"
                            });
                        }
                    })
                }
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
                    comment: "L'utilisateur n'existe pas"
                })
            }
            // vérification si Id_Diver présent dans :
            // - Dive_Registration
            // - Dive
            // - Dive_Team_Member
            // - Dive_Team

            Database.getDiversRegistered(allDiversRegistered => {
                if (allDiversRegistered == undefined) allDiversRegistered = [];
                if (allDiversRegistered.find(diverInfo => diverInfo.Id_Diver == userInfo.Id_Diver)) {
                    console.log("\t->Error, User is registered to an event");
                    return res.json({
                        deleted: false,
                        comment: "L'utilisateur est inscrit à un évènement"
                    })
                }
                Database.getDive({
                    Diver_Id_Diver: userInfo.Id_Diver
                }, dive => {
                    if (dive) {
                        console.log("\t->Error, User is linked to a dive");
                        return res.json({
                            deleted: false,
                            comment: "L'utilisateur est lié à une plongée"
                        })
                    }
                    Database.getAllDiveTeamMember({
                        Diver_Id_Diver: userInfo.Id_Diver
                    }, diveTeamMember => {
                        if (diveTeamMember) {
                            console.log("\t->Error, User is linked to a dive team member");
                            return res.json({
                                deleted: false,
                                comment: "L'utilisateur est lié à une palanquée"
                            })
                        }
                        Database.deleteUser(req.body.Mail, async (isDelDb) => {
                            if (!isDelDb) {
                                console.log("\t->Error, impossible to delete user in DB");
                                return res.json({
                                    deleted: false,
                                    comment: "Impossible de supprimer l'utilisateur"
                                })
                            }

                            const isDelKc = await Keycloak_module.deleteUser(req.body.Mail, getUserName(req), req.body.password);
                            if (isDelKc) {
                                console.log("\t->User deleted in KC");
                                console.log("\t->User correctly deleted");

                                // Supprimer le dossier
                                // avec fs, supprimer le dossier avec le mail de lutilisateur
                                let filename = req.body.Mail.replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");

                                fs.rm(__dirname + "/model/img/" + filename, {
                                    recursive: true,
                                    force: true
                                }, (err) => {
                                    if (err) {
                                        console.log("\tL'image de profil n'a pas pu être supprimée")
                                        console.log(err);
                                    } else {
                                        console.log("\t->User folder deleted");
                                    }
                                    return res.json({
                                        deleted: true,
                                        comment: "Utilisateur supprimé avec succès"
                                    })
                                });
                            } else {
                                Database.createUser(userInfo, false, (isInser) => {
                                    if (isInser) {
                                        console.log("\t->Error, impossible to delete user in KC, success to cancel all modifications");
                                        return res.json({
                                            deleted: false,
                                            comment: "Erreur lors de la suppression, succès de l'annulation des modifications"
                                        });
                                    } else {
                                        console.log("\t->Error, impossible to delete user in KC, impossible to cancel all modifications");
                                        return res.json({
                                            deleted: false,
                                            comment: "Erreur lors de la suppression, impossible d'annuler les modifications"
                                        });
                                    }
                                })
                            }
                        })
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
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
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
                    comment: "Le lieu existe déjà"
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
                        comment: "Impossible d'ajouter le lieu"
                    })
                }
                dataEmergency.Id_Emergency_Plan = idLoc;
                dataEmergency.Dive_Site_Id_Dive_Site = idLoc;
                Database.createEmergencyPlan(dataEmergency, (creaEm) => {
                    if (creaEm) {
                        console.log("\t->Location and Emergency Plan added");
                        return res.json({
                            created: true,
                            comment: "Lieu et plan d'urgence ajoutés avec succès"
                        })
                    } else {
                        Database.deleteDiveSite({
                            Site_Name: req.body.Site_Name
                        }, (delLoc) => {
                            if (delLoc) {
                                console.log("\t->Error, impossible to add Emergency Plan, Location deleted");
                                return res.json({
                                    created: false,
                                    comment: "Impossible d'ajouter le plan d'urgence"
                                })
                            } else {
                                console.log("\t->Error, impossible to add Emergency Plan and Location, impossible to cancel all modifications");
                                return res.json({
                                    created: false,
                                    comment: "Impossible d'ajouter le plan d'urgence et le lieu"
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
    body("Site_Name").trim().exists(),
    body("Gps_Latitude").trim().escape().isNumeric(),
    body("Gps_Longitude").trim().escape().isNumeric(),
    body("Track_Type").trim().escape(),
    body("Track_Number").trim().escape(),
    body("Track_Name").trim(),
    body("Zip_Code").trim().escape(),
    body("City_Name").trim(),
    body("Country_Name").trim(),
    body("Additional_Address").trim(),
    body("Tel_Number").optional({
        checkFalsy: true
    }).isLength({
        min: 10,
        max: 10
    }).trim().escape(),
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
            errors: errors.array(),
            comment: "Un champs n'est pas valide"
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
                    comment: "Le lieu n'existe pas"
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
                        comment: "Impossible de modifier le lieu"
                    });
                }
                Database.modifEmergencyPlan(dataEmergency, (isUpdateEm) => {
                    if (isUpdateEm) {
                        console.log("\t->Location and Emergency Plan updated");
                        return res.json({
                            modified: true,
                            comment: "Lieu et plan d'urgence modifiés avec succès"
                        });
                    } else {
                        Database.modifDiveSite(siteInfo, (isUpdateSite) => {
                            if (!isUpdateSite) {
                                console.log("\t->Error, impossible to cancel update of Location, failed to cancel all modifications");
                                return res.json({
                                    modified: false,
                                    comment: "Impossible d'annuler la modification du lieu"
                                });
                            } else {
                                console.log("\t->Error, impossible to update Emergency Plan, success to cancel all modifications");
                                return res.json({
                                    modified: false,
                                    comment: "Impossible de modifier le plan d'urgence"
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
                comment: "Le lieu n'existe pas"
            });
        }
        Database.getPlanning(allEvents => {
            if (allEvents === undefined) allEvents = [];
            allEvents = allEvents.filter(event => event.Dive_Site_Id_Dive_Site == siteInfo.Id_Dive_Site);
            if (allEvents.length > 0) {
                console.log("\t->Error, Location is linked in an event");
                return res.json({
                    deleted: false,
                    comment: "Le lieu est lié à un évènement"
                });
            }
            Database.deleteEmergencyPlan({
                Id_Emergency_Plan: siteInfo.Id_Dive_Site
            }, (isDelete) => {
                if (!isDelete) {
                    console.log("\t->Error, impossible to delete Emergency Plan");
                    return res.json({
                        deleted: false,
                        comment: "Impossible de supprimer le plan d'urgence"
                    });
                }
                Database.deleteDiveSite(req.body, (isDelete) => {
                    if (isDelete) {
                        console.log("\t->Location and Emergency Plan deleted");
                        return res.json({
                            deleted: true,
                            comment: "Lieu et plan d'urgence supprimés avec succès"
                        });
                    } else {
                        Database.createEmergencyPlan(siteInfo, (isCreate) => {
                            if (!isCreate) {
                                console.log("\t->Error, impossible to recreate Emergency Plan, failed to cancel all modifications");
                                return res.json({
                                    deleted: false,
                                    comment: "Impossible de recréer le plan d'urgence"
                                });
                            } else {
                                console.log("\t->Error, impossible to delete Location, success to cancel all modifications");
                                return res.json({
                                    deleted: false,
                                    comment: "Impossible de supprimer le lieu"
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
app.use((req, res) => res.redirect("/404"));
app.use((err, req, res, next) => {
    // Gestion des autres types d'erreurs si nécessaire
    res.status(500).send("Internal Server Error");
});
http.listen(port, hostname, (err) => {
    if (err) console.error(err);
    else console.log(`Server running at http://${process.env.IP_PERSO}:${port}`);
})