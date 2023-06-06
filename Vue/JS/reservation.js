import {
  frLocale
} from './@fullcalendar/core/locales/fr.js';

import {
  me,
  events,
  locations,
  my_role
} from "./class/global.js";

import {
  Event
} from "./class/Event.js";


let calendar;
let eventClicked;
document.addEventListener('DOMContentLoaded', function () {
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
    slotMinTime: '09:00:00', // Heure de début (10h)
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
      let adress = eventClicked.extendedProps.location;
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






      if (new Date(eventClicked.end) < new Date()) {
        button.style.display = "none";
        document.querySelector(".rating").style.display = "flex";
      } else {
        button.style.display = "flex";
        document.querySelector(".rating").style.display = "none";
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
});


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
  document.querySelectorAll("#createEventModal .diver_item").forEach(function (diver) {
    if (diver.querySelector("input").checked) {
      event_to_create.addUser(diver.innerText);
    }
  });
  console.log("Evenement à créer :");
  console.log(event_to_create);
});

document.querySelector(".prenom").innerText = me.firstname;

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
  document.querySelector("#eventLocationInput_modify").value = info.event.extendedProps.location;
  document.querySelector("#eventPriceInputDiver_modify").value = info.event.extendedProps.divePrice;
  document.querySelector("#eventPriceInputInstructor_modify").value = info.event.extendedProps.InstructorPrice;
  document.querySelector("#eventComment_modify").value = info.event.extendedProps.comment;
  document.querySelector("#eventNeedInput_modify").value = info.event.extendedProps.needs;
  document.querySelector("#eventDiverNumberInput_modify").value = info.event.extendedProps.max;
  document.querySelector("#eventTypeInput_modify").value = info.event.extendedProps.diveType;
  document.querySelector("#eventDPInput_modify").value = info.event.extendedProps.users[0];
  document.querySelector("#eventPrivateInput_modify").checked = info.event.extendedProps.private;
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
document.querySelectorAll(".rating").forEach(function (avis) {
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
      document.querySelector(".validate_rating").addEventListener("click", function () {
        console.log("FINAL RATE :")
        console.log(finalRate())
        modals.closeCurrent();
      });
    }, 500);
  });
});

const starClassActive = "rating__star fas fa-star";
const starClassInactive = "rating__star far fa-star";
let ret_ = 0;

function getNote(stars) {
  let i;
  let starsLength = stars.length;
  stars.map((star) => {
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
    "general": general,
    "location": location,
    "orga": orga,
    "conditions": conditions
  }
  return finaleRateObject;
}

document.querySelector(".validate_rating").addEventListener("click", function () {

  modals.closeCurrent();
});