fetch('/auth/planning').then(response => {
    const userType = response.headers.get('userType');
    console.log('userType:', userType);
});

/* ------------------------------ GET PLANNING ------------------------------ */
fetch('/auth/planning/get_planning', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(res => res.json())
    .then(res => {
        console.log(res)

        // res[0].Comments = "comment";
        // updateEvent(res[0])
        // deleteEvent(res[0])
        // getEvent(res[0]);
        // register(res[1], { Personnal_Comment: "comment", Car_Pooling_Seat_Offered: 2, Car_Pooling_Seat_Request: "Y" });
        // unregister(res[0], { Personnal_Comment: "comment", Car_Pooling_Seat_Offered: 2, Car_Pooling_Seat_Request: "Y" });
    })


/* -------------------------------------------------------------------------- */
/*                                    EVENT                                   */
/* -------------------------------------------------------------------------- */
class Event {
    constructor(start, end, divePrice, InstructorPrice, location, comment, needs, open, max, maxlevel, diveType) {
        this.Start_Date = start; //
        this.End_Date = end;//
        this.Diver_Price = divePrice;//
        this.Instructor_Price = InstructorPrice;//
        this.Location = location;//
        this.Comments = comment;//
        this.Special_Needs = needs;//
        this.title = diveType + " à " + location;
        this.Status = open;//
        this.Max_Divers = max;//
        this.users = [];
        this.Dive_Type = diveType; //
    }
}
// addEvent(new Event(new Date(2024, 5, 1, 10, 0), new Date(2024, 5, 1, 12, 0), 20, 10, { Id_Dive_Site: "714d047c-5409-4593-9139-f84748bbd495", Site_Name: "La Ciotat" }, " Commentaire Commentaire ", " Besoin Besoin Besoin", false, 5, 3, "Exploration"));

/* ------------------------------ CREATE EVENT ------------------------------ */
function addEvent(event) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    fetch('/auth/planning', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    }).then(res => res.json())
        .then(res => {
            console.log(res)
        })
}

/* -------------------------------- GET EVENT ------------------------------- */
function getEvent(event) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    fetch('/auth/planning/get_event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    }).then(res => res.json())
        .then(res => {
            console.log(res)
        })
}

/* ------------------------------ MODIFY EVENT ------------------------------ */
function updateEvent(event) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    fetch('/auth/planning', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    }).then(res => res.json())
        .then(res => {
            console.log(res)
        })
}

/* ------------------------------ DELETE EVENT ------------------------------ */
function deleteEvent(event) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    fetch('/auth/planning', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    }).then(res => res.json())
        .then(res => {
            console.log(res)
        })
}



/* -------------------------------------------------------------------------- */
/*                                REGISTRATION                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------- REGISTER -------------------------------- */
function register(event, registrationInfo) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    let data = { ...event, ...registrationInfo };
    fetch('/auth/planning/registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(res => {
            console.log(res)
        })
}

function unregister(event, registrationInfo) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    let data = { ...event, ...registrationInfo };
    fetch('/auth/planning/registration', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(res => {
            console.log(res)
        })
}