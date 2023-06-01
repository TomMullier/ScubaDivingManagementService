CREATE TABLE Dive_Site(
   Id_Dive_Site CHAR(36)  NOT NULL,
   Site_Name VARCHAR(50)  NOT NULL,
   Gps_Latitude DECIMAL(11,8)  ,
   Gps_Longitude DECIMAL(11,8)  ,
   Track_Type VARCHAR(50) ,
   Track_Number VARCHAR(50) ,
   Track_Name VARCHAR(50) ,
   Zip_Code VARCHAR(50) ,
   City_Name VARCHAR(50) ,
   Country_Name VARCHAR(50)  NOT NULL,
   Additional_Address VARCHAR(50) ,
   Tel_Number VARCHAR(50) ,
   Information_URL VARCHAR(50) ,
   CONSTRAINT PK_Dive_Site PRIMARY KEY(Id_Dive_Site)
);
#COMMENT ON TABLE Dive_Site IS 'Dive site';
#COMMENT ON COLUMN Dive_Site.Id_Dive_Site IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Dive_Site.Site_Name IS 'Name of dive site';
#COMMENT ON COLUMN Dive_Site.Gps_Latitude IS 'Dive site gps latitude. Positive value is North hemisphere, negative South hemisphere';
#COMMENT ON COLUMN Dive_Site.Gps_Longitude IS 'Dive site gps longitude Positive value is East hemisphere, negative West hemisphere';
#COMMENT ON COLUMN Dive_Site.Track_Type IS 'Road, lane, street, boulvard etc.';
#COMMENT ON COLUMN Dive_Site.Track_Number IS 'Track number with extension if present. Like 1 , 123, 1 bis , 2 ter ...';
#COMMENT ON COLUMN Dive_Site.Track_Name IS 'Name of lane, street, boulvard etc.';
#COMMENT ON COLUMN Dive_Site.Country_Name IS 'Country name where site is located';
#COMMENT ON COLUMN Dive_Site.Additional_Address IS 'Additoanl addres information like bis, ter, CEDEX and so on. Depending on country mainly';
#COMMENT ON COLUMN Dive_Site.Tel_Number IS ' Telephon number(s) of diving site';
#COMMENT ON COLUMN Dive_Site.Information_URL IS 'URL to dive site web site or information.';

CREATE TABLE Diver(
   Id_Diver CHAR(36)  NOT NULL,
   Lastname VARCHAR(50)  NOT NULL,
   Firstname VARCHAR(50)  NOT NULL,
   Mail VARCHAR(50) NOT NULL,
   Phone VARCHAR(10) NOT NULL,
   Diver_Qualification VARCHAR(50) ,
   Instructor_Qualification VARCHAR(50) ,
   Nox_Level CHAR(1) ,
   Additional_Qualifications VARCHAR(50) ,
   License_Number VARCHAR(20) ,
   License_Expiration_Date DATE,
   Medical_Certificate_Expiration_Date DATE,
   Birthdate DATE,
   CONSTRAINT PK_Diver PRIMARY KEY(Id_Diver)
);
#COMMENT ON TABLE Diver IS 'Divers';
#COMMENT ON COLUMN Diver.Id_Diver IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Diver.Lastname IS 'Last name of diver';
#COMMENT ON COLUMN Diver.Firstname IS 'First name of diver';
#COMMENT ON COLUMN Diver.Mail IS 'Mail of diver';
#COMMENT ON COLUMN Diver.Phone IS 'Phone of diver';
#COMMENT ON COLUMN Diver.Diver_Qualification IS 'Current qualification of diver: BA, PA12, PA20, PA40, PA60, PE20, PE40, PE60,  N1, N2, N3, N3, N4, N5, BR, AG, OR';
#COMMENT ON COLUMN Diver.Instructor_Qualification IS 'Current instructor qualication fo diver if it exists  E1, E2, E3, E4';
#COMMENT ON COLUMN Diver.Nox_Level IS 'Current Nitrox qualification of diver if it exists: Simple, Confirmed';
#COMMENT ON COLUMN Diver.Additional_Qualifications IS 'Current additional qualification of diver';
#COMMENT ON COLUMN Diver.License_Number IS 'Diving license number of diver';
#COMMENT ON COLUMN Diver.License_Expiration_Date IS 'Diving license expiration date';
#COMMENT ON COLUMN Diver.Medical_Certificate_Expiration_Date IS 'Medical Certificate Validity expiration date';
#COMMENT ON COLUMN Diver.Birthdate IS 'Divers birthdate. Needed to copute age of diver at dive time to select max depth and other contraints.';

