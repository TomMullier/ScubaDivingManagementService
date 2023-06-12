const mysql = require('mysql2');
const {
    v4: uuidv4
} = require('uuid');

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
        userData.Lastname = escapeHtml(userData.Lastname);
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
                result.forEach(user => {
                    user.Lastname = desEscapeHtml(user.Lastname);
                    user.Birthdate = getDateFormat(user.Birthdate);
                    user.License_Expiration_Date = getDateFormat(user.License_Expiration_Date);
                    user.Medical_Certificate_Expiration_Date = getDateFormat(user.Medical_Certificate_Expiration_Date);
                })
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
                callback(undefined);
            } else {
                result[0].Lastname = desEscapeHtml(result[0].Lastname)
                callback(result[0]);
            }
        })
    }

    modifUser(data, callback) {
        data.Lastname = escapeHtml(data.Lastname);
        const query = 'UPDATE Diver SET ? WHERE Id_Diver = ?'
        this.con.query(query, [data, data.Id_Diver], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
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
        data.Site_Name = escapeHtml(data.Site_Name);
        data.Track_Name = escapeHtml(data.Track_Name);
        data.City_Name = escapeHtml(data.City_Name);
        data.Country_Name = escapeHtml(data.Country_Name);
        data.Additional_Address = escapeHtml(data.Additional_Address);
        data.Information_URL = escapeHtml(data.Information_URL);
        let query = 'INSERT INTO Dive_Site SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(undefined);
            } else {
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
                result.forEach(site => {
                    site.Site_Name = desEscapeHtml(site.Site_Name);
                    site.Track_Name = desEscapeHtml(site.Track_Name);
                    site.City_Name = desEscapeHtml(site.City_Name);
                    site.Country_Name = desEscapeHtml(site.Country_Name);
                    site.Additional_Address = desEscapeHtml(site.Additional_Address);
                    site.Information_URL = desEscapeHtml(site.Information_URL);
                    site.Emergency_Plan = desEscapeHtml(site.Emergency_Plan);
                    site.Post_Accident_Procedure = desEscapeHtml(site.Post_Accident_Procedure);
                })
                return callback(result);
            }
        })
    }


    getDiveSiteInfoByName(data, callback) {
        const query = 'SELECT * FROM Dive_Site WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                result[0].Site_Name = desEscapeHtml(result[0].Site_Name);
                result[0].Track_Name = desEscapeHtml(result[0].Track_Name);
                result[0].City_Name = desEscapeHtml(result[0].City_Name);
                result[0].Country_Name = desEscapeHtml(result[0].Country_Name);
                result[0].Additional_Address = desEscapeHtml(result[0].Additional_Address);
                result[0].Information_URL = desEscapeHtml(result[0].Information_URL);
                callback(result[0]);
            }
        })
    }

    async getDiveSiteInfoById(data, callback) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Dive_Site WHERE ?';
            this.con.query(query, [data], (err, result) => {
                if (err || !result[0]) {
                    if (err) console.log(err);
                    callback(undefined);
                } else {
                    result[0].Site_Name = desEscapeHtml(result[0].Site_Name);
                    result[0].Track_Name = desEscapeHtml(result[0].Track_Name);
                    result[0].City_Name = desEscapeHtml(result[0].City_Name);
                    result[0].Country_Name = desEscapeHtml(result[0].Country_Name);
                    result[0].Additional_Address = desEscapeHtml(result[0].Additional_Address);
                    result[0].Information_URL = desEscapeHtml(result[0].Information_URL);
                    callback(result[0]);
                }
            })
        })
    }

    modifDiveSite(data, callback) {
        data.Site_Name = escapeHtml(data.Site_Name);
        data.Track_Name = escapeHtml(data.Track_Name);
        data.City_Name = escapeHtml(data.City_Name);
        data.Country_Name = escapeHtml(data.Country_Name);
        data.Additional_Address = escapeHtml(data.Additional_Address);
        data.Information_URL = escapeHtml(data.Information_URL);
        const query = 'UPDATE Dive_Site SET ? WHERE Id_Dive_Site = ?'
        this.con.query(query, [data, data.Id_Dive_Site], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
                return callback(true);
            }
        })
    }

    deleteDiveSite(data, callback) {
        data.Site_Name = escapeHtml(data.Site_Name);
        data.City_Name = escapeHtml(data.City_Name);
        data.Country_Name = escapeHtml(data.Country_Name);
        data.Additional_Address = escapeHtml(data.Additional_Address);
        data.Information_URL = escapeHtml(data.Information_URL);
        const query = 'DELETE FROM Dive_Site WHERE ?';
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
    /*                               EMERGENCY PLAN                               */
    /* -------------------------------------------------------------------------- */

    createEmergencyPlan(data, callback) {
        data.Emergency_Plan = escapeHtml(data.Emergency_Plan);
        data.Post_Accident_Procedure = escapeHtml(data.Post_Accident_Procedure);
        let query = 'INSERT INTO Emergency_Plan SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                callback(true);
            }
        })
    }

    modifEmergencyPlan(data, callback) {
        data.Emergency_Plan = escapeHtml(data.Emergency_Plan);
        data.Post_Accident_Procedure = escapeHtml(data.Post_Accident_Procedure);
        const query = 'UPDATE Emergency_Plan SET ? WHERE Id_Emergency_Plan = ?'
        this.con.query(query, [data, data.Id_Emergency_Plan], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
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
                return callback(true);
            }
        })
    }


    /* -------------------------------------------------------------------------- */
    /*                                  PLANNING                                  */
    /* -------------------------------------------------------------------------- */

    createEvent(data, callback) {
        data.Id_Planned_Dive = uuidv4();
        data.Special_Needs = escapeHtml(data.Special_Needs);
        data.Comments = escapeHtml(data.Comments)
        let query = 'INSERT INTO Planned_Dive SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
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
                    event.Comments = desEscapeHtml(event.Comments);
                    event.Special_Needs = desEscapeHtml(event.Special_Needs);
                });
                return callback(result);
            }
        })
    }

    getEvent(data, callback) {
        data.Comments = escapeHtml(data.Comments);
        data.Special_Needs = escapeHtml(data.Special_Needs);
        const query = 'SELECT * FROM Planned_Dive WHERE Start_Date = ? AND End_Date = ? AND Diver_Price = ? AND Instructor_Price = ? AND Comments = ? AND Special_Needs = ? AND Status = ? AND Max_Divers = ? AND Dive_Type = ? AND Dive_Site_Id_Dive_Site = ?';
        this.con.query(query, [data.Start_Date, data.End_Date, data.Diver_Price, data.Instructor_Price, data.Comments, data.Special_Needs, (data.Status + ""), data.Max_Divers, data.Dive_Type, data.Dive_Site_Id_Dive_Site], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                result[0] = dateFormat(result[0]);
                result[0].Comments = desEscapeHtml(result[0].Comments);
                result[0].Special_Needs = desEscapeHtml(result[0].Special_Needs);
                return callback(result[0]);
            }
        })
    }

    modifEvent(data, callback) {
        data.Comments = escapeHtml(data.Comments);
        data.Special_Needs = escapeHtml(data.Special_Needs);
        const query = 'UPDATE Planned_Dive SET ? WHERE Id_Planned_Dive = ?'
        this.con.query(query, [data, data.Id_Planned_Dive], (err, result) => {
            if (err) {
                console.log(err);
                return callback(false)
            } else {
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
                return callback(true);
            }
        })
    }

    /* -------------------------------------------------------------------------- */
    /*                                REGISTRATION                                */
    /* -------------------------------------------------------------------------- */
    createRegistration(data, callback) {
        data.Personal_Comment = escapeHtml(data.Personal_Comment);
        let query = 'INSERT INTO Dive_Registration SET ?';
        this.con.query(query, [data], (err, result) => {
            if (err) {
                console.log(err);
                callback(false);
            } else {
                callback(true);
            }
        })
    }

    getRegistration(data, callback) {
        const query = 'SELECT * FROM Dive_Registration WHERE Diver_Id_Diver = ? AND Planned_Dive_Id_Planned_Dive = ?';
        this.con.query(query, [data.Diver_Id_Diver, data.Planned_Dive_Id_Planned_Dive], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                callback(undefined);
            } else {
                result[0].Personal_Comment = desEscapeHtml(result[0].Personal_Comment)
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
                    event.Personal_Comment = desEscapeHtml(event.Personal_Comment)
                    event = dateFormat(event);
                });
                return callback(result);
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
    badDate = new Date(badDate).toLocaleString('fr-FR', {
        hour12: false
    })
    const day = badDate.split(', ')[0].split("/")[0];
    const month = badDate.split(', ')[0].split("/")[1];
    const year = badDate.split(', ')[0].split("/")[2];
    const hour = badDate.split(', ')[1];
    return year + "-" + month + "-" + day + " " + hour;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function desEscapeHtml(text) {
    return text
        .replace("&amp;", /&/g)
        .replace("&lt;", /</g)
        .replace("&gt;", />/g)
        .replace("&quot;", /"/g)
        .replace("&#039;", /'/g);
}

module.exports = {
    BDD
}