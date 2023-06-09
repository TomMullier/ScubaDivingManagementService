const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


class BDD {
    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */
    constructor() {
        this.con = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.DATABASE_NAME
        });

        this.con.connect(function (err) {
            if (err) throw err;
            console.log("DB connected !");
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                                CLUB MEMBERS                                */
    /* -------------------------------------------------------------------------- */
    createUser(userData, isNew, callback) {
        if (isNew) {
            userData.Id_Diver = uuidv4();
            delete userData.password;
        }
        let query = 'INSERT INTO Diver SET ?';
        this.con.query(query, [userData], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                callback(true);
            }
        })
    }

    getUsersList(callback) {
        const query = 'SELECT * FROM Diver';
        this.con.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                return callback(result);
            }
        })
    }

    getUserInfoByMail(mail, callback) {
        const data = {
            Mail: mail
        };
        const query = 'SELECT * FROM Diver WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                console.log("Can't get user info");
                callback(undefined);
            } else {
                console.log("Getting user info DB");
                callback(result[0]);
            }
        })
    }

    modifUser(data, callback) {
        const query = 'UPDATE Diver SET ? WHERE Id_Diver = ?'
        this.con.query(query, [data, data.Id_Diver], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("User info modified");
                return callback(true);
            }
        })
    }

    deleteUser(userMail, callback) {
        const data = {
            Mail: userMail
        };
        const query = 'DELETE FROM Diver WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                return callback(true);
            }
        })
    }


    /* -------------------------------------------------------------------------- */
    /*                                  DIVE SITE                                 */
    /* -------------------------------------------------------------------------- */

    createDiveSite(data, callback) {
        data.Id_Dive_Site = uuidv4();
        let query = 'INSERT INTO Dive_Site SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(undefined);
            } else {
                console.log("Site correctly inserted ");
                callback(data.Id_Dive_Site);
            }
        })
    }

    getDiveSiteList(callback) {
        const query = 'SELECT * FROM Dive_Site INNER JOIN Emergency_Plan ON Dive_Site.Id_Dive_Site = Emergency_Plan.Dive_Site_Id_Dive_Site';
        this.con.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                return callback(result);
            }
        })
    }

    getDiveSiteInfoByName(data, callback) {
        const query = 'SELECT * FROM Dive_Site WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                console.log("Can't get location info");
                callback(undefined);
            } else {
                console.log("Sending location info");
                callback(result[0]);
            }
        })
    }

    modifDiveSite(data, callback) {
        const query = 'UPDATE Dive_Site SET ? WHERE Id_Dive_Site = ?'
        this.con.query(query, [data, data.Id_Dive_Site], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("Location info modified");
                return callback(true);
            }
        })
    }

    deleteDiveSite(data, callback) {
        const query = 'DELETE FROM Dive_Site WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("Delete locatin OK");
                return callback(true);
            }
        })
    }


    /* -------------------------------------------------------------------------- */
    /*                               EMERGENCY PLAN                               */
    /* -------------------------------------------------------------------------- */

    createEmergencyPlan(data, callback) {
        let query = 'INSERT INTO Emergency_Plan SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                console.log("Emergency plan correctly inserted ");
                callback(true);
            }
        })
    }

    modifEmergencyPlan(data, callback) {
        const query = 'UPDATE Emergency_Plan SET ? WHERE Id_Emergency_Plan = ?'
        this.con.query(query, [data, data.Id_Emergency_Plan], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("Location info modified");
                return callback(true);
            }
        })
    }

    deleteEmergencyPlan(data, callback) {
        const query = 'DELETE FROM Emergency_Plan WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("Delete locatin OK");
                return callback(true);
            }
        })
    }


    /* -------------------------------------------------------------------------- */
    /*                                  PLANNING                                  */
    /* -------------------------------------------------------------------------- */

    createEvent(data, callback) {
        data.Id_Planned_Dive = uuidv4();
        let query = 'INSERT INTO Planned_Dive SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                console.log("Event correctly inserted ");
                callback(true);
            }
        })
    }

    getPlanning(callback) {
        const query = 'SELECT * FROM Planned_Dive';
        this.con.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                result.forEach(event => {
                    event = dateFormat(event);
                });
                return callback(result);
            }
        })
    }

    getEvent(data, callback) {
        console.log(data);
        const query = 'SELECT * FROM Planned_Dive WHERE Start_Date = ? AND End_Date = ? AND Diver_Price = ? AND Instructor_Price = ? AND Comments = ? AND Special_Needs = ? AND Status = ? AND Max_Divers = ? AND Dive_Type = ? AND Dive_Site_Id_Dive_Site = ?';
        this.con.query(query, [data.Start_Date, data.End_Date, data.Diver_Price, data.Instructor_Price, data.Comments, data.Special_Needs, data.Status, data.Max_Divers, data.Dive_Type, data.Dive_Site_Id_Dive_Site], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                result[0] = dateFormat(result[0]);
                return callback(result[0]);
            }
        })
    }

    modifEvent(data, callback) {
        const query = 'UPDATE Planned_Dive SET ? WHERE Id_Planned_Dive = ?'
        this.con.query(query, [data, data.Id_Planned_Dive], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("Event info modified");
                return callback(true);
            }
        })
    }

    deleteEvent(data, callback) {
        const query = 'DELETE FROM Planned_Dive WHERE Id_Planned_Dive = ?'
        this.con.query(query, [data.Id_Planned_Dive], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                console.log("Event deleted");
                return callback(true);
            }
        })
    }

    /* -------------------------------------------------------------------------- */
    /*                                REGISTRATION                                */
    /* -------------------------------------------------------------------------- */

    getRegistration(data, callback) {
        const query = 'SELECT * FROM Dive_Registration WHERE Diver_Id_Diver = ? AND Planned_Dive_Id_Planned_Dive = ?';
        this.con.query(query, [data.Diver_Id_Diver, data.Planned_Dive_Id_Planned_Dive], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                result[0] = dateFormat(result[0]);
                return callback(result[0]);
            }
        })
    }

    getDiversRegistered(callback) {
        const query = 'SELECT Diver.*,Dive_Registration.Planned_Dive_Id_Planned_Dive, Dive_Registration.Diver_Role FROM Dive_Registration INNER JOIN Diver ON Diver.Id_Diver = Dive_Registration.Diver_Id_Diver';
        this.con.query(query, (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                return callback(result);
            }
        })
    }

    getRegistrationList(data, callback) {
        const query = 'SELECT Planned_Dive.* FROM Dive_Registration INNER JOIN Planned_Dive ON Planned_Dive.Id_Planned_Dive = Dive_Registration.Planned_Dive_Id_Planned_Dive WHERE Dive_Registration.Diver_Id_Diver = ?';
        this.con.query(query, [data], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                result.forEach(event => {
                    event = dateFormat(event);
                });
                return callback(result);
            }
        })
    }

    createRegistration(data, callback) {
        let query = 'INSERT INTO Dive_Registration SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                // console.log(err);
                console.log("\t->Error creating registration");
                callback(false);
            } else {
                console.log("\t->Registration correctly inserted ");
                callback(true);
            }
        })
    }

    deleteRegistration(data, callback) {
        let query = 'DELETE FROM Dive_Registration WHERE Diver_Id_Diver = ? AND Planned_Dive_Id_Planned_Dive = ?';
        this.con.query(query, [data.Diver_Id_Diver, data.Planned_Dive_Id_Planned_Dive], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                console.log("User correctly unregistered from event");
                callback(true);
            }
        })
    }

    deleteAllRegistration(data, callback) {
        let query = 'DELETE FROM Dive_Registration WHERE Planned_Dive_Id_Planned_Dive = ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                console.log("All registrations deleted");
                callback(true);
            }
        })
    }
}

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */

function dateFormat(event) {
    event.Start_Date = getDateFormat(event.Start_Date);
    event.End_Date = getDateFormat(event.End_Date);
    return event;
}

function getDateFormat(badDate) {
    badDate += '';
    badDate = new Date(badDate).toLocaleString('en-US', { hour12: false })
    const day = badDate.split(', ')[0].split("/")[0];
    const month = badDate.split(', ')[0].split("/")[1];
    const year = badDate.split(', ')[0].split("/")[2];
    const hour = badDate.split(', ')[1];
    return year + "-" + month + "-" + day + " " + hour;
}


module.exports = {
    BDD
}