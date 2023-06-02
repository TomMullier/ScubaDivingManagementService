import {
  frLocale
} from './@fullcalendar/core/locales/fr.js';

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
    events: function (fetchInfo, successCallback, failureCallback) {
      successCallback([])
    },
    eventClick: function (info) {
      // Element HTML -> info.el
      // Evénement -> info.event

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
      console.log(list);




      // Button click
      let button = document.querySelector("#reserveButton");
      button.addEventListener("click", function () {
        if (button.classList.contains("reserveButton")) {
          button.innerHTML = "Se désinscrire";
          button.classList.add("unreserveButton");
          button.classList.remove("reserveButton");
          eventClicked.setProp("backgroundColor", "#f2574a");
        } else {
          button.innerHTML = "Réserver";
          button.classList.add("reserveButton");
          button.classList.remove("unreserveButton");
          eventClicked.setProp("backgroundColor", "#4CAF50");
        }

      });

      if (new Date(eventClicked.end) < new Date()) {
        button.style.display = "none";
      } else {
        button.style.display = "flex";
      }
    },
  });


  events.forEach(function (event) {
    
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


var events = []
var eventsFilteredTime = [];
var eventsFilteredPrice = [];
events.push(new Event(new Date(2023, 5, 1, 10, 0), new Date(2023, 5, 1, 12, 0), 20, 10, "La Ciotat", " Commentaire Commentaire ", " Besoin Besoin Besoin", false, 5, 3, "Exploration"));
events.push(new Event(new Date(2023, 5, 2, 14, 0), new Date(2023, 5, 2, 16, 0), 60, 10, "JUNIA", "Enguerrand j'espère tu seras à l'heure", "VP03", false, 5, 3, "Technique"));
events.push(new Event(new Date(2023, 5, 2, 10, 0), new Date(2023, 5, 2, 10, 30), 30, 10, "JUNIA", "Enguerrand j'espère tu seras à l'heure", "VP03", false, 5, 3, "Technique"));

// Update label text when slider value changes







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


  console.log(eventClicked);
  setTimeout(function () {

    modals.show("dive_rapport", function () {
      menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
  }, 500);

  // GMT +2

  document.querySelector(".title_rapport_plannif").innerHTML = "Plannification " + eventClicked.title;



});


const nameSelects = document.querySelectorAll('.diver-name');
const nameOptions = document.querySelectorAll('.diver-name option');


nameSelects.forEach(select => {
  select.addEventListener('change', () => {
    const selectedValues = Array.from(nameSelects)
      .map(s => s.value)
      .filter(value => value !== '');

    nameOptions.forEach(option => {
      const isOptionSelected = selectedValues.includes(option.value);

      option.disabled = isOptionSelected;
    });
  });
});


let create_event_button = document.querySelector("#createEventButton");

create_event_button.addEventListener("click", function () {
  document.querySelector("#timeline_create").style.height = "calc(" + $("#global_create").height() + "px - 40px)";
  modals.show("createEventModal", function () {
    menutoggle.classList.remove('active');
  });
  document.querySelector(".timeline_bar").style.height = $(".global").height() + "px";
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
});


// Search of user
let search_user = document.querySelector("#searchUser");

search_user.addEventListener("input", function () {
  let search = search_user.value;
  let users = document.querySelectorAll(".user_list_item");
  users.forEach(function (user) {
    if (user.innerText.toLowerCase().includes(search.toLowerCase())) {
      user.style.display = "flex";
    } else {
      user.style.display = "none";
    }
  });
});