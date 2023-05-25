var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "Maxime",
  password: "password",
  database: "sdsm"
});
const { randomUUID } = require('crypto');
const { tmpdir } = require('os');
const express = require("express");

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
  tmpREQ = "INSERT INTO diver (Id_Diver,Lastname,Firstname,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date,Birthdate) value ('"+ tmpUID +"', '"+ Lastname +"', '"+ Firstname +"', '"+ License_Number+"', '"+License_Expiration_Date+"', '"+Medical_Certificate_Expiration_Date+"', '"+Birthdate+"');";
  Requete(tmpREQ);
}

function UpdateUser(Id_Diver,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date){
  tmpREQ = "UPDATE diver set License_Number ='"+License_Number+"',License_Expiration_Date ='"+License_Expiration_Date+"',Medical_Certificate_Expiration_Date ='"+Medical_Certificate_Expiration_Date+"' WHERE Id_Diver = '"+Id_Diver+"'";
  Requete(tmpREQ);
}

function DeleteUser(Diver_Id){
  tmpREQ = "DELETE from diver where Id_Diver = '"+Diver_Id + "'";
  Requete(tmpREQ);
}

//DIVE_SITE
function CreateDiveSite(Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL){
  tmpUID = randomUUID();
  tmpREQ = "INSERT INTO dive_site (Id_Dive_Site,Site_Name,Gps_Latitude,Gps_Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL) value ('"+tmpUID+"', '"+Site_Name+"', '"+Latitude+"', '"+Longitude+"', '"+Track_Type+"', '"+Track_Number+"', '"+Track_Name+"', '"+Zip_Code+"', '"+City_Name+"', '"+Country_Name+"', '"+Additional_Address+"', '"+Tel_Number+"', '"+Information_URL+"');";
  Requete(tmpREQ);
}
function UpdateDiveSite(Id_Dive_Site,Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL){
  tmpREQ = "UPDATE Dive_Site set "
}
function DeleteDiveSite(Id_Dive_Site){
  tmpREQ = "DELETE from Dive_Site where Id_Dive_Site ='"+Id_Dive_Site+"';";
  Requete(tmpREQ);
}

//PLANNED_DIVE
function CreatePlannedDive(Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Id_Dive_Site){
 tmpUID = randomUUID();
 tmpREQ = "INSERT INTO planned_dive (Id_Planned_Dive,Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Dive_Site_Id_Dive_Site) value ('" +tmpUID+"', '"+Planned_Date+"', '"+Planned_Time+"', '"+Comments+"', '"+Special_Needs+"', '"+Status+"', '"+Diver_Price+"', '"+Instructor_Price+"', '"+Id_Dive_Site+"');";
 Requete(tmpREQ);
}
function DeletePlannedDive(Id_Planned_Dive){
  tmpREQ = "DELETE from Planned_Dive where Id_Planned_Dive ='"+Id_Planned_Dive+"';";
  Requete(tmpREQ);
}
function UpdatePlannedDive(Id_Planned_Dive,Planned_Date,Planned_Time,Comments,Special_Needs,Status,Diver_Price,Instructor_Price,Id_Dive_Site){
  tmpREQ = "UPDATE planned_dive set Planned_Date ='"+Planned_Date+"',Planned_Time='"+Planned_Time+"',Comments='"+Comments+"',Special_Needs='"+Special_Needs+"',Status='"+Status+"',Diver_Price='"+Diver_Price+"',Instructor_Price='"+Instructor_Price+"',Dive_Site_Id_Dive_Site='"+Id_Dive_Site+"' WHERE Id_Planned_Dive ='"+Id_Planned_Dive+"';";
  Requete(tmpREQ);
}

//Emergency_Plan
function CreateEmergencyPlan(SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version,Id_Dive_Site){
  tmpUID = randomUUID();
  tmpREQ = "INSERT INTO Emergency_Plan (Id_Emergency_Plan,SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version,Dive_Site_Id_Dive_Site) value ('"+tmpUID+"', '"+SOS_Tel_Number+"', '"+Emergency_Plan+"', '"+Post_Accident_Procedure+"', '"+Version+"', '"+Id_Dive_Site+"');";
  Requete(tmpREQ);
}
function UpdateEmergencyPlan(Id_Emergency_Plan,SOS_Tel_Number,Emergency_Plan,Post_Accident_Procedure,Version){
  tmpREQ = "UPDATE Emergency_Plan set SOS_Tel_Number ='"+SOS_Tel_Number+"',Emergency_Plan ='"+Emergency_Plan+"',Post_Accident_Procedure ='"+Post_Accident_Procedure+"',Version ='"+Version+"' WHERE Id_Emergency_Plan ='"+Id_Emergency_Plan+"';";
  Requete(tmpREQ);
}




//test Diver
NOM = "BURCKEL";
PRENOM = "MAXIME";
License_Number = "358";
License_Expiration_Date = "2023-11-05";
Medical_Certificate_Expiration_Date = "2023-09-05";
Birthdate = "2023-10-05";
//CreateUser(NOM,PRENOM,License_Number,License_Expiration_Date,Medical_Certificate_Expiration_Date,Birthdate);

//UpdateUser('4066e558-c95f-425f-8de4-865354e8214a','12','2011-09-15','2015-04-29');

//test Dive_Site

Site_Name = "Lille"
Latitude = "12"
Longitude = "13"
Track_Type = ""
Track_Number = ""
Track_Name = ""
Zip_Code = undefined
City_Name = ""
Country_Name = "France"
Additional_Address = ""
Tel_Number = ""
Information_URL = "www.youtube.com"
//CreateDiveSite(Site_Name,Latitude,Longitude,Track_Type,Track_Number,Track_Name,Zip_Code,City_Name,Country_Name,Additional_Address,Tel_Number,Information_URL);

//DeleteDiveSite('f909d5b8-fe01-4c3b-acb7-6dc7c48039fa');


//Test Planned_Dive
//CreatePlannedDive('2024-01-01','12h30','Bon','Sandwichs triangles','P','3.50','12','ebb5bc97-d5e1-4451-82c7-36959276ba66');
//UpdatePlannedDive('bb888c4c-e704-41c5-a085-9c8b6f0049ac','2015-12-12','12h30','','','C','15','15','ebb5bc97-d5e1-4451-82c7-36959276ba66');
//DeletePlannedDive('bb888c4c-e704-41c5-a085-9c8b6f0049ac');

//Test Emergency_Plan
CreateEmergencyPlan('3630','Courez','Aller en prison','1.0.0','ebb5bc97-d5e1-4451-82c7-36959276ba66')
