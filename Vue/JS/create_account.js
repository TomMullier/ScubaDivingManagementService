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

let confirm_button = document.querySelector("#btn-submit");
let title_user_create = document.querySelector("#txt_title_user_created");
let text_user_create = document.querySelector("#txt_descr_user_created");
let modale = document.querySelector("#user_created").querySelector(".modal-wrapper");

confirm_button.addEventListener("click", function () {
        confirm_button.innerHTML = "<img src='../img/loading_animation.svg' alt='loading' class='loading_gif'>";
        confirm_button.style.width = "20px";
        modals.closeCurrent();
        setTimeout(function () {
                modals.show("confirmation_creation");
        }, 500);
        document.querySelector("#cancelButton").addEventListener("click", function () {
                modals.closeCurrent();
                confirm_button.style.width = "200px";
                confirm_button.innerHTML = "Créer le compte";
        });
        document.querySelector("#validateButton").addEventListener("click", function () {
                let valid = true;
                modals.closeCurrent();
                if (valid) {
                        title_user_create.innerHTML = "Succès";
                        text_user_create.innerHTML = "Le compte a été créé/modifié avec succès";
                        modale.style.backgroundColor = "rgb(0, 131, 0)";
                        confirm_button.style.width = "100px";
                        confirm_button.innerHTML = "<i class='fas fa-check'></i>";
                        // modals.closeCurrent();
                        setTimeout(function () {
                                modals.show("user_created");
                        }, 500);
                        setTimeout(function () {
                                modals.closeCurrent();
                                confirm_button.style.width = "200px";
                                confirm_button.innerHTML = "Créer le compte";
                        }, 2500);

                } else {
                        title_user_create.innerHTML = "Erreur";
                        text_user_create.innerHTML = "Le compte n'a pas pu être créé/modifié";
                        modale.style.backgroundColor = "#f2574a";
                        confirm_button.style.width = "100px";
                        confirm_button.innerHTML = "<i class='fas fa-times'></i>";

                        // modals.closeCurrent();
                        setTimeout(function () {
                                modals.show("user_created");
                        }, 500);
                        setTimeout(function () {
                                modals.closeCurrent();
                                confirm_button.style.width = "200px";
                                confirm_button.innerHTML = "Créer le compte";
                        }, 2500);
                }
        });

});

let list_user = document.querySelectorAll(".user_item");

list_user.forEach(function (user) {
        user.addEventListener("click", function (e) {
                if (!e.target.classList.contains("button")) {
                        modals.show("user-info", function () {
                                menutoggle.classList.remove('active');
                        })

                        menutoggle.classList.toggle('active');
                        menutoggle.classList.toggle('close-modal');
                }
        });
});

let btn_create = document.querySelector(".create_button");
let create_title = document.querySelector("#modify_create_title");


btn_create.addEventListener("click", function () {
        confirm_button.innerHTML = "Créer le compte"
        create_title.innerHTML = "Créer un compte";
        // Vider les champs du formulaire
        document.querySelectorAll("input").forEach(function (input) {
                input.value = "";
        });
        modals.show("create_user", function () {
                menutoggle.classList.remove('active');
        })
        menutoggle.classList.toggle('active');
        menutoggle.classList.toggle('close-modal');
});


let btn_edit = document.querySelector("#edit-button");

btn_edit.addEventListener("click", function () {
        confirm_button.innerHTML = "Modifier le compte"
        create_title.innerHTML = "Modifier un compte";

        // Vider les champs du formulaire
        document.querySelectorAll("input").forEach(function (input) {
                input.value = "";
        });
        // remplir les champs avec les bonnes valeurs
        modals.show("create_user", function () {
                menutoggle.classList.remove('active');
        })
        menutoggle.classList.toggle('active');
        menutoggle.classList.toggle('close-modal');
});

let btn_delete = document.querySelector("#delete-button");

btn_delete.addEventListener("click", function () {
        modals.show("confirm_delete", function () {
                menutoggle.classList.remove('active');
        })
        menutoggle.classList.toggle('active');
        menutoggle.classList.toggle('close-modal');

        document.querySelector("#cancelButton").addEventListener("click", function () {
                modals.closeCurrent();
        });

});

let search_bar = document.querySelector("#searchbar");

search_bar.addEventListener("input", function () {
                        let list_user = document.querySelectorAll(".user_item");
                        list_user.forEach(function (user) {
                                // For Name
                                if (user.querySelector(".name").innerHTML.toLowerCase().includes(search_bar.value.toLowerCase())) {
                                        user.style.display = "flex";
                                } else {

                                        // For Email
                                        if (user.querySelector(".mail").innerHTML.toLowerCase().includes(search_bar.value.toLowerCase())) {
                                                user.style.display = "flex";
                                        } else {
                                                // for phone
                                                if (user.querySelector(".phone").innerHTML.toLowerCase().includes(search_bar.value.toLowerCase())) {
                                                        user.style.display = "flex";
                                                } else {
                                                        user.style.display = "none";
                                                }
                                        }
                                }
                        })
                });