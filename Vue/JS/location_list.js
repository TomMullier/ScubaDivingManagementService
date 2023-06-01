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

let create_button = document.getElementById("create_button");

create_button.addEventListener("click", function () {
        document.querySelector("#create_location .title").innerHTML = "Créer un lieu";
        document.querySelector("#create_location h3").innerHTML = "Remplissez les champs ci-dessous pour créer un lieu";
        document.querySelector("#create_location .create_button").innerHTML = "Créer";
        modals.show("create_location", function () {
                menutoggle.classList.remove('active');
        });
        menutoggle.classList.toggle('active');
        menutoggle.classList.toggle('close-modal');
});
let search_bar = document.querySelector("#searchbar");

search_bar.addEventListener("input", function () {
        let list_loc = document.querySelectorAll(".list_item");
        list_loc.forEach(function (loc) {
                // For Name
                if (loc.querySelector(".list_title").innerHTML.toLowerCase().includes(search_bar.value.toLowerCase())) {
                        loc.style.display = "flex";
                } else {
                        if (loc.querySelector(".adress").innerHTML.toLowerCase().includes(search_bar.value.toLowerCase())) {
                                loc.style.display = "flex";
                        } else {

                                loc.style.display = "none";
                        }
                }
        });
});

let list_item= document.querySelectorAll(".list_item");

list_item.forEach(function (loc) {
        let delete_button = loc.querySelector(".delete_button");
        delete_button.addEventListener("click", function () {
                modals.show("confirm_delete", function () {
                        menutoggle.classList.remove('active');
                });
                menutoggle.classList.toggle('active');
                menutoggle.classList.toggle('close-modal');

                document.querySelector("#cancelButton").addEventListener("click", function () {
                        modals.closeCurrent();
                });

        });
}       );


list_item.forEach(function (loc) {
        let edit_button = loc.querySelector(".edit_button");
        edit_button.addEventListener("click", function () {
                document.querySelector("#create_location .title").innerHTML = "Modifier un lieu";
                document.querySelector("#create_location h3").innerHTML = "Modifiez les champs ci-dessous pour modifier un lieu";
                document.querySelector("#create_location .create_button").innerHTML = "Modifier";
                modals.show("create_location", function () {
                        menutoggle.classList.remove('active');
                });
                menutoggle.classList.toggle('active');
                menutoggle.classList.toggle('close-modal');
        });
}       );



// PAYS
const countrySelect = document.getElementById('country');

fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(countries => {
    countries.sort((a, b) => {
      if (a.name.common < b.name.common) {
        return -1;
      }
      if (a.name.common > b.name.common) {
        return 1;
      }
      return 0;
    });


    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.name.common;
      option.text = country.name.common;
      countrySelect.appendChild(option);
    });
  })
  .catch(error => {
    console.log('Une erreur s\'est produite :', error);
  });





