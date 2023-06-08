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
// import { dp } from './@fullcalendar/core/internal-common.js';

let my_role;
fetch('/auth/planning')
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
fetch('/auth/user/account/get_info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  .then(res => {
    console.log(res)
    let userInfo = res
    if (res) {
      me = new User(userInfo.Lastname, userInfo.Firstname, userInfo.Mail, userInfo.Phone, userInfo.Diver_Qualification, userInfo.Instructor_Qualification, userInfo.Nox_Level, userInfo.Additional_Qualifications, userInfo.License_Number, userInfo.License_Expiration_Date, userInfo.Medical_Certificate_Expiration_Date, userInfo.Birthdate);
      console.log(me)
      setUserInfos();
    }

  })

/* ------------------------------ GET PLANNING ------------------------------ */

let events = [];
let locations = [];
let allDivers = [];
fetch('/auth/planning/get_planning', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  .then(res => {
    console.log(res)
    res.allLocations.forEach(function (location) {
      locations.push(new Location(location.Site_Name, location.Latitude, location.Longitude, location.Track_Type, location.Track_Number, location.Track_Name, location.Zip_Code, location.City_Name, location.Country_Name, location.Additional_Address, location.Tel_Number, location.Information_URL, [], location.SOS_Tel_Number, location.Emergency_Plan, location.Post_Accident_Procedure));
    });
    if (res.allUsers && my_role == "club") {
      allDivers = res.allUsers;
      setDiversListsHTML();
    }
    res.allEvents.forEach(function (event) {
      let e = new Event(new Date(event.Start_Date), new Date(event.End_Date), event.Diver_Price, event.Instructor_Price, event.Location, event.Comments, event.Special_Needs, event.Status, event.Max_Divers, event.Dive_Type);
      e.addUser(event.Users);
      events.push(e);

    });

    setEvents(events);
  })


/* ------------------------------ CREATE EVENT ------------------------------ */
function addEvent(event, usersToRegister) {
  console.log(event);
  // event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
  // delete event.users;
  // delete event.title;
  // delete event.Location;
  fetch('/auth/planning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).then(res => res.json())
    .then(res => {
      console.log(res)
      if (!res.created) {
        // Tom fait quelque chose, l'event n'a pas été créé
      } else {
        console.log(event.dp, usersToRegister);
        let registrationInfo = {
          Personnal_Comment: "Registered by club",
          Car_Pooling_Seat_Offered: 0,
          Car_Pooling_Seat_Request: "n",
          Diver_Role: "DP"
        }
        register(event, registrationInfo, event.dp) // dp = mail
        if (usersToRegister.length > 0) {
          registrationInfo.Diver_Role = "Diver";
          usersToRegister.forEach(function (user) {
            register(event, registrationInfo, user); // user = mail
          });
        }
      }
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
  // event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
  // delete event.users;
  // delete event.title;
  // delete event.Location;
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
function register(event, registrationInfo, userInfo = "") {
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
    })
}

function unregister(event, registrationInfo) {
  event.Dive_Site_Id_Dive_Site = event.Location.Id_Dive_Site;
  delete event.users;
  delete event.title;
  delete event.Location;
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
    })
}


let calendar;
let eventClicked;
let html_memory;

function setEvents(ev_) {
  console.log("Mes events")
  console.log(ev_)
  let slider2 = document.getElementById("priceSlider");
  var slider = document.getElementById("timeSlider");

  eventsFilteredPrice = events;
  eventsFilteredTime = events;

  var calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    // Options du calendrier

    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    height: 'auto',
    initialView: 'timeGridWeek',
    slotMinTime: '01:00:00', // Heure de début (10h)
    slotMaxTime: '19:00:00',
    views: {
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
    ],
    events: [],
    eventMouseEnter: function (info) {
      // Element HTML -> info.el
      // Evénement -> info.event

      // If role is club, on hover place a little pencil on the event
      if (my_role == "club") {
        let pencil = document.createElement("I");
        pencil.classList.add("fas");
        pencil.classList.add("fa-pencil-alt");
        pencil.style.opacity = "0";
        html_memory = info.el.innerHTML;
        info.el.innerHTML = "";
        info.el.appendChild(pencil);
        setTimeout(function () {
          pencil.style.opacity = "1";
        }, 0);
      }
    },
    eventMouseLeave: function (info) {
      // Element HTML -> info.el
      // Evénement -> info.event
      if (my_role == "club") {
        document.querySelector(".fa-pencil-alt").style.opacity = "0";
        setTimeout(function () {
          info.el.innerHTML = html_memory;
        }, 200);
      }
    },
    eventClick: function (info) {
      // Element HTML -> info.el
      // Evénement -> info.event
      if (my_role == "club") {
        edit_event(info);
        return;
      }
      eventClicked = info.event;

      // Open Modale
      modals.show("eventModal", function () {
        menutoggle.classList.remove('active');
      });
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
      console.log(info.event.end);
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
        document.querySelector("#timeline_view").style.height = "calc(" + $("#global-view").height() + "px - 40px)";
      }, 0);
      let adress = eventClicked.extendedProps.location.Site_Name;
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
      console.log(eventClicked.extendedProps);
      eventClicked.extendedProps.users.forEach(function (user) {
        let li_ = document.createElement("li");
        if (user.Diver_Role === "DP") {
          console.log(user);
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






      if (new Date(eventClicked.end) < new Date()) {
        button.style.display = "none";
        if (my_role == "user") {
          document.querySelector(".rating").style.display = "flex";
        }
      } else {
        button.style.display = "flex";
        document.querySelector(".rating").style.display = "none";
      }
      if (new Date(eventClicked.start) <= new Date() && my_role == "dp") {
        document.querySelector(".edit_rapport").style.display = "flex";
      } else {
        document.querySelector(".edit_rapport").style.display = "none";
      }
    },

  });
  events.forEach(function (event) {
    if (event.start > new Date()) {
      event.backgroundColor = "#4CAF50";
    } else {
      event.backgroundColor = "grey";
    }
    calendar.addEvent(event);
  });

  calendar.render();


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
};


