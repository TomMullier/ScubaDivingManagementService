const mysql = require('mysql');
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
            console.log("DB connected!");
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
                console.log("Deleting user in Keycloak");
                callback(false);
            } else {
                console.log("User correctly inserted ");
                callback(true);
            }
        })
    }

    getUsersList(callback) {
        const query = 'SELECT Lastname, Firstname, Mail, Phone FROM Diver';
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

    getUserInfoById(id, callback) {
        const data = {
            Id_Diver: id
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
        const query = 'SELECT * FROM Dive_Site';
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

    getDiveSiteInfoById(data, callback) {
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

    getEmergencyPlan(data, callback) {
        const query = 'SELECT * FROM Emergency_Plan WHERE ?';
        this.con.query(query, [data], (err, result) => {
            if (err || !result[0]) {
                if (err) console.log(err);
                console.log("Can't get location info");
                callback(undefined);
            } else {
                console.log("Sending location info");
                let res = result[0];
                callback(res);
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
        console.log(data);
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
        const query = 'SELECT Diver.*, Dive_Registration.Planned_Dive_Id_Planned_Dive FROM Dive_Registration INNER JOIN Diver ON Diver.Id_Diver = Dive_Registration.Diver_Id_Diver';
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
                console.log(err);
                callback(false);
            } else {
                console.log("Registration correctly inserted ");
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
                console.log("Registration deleted ");
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
    badDate = new Date(badDate).toLocaleString()
    const day = badDate.split(' ')[0].split("/")[0];
    const month = badDate.split(' ')[0].split("/")[1];
    const year = badDate.split(' ')[0].split("/")[2];
    const hour = badDate.split(' ')[1];
    return year + "-" + month + "-" + day + " " + hour;
}



//Dive_Team
function CreateDiveTeam(Max_Depth, Max_Duration, Actual_Depth, Max_Duration, Actual_Depth, Actual_Duration, Dive_Type, Sequence_Number, Start_Time, Stop_Time, Comment, Id_Diver, Id_Dive) {
    tmpUID = randomUUID();
    tmpREQ = `INSERT INTO Dive_Team (Id_Dive_Team,Max_Depth,Max_Duration,Actual_Depth,Actual_Duration,Dive_Type,Sequence_number,Start_Time,Stop_Time,Comment,Diver_Id_Diver,Dive_Id_Dive) value ("` + tmpUID + `", "` + Max_Depth + `", "` + Max_Duration + `", "` + Actual_Depth + `", "` + Actual_Duration + `", "` + Dive_Type + `", "` + Sequence_Number + `", "` + Start_Time + `", "` + Stop_Time + `", "` + Comment + `", "` + Id_Diver + `", "` + Id_Dive + `");`;
    Requete(tmpREQ);
}
function UpdateDiveTeam(Id_Dive_Team, Max_Depth, Max_Duration, Actual_Depth, Actual_Duration, Dive_Type, Sequence_Number, Start_Time, Stop_Time, Comment) {
    tmpREQ = `UPDATE Dive_Team set Max_Depth ="` + Max_Depth + `",Max_Duration ="` + Max_Duration + `",Actual_Depth ="` + Actual_Depth + `",Actual_Duration="` + Actual_Duration + `",Dive_Type ="` + Dive_Type + `",Sequence_Number ="` + Sequence_Number + `",Start_Time ="` + Start_Time + `",Stop_Time ="` + Stop_Time + `",Comment ="` + Comment + `" WHERE Id_Dive_Team ="` + Id_Dive_Team + `";`;
    Requete(tmpREQ);
}
function DeleteDiveTeam(Id_Dive_Team) {
    tmpREQ = `DELETE from Dive_Team WHERE Id_Dive_Team ="` + Id_Dive_Team + `";`;
    Requete(tmpREQ);
}

//Dive_Team_Member
function CreateDiveTeamMember(Id_Diver, Id_Dive_Team, Temporary_Diver_Qualification, Current_Diver_Qualification, Diver_Role, Current_Instructor_Qualification, Nox_Percentage, Comment, Paid_Amount) {
    tmpREQ = `INSERT INTO Dive_Team_Member(Diver_Id_Diver,Dive_Team_Id_Dive_Team,Temporary_Diver_Qualification,Current_Diver_Qualification,Diver_Role,Current_Instructor_Qualification,Nox_Percentage,Comment,Paid_Amount) value ("` + Id_Diver + `", "` + Id_Dive_Team + `", "` + Temporary_Diver_Qualification + `", "` + Current_Diver_Qualification + `", "` + Diver_Role + `", "` + Current_Instructor_Qualification + `", "` + Nox_Percentage + `", "` + Comment + `", "` + Paid_Amount + `");`;
    Requete(tmpREQ);
}
function UpdateDiveTeamMember(Id_Diver, Id_Dive_Team, Temporary_Diver_Qualification, Current_Diver_Qualification, Diver_Role, Current_Instructor_Qualification, Nox_Percentage, Comment, Paid_Amount) {
    tmpREQ = `UPDATE Dive_Team_Member set Temporary_Diver_Qualification="` + Temporary_Diver_Qualification + `",Current_Diver_Qualification="` + Current_Diver_Qualification + `",Diver_Role="` + Diver_Role + `",Current_Instructor_Qualification="` + Current_Instructor_Qualification + `",Nox_Percentage ="` + Nox_Percentage + `",Comment="` + Comment + `",Paid_Amount="` + Paid_Amount + `" WHERE Diver_Id_Diver ="` + Id_Diver + `" AND Dive_Team_Id_Dive_Team ="` + Id_Dive_Team + `";`;
    Requete(tmpREQ);
}
function DeleteDiveTeamMember(Id_Diver, Id_Dive_Team) {
    tmpREQ = `DELETE from Dive_Team_Member WHERE Diver_Id_Diver ="` + Id_Diver + `" AND Dive_Team_Id_Dive_Team ="` + Id_Dive_Team + `";`;
    Requete(tmpREQ);
}

//Dive_Team_Composition
function CreateDiveTeamComposition(Dive_Type, Diver_Age, Dive_Guide_Qualification, Max_Diver, Additional_Diver) {
    tmpUID = randomUUID();
    tmpREQ = `INSERT into Dive_Team_Composition(Id_Dive_Team_Composition,Dive_Type,Diver_Age,Dive_Guide_Qualification,Max_Diver,Additional_Diver) value ("` + tmpUID + `", "` + Dive_Type + `", "` + Diver_Age + `", "` + Dive_Guide_Qualification + `", "` + Max_Diver + `", "` + Additional_Diver + `");`;
    Requete(tmpREQ);
}
function UpdateDiveTeamComposition(Id_Dive_Team_Composition, Dive_Type, Diver_Age, Dive_Guide_Qualification, Max_Diver, Additional_Diver) {
    tmpREQ = `UPDATE Dive_Team_Composition set Dive_Type ="` + Dive_Type + `",Diver_Age="` + Diver_Age + `",Dive_Guide_Qualification="` + Dive_Guide_Qualification + `",Max_Diver="` + Max_Diver + `",Additional_Diver="` + Additional_Diver + `" WHERE Id_Dive_Team_Composition ="` + Id_Dive_Team_Composition`";`;
    Requete(tmpREQ);
}
function DeleteDiveTeamComposition(Id_Dive_Team_Composition) {
    tmpREQ = `DELETE from Dive_Team_Composition WHERE Id_Dive_Team_Composition ="` + Id_Dive_Team_Composition + `";`;
    Requete(tmpREQ);
}

//Max_Depth_for_Qualification
function CreateMaxDepthForQualification(Diver_Qualification, Diver_Age, Guided_Diver_Depth, Autonomous_Diver_Depth) {
    tmpUID = randomUUID();
    tmpREQ = `INSERT into Max_Depth_for_Qualification value("` + tmpUID + `", "` + Diver_Qualification + `", "` + Diver_Age + `", "` + Guided_Diver_Depth + `", "` + Autonomous_Diver_Depth + `");`;
    Requete(tmpREQ);
}

function DeleteMaxDepthForQualification(Id_Max_Depth_for_Qualification) {
    tmpREQ = `DELETE from Max_Depth_for_Qualification WHERE Id_Max_Depth_for_Qualification ="` + Id_Max_Depth_for_Qualification + `";`
    Requete(tmpREQ);
}



module.exports = {
    BDD
}