CREATE TABLE Planned_Dive(
   Id_Planned_Dive CHAR(36)  NOT NULL,
   Dive_Type VARCHAR(50) NOT NULL,
   Planned_Date DATE NOT NULL,
   Start_Time VARCHAR(50)  NOT NULL,
   End_Time VARCHAR(50)  NOT NULL,
   Max_Divers INT(50)  NOT NULL,
   Comments VARCHAR(50) ,
   Special_Needs VARCHAR(50) ,
   Status CHAR(5) ,
   Diver_Price DECIMAL(15,2)  ,
   Instructor_Price DECIMAL(15,2)  ,
   Dive_Site_Id_Dive_Site CHAR(36)  NOT NULL,
   CONSTRAINT PK_Planned_Dive PRIMARY KEY(Id_Planned_Dive),
   CONSTRAINT FK_Planned_Dive_Dive_Site FOREIGN KEY(Dive_Site_Id_Dive_Site) REFERENCES Dive_Site(Id_Dive_Site)
);
#COMMENT ON COLUMN Planned_Dive.Id_Planned_Dive IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Planned_Dive.Planned_Date IS 'Planned date of dive';
#COMMENT ON COLUMN Planned_Dive.Planned_Time IS 'Planned start time of dive.';
#COMMENT ON COLUMN Planned_Dive.Special_Needs IS 'Special needs for this dive like a boat, specific equipment for cave diving ...';
#COMMENT ON COLUMN Planned_Dive.Status IS 'Status of planned dive: P planned, O opened, C closed';
#COMMENT ON COLUMN Planned_Dive.Comment IS 'comment for this planned dive like meeting point, schedule, any information that Dive Director needs to exchange with divers.';
#COMMENT ON COLUMN Planned_Dive.Diver_Dive_Price IS 'Price of dive for diver';
#COMMENT ON COLUMN Planned_Dive.Instructor_Dive_Price IS 'Price of dive for instructor';
#COMMENT ON COLUMN Planned_Dive.Diver_Price IS 'Price for diver';
#COMMENT ON COLUMN Planned_Dive.Instructor_Price IS 'Price for instructor. Some dive sites have pricing based on role: diver or instructor.';

CREATE TABLE Dive_Team_Composition(
   Id_Dive_Team_Composition CHAR(36)  NOT NULL,
   Dive_Type VARCHAR(50)  NOT NULL,
   Diver_Age SMALLINT NOT NULL,
   Dive_Guide_Qualification VARCHAR(50) ,
   Max_Diver VARCHAR(50)  NOT NULL,
   Additional_Diver SMALLINT,
   CONSTRAINT PK_Dive_Team_Composition PRIMARY KEY(Id_Dive_Team_Composition)
);
#COMMENT ON TABLE Dive_Team_Composition IS 'How many diver in each team depinding on qualification of dive guide, age of teamate, type of dive like education/exploration etc.';
#COMMENT ON COLUMN Dive_Team_Composition.Id_Dive_Team_Composition IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Dive_Team_Composition.Dive_Type IS 'Exploration or Education';
#COMMENT ON COLUMN Dive_Team_Composition.Diver_Age IS 'Age of diver';
#COMMENT ON COLUMN Dive_Team_Composition.Dive_Guide_Qualification IS 'Qualification of dive guide: N4, N5, E2, E3, E4';
#COMMENT ON COLUMN Dive_Team_Composition.Max_Diver IS 'Maximum number of diver in team';
#COMMENT ON COLUMN Dive_Team_Composition.Additional_Diver IS 'Additionnal diver with specific role of dive guide assistant. Max 1';

