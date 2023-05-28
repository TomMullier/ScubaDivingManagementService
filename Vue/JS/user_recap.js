import {
  frLocale
} from './@fullcalendar/core/locales/fr.js';
document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    // Options du calendrier
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
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
    calendar.addEvent(event);
    let startHour = getHours(event.start);
    let endHour = getHours(event.end);
    let startMinutes = getMinutes(event.start);
    let endMinutes = getMinutes(event.end);
    let startDate = getDate(event.start);
    let endDate = getDate(event.end);
    let startTime = startHour + ':' + startMinutes;
    let endTime = endHour + ':' + endMinutes;
    let title = getTitle(event);

    let today = new Date();
    let todayDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    startDate = startDate.split('-')[0] + '-' + startDate.split('-')[1] + '-' + startDate.split('-')[2];
    let startDate2 = new Date(startDate);
    todayDate = new Date(todayDate);

    if (startDate2 > todayDate) {
      HTML += '<div class="event"><p class="date">' + startDate + '</p><p class="hour">De ' + startHour + 'h' + startMinutes + ' à ' + endHour + 'h' + endMinutes + '</p><p class="name">' + title + '</p></div>'
    }
    document.getElementById("planning").style.height = calendarEl.offsetHeight + "px";
  });
  document.querySelector('#event-container').innerHTML = HTML;
  calendar.render();

  if (document.getElementById("important_text").innerText == "") {
    document.querySelector(".message").style.display = "none";
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

let addImportantMessageButton = document.querySelector(".message_add");
addImportantMessageButton.addEventListener("click", function () {
  modals.show("importantMessageModal", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
  document.querySelector("#textarea_important").value = "";
});


function getHours(time) {
  let hours = time.split('T')[1].split(':')[0];
  return hours;
}

function getMinutes(time) {
  let minutes = time.split('T')[1].split(':')[1];
  return minutes;
}

function getDate(time) {
  let date = time.split('T')[0];
  return date;
}

function getTitle(event) {
  let title = event.title;
  return title;
}

var events = [{
    title: 'Événement 1',
    start: '2023-05-25T10:00:00',
    end: '2023-05-25T12:00:00'
  },
  {
    title: 'Événement 2',
    start: '2023-05-25T14:00:00',
    end: '2023-05-25T16:00:00'
  },
  {
    title: 'Événement 3',
    start: '2023-05-26T12:00:00',
    end: '2023-05-26T13:00:00'
  },
  {
    title: 'Événement 4',
    start: '2023-05-27T12:00:00',
    end: '2023-05-27T13:00:00'
  },
  {
    title: 'Événement 5',
    start: '2023-05-28T12:00:00',
    end: '2023-05-28T13:00:00'
  },
  {
    title: 'Événement 3',
    start: '2023-05-30T12:00:00',
    end: '2023-05-30T13:00:00'
  },
  {
    title: 'Événement 3',
    start: '2023-05-31T12:00:00',
    end: '2023-05-31T13:00:00'
  },
  {
    title: 'Événement 3',
    start: '2023-05-21T12:00:00',
    end: '2023-05-21T13:00:00'
  },
  {
    title: 'Événement 3',
    start: '2023-05-29T12:00:00',
    end: '2023-05-29  T13:00:00'
  }
];