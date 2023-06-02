class User {
        constructor(lastname, firstname, mail, phone, diverQualification, instructorQualification, noxLevel, additionnalQualification, licenceNumber, licenceExpiration, medicalExpiration, birthdate ) {
                this.lastname = lastname;
                this.firstname = firstname;
                this.mail = mail;
                this.phone = phone;
                this.diverQualification = diverQualification;
                this.instructorQualification = instructorQualification;
                this.noxLevel = noxLevel;
                this.additionnalQualification = additionnalQualification;
                this.licenceNumber = licenceNumber;
                this.licenceExpiration = licenceExpiration;
                this.medicalExpiration = medicalExpiration;
                this.birthdate = birthdate+"T00:00:00";
        }
}

export {
        User
} //exporter les variables pour les utiliser dans d'autres fichiers