CREATE TABLE Max_Depth_for_Qualification(
   Id_Max_Depth_for_Qualification CHAR(36)  NOT NULL,
   Diver_Qualification CHAR(50)  NOT NULL,
   Diver_Age SMALLINT,
   Guided_Diver_Depth SMALLINT,
   Autonomous_Diver_Depth SMALLINT,
   CONSTRAINT PK_Max_Depth_for_Qualification PRIMARY KEY(Id_Max_Depth_for_Qualification)
);
#COMMENT ON TABLE Max_Depth_for_Qualification IS 'Max depth allocwed depending on diver age, qualification ...  Example: N2 is PA20 and PE40 hence max guided diver depth is 40 m and max autonomous diver is 20 if diver is at least 16 years old.';
#COMMENT ON COLUMN Max_Depth_for_Qualification.Id_Max_Depth_for_Qualification IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Max_Depth_for_Qualification.Diver_Qualification IS 'Diver qualification';
#COMMENT ON COLUMN Max_Depth_for_Qualification.Diver_Age IS 'Age of the diver: 8, 10 , 12, 14, 16, 18+ years old';
#COMMENT ON COLUMN Max_Depth_for_Qualification.Guided_Diver_Depth IS 'Max depth for a guided diver';
#COMMENT ON COLUMN Max_Depth_for_Qualification.Autonomous_Diver_Depth IS 'Max depth for an autonoumous diver';

CREATE TABLE Emergency_Plan(
   Id_Emergency_Plan CHAR(36)  NOT NULL,
   SOS_Tel_Number VARCHAR(50) ,
   Emergency_Plan VARCHAR(50)  NOT NULL,
   Post_Accident_Procedure VARCHAR(50) ,
   Version VARCHAR(50) ,
   Dive_Site_Id_Dive_Site CHAR(36)  NOT NULL,
   CONSTRAINT PK_Emergency_Plan PRIMARY KEY(Id_Emergency_Plan),
   CONSTRAINT AK_Emergency_Plan UNIQUE(Dive_Site_Id_Dive_Site),
   CONSTRAINT FK_Emergency_Plan_Dive_Site FOREIGN KEY(Dive_Site_Id_Dive_Site) REFERENCES Dive_Site(Id_Dive_Site)
);
#COMMENT ON COLUMN Emergency_Plan.Id_Emergency_Plan IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Emergency_Plan.SOS_Tel_Number IS 'SOS telephon number to reach assistance';
#COMMENT ON COLUMN Emergency_Plan.Emergency_Plan IS 'Detailed description of emergency plan.';
#COMMENT ON COLUMN Emergency_Plan.Post_Accident_Procedure IS 'Mandatory rules to follow once an accident tok place.';
#COMMENT ON COLUMN Emergency_Plan.Version IS 'Backup plan version. Multiple versions';


CREATE TABLE SDMS_Meta_Data(
   Id_SDMS_Meta_Data CHAR(36)  NOT NULL,
   VRM_Schema VARCHAR(50) ,
   VRM_Schema_Start DATETIME,
   VRM_Schema_End DATETIME,
   VRM_Schema_Comment VARCHAR(50) ,
   CONSTRAINT PK_SDMS_Meta_Data PRIMARY KEY(Id_SDMS_Meta_Data)
);
#COMMENT ON TABLE SDMS_Meta_Data IS 'Information about Version.Release.Modification level of SDMS database schema, minimum version of SDMS applicaiton compatible wtith current schema';
#COMMENT ON COLUMN SDMS_Meta_Data.Id_SDMS_Meta_Data IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN SDMS_Meta_Data.VRM_Schema IS 'V.R.M level of database schema';
#COMMENT ON COLUMN SDMS_Meta_Data.VRM_Schema_Start IS 'Activation TS of activation of this VRM schema';
#COMMENT ON COLUMN SDMS_Meta_Data.VRM_Schema_End IS 'Deactivation TS of this VRM schema';

