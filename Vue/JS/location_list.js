import {
        locations

} from './class/global.js';
import {
        Location
} from './class/Location.js';

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
        document.querySelector("#create_location").querySelectorAll("input").forEach(function (input) {
                input.value = "";
        });
        document.querySelector("#create_location .title").innerHTML = "Créer un lieu";
        document.querySelector("#create_location h3").innerHTML = "Remplissez les champs ci-dessous pour créer un lieu";
        document.querySelector("#create_location .create_button").innerHTML = "Créer";
        modals.show("create_location", function () {
                menutoggle.classList.remove('active');
        });
        menutoggle.classList.toggle('active');
        menutoggle.classList.toggle('close-modal');
        document.querySelector("#validate_creation").addEventListener("click", function () {
                // empty all input


                let name = document.querySelector("#name").value;
                let lat = document.querySelector("#latitude").value;
                let lng = document.querySelector("#longitude").value;
                let total = document.querySelector("#street").value;
                let trackType = total.split(" ")[0];
                let trackName = total.replace(trackType, "");
                let trackNumber = document.querySelector("#streetNumber").value;
                let country = document.querySelector("#country").value;
                let zipCode = document.querySelector("#postalCode").value;
                let cityName = document.querySelector("#city").value;
                let complement = document.querySelector("#adress_complement").value;
                let phone = document.querySelector("#phone").value;
                let url = document.querySelector("#web").value;

                let location = new Location(name, lat, lng, trackType, trackNumber, trackName, zipCode, cityName, country, complement, phone, url);
                locations.push(location);
                console.log("Lieu créé :")
                console.log(location);
                updateDisplayLocations();
        });
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

document.addEventListener('DOMContentLoaded', function updateDisplayLocations() {
        let container_location = document.querySelector(".list_container");
        container_location.innerHTML = "";

        // remove events listener on delete button, and edit button, and validate
        let list_item = document.querySelectorAll(".list_item");

        list_item.forEach(function (loc) {
                let delete_button = loc.querySelector(".delete_button");
                delete_button.removeEventListener("click", function () {});
                document.querySelector("#validateButton").removeEventListener("click", function () {});
                let edit_button = loc.querySelector(".edit_button");
                edit_button.removeEventListener("click", function () {});
        });




        locations.forEach(function (loc) {
                let list_item = '<div class="list_item"><h1 class="list_title">' + loc.name + '</h1><h2 class="adress">' + loc.trackNumber + " " + loc.trackType + " " + loc.trackName + ",<br>" + loc.zipCode + " " + loc.cityName + ",<br>" + loc.country + '</h2>';
                list_item += '<div class="coordinate"><h2 class="latitude"><i class="fa-solid fa-map-marker"></i> Latitude : ' + loc.lat + ' </h2><h2 class="longitude"><i class="fa-solid fa-map-marker"></i> Longitude : ' + loc.lng + '</h2>';
                list_item += '</div><a href="" class="phone"><i class="fa-solid fa-phone"></i>' + loc.phone + '</a>';
                list_item += '<a href="' + loc.url + '" class="web"><i class="fa-solid fa-at"></i> Site Web</a><div class="button_container"><button class="edit_button"><i class="fa-solid fa-pencil"></i></button><button class="delete_button"><i class="fa-solid fa-trash"></i></button></div></div>';
                container_location.innerHTML += list_item;
        });

        list_item = document.querySelectorAll(".list_item");

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
                        document.querySelector("#validateButton").addEventListener("click", function () {
                                let name = loc.querySelector(".list_title").innerHTML;
                                let index = locations.findIndex(function (location) {
                                        return location.name == name;
                                });
                                locations.splice(index, 1);
                                console.log("Lieu supprimé :")
                                console.log(name);
                                // updateDisplayLocations();
                                // actualiser la page 
                                document.location.reload();

                                modals.closeCurrent();
                        });

                });
        });


        list_item.forEach(function (loc) {
                let edit_button = loc.querySelector(".edit_button");
                edit_button.addEventListener("click", function () {
                        document.querySelector("#create_location").querySelectorAll("input").forEach(function (input) {
                                input.value = "";
                        });
                        document.querySelector("#create_location .title").innerHTML = "Modifier un lieu";
                        document.querySelector("#create_location h3").innerHTML = "Modifiez les champs ci-dessous pour modifier un lieu";
                        document.querySelector("#create_location .create_button").innerHTML = "Modifier";
                        modals.show("create_location", function () {
                                menutoggle.classList.remove('active');
                        });
                        menutoggle.classList.toggle('active');
                        menutoggle.classList.toggle('close-modal');
                        // fill input with location data
                        document.querySelector("#name").value = loc.querySelector(".list_title").innerHTML;
                        let data = locations.find(function (location) {
                                return location.name == loc.querySelector(".list_title").innerHTML;
                        });
                        document.querySelector("#latitude").value = data.lat;
                        document.querySelector("#longitude").value = data.lng;
                        document.querySelector("#street").value = data.trackType + " " + data.trackName;
                        document.querySelector("#streetNumber").value = data.trackNumber;
                        document.querySelector("#country").value = data.country;
                        document.querySelector("#postalCode").value = data.zipCode;
                        document.querySelector("#city").value = data.cityName;
                        document.querySelector("#adress_complement").value = data.additional;
                        document.querySelector("#phone").value = data.phone;
                        document.querySelector("#web").value = data.url;

                        document.querySelector("#validate_creation").addEventListener("click", function () {
                                let name = document.querySelector("#name").value;
                                let lat = document.querySelector("#latitude").value;
                                let lng = document.querySelector("#longitude").value;
                                let total = document.querySelector("#street").value;
                                let trackType = total.split(" ")[0];
                                let trackName = total.replace(trackType, "");
                                let trackNumber = document.querySelector("#streetNumber").value;
                                let country = document.querySelector("#country").value;
                                let zipCode = document.querySelector("#postalCode").value;
                                let cityName = document.querySelector("#city").value;
                                let complement = document.querySelector("#adress_complement").value;
                                let phone = document.querySelector("#phone").value;
                                let url = document.querySelector("#web").value;

                                let location = new Location(name, lat, lng, trackType, trackNumber, trackName, zipCode, cityName, country, complement, phone, url);
                                console.log("Lieu modifié :")
                                console.log(location);
                        });
                })
        });
});