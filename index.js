var mysql = require(`mysql`);

var con = mysql.createConnection({
  host: `localhost`,
  user: `Maxime`,
  password: `password`,
  database: `sdsm`
});
const { randomUUID } = require("crypto");
const { tmpdir } = require("os");
const express = require(`express`);

const app = express();


function Requete(req){
  con.connect(function(err) {
    if (err) throw err;
    con.query(req, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
    });
  });
}


//USER
function CreateUser(Lastname,Firstname,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date,Birthdate){
  tmpUID = randomUUID();
  tmpREQ = `INSERT INTO diver (Id_Diver,Lastname,Firstname,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date,Birthdate) value ("`+ tmpUID +`", "`+ Lastname +`", "`+ Firstname +`", "`+ License_Number+`", "`+License_Expiration_Date+`", "`+Medical_Certificate_Expiration_Date+`", "`+Birthdate+`");`;
  Requete(tmpREQ);
}

function UpdateUser(Id_Diver,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date){
  tmpREQ = `UPDATE diver set License_Number ="`+License_Number+`",License_Expiration_Date ="`+License_Expiration_Date+`",Medical_Certificate_Expiration_Date ="`+Medical_Certificate_Expiration_Date+`" WHERE Id_Diver = "`+Id_Diver+`"`;
  Requete(tmpREQ);
}

function DeleteUser(Diver_Id){
  tmpREQ = `DELETE from diver where Id_Diver = "`+Diver_Id + `"`;
  Requete(tmpREQ);
}

//DIVE_SITE
function CreateDiveSite(Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL){
  tmpUID = randomUUID();
  tmpREQ = `INSERT INTO dive_site (Id_Dive_Site,Site_Name,Gps_Latitude,Gps_Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL) value ("`+tmpUID+`", "`+Site_Name+`", "`+Latitude+`", "`+Longitude+`", "`+Track_Type+`", "`+Track_Number+`", "`+Track_Name+`", "`+Zip_Code+`", "`+City_Name+`", "`+Country_Name+`", "`+Additional_Address+`", "`+Tel_Number+`", "`+Information_URL+`");`;
  Requete(tmpREQ);
}
function UpdateDiveSite(Id_Dive_Site,Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL){
  tmpREQ = `UPDATE Dive_Site set Site_Name ="`+Site_Name+`",Gps_Latitude ="`+Latitude+`",Gps_Longitude ="`+Longitude+`",Track_Type ="`+Track_Type+`",Track_Number ="`+Track_Number+`",Track_Name ="`+Track_Name+`",Zip_Code ="`+Zip_Code+`",City_Name ="`+City_Name+`",Country_Name ="`+Country_Name+`",Additional_Address ="`+Additional_Address+`",Tel_Number ="`+Tel_Number+`",Information_URL ="`+Information_URL+`" WHERE Id_Dive_Site = "`+Id_Dive_Site+`";`;
  Requete(tmpREQ);
}
function DeleteDiveSite(Id_Dive_Site){
  tmpREQ = `DELETE from Dive_Site where Id_Dive_Site ="`+Id_Dive_Site+`";`;
  Requete(tmpREQ);
}

//PLANNED_DIVE
function CreatePlannedDive(Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Id_Dive_Site){
 tmpUID = randomUUID();
 tmpREQ = `INSERT INTO planned_dive (Id_Planned_Dive,Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Dive_Site_Id_Dive_Site) value ("` +tmpUID+`", "`+Planned_Date+`", "`+Planned_Time+`", "`+Comments+`", "`+Special_Needs+`", "`+Status+`", "`+Diver_Price+`", "`+Instructor_Price+`", "`+Id_Dive_Site+`");`;
 Requete(tmpREQ);
}
function DeletePlannedDive(Id_Planned_Dive){
  tmpREQ = `DELETE from Planned_Dive where Id_Planned_Dive ="`+Id_Planned_Dive+`";`;
  Requete(tmpREQ);
}
function UpdatePlannedDive(Id_Planned_Dive,Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Id_Dive_Site){
  tmpREQ = `UPDATE planned_dive set Planned_Date ="`+Planned_Date+`",Planned_Time="`+Planned_Time+`",Comments="`+Comments+`",Special_Needs="`+Special_Needs+`",Status="`+Status+`",Diver_Price="`+Diver_Price+`",Instructor_Price="`+Instructor_Price+`",Dive_Site_Id_Dive_Site="`+Id_Dive_Site+`" WHERE Id_Planned_Dive ="`+Id_Planned_Dive+`";`;
  Requete(tmpREQ);
}

