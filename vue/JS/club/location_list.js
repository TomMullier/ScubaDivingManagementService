/* -------------------------------------------------------------------------- */
/*                                   IMPORT                                   */
/* -------------------------------------------------------------------------- */
import {
    Location
} from '../class/Location.js';


/* -------------------------------------------------------------------------- */
/*                              GLOBAL VARIABLES                              */
/* -------------------------------------------------------------------------- */
let locations = [];


/* -------------------------------------------------------------------------- */
/*                                   REQUEST                                  */
/* -------------------------------------------------------------------------- */

/* ------------------------------ GET SITE LIST ----------------------------- */
fetch('/auth/club/get_locations', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
    .then(sites => {
        console.log(sites);
        sites.forEach(function (site) {
            locations.push(new Location(site.Site_Name, site.Gps_Latitude, site.Gps_Longitude, site.Track_Type, site.Track_Number, site.Track_Name, site.Zip_Code, site.City_Name, site.Country_Name, site.Additional_Address, site.Tel_Number, site.Information_URL, [], site.SOS_Tel_Number, site.Emergency_Plan, site.Post_Accident_Procedure));
        });
        console.log("Locations :");
        console.log(locations);
        updateDisplayLocations();
    })

/* ----------------------------- CREATE LOCATION ---------------------------- */
function createLocation(loc) {
    console.log("iciiiiiiiiiiiiiiiiiiiiii");
    fetch('/auth/club/locations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loc)
        }).then((res) => res.json())
        .then((res) => {
            console.log(res);
            document.location.reload();
        });
}

/* -------------------------- MODIFY LCOATION INFO -------------------------- */
function modifyLocation(data) {
    fetch('/auth/club/locations', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => console.log(res))
}

/* ----------------------------- DELETE LOCATION ---------------------------- */
function deleteLocation(target) {
    console.log(target);
    fetch('/auth/club/locations', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Site_Name: target
            })
        }).then((res) => res.json())
        .then((res) => {
            console.log(res);
        });
}



/* -------------------------------------------------------------------------- */
/*                                    CODE                                    */
/* -------------------------------------------------------------------------- */

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

function validatePhoneNumber(input_str) {
    var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

    return re.test(input_str);
}
//! Create location
let create_button = document.getElementById("create_button");

