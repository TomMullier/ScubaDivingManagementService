fetch('/auth/planning')
    .then(response => {
        // Obtenir le header "admin" de la réponse
        const userType = response.headers.get('userType');

        // Faire ce que vous souhaitez avec la valeur "isAdmin"
        console.log('userType:', userType);
    });


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
// addEvent(new Event(new Date(2024, 5, 1, 10, 0), new Date(2024, 5, 1, 12, 0), 20, 10, {Id_Dive_Site:"ad47d2df-dba2-4a59-b0af-e05032013e94", Site_Name : "La Ciotat"}, " Commentaire Commentaire ", " Besoin Besoin Besoin", false, 5, 3, "Exploration"));

function addEvent(event) {
    event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
    delete event.users;
    delete event.title;
    delete event.Location;
    console.log(event);
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


fetch('/auth/planning/get_planning', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(res => res.json())
    .then(res => {
        console.log(res)

    })