//Emergency_Plan
function CreateEmergencyPlan(SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version,Id_Dive_Site){
  tmpUID = randomUUID();
  tmpREQ = `INSERT INTO Emergency_Plan (Id_Emergency_Plan,SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version,Dive_Site_Id_Dive_Site) value ("`+tmpUID+`", "`+SOS_Tel_Number+`", "`+Emergency_Plan+`", "`+Post_Accident_Procedure+`", "`+Version+`", "`+Id_Dive_Site+`");`;
  Requete(tmpREQ);
}
function UpdateEmergencyPlan(Id_Emergency_Plan,SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version){
  tmpREQ = `UPDATE Emergency_Plan set SOS_Tel_Number ="`+SOS_Tel_Number+`",Emergency_Plan ="`+Emergency_Plan+`",Post_Accident_Procedure ="`+Post_Accident_Procedure+`",Version ="`+Version+`" WHERE Id_Emergency_Plan ="`+Id_Emergency_Plan+`";`;
  Requete(tmpREQ);
}
function DeleteEmergencyPlan(Id_Emergency_Plan){
  tmpREQ = `DELETE from Emergency_Plan where Id_Emergency_Plan ="`+Id_Emergency_Plan+`";`;
  Requete(tmpREQ);
}

//Dive_Registration
function CreateDiveRegistration(Id_Diver,Id_Planned_Dive,Diver_Role,Personal_Comment,Car_Pooling_Seat_Offered,Car_Pooling_Seat_Request){
  tmpNOW = new Date();
  tmpTimestamp = tmpNOW.getFullYear().toString() +`-`+tmpNOW.getMonth().toString()+`-`+tmpNOW.getDate().toString()+" "+tmpNOW.getHours().toString()+":"+tmpNOW.getMinutes().toString()+":"+tmpNOW.getSeconds().toString();
  tmpREQ = `INSERT INTO Dive_Registration (Diver_Id_Diver,Planned_Dive_Id_Planned_Dive,Diver_Role,Registration_Timestamp,Personal_Comment,Car_Pooling_Seat_Offered,Car_Pooling_Seat_Request) value ("`+Id_Diver+`", "`+Id_Planned_Dive+`", "`+Diver_Role+`", "`+tmpTimestamp+`", "`+Personal_Comment+`", "`+Car_Pooling_Seat_Offered+`", "`+Car_Pooling_Seat_Request+`");`;
  Requete(tmpREQ);
}
function UpdateDiveRegistration(Id_Diver,Id_Planned_Dive,Diver_Role,Personal_Comment,Car_Pooling_Seat_Offered,Car_Pooling_Seat_Request){
  tmpREQ = `UPDATE Dive_Registration set Diver_Role ="`+Diver_Role+`",Personal_Comment ="`+Personal_Comment+`",Car_Pooling_Seat_Offered ="`+Car_Pooling_Seat_Offered+`",Car_Pooling_Seat_Request ="`+Car_Pooling_Seat_Request+`" WHERE Diver_Id_Diver ="`+Id_Diver+`" AND Planned_Dive_Id_Planned_Dive ="`+Id_Planned_Dive+`";`;
  Requete(tmpREQ);
}
function DeleteDiveRegistration(Id_Diver,Id_Planned_Dive){
  tmpREQ =`DELETE from Dive_Registration where Diver_Id_Diver ="`+Id_Diver+`" AND Planned_Dive_Id_Planned_Dive ="`+Id_Planned_Dive+`";`;
  Requete(tmpREQ);
}

