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
    button.innerHTML = "<img src='../img/loading_animation.svg' alt='loading' class='loading_gif'>";
    button.style.width = "20px";
    setTimeout(function () {
      button.style.width = "100px";
      button.innerHTML = "<i class='fas fa-check'></i>";
      modals.show("validation_save");
      setTimeout(function () {
        modals.closeCurrent();
        button.style.width = "200px";
        button.innerHTML = "Sauvegarder";
      }, 2000);

    }, 2000);

  });
});