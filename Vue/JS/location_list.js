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