create_button.addEventListener("click", function () {
    document.querySelector("#create_location").querySelectorAll("input").forEach(function (input) {
        input.value = "";
    });
    document.querySelector("#name").disabled = false;
    document.querySelector("#create_location .title").innerHTML = "Créer un lieu";
    document.querySelector("#create_location h3").innerHTML = "Remplissez les champs ci-dessous pour créer un lieu";
    document.querySelector("#create_location .create_button").innerHTML = "Créer";
    modals.show("create_location", function () {
        menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
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
        let url_ = document.querySelector("#webMax").value;
        let SOS_Tel_Number = document.querySelector("#sos_phone").value;
        let Emergency_Plan = document.querySelector("#plan_urgent").value;
        let Post_Accident_Procedure = document.querySelector("#post_accident_procedure").value;
        console.log("URL LIEU CREE : " + url_);
        let location = new Location(name, lat, lng, trackType, trackNumber, trackName, zipCode, cityName, country, complement, phone, url_, [], SOS_Tel_Number, Emergency_Plan, Post_Accident_Procedure);
        locations.push(location);
        console.log("Lieu créé :")
        console.log(location);
        let data = {
            Site_Name: name,
            Gps_Latitude: lat,
            Gps_Longitude: lng,
            Track_Type: trackType,
            Track_Number: trackNumber,
            Track_Name: trackName,
            Zip_Code: zipCode,
            City_Name: cityName,
            Country_Name: country,
            Additional_Address: complement,
            Tel_Number: phone,
            Information_URL: url_,
            SOS_Tel_Number: SOS_Tel_Number,
            Emergency_Plan: Emergency_Plan,
            Post_Accident_Procedure: Post_Accident_Procedure
        };
        if (data.Gps_Latitude == "" || data.Gps_Longitude == "") {
            // Get from adress
        } else if (data.trackType == "" || data.trackName == "" || data.trackNumber == "" || data.zipCode == "" || data.cityName == "" || data.country == "") {
            // Get from lat lng
        }

        let auth = true;
        document.querySelector("#create_location").querySelectorAll("input").forEach(function (input) {
            if (input.value == "" && input.getAttribute("required")) {
                auth = false;
                console.log("Champ vide");
                console.log(input);
            }
        });

        // if (!validatePhoneNumber(data.Tel_Number)) {
        //     console.log("Numéro de téléphone invalide");
        //     auth = false;
        //     document.querySelector("#phone").style.border = "1px solid #f2574a";
        // }

        if (auth) {
            createLocation(data);
            // updateDisplayLocations();
            document.querySelector("#validate_creation").disabled = true;
            document.querySelector("#validate_creation").innerHTML = "<img src='../img/loading_animation.svg' alt='loading' class='loading'>";
            document.querySelector("#validate_creation").style.height = "40px";
            setTimeout(function () {
                // document.location.reload();
            }, 1000);
        } else {
            document.querySelector("#create_location").innerHTML = "Certains champs ne sont pas remplis";
            document.querySelector("#create_location").querySelectorAll('input').forEach(function (input) {
                if (input.getAttribute("required")) {
                    input.style.border = "1px solid #120B8F";
                }
            });
            document.querySelector("#create_location").querySelectorAll('input').forEach(function (input) {
                if (input.value == "" && input.getAttribute("required")) {
                    input.style.border = "1px solid #f2574a";
                }
            });

            setTimeout(function () {
                document.querySelector("#create_location").innerHTML = "Créer";

            }, 2000);

        }
    });
});

//! Search event
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

