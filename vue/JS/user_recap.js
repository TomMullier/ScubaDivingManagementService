/* -------------------------------------------------------------------------- */
/*                                   IMPORT                                   */
/* -------------------------------------------------------------------------- */
import {
    frLocale
} from './@fullcalendar/core/locales/fr.js';

import {
    User
} from './class/User.js';

import {
    Event
} from './class/Event.js';


/* -------------------------------------------------------------------------- */
/*                              GLOBAL VARIABLES                              */
/* -------------------------------------------------------------------------- */
let my_role;
let me;
let events = [];

/* -------------------------------------------------------------------------- */
/*                                   REQUEST                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------- USERTYPE -------------------------------- */
function openErrorModal(e) {
    modals.closeCurrent();
    setTimeout(function () {
        modals.show("error_occured");
        document.querySelector("#error_occured p").innerText = e;
        setTimeout(function () {
            modals.closeCurrent();
        }, 3000);
    }, 500);
}
fetch('/auth/dashboard')
    .then(response => {
        const userType = response.headers.get('userType');
        console.log("User Role :" + userType);
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
        getInfo();
    });

/* ------------------------- GET USER INFO + EVENTS ------------------------- */
function getInfo() {
    fetch('/auth/dashboard/get_info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            if (Object.keys(res).length === 0) {
                openErrorModal("Une erreur est survenue lors de la récupération des informations");
            }
            let userInfo = res.userInfo
            if (res.userInfo && res.userInfo.length != 0 && my_role != "club") {
                me = new User(userInfo.Lastname, userInfo.Firstname, userInfo.Mail, userInfo.Phone, userInfo.Diver_Qualification, userInfo.Instructor_Qualification, userInfo.Nox_Level, userInfo.Additional_Qualifications, userInfo.License_Number, userInfo.License_Expiration_Date, userInfo.Medical_Certificate_Expiration_Date, userInfo.Birthdate);
            } else if (my_role == "club") {
                me = res.userInfo;
            }
            setUserInfos();
            if (res.registrationList && res.registrationList.length != 0) {
                let events_ = res.registrationList;
                events = [];
                events_.forEach(function (event) {
                    events.push(new Event(new Date(event.Start_Date), new Date(event.End_Date), event.Diver_Price, event.Instructor_Price, event.Location, event.Comment, event.Special_Needs, event.Status, event.Max_Divers, event.Dive_Type));
                });
            }
            startCalendar();
        })
}

function getUserPP(user) {
    fetch('/auth/user_pp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }).then((res) => res.blob())
        .then((imgBlob) => {
            let res = URL.createObjectURL(imgBlob);
            console.log(res);
            document.querySelector("#my_profile_picture").src = res;
        });
}

function addMessage(message) {
    console.log(message);
    const data = { "Message": message };
    fetch('/auth/dashboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((res) => {
            console.log(res);
            return res.json()
        })
        .then((res) => {
            console.log(res);
        });
}



/* -------------------------------------------------------------------------- */
/*                                    CODE                                    */
/* -------------------------------------------------------------------------- */

function startCalendar() {
    //!document.querySelector('#my_profile_picture').src = "../img/profile_pictures/" + me.firstname + me.lastname + me.licenceNumber + ".jpg";
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        // Options du calendrier
        locale: frLocale,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        height: 'auto',
        initialView: 'timeGridDay',
        slotMinTime: '09:00:00', // Heure de début (10h)
        slotMaxTime: '19:00:00',
        views: {
            timeGridDay: {
                nowIndicator: true,
                allDaySlot: false
            },
            timeGridWeek: {
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
        ]
    });

    let HTML = "";

    // Order events by date
    events.sort(function (a, b) {
        return new Date(a.start) - new Date(b.start);
    });

    events.forEach(function (event) {
        if (event.start > new Date()) {
            event.backgroundColor = "#4CAF50";
        } else {
            event.backgroundColor = "grey";
        }
        calendar.addEvent(event);
        let startHour = event.start.getHours();
        let endHour = event.end.getHours();
        let startMinutes = event.start.getMinutes();
        let endMinutes = event.end.getMinutes();
        let startDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate(), event.start.getHours(), event.start.getMinutes());
        let endDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate(), event.end.getHours(), event.end.getMinutes());
        let startTime = startHour + ':' + startMinutes;
        let endTime = endHour + ':' + endMinutes;
        let title = getTitle(event);

        let today = new Date();
        if (startDate > today) {
            startDate = startDate.toLocaleDateString();
            if (startMinutes < 10) {
                startMinutes = "0" + startMinutes;
            }
            if (endMinutes < 10) {
                endMinutes = "0" + endMinutes;
            }


            HTML += '<div class="event"><p class="date">' + startDate + '</p><p class="hour">De ' + startHour + 'h' + startMinutes + ' à ' + endHour + 'h' + endMinutes + '</p><p class="name">' + title + '</p></div>'
        }
    });
    document.querySelector('#event-container').innerHTML = HTML;
    calendar.render();
    document.getElementById("planning").style.height = $('#calendar').height() + "px";

    if (document.getElementById("important_text").innerText == "") {
        document.querySelector(".message").style.display = "none";
    }

    document.querySelector(".event_list").style.height = "calc(" + $("#calendar").height() + "px + 30px)";

    loadingClose();
};