//Dive
function CreateDive(Begin_Time,Begin_Date,End_Date,End_Time,Comment,Surface_Security,Dive_Price,Instructor_Price,Max_Ppo2,Id_Diver,Id_Planned_Dive){
  tmpUID = randomUUID()
  tmpREQ = `INSERT INTO Dive (Id_Dive,Begin_Time,Begin_Date,End_Date,End_Time,Comment,Surface_Security,Dive_Price,Instructor_Price,Max_Ppo2,Diver_Id_Diver,Planned_Dive_Id_Planned_Dive) value ("`+tmpUID+`", "`+Begin_Time+`", "`+Begin_Date+`", "`+End_Date+`", "`+End_Time+`", "`+Comment+`", "`+Surface_Security+`", "`+Dive_Price+`", "`+Instructor_Price+`", "`+Max_Ppo2+`", "`+Id_Diver+`", "`+Id_Planned_Dive+`");`;
  Requete(tmpREQ);
}
function UpdateDive(Id_Dive,Begin_Time,Begin_Date,End_Date,End_Time,Comment,Surface_Security,Dive_Price,Instructor_Price,Max_Ppo2){
  tmpREQ =`UPDATE Dive set Begin_Time ="`+Begin_Time+`",Begin_Date ="`+Begin_Date+`",End_Date="`+End_Date+`",End_Time="`+End_Time+`",Comment="`+Comment+`",Surface_Security="`+Surface_Security+`",Dive_Price ="`+Dive_Price+`",Instructor_Price="`+Instructor_Price+`",Max_Ppo2 ="`+Max_Ppo2+`" WHERE Id_Dive ="`+Id_Dive+`";`;
  Requete(tmpREQ);
}
function DeleteDive(Id_Dive){
  tmpREQ = "DELETE from Dive WHERE Id_Dive ="+Id_Dive+`";`;
  Requete(tmpREQ);
}

//Dive_Team
function CreateDiveTeam(Max_Depth,Max_Duration,Actual_Depth,Max_Duration,Actual_Depth,Actual_Duration,Dive_Type,Sequence_Number,Start_Time,Stop_Time,Comment,Id_Diver,Id_Dive){
  tmpUID =randomUUID();
  tmpREQ = `INSERT INTO Dive_Team (Id_Dive_Team,Max_Depth,Max_Duration,Actual_Depth,Actual_Duration,Dive_Type,Sequence_number,Start_Time,Stop_Time,Comment,Diver_Id_Diver,Dive_Id_Dive) value ("`+tmpUID+`", "`+Max_Depth+`", "`+Max_Duration+`", "`+Actual_Depth+`", "`+Actual_Duration+`", "`+Dive_Type+`", "`+Sequence_Number+`", "`+Start_Time+`", "`+Stop_Time+`", "`+Comment+`", "`+Id_Diver+`", "`+Id_Dive+`");`;
  Requete(tmpREQ);
}
function UpdateDiveTeam(Id_Dive_Team,Max_Depth,Max_Duration,Actual_Depth,Actual_Duration,Dive_Type,Sequence_Number,Start_Time,Stop_Time,Comment){
  tmpREQ =`UPDATE Dive_Team set Max_Depth ="`+Max_Depth+`",Max_Duration ="`+Max_Duration+`",Actual_Depth ="`+Actual_Depth+`",Actual_Duration="`+Actual_Duration+`",Dive_Type ="`+Dive_Type+`",Sequence_Number ="`+Sequence_Number+`",Start_Time ="`+Start_Time+`",Stop_Time ="`+Stop_Time+`",Comment ="`+Comment+`" WHERE Id_Dive_Team ="`+Id_Dive_Team+`";`;
  Requete(tmpREQ);
}
function DeleteDiveTeam(Id_Dive_Team){
  tmpREQ =`DELETE from Dive_Team WHERE Id_Dive_Team ="`+Id_Dive_Team+`";`;
  Requete(tmpREQ);
}