function updateDisplayLocations() {
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
        if (!loc.url.includes("http") && loc.url != "") {
            loc.url = "http://" + loc.url;
        }
        let list_item = '<div class="list_item"><h1 class="list_title">' + loc.name + '</h1><h2 class="adress">' + loc.trackNumber + " " + loc.trackType + " " + loc.trackName + ",<br>" + loc.zipCode + " " + loc.cityName + ",<br>" + loc.country + '</h2>';
        list_item += '<div class="coordinate"><h2 class="latitude"><i class="fa-solid fa-map-marker"></i> Latitude : ' + loc.lat + ' </h2><h2 class="longitude"><i class="fa-solid fa-map-marker"></i> Longitude : ' + loc.lng + '</h2>';
        list_item += '</div>'
        if (loc.phone != "") {
            list_item += '<a href="" class="phone"><i class="fa-solid fa-phone"></i>' + loc.phone + '</a>';
        }
        if (loc.url != "") {
            list_item += '<a target="_blank" href="' + loc.url + '" class="web"><i class="fa-solid fa-at"></i> Site Web</a>'
        }
        list_item += '<div class="button_container"><button class="edit_button"><i class="fa-solid fa-pencil"></i></button><button class="delete_button"><i class="fa-solid fa-trash"></i></button></div></div>';
        container_location.innerHTML += list_item;
    });

    list_item = document.querySelectorAll(".list_item");

    list_item.forEach(function (loc) {
        let delete_button = loc.querySelector(".delete_button");
        delete_button.addEventListener("click", function () {
            modals.show("confirm_delete")
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

                // locations.splice(index, 1);
                console.log("Lieu supprimé :")
                console.log(name);
                deleteLocation(name);
                // updateDisplayLocations();
                // actualiser la page 
                document.location.reload();
                modals.closeCurrent();
            });

        });
    });;


    //!Edit location

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
            document.querySelector("#name").disabled = true;
            menutoggle.classList.toggle('active');
            menutoggle.classList.toggle('close-modal');
            // fill input with location data
            document.querySelector("#name").value = loc.querySelector(".list_title").innerHTML;
            let data = locations.find(function (location) {
                return location.name == loc.querySelector(".list_title").innerHTML;
            });
            console.log("oqerhygfbqosjkdfhlbqefoivkqjdfh")
            console.log(data);
            document.querySelector("#latitude").value = data.lat;
            document.querySelector("#longitude").value = data.lng;
            document.querySelector("#street").value = data.trackType + " " + data.trackName;
            document.querySelector("#streetNumber").value = data.trackNumber;
            document.querySelector("#country").value = data.country;
            document.querySelector("#postalCode").value = data.zipCode;
            document.querySelector("#city").value = data.cityName;
            document.querySelector("#adress_complement").value = data.additional;
            document.querySelector("#phone").value = data.phone;
            document.querySelector("#webMax").value = data.url;
            document.querySelector("#sos_phone").value = data.SOS_Tel_Number;
            document.querySelector("#plan_urgent").value = data.Emergency_Plan;
            document.querySelector("#post_accident_procedure").value = data.Post_Accident_Procedure;

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
                let url_ = document.querySelector("#webMax").value;
                let SOS_Tel_Number = document.querySelector("#sos_phone").value;
                let Emergency_Plan = document.querySelector("#plan_urgent").value;
                let Post_Accident_Procedure = document.querySelector("#post_accident_procedure").value;

                let location = new Location(name, lat, lng, trackType, trackNumber, trackName, zipCode, cityName, country, complement, phone, url_, [], SOS_Tel_Number, Emergency_Plan, Post_Accident_Procedure);
                console.log("Lieu modifié :")
                console.log(location);
                let data = {
                    Site_Name: name,
                    Gps_Latitude: lat,
                    Gps_Longitude: lng,
                    Track_Type: trackType,
                    Track_Number: trackNumber,
                    Track_Name: trackName,
                    Zip_Code: zipCode,
                    City_Name: cityName,
                    Country_Name: country,
                    Additional_Address: complement,
                    Tel_Number: phone,
                    Information_URL: url_,
                    SOS_Tel_Number: SOS_Tel_Number,
                    Emergency_Plan: Emergency_Plan,
                    Post_Accident_Procedure: Post_Accident_Procedure
                };
                let auth = true;
                document.querySelector("#create_location").querySelectorAll("input").forEach(function (input) {
                    if (input.value == "" && input.getAttribute("required")) {
                        auth = false;
                    }
                });

                // if (!validatePhoneNumber(data.Tel_Number)) {
                //     auth = false;
                //     document.querySelector("#phone").style.border = "1px solid #f2574a";
                // }

                if (auth) {
                    modifyLocation(data);
                    updateDisplayLocations();
                    document.querySelector("#validate_creation").disabled = true;
                    document.querySelector("#validate_creation").innerHTML = "<img src='../img/loading_animation.svg' alt='loading' class='loading'>";
                    document.querySelector("#validate_creation").style.height = "40px";
                    setTimeout(function () {
                        document.location.reload();
                    }, 1000);
                } else {
                    document.querySelector("#create_location").innerHTML = "Certains champs ne sont pas remplis";
                    document.querySelector("#create_location").querySelectorAll('input').forEach(function (input) {
                        if (input.getAttribute("required")) {
                            input.style.border = "1px solid #120B8F";
                        }
                    });
                    document.querySelector("#create_location").querySelectorAll('input').forEach(function (input) {
                        if (input.value == "" && input.getAttribute("required")) {
                            input.style.border = "1px solid #f2574a";
                        }
                    });
                    setTimeout(function () {
                        document.querySelector("#create_location").innerHTML = "Modifier";

                    }, 2000);

                }

            });
        })
    });
    loadingClose();
}

function loadingClose() {
    document.querySelector(".loading_animation").style.opacity = "0";
    setTimeout(function () {
        document.querySelector(".loading_animation").style.display = "none";
    }, 500);
}