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

let save_buttons = document.querySelectorAll(".save_button_infos");

save_buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    modals.show("validation_save");
    // time out to close
    setTimeout(function () {
      modals.closeCurrent();
    }, 2000);

  });
});


// Sélectionnez l'élément du bouton de sauvegarde
const saveButton = document.getElementById('saveButton');

// Ajoutez un gestionnaire d'événement au clic sur le bouton de sauvegarde
saveButton.addEventListener('click', generatePDF);
document.getElementById('saveButton').addEventListener('click', generatePDF);
