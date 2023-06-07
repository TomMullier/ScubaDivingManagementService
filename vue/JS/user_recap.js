import {
  frLocale
} from './@fullcalendar/core/locales/fr.js';

import {
  User
} from './class/User.js';

import {
  Event
} from './class/Event.js';

let my_role;
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
  });




let me;
let events = [];
fetch('/auth/dashboard/get_info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  .then(res => {
    console.log(res)
    let userInfo = res.userInfo
    if (res.userInfo && res.userInfo.length != 0) {
      me = new User(userInfo.Lastname, userInfo.Firstname, userInfo.Mail, userInfo.Phone, userInfo.Diver_Qualification, userInfo.Instructor_Qualification, userInfo.Nox_Level, userInfo.Additional_Qualifications, userInfo.License_Number, userInfo.License_Expiration_Date, userInfo.Medical_Certificate_Expiration_Date, userInfo.Birthdate);
      console.log(me)
      setUserInfos();
    }
    if (res.registrationList && res.registrationList.length != 0) {
      let events_ = res.registrationList;
      events = [];
      events_.forEach(function (event) {
        events.push(new Event(new Date(event.Start_Date), new Date(event.End_Date), event.Diver_Price, event.Instructor_Price, event.Location, event.Comment, event.Special_Needs, event.Status, event.Max_Divers, event.Dive_Type));
      });
      console.log(events)
    }
  })






document.addEventListener('DOMContentLoaded', function () {
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

emergencyButton.addEventListener("click", function () {
  modals.show("emergencyModal", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
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
    if (message !== "") {
      document.querySelector(".message").style.display = "flex";
      document.querySelector("#important_text").innerText = message;
    } else {
      document.querySelector(".message").style.display = "none";
      document.querySelector("#important_text").innerText = "";
    }
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
  document.querySelector(".name").innerHTML = "<b>Nom : </b>" + me.firstname + " " + me.lastname;
  document.querySelector(".phone").innerHTML = "<b>Téléphone : </b>" + me.phone;
  let birthdate = new Date(me.birthdate);
  document.querySelector(".birth").innerHTML = "<b>Date de naissance : </b>" + birthdate.toLocaleDateString();
  document.querySelector(".email").innerHTML = "<b>Mail : </b>" + me.mail;
  let level = me.diverQualification;
  let HTMLlevel = document.querySelectorAll(".level p");
  document.querySelector(".right .name").innerText = me.firstname;
  HTMLlevel.forEach(function (element) {
    if (parseInt(element.innerText.split("N")[1]) <= parseInt(level.split("N")[1])) {
      element.classList.add("active");
      element.classList.remove("not-active");
    } else {
      element.classList.remove("active");
      element.classList.add("not-active");
    }
  });
}