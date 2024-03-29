/* -------------------------------------------------------------------------- */
/*                                   IMPORT                                   */
/* -------------------------------------------------------------------------- */
import {
    frLocale
} from './@fullcalendar/core/locales/fr.js';
import {
    Event
} from "./class/Event.js";

import {
    User
} from "./class/User.js";

import {
    Location
} from "./class/Location.js";
// import {
//     check
// } from 'express-validator';

/* -------------------------------------------------------------------------- */
/*                              GLOBAL VARIABLES                              */
/* -------------------------------------------------------------------------- */
let my_role;
let me;
let events = [];
let locations = [];
let allDivers = [];

function openErrorModal(e) {
    modals.closeCurrent();
    setTimeout(function () {
        modals.show("error_occured");
        document.querySelector("#error_occured p").innerText = e;
        setTimeout(function () {
            modals.closeCurrent();
            document.location.reload();
        }, 3000);
    }, 500);
}

/* -------------------------------------------------------------------------- */
/*                                   REQUEST                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------- USERTYPE -------------------------------- */
fetch('/auth/planning')
    .then(response => {
        const userType = response.headers.get('userType');
        my_role = userType;
        // user, dp, club
        if (my_role != "club") {
            document.querySelectorAll(".club_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
        if (my_role != "dp") {
            document.querySelectorAll(".dp_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
        if (my_role != "user") {
            document.querySelectorAll(".user_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
        if (my_role == "user") {
            document.querySelector(".my_profile_menu").style.display = "flex";
            document.querySelector(".locations_menu").style.display = "none";
            document.querySelector(".club_members_menu").style.display = "none";
        }
        if (my_role == "dp") {
            document.querySelector(".my_profile_menu").style.display = "flex";
            document.querySelector(".locations_menu").style.display = "none";
            document.querySelector(".club_members_menu").style.display = "none";
        }
        if (my_role == "club") {
            document.querySelector(".my_profile_menu").style.display = "none";
            document.querySelector(".locations_menu").style.display = "flex";
            document.querySelector(".club_members_menu").style.display = "flex";
        }
    });

/* -------------------------------- USERINFO -------------------------------- */
fetch('/auth/user/account/get_info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then(res => {
        let userInfo = res
        try {
            if (res.Lastname) {
                me = new User(userInfo.Lastname, userInfo.Firstname, userInfo.Mail, userInfo.Phone, userInfo.Diver_Qualification, userInfo.Instructor_Qualification, userInfo.Nox_Level, userInfo.Additional_Qualifications, userInfo.License_Number, userInfo.License_Expiration_Date, userInfo.Medical_Certificate_Expiration_Date, userInfo.Birthdate);
                // setUserInfos();
            }
            if (res.username) {
                me = res.username.split("@")[0];
            }
        } catch (e) {
            openErrorModal(e);
        }
        setUserInfos();
        getPlanning()
    })

/* ------------------------------ GET PLANNING ------------------------------ */
function getPlanning() {
    fetch('/auth/planning/get_planning', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            res.allLocations.forEach(function (location) {
                locations.push(new Location(location.Site_Name, location.Gps_Latitude, location.Gps_Longitude, location.Track_Type, location.Track_Number, location.Track_Name, location.Zip_Code, location.City_Name, location.Country_Name, location.Additional_Address, location.Tel_Number, location.Information_URL, [location.General_Rate, location.Location_Rate, location.Organisation_Rate, location.Conditions_Rate, location.Rate_Number], location.SOS_Tel_Number, location.Emergency_Plan, location.Post_Accident_Procedure));
            });
            if (res.allUsers && my_role == "club") {
                allDivers = res.allUsers;
            }
            res.allEvents.forEach(function (event) {
                let e = new Event(new Date(event.Start_Date), new Date(event.End_Date), event.Diver_Price, event.Instructor_Price, event.Location, event.Comments, event.Special_Needs, event.Status, event.Max_Divers, event.Dive_Type);
                e.addUser(event.Users);
                if (my_role == "club" && e.start > new Date()) {
                    e.startEditable = true;
                    e.durationEditable = true;
                    e.resizableFromStart = true;
                    e.dropable = true;
                } else {
                    e.startEditable = false;
                    e.durationEditable = false;
                    e.resizableFromStart = false;
                    e.dropable = false;
                }
                events.push(e);
            });
            setEvents(events);
        })
}

/* ------------------------------ CREATE EVENT ------------------------------ */

function addEvent(event, usersToRegister) {
    usersToRegister = usersToRegister.filter(user => user != event.dp);
    event.lengthUsersToRegister = usersToRegister.length
    fetch('/auth/planning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).then(res => res.json())
        .then(async res => {
            console.log(res)
            if (!res.created) {
                // L'event n'a pas été créé
                openErrorModal(res.comment);
            } else {
                let registrationInfo = {
                    Personnal_Comment: "Registered by club",
                    Car_Pooling_Seat_Offered: 0,
                    Car_Pooling_Seat_Request: "n",
                    Diver_Role: "DP"
                }
                let isRegistered = await register(event, registrationInfo, event.dp, false) // dp = mail  
                if (!isRegistered) {
                    openErrorModal("L'event a été créé mais le DP n'a pas été inscrit");
                    return;
                }
                if (usersToRegister.length > 0) {
                    registrationInfo.Diver_Role = "Diver";
                    for (const user of usersToRegister) {
                        if (user !== event.dp) isRegistered = await register(event, registrationInfo, user, false); // user = mail
                        if (!isRegistered) break;
                    }
                }
                if (isRegistered) window.location.reload();
                else openErrorModal("L'event a été créé mais les inscriptions n'ont pas pu être effectuées");
            }
        })
}

/* ------------------------------ MODIFY EVENT ------------------------------ */
function updateEvent(oldEvent, event, usersToRegister) {
    console.log(oldEvent)
    console.log(event)
    console.log(usersToRegister)
    event.oldEvent = oldEvent;
    usersToRegister = usersToRegister.filter(user => user != event.dp);
    event.lengthUsersToRegister = usersToRegister.length
    fetch('/auth/planning', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).then(res => res.json())
        .then(async res => {
            console.log(res)
            if (!res.modified) {
                // L'event n'a pas été modifié
                openErrorModal(res.comment);
            } else {
                delete event.oldEvent;
                let isDeleted = await deleteAllRegistration(event);
                if (isDeleted) {
                    let registrationInfo = {
                        Personnal_Comment: "Registered by club",
                        Car_Pooling_Seat_Offered: 0,
                        Car_Pooling_Seat_Request: "n",
                        Diver_Role: "DP"
                    }
                    let registered = await register(event, registrationInfo, event.dp, false) // dp = mail
                    if (!registered) {
                        openErrorModal("L'event a été modifié mais le DP n'a pas été inscrit");
                        return;
                    }
                    if (usersToRegister.length > 0) {
                        registrationInfo.Diver_Role = "Diver";
                        for (const user of usersToRegister) {
                                if (user !== event.dp) {
                                    registered = await register(event, registrationInfo, user, false); // user = mail
                                    if (!registered) break;
                                }
                        }
                    }
                    if (registered) window.location.reload();
                    else openErrorModal("L'event a été modifié mais les inscriptions n'ont pas pu être effectuées");
                }
            }
        })
}

/* ------------------------------ DELETE EVENT ------------------------------ */
function deleteEvent(event) {
    fetch('/auth/planning', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            if (!res.deleted) {
                // L'event n'a pas été supprimé
                openErrorModal(res.comment);
            } else window.location.reload()
        })
}

/* -------------------------------- REGISTER -------------------------------- */
async function register(
    event,
    registrationInfo = {
        Personnal_Comment: "",
        Car_Pooling_Seat_Offered: 0,
        Car_Pooling_Seat_Request: "n",
        Diver_Role: "Diver"
    },
    userInfo = "", reload = true) {
    return new Promise((resolve, reject) => {
        let data = {
            ...event,
            ...registrationInfo,
        };
        data.Mail = userInfo;
        fetch('/auth/planning/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(res => res.json())
            .then(res => {
                console.log(res)
                if (res.registered) {
                    document.querySelector("#reserveButton").innerHTML = "Se désinscrire";
                    document.querySelector("#reserveButton").classList.add("unreserveButton");
                    document.querySelector("#reserveButton").classList.remove("reserveButton");
                    if (reload) document.location.reload();
                    resolve(res.registered);
                    // eventClicked.setProp("backgroundColor", "#f2574a");
                } else {
                    // Impossible de s'inscrire
                    openErrorModal(res.comment);
                    resolve(res.registered)
                }
            })
    })
}

/* ------------------------------- UNREGISTER ------------------------------- */
function unregister(event, registrationInfo = {
    Personnal_Comment: "Registered by club",
    Car_Pooling_Seat_Offered: 0,
    Car_Pooling_Seat_Request: "n",
    Diver_Role: "Diver"
}) {
    let data = {
        ...event,
        ...registrationInfo
    };
    fetch('/auth/planning/registration', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            if (res.deleted) {
                document.querySelector("#reserveButton").innerHTML = "S'inscrire";
                document.querySelector("#reserveButton").classList.add("reserveButton");
                document.querySelector("#reserveButton").classList.remove("unreserveButton");
                eventClicked.setProp("backgroundColor", "#4CAF50");
                document.location.reload();
            } else {
                // Impossible de se désinscrire
                openErrorModal(res.comment);
            }
        })
}

/* ------------------------- DELETE ALL REGISTRATION ------------------------ */
async function deleteAllRegistration(event) {
    return new Promise((resolve, reject) => {
        fetch('/auth/planning/registration/all', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }).then(res => res.json())
            .then(res => {
                if (res.deleted) resolve(true);
                else {
                    resolve(false);
                    openErrorModal(res.comment);
                }
            })
    })
}

/* ------------------------------ RATE LOCATION ----------------------------- */
function rateLocation(data) {
    fetch('/auth/planning/set_rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            if (!res.rated) {
                openErrorModal(res.comment);
            } else {
                document.location.reload();
            }
        })
}

async function hasVoted(event) {
    return new Promise((resolve, reject) => {
        fetch('/auth/planning/has_voted', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }).then(res => res.json())
            .then(res => {
                console.log(res)
                resolve(res.hasVoted)
            })
    })
}