CREATE TABLE Dive(
   Id_Dive CHAR(36)  NOT NULL,
   Begin_Time TIME NOT NULL,
   Begin_Date DATE NOT NULL,
   End_Date DATE NOT NULL,
   End_Time TIME NOT NULL,
   Comment VARCHAR(50) ,
   Surface_Security VARCHAR(50) ,
   Dive_Price DECIMAL(15,2)  ,
   Instructor_Price DECIMAL(15,2)  ,
   Max_Ppo2 DECIMAL(4,2)  ,
   Diver_Id_Diver CHAR(36)  NOT NULL,
   Planned_Dive_Id_Planned_Dive CHAR(36)  NOT NULL,
   CONSTRAINT PK_Dive PRIMARY KEY(Id_Dive),
   CONSTRAINT AK_Dive UNIQUE(Planned_Dive_Id_Planned_Dive),
   CONSTRAINT FK_Dive_Diver FOREIGN KEY(Diver_Id_Diver) REFERENCES Diver(Id_Diver),
   CONSTRAINT FK_Dive_Planned_Dive FOREIGN KEY(Planned_Dive_Id_Planned_Dive) REFERENCES Planned_Dive(Id_Planned_Dive)
);
#COMMENT ON TABLE Dive IS 'Actual dive';
#COMMENT ON COLUMN Dive.Id_Dive IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Dive.Begin_Time IS 'Begin time of dive';
#COMMENT ON COLUMN Dive.Begin_Date IS 'Begin date of dive';
#COMMENT ON COLUMN Dive.End_Date IS 'End date of dive';
#COMMENT ON COLUMN Dive.End_Time IS 'End time of dive';
#COMMENT ON COLUMN Dive.Comment IS 'Comment(s) linked to this dive. Could be before or/and after dive comments.  For example in case of dive issue, comments should be filled.';
#COMMENT ON COLUMN Dive.Surface_Security IS 'What kind of security suface provided. Could be something like SOS telephon number, person in charge to monitor the dive etc.';
#COMMENT ON COLUMN Dive.Dive_Price IS 'Actual Price for diver, by default diver price from planned dive.';
#COMMENT ON COLUMN Dive.Instructor_Price IS 'Actual Price for instructor. Some dive sites have pricing based on role: diver or instructor. By default instructor price from planned dive.';
#COMMENT ON COLUMN Dive.Max_Ppo2 IS 'Maximum of Ppo2 that diver must follow. This has an impact on max of depth for diver diving with Nitrox. Could be a decision of Dive Director. In any case, Max Ppo2 shouldn't be greater tha 1.6 bar.';

CREATE TABLE Dive_team(
   Id_Dive_Team CHAR(36)  NOT NULL,
   Max_Depth INT NOT NULL,
   Max_Duration INT NOT NULL,
   Actual_Depth DECIMAL(5,2)   NOT NULL,
   Actual_Duration VARCHAR(50)  NOT NULL,
   Dive_Type VARCHAR(50)  NOT NULL,
   Sequence_number SMALLINT NOT NULL,
   Start_Time TIME NOT NULL,
   Stop_Time VARCHAR(50)  NOT NULL,
   Comment VARCHAR(50) ,
   Diver_Id_Diver CHAR(36) ,
   Dive_Id_Dive CHAR(36)  NOT NULL,
   CONSTRAINT PK_Dive_team PRIMARY KEY(Id_Dive_Team),
   CONSTRAINT FK_Dive_team_Diver FOREIGN KEY(Diver_Id_Diver) REFERENCES Diver(Id_Diver),
   CONSTRAINT FK_Dive_team_Dive FOREIGN KEY(Dive_Id_Dive) REFERENCES Dive(Id_Dive)
);
#COMMENT ON TABLE Dive_team IS 'Team of divers who dive all together. At least one team per dive.';
#COMMENT ON COLUMN Dive_team.Id_Dive_Team IS 'of type GUID stored as char(36). Like 363d5a64-22c2-4b45-a29b-2d2d358e340c';
#COMMENT ON COLUMN Dive_team.Max_Depth IS 'Maximum of depth allowed for this team';
#COMMENT ON COLUMN Dive_team.Max_Duration IS 'Maximum duration in minutes of dive allowed for team';
#COMMENT ON COLUMN Dive_team.Actual_Depth IS 'Max depth reached by team during the dive';
#COMMENT ON COLUMN Dive_team.Actual_Duration IS 'Actual duration of dive';
#COMMENT ON COLUMN Dive_team.Dive_Type IS 'Dive type for this team: Exploration, Education';
#COMMENT ON COLUMN Dive_team.Sequence_number IS 'Sequence number of team in the dive. First is 1, second is 2 ....';
#COMMENT ON COLUMN Dive_team.Start_Time IS 'Start of dive time';
#COMMENT ON COLUMN Dive_team.Stop_Time IS 'Stop of dive time';
#COMMENT ON COLUMN Dive_team.Comment IS 'Comments about dive in relationship with that team. Could be for examle information about issue on dive equipement of one diver.';

