import {
  me,
  events,
  my_role
} from './class/global.js';


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

document.addEventListener("DOMContentLoaded", function () {
  // document.querySelector('#profile_picture').src = "../img/profile_pictures/" + me.firstname + me.lastname + me.licenceNumber + ".jpg";
  checkForPP();
  document.querySelector(".name").innerHTML = me.firstname + " " + me.lastname;
  document.querySelector(".licence_number").innerHTML = me.licenceNumber;
  document.querySelector(".birthdate").innerHTML = new Date(me.birthdate).toLocaleDateString();
  document.querySelector(".email").value = me.mail;
  document.querySelector(".phone").value = me.phone;
  document.querySelector(".name_identity").value = me.lastname;
  document.querySelector(".firstname_identity").value = me.firstname;
  document.querySelector(".info-section").style.height = "calc(" + $(".profile_container_card").height() + " + 40px)";
  if(me.diverQualification!=""){
    document.querySelector("#qualif").value = me.diverQualification;
  }
  if(me.instructorQualification!=""){
    document.querySelector("#qualif_instruc").value = me.instructorQualification;
  }
  if(me.noxLevel!=""){
    document.querySelector("#niveau").value = me.noxLevel;
  }
  if(me.additionnalQualification!=""){
    document.querySelector("#qualif_add").value = me.additionnalQualification;
  }
});

document.querySelector(".phone").addEventListener("input", function () {
  if (document.querySelector(".phone").value != me.phone || document.querySelector(".email").value != me.mail) {
    document.querySelector(".save_button_infos").style.display = "flex";
  } else {
    document.querySelector(".save_button_infos").style.display = "none";
  }
});

document.querySelector(".email").addEventListener("input", function () {
  if (document.querySelector(".email").value != me.mail || document.querySelector(".phone").value != me.phone) {
    document.querySelector(".save_button_infos").style.display = "flex";
  } else {
    document.querySelector(".save_button_infos").style.display = "none";
  }
});




//! Profile picture

let profile_picture_name = me.firstname + me.lastname + me.licenceNumber;

function checkForPP(){
  // try {
  //   document.querySelector('#profile_picture').src = "../../Model/user-data/" + me.firstname+me.lastname+"/"+ profile_picture_name + ".jpg";
  // } catch (error) {
  //   document.querySelector('#profile_picture').src = "../../Model/user-data/default.jpg";
  // }
}