function editPalanquee(event) {
    fetch('/auth/planning/edit_palanquee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            if (res.created) window.location.href = '/auth/dp/palanquee'
            else {
                openErrorModal(res.comment);
            }
        })
}

async function check_PDF(event) {
    return new Promise((resolve, reject) => {
        fetch('/auth/planning/pdf_event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }).then(res => res.json())
            .then(res => {
                console.log(res)
                if (res.pdf) resolve(true);
                else {
                    resolve(false);
                }
            })
    })
}



/* -------------------------------------------------------------------------- */
/*                                    CODE                                    */
/* -------------------------------------------------------------------------- */
let calendar;
let eventClicked;
let html_memory;

function setEvents(ev_) {
    let slider2 = document.getElementById("priceSlider");
    var slider = document.getElementById("timeSlider");

    eventsFilteredPrice = events;
    eventsFilteredTime = events;

    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        // Options du calendrier
        editable: true,
        locale: frLocale,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        height: 'auto',
        slotMinTime: '09:00:00', // Heure de début (10h)
        slotMaxTime: '19:00:00',
        views: {
            timeGridWeek: {
                nowIndicator: true,
                allDaySlot: false
            },
            timeGridDay: {
                nowIndicator: true,
                allDaySlot: false
            }
        },
        businessHours: [ // specify an array instead
            {
                daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday, Tuesday, Wednesday
                startTime: '10:00', // 8am
                endTime: '12:00' // 6pm
            },
            {
                daysOfWeek: [1, 2, 3, 4, 5, 6], // Thursday, Friday
                startTime: '14:00', // 10am
                endTime: '18:00' // 4pm
            }
        ],
        events: [],
        eventChange: function (info) {
            if (my_role != "club") return;
            let data = {
                Start_Date: info.event.start,
                End_Date: info.event.end,
                Diver_Price: info.event.extendedProps.divePrice,
                Instructor_Price: info.event.extendedProps.InstructorPrice,
                Special_Needs: info.event.extendedProps.needs,
                Status: info.event.extendedProps.open,
                Max_Divers: info.event.extendedProps.max,
                Dive_Type: info.event.extendedProps.diveType,
                Comments: info.event.extendedProps.comment,
                Site_Name: info.event.extendedProps.location.Site_Name,
            }
            // Use find to get the dp (user with role DP)
            let dp = info.event.extendedProps.users.find(user => user.Diver_Role == "DP");
            data.dp = dp.Mail;
            let oldData = {
                Start_Date: info.oldEvent.start,
                End_Date: info.oldEvent.end,
                Diver_Price: info.oldEvent.extendedProps.divePrice,
                Instructor_Price: info.oldEvent.extendedProps.InstructorPrice,
                Special_Needs: info.oldEvent.extendedProps.needs,
                Status: info.oldEvent.extendedProps.open,
                Max_Divers: info.oldEvent.extendedProps.max,
                Dive_Type: info.oldEvent.extendedProps.diveType,
                Comments: info.oldEvent.extendedProps.comment,
                Site_Name: info.oldEvent.extendedProps.location.Site_Name,
            }
            // Use find to get the dp (user with role DP)
            let oldDp = info.oldEvent.extendedProps.users.find(user => user.Diver_Role == "DP");
            oldData.dp = oldDp.Mail;
            let usersToRegister = [];
            info.event.extendedProps.users.forEach(function (user) {
                if (user.Diver_Role == "Diver") {
                    usersToRegister.push(user.Mail);
                }
            });
            updateEvent(oldData, data, usersToRegister);
        },
        eventMouseEnter: function (info) {
            // Element HTML -> info.el
            // Evénement -> info.event

            // If role is club, on hover place a little pencil on the event
            if (my_role == "club" && new Date(info.event.start) > new Date()) {
                // let pencil = document.createElement("I");
                // pencil.classList.add("fas");
                // pencil.classList.add("fa-pencil-alt");
                // pencil.style.opacity = "0";
                // html_memory = info.el.innerHTML;
                // info.el.innerHTML = "";
                // info.el.appendChild(pencil);
                // setTimeout(function () {
                //     pencil.style.opacity = "1";
                // }, 0);
                info.el.title = "Cliquez pour modifier";
            }
        },
        eventMouseLeave: function (info) {
            // Element HTML -> info.el
            // Evénement -> info.event
            if (my_role == "club" && new Date(info.event.end) > new Date()) {
                // document.querySelector(".fa-pencil-alt").style.opacity = "0";
                // setTimeout(function () {
                //     info.el.innerHTML = html_memory;
                // }, 100);
            }
        },
        eventClick: async function (info) {
            // Element HTML -> info.el
            // Evénement -> info.event
            if (my_role == "club" && new Date(info.event.end) > new Date()) {
                edit_event(info);
                return;
            }
            eventClicked = info.event;

            // Open Modale
            modals.show("eventModal", function () {
                menutoggle.classList.remove('active');
            });

            // Button update
            let button = document.querySelector("#reserveButton");
            if (info.event.backgroundColor == "#f2574a") {
                button.innerHTML = "Se désinscrire";
                button.classList.add("unreserveButton");
                button.classList.remove("reserveButton");
            } else {
                button.innerHTML = "S'inscrire";
                button.classList.add("reserveButton");
                button.classList.remove("unreserveButton");
            }
            let dp_in_event = false;
            info.event.extendedProps.users.forEach(function (user) {
                if (user.Diver_Role == "DP" && user.Mail == me.mail) {
                    dp_in_event = true;
                }
            });
            let event__ = {
                Start_Date: eventClicked.start,
                End_Date: eventClicked.end,
                Diver_Price: eventClicked.extendedProps.divePrice,
                Instructor_Price: eventClicked.extendedProps.InstructorPrice,
                Special_Needs: eventClicked.extendedProps.needs,
                Status: eventClicked.extendedProps.open,
                Max_Divers: eventClicked.extendedProps.max,
                Dive_Type: eventClicked.extendedProps.diveType,
                Comments: eventClicked.extendedProps.comment,
                Site_Name: eventClicked.extendedProps.location.Site_Name,
            }
            let voted = await hasVoted(event__);
            if (voted) {
                document.querySelector(".rating").style.display = "none";
            } else {
                document.querySelector(".rating").style.display = "flex";
            }
            if (new Date(eventClicked.start) < new Date() && my_role == "user") {
                button.style.display = "none";

            } else {
                button.style.display = "flex";
                document.querySelector(".rating").style.display = "none";
            }

            if (my_role == "club") button.style.display = "none";
            let midnight_before = new Date(eventClicked.start);
            midnight_before.setHours(0, 0, 0, 0);
            let midnight_after = new Date(eventClicked.start);
            midnight_after.setHours(23, 59, 59, 999);
            let event = {
                Start_Date: eventClicked.start,
                End_Date: eventClicked.end,
                Diver_Price: eventClicked.extendedProps.divePrice,
                Instructor_Price: eventClicked.extendedProps.InstructorPrice,
                Special_Needs: eventClicked.extendedProps.needs,
                Status: eventClicked.extendedProps.open,
                Max_Divers: eventClicked.extendedProps.max,
                Dive_Type: eventClicked.extendedProps.diveType,
                Comments: eventClicked.extendedProps.comment,
                Site_Name: eventClicked.extendedProps.location.Site_Name,
            }
            let pdf_created = await check_PDF(event);
            if (my_role == "dp" && new Date() > midnight_before && new Date() < midnight_after && !pdf_created) {
                document.querySelector(".edit_rapport").querySelector("i").classList = "fa-solid fa-file-circle-plus edit_rapport";
                document.querySelector(".edit_rapport").style.display = "flex";
            } else {
                if ((my_role == "dp" || my_role == "club") && (new Date() > midnight_after || pdf_created)) {
                    document.querySelector(".edit_rapport").querySelector("i").classList = "fa-solid fa-floppy-disk edit_rapport";
                    document.querySelector(".edit_rapport").style.display = "flex";
                } else {
                    document.querySelector(".edit_rapport").style.display = "none";
                }
            }

            if (dp_in_event) {
                document.querySelectorAll("#reserveButton").forEach(function (button) {
                    button.style.display = "none";
                });
            }

            // If event full 
            if (info.event.extendedProps.max - info.event.extendedProps.users.length == 0) {
                document.querySelector("#reserveButton").style.display = "none";
            }
            displayRatings(eventClicked);

            menutoggle.classList.toggle('active');
            menutoggle.classList.toggle('close-modal');
            //Titre
            document.querySelector("#eventTitle").innerHTML = info.event.title;
            // Durée
            //get start time with 2 digits even if 0
            let startHour = info.event.start.getHours();
            let startMinutes = info.event.start.getMinutes();
            if (startMinutes < 10) {
                startMinutes = "0" + startMinutes;

            }
            //get end time with 2 digits even if 0
            let endHour = info.event.end.getHours();
            let endMinutes = info.event.end.getMinutes();
            if (endMinutes < 10) {
                endMinutes = "0" + endMinutes;
            }

            let startTime = startHour + "h" + startMinutes;
            let endTime = endHour + "h" + endMinutes;
            let event_durationHour = endHour - startHour;
            let event_durationMinute = endMinutes - startMinutes;
            let event_duration;
            if (event_durationHour == 0) {
                event_duration = event_durationMinute + "min";
            } else if (event_durationMinute == 0) {
                event_duration = event_durationHour + "h";
            } else {
                event_duration = event_durationHour + "h" + event_durationMinute + "min";
            }
            document.querySelector(".event_duration").innerHTML = event_duration;
            document.querySelector("#eventStart").innerHTML = startTime;
            document.querySelector("#eventEnd").innerHTML = endTime;

            // Location
            setTimeout(function () {
                if (window.innerWidth > 900)
                    document.querySelector("#timeline_view").style.height = "calc(" + $("#global-view").height() + "px - 40px)";
            }, 0);
            let adress = eventClicked.extendedProps.location.Site_Name;
            adress += "\n" + eventClicked.extendedProps.location.Track_Number + " " + eventClicked.extendedProps.location.Track_Type + " " + eventClicked.extendedProps.location.Track_Name;
            adress += "\n" + eventClicked.extendedProps.location.Zip_Code + " " + eventClicked.extendedProps.location.City_Name;
            adress += "\n" + eventClicked.extendedProps.location.Country_Name;
            document.querySelector("#eventLocation").innerText = adress;
            adress = adress.replace(/(\r\n|\n|\r)/gm, " ");
            document.querySelector("#eventLocation").href = "https://www.google.com/maps/search/?api=1&query=" + adress;
            document.querySelector("#eventLocation").title = "Voir sur Google Maps";

            // Level display
            let level = eventClicked.extendedProps.maxlevel;
            let level_item = document.querySelectorAll(".level-item-modale");
            level_item.forEach(function (level_item_item) {
                if (parseInt(level_item_item.innerText) <= parseInt(level)) {
                    level_item_item.classList.add("active");
                    level_item_item.classList.remove("not-active");
                } else {
                    level_item_item.classList.remove("active");
                    level_item_item.classList.add("not-active");
                }
            });

            // Price
            let DivePrice = eventClicked.extendedProps.divePrice;
            let InstructorPrice = eventClicked.extendedProps.InstructorPrice;
            document.querySelector("#eventPriceDiver").innerHTML = "Plongeur : " + DivePrice + " €";
            document.querySelector("#eventPriceInstructor").innerHTML = "Instructeur : " + InstructorPrice + "€";

            document.querySelector("#places_left").innerText = eventClicked.extendedProps.max - eventClicked.extendedProps.users.length;

            let user_list = document.querySelector("#display_users");
            user_list.innerHTML = "";
            eventClicked.extendedProps.users.forEach(function (user) {
                let li_ = document.createElement("li");
                if (user.Diver_Role === "DP") {
                    li_.className = "DP";
                }
                li_.innerText = user.Firstname + " " + user.Lastname;
                user_list.appendChild(li_);
            });


            // Comment
            let comment = eventClicked.extendedProps.comment;
            document.querySelector("#comment").innerHTML = "Commentaire : " + comment;

            // Needs
            let needs = eventClicked.extendedProps.needs;
            document.querySelector("#needs").innerHTML = "Besoin : " + needs;

            /// Order of divers
            let list = document.querySelectorAll(".listOfUser ul li");
            let innerTexts = [];
            list.forEach(function (li) {
                if (!li.classList.contains("DP")) {
                    innerTexts.push(li.innerText);
                }
            });
            innerTexts.sort();
            list.forEach(function (li) {
                if (li.classList.contains("DP")) {
                    innerTexts.unshift(li.innerText);
                }
            });
            document.querySelector(".listOfUser ul").innerHTML = "";
            let li = document.createElement("li");
            li.innerText = innerTexts[0];
            li.classList.add("DP");
            document.querySelector(".listOfUser ul").appendChild(li);
            innerTexts.shift();
            innerTexts.forEach(function (innerText) {
                // create li
                li = document.createElement("li");
                li.innerText = innerText;
                // add li to ul
                document.querySelector(".listOfUser ul").appendChild(li);
            });

            // Display ratings
            // displayRatings(eventClicked);


        },

    });

    // Check if screen wicth sup or inf to 900px
    checkScreenSize();

    window.addEventListener("resize", function () {
        checkScreenSize();
    });



    // Filtres

    slider.addEventListener("input", function () {
        var label = document.getElementById("timeLabel");
        var hours = Math.floor(this.value / 60);
        var minutes = this.value % 60;
        if (this.value == 150) {
            label.textContent = "Illimité"
            eventsFilteredTime = events;
        } else {
            label.textContent = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
            eventsFilteredTime = [];
            events.forEach(function (event) {
                var start = event.start;
                var end = event.end;
                var duration = (end - start) / 1000 / 60;
                if (duration <= slider.value) {
                    eventsFilteredTime.push(event);
                }
            })
        }

        // To display the events
        calendar.removeAllEvents();
        eventsFilteredTime.forEach(function (event) {
            if (eventsFilteredPrice.includes(event)) {
                calendar.addEvent(event);
            }
        });
    });

    slider2.addEventListener("input", function () {
        var label = document.getElementById("priceLabel");
        var price = Math.floor(this.value);
        if (this.value == 150) {
            label.textContent = "Illimité"
            eventsFilteredPrice = events;
        } else {
            label.textContent = price.toString().padStart(2, "0") + "€";
            eventsFilteredPrice = [];
            events.forEach(function (event) {
                if (event.divePrice <= price) {
                    eventsFilteredPrice.push(event);
                }
            });
        }
        calendar.removeAllEvents();
        eventsFilteredPrice.forEach(function (event) {
            if (eventsFilteredTime.includes(event)) {
                calendar.addEvent(event);
            }
        });
    });

    //! Check si il est déja inscrit
    events.forEach(function (event) {
        if (!event.users == [] && my_role != "club") {
            event.users.forEach(function (user) {
                if (user.Mail == me.mail) {
                    event.backgroundColor = "#f2574a";
                    return;
                }
            });
        }
        if (event.start < new Date()) {
            event.backgroundColor = "grey";
        }
        calendar.addEvent(event);
    });
    calendar.render();

    loadingClose();
};