function loadingClose() {
    document.querySelector(".loading_animation").style.opacity = "0";
    setTimeout(function () {
        document.querySelector(".loading_animation").style.display = "none";
    }, 500);
}

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

emergencyButton.addEventListener("click", function () {
    modals.show("emergencyModal", function () {
        menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    document.querySelector("#emergencyModal .download_button").addEventListener("click", function () {
        location.href = "/auth/incident_rapport"
        modals.closeCurrent();
    })
});

let addImportantMessageButton = document.querySelector(".message_add");
addImportantMessageButton.addEventListener("click", function () {
    modals.show("importantMessageModal", function () {
        menutoggle.classList.remove('active');
        document.querySelector("#textarea_important").value = "";
        // document.getElementById("important_text").innerText == "";
        // document.querySelector(".message").style.display = "none";
    });
    document.querySelector("#textarea_important").focus();
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    document.querySelector(".validate_message").addEventListener("click", function () {
        let message = document.querySelector("#textarea_important").value;
        document.querySelector("#textarea_important").value = "";
        if (message != "") {
            document.querySelector(".message").style.display = "flex";
            document.querySelector("#important_text").innerText = message;
        } else {
            document.querySelector(".message").style.display = "none";
            document.querySelector("#important_text").innerText = "";
        }
        addMessage(message);
        modals.closeCurrent();
    })
});



function getDate(time) {
    let date = time.split('T')[0];
    return date;
}

function getTitle(event) {
    let title = event.title;
    return title;
}

function setUserInfos() {
    let club
    if (my_role == "club") {
        document.querySelector(".right .name").innerText = me.split("@")[0];
        document.querySelector(".name").innerHTML = "<b>Nom du club : </b>" + me.split("@")[0];
        document.querySelector(".phone").style.display = "none";
        document.querySelector(".birth").style.display = "none";
        document.querySelector(".email").style.display = "none";
        document.querySelector(".level").style.display = "none";
        document.querySelector(".level_text").style.display = "none";

        // document.querySelector(".photo_container").style.display = "none";
        // document.querySelector("#my_profile_picture").style.display = "none";
        club = {
            mail: me
        }
        getUserPP(club);
        return;
    }
    getUserPP(me);
    document.querySelector(".name").innerHTML = "<b>Nom : </b>" + me.firstname + " " + me.lastname;
    document.querySelector(".phone").innerHTML = "<b>Téléphone : </b>" + me.phone;
    let birthdate = new Date(me.birthdate);
    document.querySelector(".birth").innerHTML = "<b>Date de naissance : </b>" + birthdate.toLocaleDateString();
    document.querySelector(".email").innerHTML = "<b>Mail : </b>" + me.mail;
    let level = me.diverQualification;
    let HTMLlevel = document.querySelectorAll(".level p");
    document.querySelector(".right .name").innerText = me.firstname;

    HTMLlevel.forEach(function (element) {
        if (parseInt(element.innerText.split("P")[1]) <= parseInt(level.split("P")[1])) {
            element.classList.add("active");
            element.classList.remove("not-active");
        } else {
            element.classList.remove("active");
            element.classList.add("not-active");
        }
    });
}