//Dive_Team_Member
function CreateDiveTeamMember(Id_Diver,Id_Dive_Team,Temporary_Diver_Qualification,Current_Diver_Qualification,Diver_Role,Current_Instructor_Qualification,Nox_Percentage,Comment,Paid_Amount){
  tmpREQ = `INSERT INTO Dive_Team_Member(Diver_Id_Diver,Dive_Team_Id_Dive_Team,Temporary_Diver_Qualification,Current_Diver_Qualification,Diver_Role,Current_Instructor_Qualification,Nox_Percentage,Comment,Paid_Amount) value ("`+Id_Diver+`", "`+Id_Dive_Team+`", "`+Temporary_Diver_Qualification+`", "`+Current_Diver_Qualification+`", "`+Diver_Role+`", "`+Current_Instructor_Qualification+`", "`+Nox_Percentage+`", "`+Comment+`", "`+Paid_Amount+`");`;
  Requete(tmpREQ);
}
function UpdateDiveTeamMember(Id_Diver,Id_Dive_Team,Temporary_Diver_Qualification,Current_Diver_Qualification,Diver_Role,Current_Instructor_Qualification,Nox_Percentage,Comment,Paid_Amount){
  tmpREQ = `UPDATE Dive_Team_Member set Temporary_Diver_Qualification="`+Temporary_Diver_Qualification+`",Current_Diver_Qualification="`+Current_Diver_Qualification+`",Diver_Role="`+Diver_Role+`",Current_Instructor_Qualification="`+Current_Instructor_Qualification+`",Nox_Percentage ="`+Nox_Percentage+`",Comment="`+Comment+`",Paid_Amount="`+Paid_Amount+`" WHERE Diver_Id_Diver ="`+Id_Diver+`" AND Dive_Team_Id_Dive_Team ="`+Id_Dive_Team+`";`;
  Requete(tmpREQ);
}
function DeleteDiveTeamMember(Id_Diver,Id_Dive_Team){
  tmpREQ = `DELETE from Dive_Team_Member WHERE Diver_Id_Diver ="`+Id_Diver+`" AND Dive_Team_Id_Dive_Team ="`+Id_Dive_Team+`";`;
  Requete(tmpREQ);
}

//Dive_Team_Composition
function CreateDiveTeamComposition(Dive_Type,Diver_Age,Dive_Guide_Qualification,Max_Diver,Additional_Diver){
  tmpUID = randomUUID();
  tmpREQ = `INSERT into Dive_Team_Composition(Id_Dive_Team_Composition,Dive_Type,Diver_Age,Dive_Guide_Qualification,Max_Diver,Additional_Diver) value ("`+tmpUID+`", "`+Dive_Type+`", "`+Diver_Age+`", "`+Dive_Guide_Qualification+`", "`+Max_Diver+`", "`+Additional_Diver+`");`;
  Requete(tmpREQ);
}
function UpdateDiveTeamComposition(Id_Dive_Team_Composition,Dive_Type,Diver_Age,Dive_Guide_Qualification,Max_Diver,Additional_Diver){
  tmpREQ = `UPDATE Dive_Team_Composition set Dive_Type ="`+Dive_Type+`",Diver_Age="`+Diver_Age+`",Dive_Guide_Qualification="`+Dive_Guide_Qualification+`",Max_Diver="`+Max_Diver+`",Additional_Diver="`+Additional_Diver+`" WHERE Id_Dive_Team_Composition ="`+Id_Dive_Team_Composition`";`;
  Requete(tmpREQ);
}
function DeleteDiveTeamComposition(Id_Dive_Team_Composition){
  tmpREQ = `DELETE from Dive_Team_Composition WHERE Id_Dive_Team_Composition ="`+Id_Dive_Team_Composition+`";`;
  Requete(tmpREQ);
}

//Max_Depth_for_Qualification
function CreateMaxDepthForQualification(Diver_Qualification,Diver_Age,Guided_Diver_Depth,Autonomous_Diver_Depth){
  tmpUID = randomUUID();
  tmpREQ = `INSERT into Max_Depth_for_Qualification value("`+tmpUID+`", "`+Diver_Qualification+`", "`+Diver_Age+`", "`+Guided_Diver_Depth+`", "`+Autonomous_Diver_Depth+`");`;
  Requete(tmpREQ);
}

function DeleteMaxDepthForQualification(Id_Max_Depth_for_Qualification){
  tmpREQ = `DELETE from Max_Depth_for_Qualification WHERE Id_Max_Depth_for_Qualification ="`+Id_Max_Depth_for_Qualification+`";`
  Requete(tmpREQ);
}


