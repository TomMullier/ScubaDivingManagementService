import {
  frLocale
} from './@fullcalendar/core/locales/fr.js';

import {
  Event
} from "./Event.js";
let calendar;
let eventClicked;
document.addEventListener('DOMContentLoaded', function () {


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
      document.querySelector(".timeline_bar").style.height = $(".global").height() + "px";
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
      document.querySelector("#eventPriceDiver").innerHTML = "Plongeur : "+DivePrice + " €";
      document.querySelector("#eventPriceInstructor").innerHTML = "Instructeur : "+InstructorPrice + "€";


      // Comment
      let comment = eventClicked.extendedProps.comment;
      document.querySelector("#comment").innerHTML = "Commentaire : "+comment;

      // Needs
      let needs = eventClicked.extendedProps.needs;
      document.querySelector("#needs").innerHTML = "Besoin : "+needs;

      // Button click
      let button = document.querySelector("#reserveButton");
      button.addEventListener("click", function () {
        if(button.classList.contains("reserveButton")){
        button.innerHTML = "Se désinscrire";
        button.classList.add("unreserveButton");
        button.classList.remove("reserveButton");
        eventClicked.setProp("backgroundColor", "#f2574a");}
        else{
          button.innerHTML = "Réserver";
          button.classList.add("reserveButton");
          button.classList.remove("unreserveButton");
          eventClicked.setProp("backgroundColor", "#4CAF50");
        }

      });

      if(new Date(eventClicked.end) < new Date()){
        button.style.display = "none";
      } else {
        button.style.display = "flex";
      }
    }

  });

  events.forEach(function (event) {
    if (event.reserved) {
      event.backgroundColor = "#f2574a";
    } else {
      event.backgroundColor = "#4CAF50";
    }
    calendar.addEvent(event);
  });
  calendar.render();

});


var events = []
events.push(new Event(new Date(2023, 5, 1, 10, 0), new Date(2023, 5, 1, 12, 0), 20, 10, "La Ciotat", " Commentaire Commentaire ", " Besoin Besoin Besoin", false, 5,3, "Exploration"));

// Update label text when slider value changes

var slider = document.getElementById("timeSlider");
slider.addEventListener("input", function () {
  var label = document.getElementById("timeLabel");
  var hours = Math.floor(this.value / 60);
  var minutes = this.value % 60;
  if (this.value == 150) {
    label.textContent = "Illimité"
  } else label.textContent = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
});

// Update label text when slider value changes
var slider2 = document.getElementById("priceSlider");

slider2.addEventListener("input", function () {
  var label = document.getElementById("priceLabel");
  var price = Math.floor(this.value);
  if (this.value == 150) {
    label.textContent = "Illimité"
  } else label.textContent = price.toString().padStart(2, "0") + "€";
});

// Eupdate level background color
var levelItems = document.querySelectorAll(".level-item");
levelItems.forEach(function (levelItem) {
  levelItem.addEventListener("click", function () {
    levelItems.forEach(function (elem) {
      if (parseInt(elem.innerText) <= parseInt(levelItem.innerText)) {
        elem.classList.add("active");
        elem.classList.remove("not-active");
      } else {
        elem.classList.remove("active");
        elem.classList.add("not-active");
      }
    });
  });
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


// JavaScript
const nameSelects = document.querySelectorAll('.diver-name');
const nameOptions = document.querySelectorAll('.diver-name option');

// Gérer les changements de sélection
nameSelects.forEach(select => {
  select.addEventListener('change', () => {
    const selectedValues = Array.from(nameSelects)
      .map(s => s.value)
      .filter(value => value !== '');

    // Parcourir toutes les options
    nameOptions.forEach(option => {
      // Vérifier si l'option a déjà été sélectionnée
      const isOptionSelected = selectedValues.includes(option.value);

      // Activer/désactiver l'option en fonction de sa sélection
      option.disabled = isOptionSelected;
    });
  });
});