//! RESERVATION 
let button = document.querySelector("#reserveButton");
button.addEventListener("click", async function (e) {
    e.stopPropagation();
    let data = {
        Start_Date: eventClicked.start,
        End_Date: eventClicked.end,
        Diver_Price: eventClicked.extendedProps.divePrice,
        Instructor_Price: eventClicked.extendedProps.InstructorPrice,
        Special_Needs: eventClicked.extendedProps.needs,
        Status: eventClicked.extendedProps.open,
        Max_Divers: eventClicked.extendedProps.max,
        Dive_Type: eventClicked.extendedProps.diveType,
        Comments: eventClicked.extendedProps.comment,
        Site_Name: eventClicked.extendedProps.location.Site_Name,
    }
    if (document.querySelector("#reserveButton").classList.contains("reserveButton")) {
        // Reserver
        const reg = await register(data);
        
    } else {
        // Se désinscrire
        unregister(data);
    }
});

function loadingClose() {
    document.querySelector(".loading_animation").style.opacity = "0";
    setTimeout(function () {
        document.querySelector(".loading_animation").style.display = "none";
    }, 500);
}

function checkScreenSize() {
    if (window.innerWidth > 900) {
        calendar.initialView = 'timeGridWeek',
            calendar.changeView('timeGridWeek');
    } else {
        calendar.initialView = 'timeGridDay';
        calendar.changeView('timeGridDay');
    }
}