//test Diver
NOM = `BURCKEL`;
PRENOM = `MAXIME`;
License_Number = `358`;
License_Expiration_Date = `2023-11-05`;
Medical_Certificate_Expiration_Date = `2023-09-05`;
Birthdate = `2023-10-05`;
//CreateUser(NOM,PRENOM,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date,Birthdate);
//UpdateUser(Id_Diver,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date);
//DeleteUser(Id_Diver)

//test Dive_Site

Site_Name = `Lille`
Latitude = `12`
Longitude = `13`
Track_Type = ``
Track_Number = ``
Track_Name = ``
Zip_Code = "jsp"
City_Name = ``
Country_Name = `France`
Additional_Address = ``
Tel_Number = ``
Information_URL = `www.youtube.com`
//CreateDiveSite(Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL);
//UpdateDiveSite(Id_Dive_Site,Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL);
//DeleteDiveSite(Id_Dive_Site);


//Test Planned_Dive
Planned_Date = "2023-11-05";Planned_Time = "12";Comments ="";Special_Needs = "Sandwich";Status = `O`;Diver_Price = "12";Instructor_Price = "10";Id_Dive_Site = "c3864752-5ffe-4e86-883d-00028be7e82d";

//CreatePlannedDive(Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Id_Dive_Site);
//UpdatePlannedDive(Id_Planned_Dive,Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Id_Dive_Site);
//DeletePlannedDive(Id_Planned_Dive);

//Test Emergency_Plan
//CreateEmergencyPlan(SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version,Id_Dive_Site);
//UpdateEmergencyPlan(Id_Emergency_Plan,SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version);
//DeleteEmergencyPlan(Id_Emergency_Plan);


//Test DiveRegistration
//CreateDiveRegistration("5909b800-e5e8-461c-8543-f6276bda8cb7","3d3796ab-b76c-4f59-812a-71699009729c","Useless","","15","N");
//UpdateDiveRegistration("1631171d-beb4-4458-b07f-6fe1ef326382","4a4d644c-ea2f-49b9-82e0-dd0ef2f94000","Utile de ouf","OUI","15","N");
//DeleteDiveRegistration("1631171d-beb4-4458-b07f-6fe1ef326382","4a4d644c-ea2f-49b9-82e0-dd0ef2f94000");

//Test Dive
//CreateDive("12:30:10","2021-12-01","2021-12-01","14:00:10","","","12","10","0","5909b800-e5e8-461c-8543-f6276bda8cb7","3d3796ab-b76c-4f59-812a-71699009729c");
//UpdateDive("79bd08f6-c060-4184-ba1e-cb7f3bbceedc","11:11:11","2022-11-1","2021-12-2","12:12:12","","","12","1","12");
//DeleteDive(Id_Dive);

//Test DiveTeam
//CreateDiveTeam("40","40","20","500","12","12","Explo","1254","12:50:10","bite","Comment","5909b800-e5e8-461c-8543-f6276bda8cb7","df37cbec-d082-45a1-9404-b670ae22b5a2");
//UpdateDiveTeam("4bdc78fb-3a50-4289-827d-52f49726c868","10","10","10","10",`C'est chiant`,"12","12","12","bi");
//DeleteDiveTeam(Id_Dive_Team);

//Test DiveTeamMember
//CreateDiveTeamMember("5909b800-e5e8-461c-8543-f6276bda8cb7","bab987de-f3bb-4003-a0ca-fb962f6031db","N5","N4","Aucun","E2","0","C'est la merde frère","50");
//UpdateDiveTeamMember("5909b800-e5e8-461c-8543-f6276bda8cb7","bab987de-f3bb-4003-a0ca-fb962f6031db","N0","N2","Aucun","E2","0","C'est la merde frère","50");
//DeleteDiveTeamMember("5909b800-e5e8-461c-8543-f6276bda8cb7","bab987de-f3bb-4003-a0ca-fb962f6031db");

//Test MaxDepthforQualification
//CreateMaxDepthForQualification('N2','18','40','20');
//DeleteMaxDepthForQualification('6f45d467-1d51-4b70-bc64-f2e221bdcae8');
