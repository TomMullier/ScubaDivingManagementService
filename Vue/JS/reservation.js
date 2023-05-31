import {
  frLocale
} from './@fullcalendar/core/locales/fr.js';
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
      modals.show("eventModal", function () {
        menutoggle.classList.remove('active');
      });
      menutoggle.classList.toggle('active');
      menutoggle.classList.toggle('close-modal');

      document.querySelector("#eventTitle").innerHTML = info.event.title;
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

      // document.querySelector("#left_bar").style.height=$(".global").height()+"px";
      // document.querySelector("#left_bar").style.width=$(".global").width()+"px";  
      document.querySelector(".timeline_bar").style.height = $(".global").height() + "px";
      let adress = document.querySelector("#eventLocation").innerText;
      // Remove line breaks
      adress = adress.replace(/(\r\n|\n|\r)/gm, " ");

      document.querySelector("#eventLocation").href = "https://www.google.com/maps/search/?api=1&query=" + adress;
      // Set title of link to "Voir sur Google Maps"
      document.querySelector("#eventLocation").title = "Voir sur Google Maps";
    }

  });
  events.forEach(function (event) {
    if (event.reserved) {
      event.backgroundColor = "#f2574a";
    } else {
      event.backgroundColor = "#4CAF50";
    }
    if (new Date(event.start) < new Date() && new Date(event.end) > new Date()) {
      event.backgroundColor = "#120B8F";
    }
    if (new Date(event.end) < new Date()) {
      event.backgroundColor = "#8b93a1";
    }

    calendar.addEvent(event);
  });
  calendar.render();

});

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




var events = [{
    title: 'Événement 1',
    start: '2023-05-25T10:00:00',
    end: '2023-05-25T12:00:00',
    reserved: false
  },
  {
    title: 'Événement 2',
    start: '2023-05-25T14:00:00',
    end: '2023-05-25T16:00:00',
    reserved: false
  },
  {
    title: 'Événement 3',
    start: '2023-05-26T12:00:00',
    end: '2023-05-26T13:30:00',
    reserved: true,
  },
  {
    title: 'Événement 6',
    start: '2023-05-26T15:00:00',
    end: '2023-05-26T16:30:00',
    reserved: true,
  },
  {
    title: 'Événement 4',
    start: '2023-05-27T12:00:00',
    end: '2023-05-27T13:00:00',
    reserved: true
  },
  {
    title: 'Événement 5',
    start: '2023-05-28T12:00:00',
    end: '2023-05-28T13:00:00',
    reserved: false
  },
  {
    title: 'Événement 3',
    start: '2023-05-30T12:00:00',
    end: '2023-05-30T13:00:00',
    reserved: false
  },
  {
    title: 'Événement 3',
    start: '2023-05-31T12:00:00',
    end: '2023-05-31T13:00:00',
    reserved: false
  },
  {
    title: 'Événement 3',
    start: '2023-05-21T12:00:00',
    end: '2023-05-21T13:00:00',
    reserved: false
  },
  {
    title: 'Événement 3',
    start: '2023-05-29T12:00:00',
    end: '2023-05-29  T13:00:00',
    reserved: false
  }
]


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

  document.querySelector(".title_rapport_plannif").innerHTML = "Plannification "+eventClicked.title;



});

const legendItems = document.querySelectorAll('.legend_item');
const tableContainer = document.querySelector('.table-container');
const maxTagsPerColumn = 5;
let columns = [document.getElementById('column1')];
let draggedItem = null;

// Gestionnaires d'événements pour le glisser-déposer des éléments de la légende
legendItems.forEach(item => {
  item.addEventListener('dragstart', () => {
    draggedItem = item;
    item.classList.add('dragged');
  });

  item.addEventListener('dragend', () => {
    draggedItem = null;
    item.classList.remove('dragged');
  });
});

function createNewColumn() {
  const column = document.createElement('div');
  column.classList.add('column');
  column.id = `column${columns.length + 1}`;

  const columnTitle = document.createElement('h2');
  columnTitle.classList.add('column-title');
  columnTitle.textContent = `Palanquée ${columns.length + 1}`;
  column.appendChild(columnTitle);

  columns.push(column);
  tableContainer.appendChild(column);

  // Ajouter les gestionnaires d'événements pour la nouvelle colonne
  column.addEventListener('dragover', e => {
    e.preventDefault();
    column.classList.add('dragover');
  });

  column.addEventListener('dragleave', () => {
    column.classList.remove('dragover');
  });

  column.addEventListener('drop', () => {
    if (column.children.length < maxTagsPerColumn) {
      column.appendChild(draggedItem);
      draggedItem.classList.remove('dragged');
      draggedItem.classList.add('in-table');
      column.classList.remove('dragover');
    }
  });
}

// Gestionnaire d'événement pour le glisser-déposer sur les colonnes existantes
columns.forEach(column => {
  column.addEventListener('dragover', e => {
    e.preventDefault();
    column.classList.add('dragover');
  });

  column.addEventListener('dragleave', () => {
    column.classList.remove('dragover');
  });

  column.addEventListener('drop', () => {
    if (column.children.length < maxTagsPerColumn) {
      column.appendChild(draggedItem);
      draggedItem.classList.remove('dragged');
      draggedItem.classList.add('in-table');
      column.classList.remove('dragover');
    }
  });
});

// Gestionnaire d'événement pour le glisser-déposer sur la première colonne
columns[0].addEventListener('drop', () => {
  if (columns[0].children.length < maxTagsPerColumn) {
    columns[0].appendChild(draggedItem);
    draggedItem.classList.remove('dragged');
    draggedItem.classList.add('in-table');
    columns[0].classList.remove('dragover');

    if (columns[0].children.length === 1) {
      createNewColumn();
    }
  }
});