CREATE TABLE Dive_Team_Member(
   Diver_Id_Diver CHAR(36) ,
   Dive_team_Id_Dive_Team CHAR(36) ,
   Temporary_Diver_Qualification VARCHAR(50) ,
   Current_Diver_Qualification VARCHAR(50) ,
   Diver_Role VARCHAR(50) ,
   Current_Instructorr_Qualification VARCHAR(50) ,
   Nox_Percentage SMALLINT,
   Comment VARCHAR(50) ,
   Paid_Amount SMALLINT,
   CONSTRAINT PK_Dive_Team_Member PRIMARY KEY(Diver_Id_Diver, Dive_team_Id_Dive_Team),
   CONSTRAINT FK_Dive_Team_Member_Diver FOREIGN KEY(Diver_Id_Diver) REFERENCES Diver(Id_Diver),
   CONSTRAINT FK_Dive_Team_Member_Dive_team FOREIGN KEY(Dive_team_Id_Dive_Team) REFERENCES Dive_team(Id_Dive_Team)
);
#COMMENT ON TABLE Dive_Team_Member IS 'All information related to diver are information collected at time of the dive. Hence if information about a diver change for example acquisition of new qualification, we get a trace of what was the qualification had a diver in that dive. This is a form of historization.';
#COMMENT ON COLUMN Dive_Team_Member.Temporary_Diver_Qualification IS 'Temporary qualifiaction given by diver director to diver for that dive. PA12, PA20, PA40, PE20, PE40, PE60';
#COMMENT ON COLUMN Dive_Team_Member.Current_Diver_Qualification IS 'Highest diving qualification owned by diver at dive time';
#COMMENT ON COLUMN Dive_Team_Member.Diver_Role IS 'Role of diver in the team: dive guide, teamate, student';
#COMMENT ON COLUMN Dive_Team_Member.Current_Instructorr_Qualification IS 'Highest instructor qualification owned by diver at dive time';
#COMMENT ON COLUMN Dive_Team_Member.Nox_Percentage IS '% of Nox used by diver for this dive. No Nox % means air diving. Currently we do not support Trimix.';
#COMMENT ON COLUMN Dive_Team_Member.Comment IS 'Free comment area about team member.';
#COMMENT ON COLUMN Dive_Team_Member.Paid_Amount IS 'Amount paid by diver for diving';

CREATE TABLE Dive_Registration(
   Diver_Id_Diver CHAR(36) ,
   Planned_Dive_Id_Planned_Dive CHAR(36) ,
   Diver_Role VARCHAR(50) ,
   Resgistration_Timestamp DATETIME,
   Personal_Comment VARCHAR(50) ,
   Car_Pooling_Seat_Offered SMALLINT,
   Car_Pooling_Seat_Request CHAR(1) ,
   CONSTRAINT PK_Dive_Registration PRIMARY KEY(Diver_Id_Diver, Planned_Dive_Id_Planned_Dive),
   CONSTRAINT FK_Dive_Registration_Diver FOREIGN KEY(Diver_Id_Diver) REFERENCES Diver(Id_Diver),
   CONSTRAINT FK_Dive_Registration_Planned_Dive FOREIGN KEY(Planned_Dive_Id_Planned_Dive) REFERENCES Planned_Dive(Id_Planned_Dive)
);
#COMMENT ON COLUMN Dive_Registration.Diver_Role IS 'Special role of the diver for this planned dive: Dive Director, Pilot ...';
#COMMENT ON COLUMN Dive_Registration.Resgistration_Timestamp IS 'Timestamp of this registration ';
#COMMENT ON COLUMN Dive_Registration.Personal_Comment IS 'A free area for diver to put any information or comment about his/her participation to the planned dive. Could be for example a proposal for car pooling to go to dive site.';
#COMMENT ON COLUMN Dive_Registration.Car_Pooling_Seat_Offered IS 'Number of passengers seat offered by diver for car pooling';
#COMMENT ON COLUMN Dive_Registration.Car_Pooling_Seat_Request IS 'Diver would like to get a car pooling seat. (Y/N)';