var eventsFilteredTime = [];
var eventsFilteredPrice = [];








let list_checkbox = document.querySelector("#checkbox_list");
list_checkbox.addEventListener("click", function (e) {
    e.stopPropagation();
    if (list_checkbox.checked) {
        calendar.initialView = 'listWeek';
        calendar.changeView('listWeek');
    } else {
        calendar.initialView = 'timeGridWeek';
        calendar.changeView('timeGridWeek');
        checkScreenSize();
    }
});




//boutton menu
let menutoggle = document.querySelector('.toggle')
menutoggle.onclick = function () {
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    if (!menutoggle.classList.contains('active')) {
        modals.closeCurrent();
    } else {
        modals.show("menuModal");
    }
}

//bouton d'urgence
var emergencyButton = document.getElementById("emergencyButton");
var emergencyModal = document.getElementById("emergencyModal");

emergencyButton.addEventListener("click", function (e) {
    e.stopPropagation();
    modals.show("emergencyModal", function () {
        menutoggle.classList.remove('active');
        document.querySelectorAll(".toggle span").forEach(function (element) {
            element.style.backgroundColor = "#f2574a"
        });
    });
    document.querySelectorAll(".toggle span").forEach(function (element) {
        element.style.backgroundColor = "white"
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    document.querySelector("#emergencyModal .download_button").addEventListener("click", function () {
        location.href = "/auth/incident_rapport"
        modals.closeCurrent();
    })
});





let rapport_button = document.querySelector(".edit_rapport");
rapport_button.addEventListener("click", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    let event = {
        Start_Date: eventClicked.start,
        End_Date: eventClicked.end,
        Diver_Price: eventClicked.extendedProps.divePrice,
        Instructor_Price: eventClicked.extendedProps.InstructorPrice,
        Special_Needs: eventClicked.extendedProps.needs,
        Status: eventClicked.extendedProps.open,
        Max_Divers: eventClicked.extendedProps.max,
        Dive_Type: eventClicked.extendedProps.diveType,
        Comments: eventClicked.extendedProps.comment,
        Site_Name: eventClicked.extendedProps.location.Site_Name,
    }
    let pdf_created = await check_PDF(event);
    if (pdf_created) {
        document.location.href = "/auth/planning/download_pdf"
    } else {
        editPalanquee(event);
    }
});

//! EVENT CREATION

let create_event_button = document.querySelector("#createEventButton");

create_event_button.addEventListener("click", function () {
    modals.show("createEventModal", function () {
        menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    document.querySelector("#createEventModal .container_create_event").querySelectorAll('input').forEach(function (input) {
        if (input.getAttribute("required")) {
            input.style.border = "1px solid #120B8F";
        }
    });
    document.querySelector("#eventDateInput").value = new Date().toISOString().slice(0, 10);
    document.querySelector("#eventStartInput").value = new Date().toLocaleString().slice(11, 16);
    let end = new Date();
    end.setHours(end.getHours() + 2);
    document.querySelector("#eventEndInput").value = end.toLocaleString().slice(11, 16);
    let location_select = document.querySelector(".location_select");
    location_select.querySelector(".option-list").innerHTML = "";
    locations.forEach(function (location) {
        let option = "<li data-text='" + location.name + "' data-value='" + location.name + "'><a><i class='fas fa-map-marker-alt'></i>" + location.name + "</a></li>";
        location_select.querySelector(".option-list").innerHTML += option;
    });
    let select_dp = document.querySelector("#createEventModal .DP_list_dropdown")
    select_dp.querySelector(".option-list").innerHTML = "";
    let select_diver = document.querySelector("#createEventModal .diver_list_dropdown");
    select_diver.querySelector(".option-list").innerHTML = "";
    allDivers.forEach(function (diver) {
        if (diver.Diver_Qualification == "P5") {
            let option = "<li data-value='" + diver.Mail + "'><a><i class='fa-solid fa-user'></i><div class=user-info-list><span class=name>" + diver.Firstname + " " + diver.Lastname + "</span><span class=mail>" + diver.Mail + "</span></div></a></li>";
            select_dp.querySelector(".option-list").innerHTML += option;
        }
        let option = "<li data-value='" + diver.Mail + "'><a><i class='fa-solid fa-user'></i><div class=user-info-list><span class=name>" + diver.Firstname + " " + diver.Lastname + "</span><span class=mail>" + diver.Mail + "</span></div></a></li>";
        select_diver.querySelector(".option-list").innerHTML += option;
    });
});

function setDiversListsHTML_Edit() {
    // Set DP list in HTML
    let DP_list = document.querySelector("#modifyEventModal .DP_list_dropdown");
    DP_list.innerHTML = "";
    let diver_DD = document.querySelector("#modifyEventModal .diver_list_dropdown");
    diver_DD.innerHTML = "";
    allDivers.forEach(function (diver) {
        if (diver.Diver_Qualification == "P5") {
            let info_contain = document.createElement("DIV");
            info_contain.classList.add("DP_item");
            let diver_item = document.createElement("H4");
            diver_item.classList.add("diver_item");
            let hidden = document.createElement("H4");
            hidden.style.display = "flex";
            hidden.className = diver.Mail;
            hidden.innerText = diver.Mail;
            hidden.id = "DP_mail";
            let name_contain = document.createElement("DIV");
            name_contain.classList.add("name_contain");
            name_contain.innerHTML = diver.Firstname + " " + diver.Lastname;
            info_contain.appendChild(name_contain);
            info_contain.appendChild(hidden);
            DP_list.appendChild(info_contain);
        }
        let info_contain = document.createElement("DIV");
        info_contain.classList.add("info_contain");
        let diver_item = document.createElement("H4");
        diver_item.classList.add("diver_item");
        let hidden = document.createElement("H4");
        hidden.style.display = "flex";
        hidden.className = diver.Mail;
        hidden.innerText = diver.Mail;
        hidden.id = "diver_mail";
        diver_item.innerHTML = "<input type='checkbox' class='checkbox_item'>";
        let name_contain = document.createElement("DIV");
        name_contain.classList.add("name_contain");
        name_contain.innerHTML = diver.Firstname + " " + diver.Lastname;
        info_contain.appendChild(name_contain);
        info_contain.appendChild(hidden);
        diver_item.appendChild(info_contain);
        diver_DD.appendChild(diver_item);
    });
}

let dp_mail;


let validate_event = document.querySelector("#createEventModal .create_event_button");
validate_event.addEventListener("click", function (e) {
    e.stopPropagation();
    // Prevent default action
    e.preventDefault();
    let beginDate = document.querySelector("#eventDateInput").value;
    let beginTime = document.querySelector("#eventStartInput").value;
    let endTime = document.querySelector("#eventEndInput").value;
    let begin = new Date(beginDate + " " + beginTime);
    let end = new Date(beginDate + " " + endTime);
    //find in Llocations the location with the same name as the one in the input
    let location = locations.find(location => location.name == document.querySelector(".location_select").querySelector(".select-input").innerText);
    location = location.name;
    let divePrice = document.querySelector("#eventPriceInputDiver").value;
    let instructorPrice = document.querySelector("#eventPriceInputInstructor").value;
    let comment = document.querySelector("#eventComment").value;
    let needs = document.querySelector("#eventNeedInput").value;
    let max = document.querySelector("#eventDiverNumberInput").value;
    let type = document.querySelector("#eventTypeInput").value;
    let dp_ = document.querySelector("#createEventModal .DP_list_dropdown .select-input").innerText;
    let dp = allDivers.find(diver => diver.Firstname + " " + diver.Lastname == dp_);

    let private_ = document.querySelector("#eventPrivateInput").checked;
    if (dp != undefined) {
        dp_mail = dp.Mail;
    } else {
        dp_mail = "";
    }
    let diverListMail = [];
    document.querySelectorAll("#createEventModal .diver_list_dropdown .short-tag").forEach(function (diver) {
        let diver_name = diver.innerText.replace("\n×", "");
        allDivers.forEach(function (diver_) {
            if (diver_.Firstname + " " + diver_.Lastname == diver_name) {
                diverListMail.push(diver_.Mail);
            }
        });
    })


    let data = {
        Start_Date: begin,
        End_Date: end,
        Diver_Price: divePrice,
        Instructor_Price: instructorPrice,
        Special_Needs: needs,
        Status: private_,
        Max_Divers: max,
        Dive_Type: type,
        Comments: comment,
        Site_Name: location,
        dp: dp_mail, // MAIL
    }
    let validate_autho = true
    for (const [key, value] of Object.entries(data)) {
        if (value == "" && key != "Comments" && key != "Special_Needs" && key != "users" && key != "Status") {
            validate_autho = false;
        }
    }

    if (data.Start_Date > data.End_Date) validate_autho = false;

    if (validate_autho) {
        let event_to_create = new Event(begin, end, divePrice, instructorPrice, location, comment, needs, private_, max, 0, type);
        event_to_create.addUser(diverListMail);
        let usersToRegister = event_to_create.users;
        addEvent(data, usersToRegister);
        validate_event.disabled = true;
        validate_event.innerHTML = "<img src='../img/loading_animation.svg' alt='loading' class='loading'>";
        validate_event.style.height = "40px";
    } else {
        validate_event.innerHTML = "Les champs ne sont pas correctement remplis";
        document.querySelector("#createEventModal .container_create_event").querySelectorAll('input').forEach(function (input) {
            if (input.getAttribute("required")) {
                input.style.border = "1px solid #120B8F";
            }
        });
        document.querySelector("#createEventModal .container_create_event").querySelectorAll('input').forEach(function (input) {
            if (input.value == "" && input.getAttribute("required")) {
                input.style.border = "1px solid #f2574a";
            }
        });
        if (document.querySelector(".location_select").querySelector(".select-input").innerText == "") {
            document.querySelector(".location_select").style.border = "1px solid #f2574a";
        }
        setTimeout(function () {
            validate_event.innerHTML = "Valider";

        }, 2000);
    }

});

function setUserInfos() {
    if (me.firstname) {
        document.querySelector(".prenom").innerText = me.firstname;
    } else {
        document.querySelector(".prenom").innerText = me;
    }
}

//! EVENT EDITION

let search_diver_edit = document.querySelector("#eventDiverInput_modify");






function edit_event(info) {
    // Open modale
    modals.show("modifyEventModal", function () {
        menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    let oldEvent = {
        Start_Date: info.event.start,
        End_Date: info.event.end,
        Diver_Price: info.event._def.extendedProps.divePrice,
        Instructor_Price: info.event._def.extendedProps.InstructorPrice,
        Special_Needs: info.event._def.extendedProps.needs,
        Status: info.event._def.extendedProps.open,
        Max_Divers: info.event._def.extendedProps.max,
        Dive_Type: info.event._def.extendedProps.diveType,
        Comments: info.event._def.extendedProps.comment,
        Site_Name: info.event._def.extendedProps.location.Site_Name,
    }

    let location_dropdown_edit = document.querySelector("#modifyEventModal .location_list_dropdown");
    location_dropdown_edit.querySelector(".option-list").innerHTML = "";
    let _location = info.event.extendedProps.location.Site_Name;
    locations.forEach(function (location) {
        let option;
        location_dropdown_edit.querySelector(".select-input").innerHTML = "<i class='fas fa-map-marker-alt'></i>" + _location;
        if (location.name == _location) {
            option = "<li class=active data-text='" + location.name + "' data-value='" + location.name + "'><a><i class='fas fa-map-marker-alt'></i>" + location.name + "</a></li>";
        } else {
            option = "<li data-text='" + location.name + "' data-value='" + location.name + "'><a><i class='fas fa-map-marker-alt'></i>" + location.name + "</a></li>";
        }
        location_dropdown_edit.querySelector(".option-list").innerHTML += option;
    });
    let select_dp = document.querySelector("#modifyEventModal .DP_list_dropdown")
    select_dp.querySelector(".option-list").innerHTML = "";
    let dp = info.event.extendedProps.users.find(user => user.Diver_Role == "DP");
    select_dp.querySelector(".select-input").innerHTML = "<i class='fa-solid fa-user'></i>" + dp.Firstname + " " + dp.Lastname;
    let select_diver = document.querySelector("#modifyEventModal .diver_list_dropdown");
    select_diver.querySelector(".option-list").innerHTML = "";
    allDivers.forEach(function (diver) {
        let option;
        if (diver.Diver_Qualification == "P5") {
            if (diver.Mail == dp.Mail) {
                option = "<li data-value='" + diver.Mail + "'><a><i class='fa-solid fa-user'></i><div class=user-info-list><span class=name>" + diver.Firstname + " " + diver.Lastname + "</span><span class=mail>" + diver.Mail + "</span></div></a></li>";
            } else {
                option = "<li data-value='" + diver.Mail + "'><a><i class='fa-solid fa-user'></i><div class=user-info-list><span class=name>" + diver.Firstname + " " + diver.Lastname + "</span><span class=mail>" + diver.Mail + "</span></div></a></li>";
            }
            select_dp.querySelector(".option-list").innerHTML += option;
        }
        option = "<li data-value='" + diver.Mail + "'><a><i class='fa-solid fa-user'></i><div class=user-info-list><span class=name>" + diver.Firstname + " " + diver.Lastname + "</span><span class=mail>" + diver.Mail + "</span></div></a></li>";
        select_diver.querySelector(".option-list").innerHTML += option;
    });
    // set divers already selected
    let diver_list = info.event.extendedProps.users;
    document.querySelector("#modifyEventModal .diver_list_dropdown .select-input").innerHTML = "";
    diver_list.forEach(function (diver) {
        if (diver.Diver_Role != "DP") {
            select_diver.querySelector(".option-list").querySelectorAll("li").forEach(function (li) {
                if (li.innerText.includes(diver.Firstname + " " + diver.Lastname)) {
                    li.click();
                }
            })
        }
    });




    // Remplir les champs avec les valeurs de info
    document.querySelector("#eventDateInput_modify").value = info.event.start.toISOString().slice(0, 10);
    document.querySelector("#eventStartInput_modify").value = info.event.start.toLocaleTimeString().slice(0, 5);
    document.querySelector("#eventEndInput_modify").value = info.event.end.toLocaleTimeString().slice(0, 5);
    // document.querySelector("#eventLocationInput_modify").value = info.event.extendedProps.location.Site_Name;
    document.querySelector("#eventPriceInputDiver_modify").value = info.event.extendedProps.divePrice;
    document.querySelector("#eventPriceInputInstructor_modify").value = info.event.extendedProps.InstructorPrice;
    document.querySelector("#eventComment_modify").value = info.event.extendedProps.comment;
    document.querySelector("#eventNeedInput_modify").value = info.event.extendedProps.needs;
    document.querySelector("#eventDiverNumberInput_modify").value = info.event.extendedProps.max;
    document.querySelector("#eventTypeInput_modify").value = info.event.extendedProps.diveType;
    document.querySelector("#eventPrivateInput_modify").checked = info.event.extendedProps.open === "true" ? true : false;




    //! SUPPRESSION EVENT
    document.querySelector(".delete_event_button").addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        let data = {
            Start_Date: info.event.start,
            End_Date: info.event.end,
            Diver_Price: info.event._def.extendedProps.divePrice,
            Instructor_Price: info.event._def.extendedProps.InstructorPrice,
            Special_Needs: info.event._def.extendedProps.needs,
            Status: info.event._def.extendedProps.open,
            Max_Divers: info.event._def.extendedProps.max,
            Dive_Type: info.event._def.extendedProps.diveType,
            Comments: info.event._def.extendedProps.comment,
            users: info.event._def.extendedProps.users,
            Dive_Site_Id_Dive_Site: info.event._def.extendedProps.location.Dive_Site_Id_Dive_Site,
        }
        deleteEvent(data);
    });

    // Create new event with new values
    let validate_event = document.querySelector("#modifyEventModal .create_event_button");
    validate_event.addEventListener("click", function (e) {
        // Prevent default action
        e.stopPropagation();
        e.preventDefault();
        let beginDate = document.querySelector("#eventDateInput_modify").value;
        let beginTime = document.querySelector("#eventStartInput_modify").value;
        let endTime = document.querySelector("#eventEndInput_modify").value;
        let begin = new Date(beginDate + " " + beginTime);
        let end = new Date(beginDate + " " + endTime);
        //find in Llocations the location with the same name as the one in the input
        let location = locations.find(location => location.name == document.querySelector(".location_list_dropdown").querySelector(".select-input").innerText);
        location = location.name;
        let divePrice = document.querySelector("#eventPriceInputDiver_modify").value;
        let instructorPrice = document.querySelector("#eventPriceInputInstructor_modify").value;
        let comment = document.querySelector("#eventComment_modify").value;
        let needs = document.querySelector("#eventNeedInput_modify").value;
        let max = document.querySelector("#eventDiverNumberInput_modify").value;
        let type = document.querySelector("#eventTypeInput_modify").value;
        let private_ = document.querySelector("#eventPrivateInput_modify").checked;
        let dp_ = document.querySelector("#modifyEventModal .DP_list_dropdown .select-input").innerText;

        let dp = allDivers.find(diver => diver.Firstname + " " + diver.Lastname == dp_);
        if (dp != undefined) {
            dp_mail = dp.Mail;
        } else {
            dp_mail = "";
        }




        let diverListMail = [];
        document.querySelectorAll("#modifyEventModal .diver_list_dropdown .short-tag").forEach(function (diver) {
            let diver_name = diver.innerText.replace("\n×", "");
            allDivers.forEach(function (diver_) {
                if (diver_.Firstname + " " + diver_.Lastname == diver_name) {
                    diverListMail.push(diver_.Mail);
                }
            });
        })

        let data = {
            Start_Date: begin,
            End_Date: end,
            Diver_Price: divePrice,
            Instructor_Price: instructorPrice,
            Special_Needs: needs,
            Status: private_,
            Max_Divers: max,
            Dive_Type: type,
            Comments: comment,
            Site_Name: location,
            dp: dp_mail, // MAIL
        }
        let validate_autho = true
        for (const [key, value] of Object.entries(data)) {
            if (value == "" && key != "Comments" && key != "Special_Needs" && key != "users" && key != "Status") {
                validate_autho = false;
            }
        }

        if (data.Start_Date > data.End_Date) validate_autho = false;
        if (validate_autho) {
            let event_to_create = new Event(begin, end, divePrice, instructorPrice, location, comment, needs, private_, max, 0, type);
            event_to_create.addUser(diverListMail);
            let usersToRegister = event_to_create.users;
            validate_event.disabled = true;
            validate_event.innerHTML = "<img src='../img/loading_animation.svg' alt='loading' class='loading'>";
            validate_event.style.height = "40px";
            updateEvent(oldEvent, data, event_to_create.users);


        } else {
            validate_event.innerHTML = "Les champs ne sont pas correctement remplis";
            document.querySelector("#modifyEventModal .container_create_event").querySelectorAll('input').forEach(function (input) {
                if (input.getAttribute("required")) {
                    input.style.border = "1px solid #120B8F";
                }
            });
            document.querySelector("#modifyEventModal .container_create_event").querySelectorAll('input').forEach(function (input) {
                if (input.value == "" && input.getAttribute("required")) {
                    input.style.border = "1px solid #f2574a";
                }
            });
            if (document.querySelector(".location_list_dropdown").querySelector(".select-input").innerText == "") {
                document.querySelector(".location_list_dropdown").style.border = "1px solid #f2574a";
            }
            setTimeout(function () {
                validate_event.innerHTML = "Valider";
            }, 2000);
        }

    });
}


//! AVIS
let general_r = 0;
let location_r = 0;
let orga_r = 0;
let conditions_r = 0;
let G_stars = [];
let L_stars = [];
let O_stars = [];
let C_stars = [];
let avis = document.querySelector(".rating")
avis.addEventListener("click", function () {
    modals.closeCurrent();
    setTimeout(function () {
        modals.show("rating", function () {
            menutoggle.classList.remove('active');
            displayRatings(eventClicked);
        });
        menutoggle.classList.toggle('active');
        menutoggle.classList.toggle('close-modal');
        G_stars = [...document.querySelector(".general").getElementsByClassName("rating__star")];
        L_stars = [...document.querySelector(".location_rating").getElementsByClassName("rating__star")];
        O_stars = [...document.querySelector(".orga_rating").getElementsByClassName("rating__star")];
        C_stars = [...document.querySelector(".conditions_rating").getElementsByClassName("rating__star")];
        general_r = getNote(G_stars);
        location_r = getNote(L_stars);
        orga_r = getNote(O_stars);
        conditions_r = getNote(C_stars);
        if (document.querySelector(".validate_rating").getAttribute('listener') !== 'true') {
            document.querySelector(".validate_rating").setAttribute('listener', 'true');
            document.querySelector(".validate_rating").addEventListener("click", function () {
                modals.closeCurrent();
                let final = finalRate();
                // Get location of event clicked
                let location = eventClicked.extendedProps.location;
                // in location array, find the event clicked location and add the rate
                let data;
                let event = {
                    Start_Date: eventClicked.start,
                    End_Date: eventClicked.end,
                    Diver_Price: eventClicked.extendedProps.divePrice,
                    Instructor_Price: eventClicked.extendedProps.InstructorPrice,
                    Special_Needs: eventClicked.extendedProps.needs,
                    Status: eventClicked.extendedProps.open,
                    Max_Divers: eventClicked.extendedProps.max,
                    Dive_Type: eventClicked.extendedProps.diveType,
                    Comments: eventClicked.extendedProps.comment,
                }
                locations.forEach(function (location_) {
                    if (location_.name == location.Site_Name) {
                        data = {
                            "General_Rate": (location_.rate[0] * location_.rate[4] + final.generalRate) / (location_.rate[4] + 1),
                            "Location_Rate": (location_.rate[1] * location_.rate[4] + final.locationRate) / (location_.rate[4] + 1),
                            "Organisation_Rate": (location_.rate[2] * location_.rate[4] + final.organisationRate) / (location_.rate[4] + 1),
                            "Conditions_Rate": (location_.rate[3] * location_.rate[4] + final.conditionsRate) / (location_.rate[4] + 1),
                            "Site_Name": location_.name,
                            "Event": event
                        }
                        rateLocation(data);
                    }
                });
                // reset stars
                document.querySelectorAll(".rating__star").forEach(function (star) {
                    star.className = starClassInactive;
                });
                modals.closeCurrent();
            });
        }
    }, 500);
});


const starClassActive = "rating__star fas fa-star";
const starClassInactive = "rating__star far fa-star";
let ret_ = 0;

function getNote(stars) {
    let i = 0;
    let starsLength = stars.length;
    stars.map((star) => {
        if (star.getAttribute('listener') !== 'true') {
            star.setAttribute('listener', 'true');
            star.addEventListener("click", () => {
                i = stars.indexOf(star);
                ret_ = i + 1;
                if (star.className === starClassInactive) {
                    for (i; i >= 0; --i) stars[i].className = starClassActive;
                } else {
                    for (i; i < starsLength; ++i) stars[i].className = starClassInactive;
                }
                return ret_;
            });
        }
    });
}

function finalRate() {
    // For general, count stars with class starClassActive
    let general = 0;
    G_stars.forEach(function (star) {
        if (star.className == starClassActive) {
            general++;
        }
    });
    // For location, count stars with class starClassActive
    let location = 0;
    L_stars.forEach(function (star) {
        if (star.className == starClassActive) {
            location++;
        }
    });
    // For orga, count stars with class starClassActive
    let orga = 0;
    O_stars.forEach(function (star) {

        if (star.className == starClassActive) {
            orga++;
        }
    });
    // For conditions, count stars with class starClassActive
    let conditions = 0;
    C_stars.forEach(function (star) {
        if (star.className == starClassActive) {
            conditions++;
        }
    });
    let finaleRateObject = {
        "generalRate": general,
        "locationRate": location,
        "organisationRate": orga,
        "conditionsRate": conditions
    }
    return finaleRateObject;
}


function displayRatings(event) {
    // Get location of event clicked
    let location = event.extendedProps.location;
    // in location array, find the event clicked location and check if one note is at 0
    locations.forEach(function (location_) {
        if (location_.name == location.Site_Name) {
            if (location_.rate[4] == 0) {
                document.querySelector(".displayRating_container").style.display = "none";
                document.querySelector(".numberOfRatings").style.display = "none";

                return;
            } else {
                document.querySelector(".displayRating_container").style.display = "flex";
                document.querySelector(".numberOfRatings").style.display = "flex";
                document.querySelector(".general_display").innerHTML = Math.round(location_.rate[0] * 10) / 10 + "/5";
                document.querySelector(".location_display").innerHTML = Math.round(location_.rate[1] * 10) / 10 + "/5";
                document.querySelector(".orga_display").innerHTML = Math.round(location_.rate[2] * 10) / 10 + "/5";
                document.querySelector(".conditions_display").innerHTML = Math.round(location_.rate[3] * 10) / 10 + "/5";
                document.querySelector(".numberOfRatings_display").innerHTML = location_.rate[4] + " avis";
            }
        }
    });

}