var eventsFilteredTime = [];
var eventsFilteredPrice = [];



//! RESERVATION 
let button = document.querySelector("#reserveButton");
button.addEventListener("click", function () {
  if (button.classList.contains("reserveButton")) {
    button.innerHTML = "Se désinscrire";
    button.classList.add("unreserveButton");
    button.classList.remove("reserveButton");
    eventClicked.setProp("backgroundColor", "#f2574a");
    console.log("Evenement reservé :")
    console.log(eventClicked);
  } else {
    button.innerHTML = "Réserver";
    button.classList.add("reserveButton");
    button.classList.remove("unreserveButton");
    eventClicked.setProp("backgroundColor", "#4CAF50");
    console.log("Evenement annulé :")
    console.log(eventClicked);
  }

});




let list_checkbox = document.querySelector("#checkbox_list");
list_checkbox.addEventListener("click", function () {
  if (list_checkbox.checked) {
    calendar.initialView = 'listWeek';
    calendar.changeView('listWeek');
  } else {
    calendar.initialView = 'timeGridWeek';
    calendar.changeView('timeGridWeek');
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

emergencyButton.addEventListener("click", function () {
  modals.show("emergencyModal", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
});





let rapport_button = document.querySelector(".edit_rapport");
rapport_button.addEventListener("click", function () {
  modals.closeCurrent();
  // console.log(eventClicked);
  setTimeout(function () {
    modals.show("dive_rapport", function () {
      menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
  }, 500);
  document.querySelector(".title_rapport_plannif").innerHTML = "Plannification " + eventClicked.title;
});

//! EVENT CREATION

let create_event_button = document.querySelector("#createEventButton");

create_event_button.addEventListener("click", function () {
  modals.show("createEventModal", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
  let location_dropdown = document.querySelector("#location_list_dropdown_create");
  location_dropdown.innerHTML = "";
  console.log("les lieux de max")
  console.log(locations);
  locations.forEach(function (location) {
    let location_item = document.createElement("H4");
    location_item.classList.add("location_item");
    location_item.innerText = location.name;
    location_dropdown.appendChild(location_item);
  });
})

// Search of location 
let search_location = document.querySelector("#eventLocationInput");

search_location.addEventListener("input", function () {
  let search = search_location.value;
  let location_ = document.querySelectorAll(".location_item");
  location_.forEach(function (location) {
    if (location.innerText.toLowerCase().includes(search.toLowerCase())) {
      document.querySelector("#createEventModal .location_list_dropdown").style.display = "flex";
      location.style.display = "flex";
      location.addEventListener("click", function () {
        search_location.value = location.innerText;
        document.querySelector("#createEventModal .location_list_dropdown").style.display = "none";
      });
    } else {
      location.style.display = "none";
    }

  });
  let display = false;
  location_.forEach(function (location) {
    if (location.style.display == "flex") {
      display = true;
    }
  });
  if (search_location.value == "") {
    display = false;
  }
  if (display) {
    document.querySelector("#createEventModal  .location_list_dropdown").style.display = "flex";
  } else {
    document.querySelector("#createEventModal  .location_list_dropdown").style.display = "none";
  }
});

function setDiversListsHTML() {
  // Set DP list in HTML
  let DP_list = document.querySelector("#createEventModal .DP_list_dropdown");
  DP_list.innerHTML = "";
  let diver_DD = document.querySelector("#createEventModal .diver_list_dropdown");
  diver_DD.innerHTML = "";
  console.log(allDivers);
  allDivers.forEach(function (diver) {
    if (diver.Diver_Qualification == "P5") {
      let DP_item = document.createElement("H4");
      let hidden = document.createElement("H4");
      hidden.style.display = "none";
      hidden.id = "DP_mail";
      hidden.className = diver.Mail;
      DP_item.classList.add("DP_item");
      DP_item.innerText = diver.Firstname + " " + diver.Lastname;
      DP_item.appendChild(hidden);
      DP_list.appendChild(DP_item);
    }
    let diver_item = document.createElement("H4");
    diver_item.classList.add("diver_item");
    let hidden = document.createElement("H4");
    hidden.style.display = "none";
    hidden.className = diver.Mail;
    hidden.id = "diver_mail";
    diver_item.innerHTML = "<input type='checkbox' class='checkbox_item'>" + diver.Firstname + " " + diver.Lastname;
    diver_item.appendChild(hidden);
    diver_DD.appendChild(diver_item);
  });
}

let dp_mail;
let search_dp = document.querySelector("#eventDPInput");
search_dp.addEventListener("input", function () {
  let search = search_dp.value;
  let dps = document.querySelectorAll("#createEventModal .DP_item");
  dps.forEach(function (dp) {
    if (dp.innerText.toLowerCase().includes(search.toLowerCase())) {
      dp.style.display = "flex";
      document.querySelector("#createEventModal .DP_list_dropdown").style.display = "flex";
      dp.addEventListener("click", function () {
        search_dp.value = dp.innerText;
        dp_mail = dp.querySelector("#DP_mail").className;
        document.querySelector("#createEventModal .DP_list_dropdown").style.display = "none";
      });
    } else {
      dp.style.display = "none";
    }

  });
  let display = false;
  dps.forEach(function (dp) {
    if (dp.style.display == "flex") {
      display = true;
    }
  });
  if (search_dp.value == "") {
    display = false;
  }
  if (display) {
    document.querySelector("#createEventModal .DP_list_dropdown").style.display = "flex";
  } else {
    document.querySelector("#createEventModal .DP_list_dropdown").style.display = "none";
  }
});

let search_diver = document.querySelector("#eventDiverInput");

search_diver.addEventListener("click", function () {
  detectDivers();
  let dps = document.querySelectorAll(".diver_item");
  document.querySelector("#createEventModal .diver_list_dropdown").style.display = "none";

  dps.forEach(function (dp) {
    if (dp.querySelector("input").checked) {
      dp.style.display = "flex";
      document.querySelector("#createEventModal .diver_list_dropdown").style.display = "flex";
    } else {
      dp.style.display = "none";
    }
  });
});

search_diver.addEventListener("input", function checkInputDiver() {
  detectDivers();
  let search = search_diver.value;
  let divers = document.querySelectorAll("#createEventModal .diver_item");
  divers.forEach(function (diver) {

    diver.querySelector("input").addEventListener("click", function () {
      document.querySelector("#createEventModal .diver_list_dropdown").style.display = "none";
      search_diver.value = "";

      checkInputDiver();
    });
    if (diver.innerText.toLowerCase().includes(search.toLowerCase())) {
      diver.style.display = "flex";
      document.querySelector("#createEventModal .diver_list_dropdown").style.display = "flex";
    } else {
      if (diver.querySelector("input").checked) {
        diver.style.display = "flex";
      } else {
        diver.style.display = "none";
      }
    }

  });

  let display = false;
  divers.forEach(function (diver) {
    if (diver.style.display == "flex") {
      display = true;
    }
  });
  if (search_diver.value == "") {
    display = false;
  }
  if (display) {
    document.querySelector("#createEventModal .diver_list_dropdown").style.display = "flex";
  } else {
    document.querySelector("#createEventModal .diver_list_dropdown").style.display = "none";
  }
});

function detectDivers() {
  let divers = document.querySelectorAll("#createEventModal .diver_item");
  let number_of_diver = 0;
  divers.forEach(function (diver) {
    if (diver.querySelector("input").checked) {
      number_of_diver++;
    }
  });
  search_diver.placeholder = "Rechercher" + " (" + number_of_diver + " inscrits)";
}


let validate_event = document.querySelector("#createEventModal .create_event_button");
validate_event.addEventListener("click", function (e) {
  // Prevent default action
  e.preventDefault();
  let beginDate = document.querySelector("#eventDateInput").value;
  let beginTime = document.querySelector("#eventStartInput").value;
  let endTime = document.querySelector("#eventEndInput").value;
  let begin = new Date(beginDate + " " + beginTime);
  let end = new Date(beginDate + " " + endTime);
  let location = document.querySelector("#eventLocationInput").value;
  let divePrice = document.querySelector("#eventPriceInputDiver").value;
  let instructorPrice = document.querySelector("#eventPriceInputInstructor").value;
  let comment = document.querySelector("#eventComment").value;
  let needs = document.querySelector("#eventNeedInput").value;
  let max = document.querySelector("#eventDiverNumberInput").value;
  let type = document.querySelector("#eventTypeInput").value;
  let dp_ = document.querySelector("#eventDPInput").value;
  let private_ = document.querySelector("#eventPrivateInput").checked;
  let diverList = [];
  let event_to_create = new Event(begin, end, divePrice, instructorPrice, location, comment, needs, private_, max, 0, type);
  // find diver corresponding to dp_ name

  document.querySelectorAll("#createEventModal .diver_item").forEach(function (diver) {
    allDivers.forEach(function (diver_) {
      if (diver_.Mail == diver.querySelector("#diver_mail").className && diver_.Mail != dp_mail) {
        if (diver.querySelector("input").checked) {
          event_to_create.addUser(diver_.Mail);
        }
      }
    });
    // event_to_create.addUser(dp_mail);
  });
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
    //users : event_to_create.users // MAIL
  }
  let usersToRegister = event_to_create.users;
  console.log("Evenement à créer :");
  console.log(data);
  addEvent(data, usersToRegister);
  document.location.reload();


});

function setUserInfos() {
  document.querySelector(".prenom").innerText = me.firstname;
}

//! EVENT EDITION

function edit_event(info) {
  // Open modale
  modals.show("modifyEventModal", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');

  // Remplir les champs avec les valeurs de info
  document.querySelector("#eventDateInput_modify").value = info.event.start.toISOString().slice(0, 10);
  document.querySelector("#eventStartInput_modify").value = info.event.start.toLocaleTimeString().slice(0, 5);
  document.querySelector("#eventEndInput_modify").value = info.event.end.toLocaleTimeString().slice(0, 5);
  document.querySelector("#eventLocationInput_modify").value = info.event.extendedProps.location.Site_Name;
  document.querySelector("#eventPriceInputDiver_modify").value = info.event.extendedProps.divePrice;
  document.querySelector("#eventPriceInputInstructor_modify").value = info.event.extendedProps.InstructorPrice;
  document.querySelector("#eventComment_modify").value = info.event.extendedProps.comment;
  document.querySelector("#eventNeedInput_modify").value = info.event.extendedProps.needs;
  document.querySelector("#eventDiverNumberInput_modify").value = info.event.extendedProps.max;
  document.querySelector("#eventTypeInput_modify").value = info.event.extendedProps.diveType;
  info.event._def.extendedProps.users.forEach(function (user) {
    if (user.Diver_Role == "DP") {
      document.querySelector("#eventDPInput_modify").value = user.Firstname + " " + user.Lastname;
    } else {
      let diver_item = document.querySelectorAll("#modifyEventModal .diver_item");
      diver_item.forEach(function (diver) {
        if (diver.innerText == user.Firstname + " " + user.Lastname) {
          diver.querySelector("input").checked = true;
        }
      });
    }
  });
  document.querySelector("#eventDiverInput_modify").placeholder = "Rechercher" + " (" + info.event.extendedProps.users.length + " inscrits)";
  document.querySelector("#eventPrivateInput_modify").checked = new Boolean(info.event.extendedProps.open);

  let diverList = [];
  info.event.extendedProps.users.forEach(function (user) {
    diverList.push(user);
  });
  let diver_item = document.querySelectorAll("#modifyEventModal .diver_item");
  diver_item.forEach(function (diver) {
    if (diverList.includes(diver.innerText)) {
      diver.querySelector("input").checked = true;
    } else {
      diver.querySelector("input").checked = false;
    }
  });

  //! SUPPRESSION EVENT
  document.querySelector(".delete_event_button").addEventListener("click", function () {
    console.log("Suppression de l'événement :");
    console.log(info.event);
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
    console.log(data);
    deleteEvent(data);
    document.location.reload();
  });

  // Create new event with new values
  let validate_event = document.querySelector("#modifyEventModal .create_event_button");
  validate_event.addEventListener("click", function (e) {
    // Prevent default action
    e.preventDefault();
    let beginDate = document.querySelector("#eventDateInput_modify").value;
    let beginTime = document.querySelector("#eventStartInput_modify").value;
    let endTime = document.querySelector("#eventEndInput_modify").value;
    let begin = new Date(beginDate + " " + beginTime);
    let end = new Date(beginDate + " " + endTime);
    let location = document.querySelector("#eventLocationInput_modify").value;
    let divePrice = document.querySelector("#eventPriceInputDiver_modify").value;
    let instructorPrice = document.querySelector("#eventPriceInputInstructor_modify").value;
    let comment = document.querySelector("#eventComment_modify").value;
    let needs = document.querySelector("#eventNeedInput_modify").value;
    let max = document.querySelector("#eventDiverNumberInput_modify").value;
    let type = document.querySelector("#eventTypeInput_modify").value;
    let dp_ = document.querySelector("#eventDPInput_modify").value;
    let private_ = document.querySelector("#eventPrivateInput_modify").checked;
    let diverList = [];
    let event_to_create = new Event(begin, end, divePrice, instructorPrice, location, comment, needs, private_, max, 0, type);
    document.querySelectorAll("#modifyEventModal .diver_item").forEach(function (diver) {
      if (diver.querySelector("input").checked) {
        event_to_create.addUser(diver.innerText);
      }
    });
    console.log("Evenement à créer :");
    console.log(event_to_create);
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
        console.log("FINAL RATE:")
        console.log(finalRate())
        // Get location of event clicked
        let location = eventClicked.extendedProps.location;
        // in location array, find the event clicked location and add the rate
        locations.forEach(function (location_) {
          if (location_.name == location) {
            location_.rate.addRate(finalRate());
            console.log("Location rate updated :");
            console.log(location_.rate);
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
      if (location_.rate.generalRate == 0 || location_.rate.locationRate == 0 || location_.rate.organisationRate == 0 || location_.rate.conditionsRate == 0) {
        document.querySelector(".displayRating_container").style.display = "none";
        document.querySelector(".numberOfRatings").style.display = "none";

        return;
      } else {
        document.querySelector(".displayRating_container").style.display = "flex";
        document.querySelector(".numberOfRatings").style.display = "flex";
        document.querySelector(".general_display").innerHTML = location_.rate.getMeanRate()[0] + "/5";
        document.querySelector(".location_display").innerHTML = location_.rate.getMeanRate()[1] + "/5";
        document.querySelector(".orga_display").innerHTML = location_.rate.getMeanRate()[2] + "/5";
        document.querySelector(".conditions_display").innerHTML = location_.rate.getMeanRate()[3] + "/5";
        document.querySelector(".numberOfRatings_display").innerHTML = location_.rate.getNumberOfRate() + " avis";
      }
    }
  });

}