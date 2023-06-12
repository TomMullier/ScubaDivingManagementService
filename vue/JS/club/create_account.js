/* -------------------------------------------------------------------------- */
/*                                   IMPORT                                   */
/* -------------------------------------------------------------------------- */
import {
    User
} from '../class/User.js';

/* ----------------------------- GLOBAL VARIABLE ---------------------------- */
let my_role;
let all_user = [];

/* -------------------------------------------------------------------------- */
/*                                   REQUEST                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------- USERTYPE -------------------------------- */
fetch('/auth/club/club_members')
    .then(response => {
        const userType = response.headers.get('userType');
        console.log("User Role :" + userType);
        my_role = userType;
        // user, dp, club
        if (my_role != "club") {
            document.querySelectorAll(".club_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
        if (my_role != "dp") {
            document.querySelectorAll(".dp_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
        if (my_role != "user") {
            document.querySelectorAll(".user_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
    });

/* ------------------------------ GET USER LIST ----------------------------- */
fetch('/auth/club/get_club_members', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
    .then(users => {
        console.log(users);
        users.forEach(user => {
            all_user.push(new User(user.Lastname, user.Firstname, user.Mail, user.Phone, user.Diver_Qualification, user.Instructor_Qualification, user.Nox_Level, user.Additional_Qualifications, user.License_Number, user.License_Expiration_Date, user.Medical_Certificate_Expiration_Date, user.Birthdate));
        });
        displayUsers();


    })

/* ------------------------------- CREATE USER ------------------------------ */
function createUser(data) {
    fetch('/auth/club/club_members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((res) => res.json())
        .then((res) => {
            openModalConfirmCreate(res.created)
        });
}

/* ---------------------------- MODIFY USER INFO ---------------------------- */
function modifyUserInfo(data) {
    fetch('/auth/club/club_members', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => openModalConfirmCreate(res.modified))
}

/* ------------------------------- DELETE USER ------------------------------ */
function deleteUser(target) {
    // console.log(target);
    fetch('/auth/club/club_members', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(target)
        }).then((res) => res.json())
        .then((res) => {
            console.log(res);
            location.reload();
        });
}




/* -------------------------------------------------------------------------- */
/*                                    CODE                                    */
/* -------------------------------------------------------------------------- */

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
let oldMail;

function displayUsers() {
    let container = document.querySelector(".list_container");
    container.innerHTML = "";
    all_user.forEach(function (me) {
            container.innerHTML += '<div class="user_item"><div class="infos"><h2 class="name">' + me.lastname + " " + me.firstname + '</h2><h2 class="mail">' + me.mail + '</h2><h2 class="phone">' + me.phone + '</h2></div><div class="buttons"><div class="edit_button"><i id="edit-button" class="button fa-solid fa-pencil"></i></div><div class="delete_button"><i id="delete-button" class="button fa-solid fa-trash"></i></div></div></div>'

    });
    let btn_edit = document.querySelectorAll("#edit-button");

    btn_edit.forEach(function (button) {
            button.addEventListener("click", function (event) {
                    confirm_button.innerHTML = "Modifier le compte"
                    create_title.innerHTML = "Modifier un compte";
                    let name_clicked = event.target.parentNode.parentNode.parentNode.querySelector(".infos").querySelector(".name").innerHTML;
                    let mail_clicked = event.target.parentNode.parentNode.parentNode.querySelector(".infos").querySelector(".mail").innerHTML;
                    let phone_clicked = event.target.parentNode.parentNode.parentNode.querySelector(".infos").querySelector(".phone").innerHTML;
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
                    document.querySelector("#lastname").value = name_clicked.split(" ")[0];
                    document.querySelector("#firstname").value = name_clicked.split(" ")[1];
                    document.querySelector("#mail").value = mail_clicked;
                    document.querySelector("#phone").value = phone_clicked;
                    let get_user = all_user.find(user => user.lastname == name_clicked.split(" ")[0] && user.firstname == name_clicked.split(" ")[1] && user.mail == mail_clicked && user.phone == phone_clicked);
                    document.querySelector("#birthdate").value = get_user.birthdate.split("T")[0];
                    document.querySelector("#licence").value = get_user.licenceNumber;
                    document.querySelector("#diver_qualif").value = get_user.diverQualification;
                    document.querySelector("#instru_qualif").value = get_user.instructorQualification;
                    document.querySelector("#nitrox_qualif").value = get_user.noxLevel;
                    document.querySelector("#additionnal_qualif").value = get_user.additionnalQualification;
                    document.querySelector("#licence_date").value = get_user.licenceExpiration;
                    document.querySelector("#medic_date").value = get_user.medicalExpiration;
                    oldMail = mail_clicked;
            });
    });

    let btn_delete = document.querySelectorAll("#delete-button");
    btn_delete.forEach(function (button) {
            button.addEventListener("click", function (event) {
                    modals.show("confirm_delete", function () {
                            menutoggle.classList.remove('active');
                    })
                    menutoggle.classList.toggle('active');
                    menutoggle.classList.toggle('close-modal');


                    document.querySelector("#validateButton").addEventListener("click", function () {
                            let data = {
                                    Mail: event.target.parentNode.parentNode.parentNode.querySelector(".infos").querySelector(".mail").innerHTML,
                                    password: document.querySelector("#password_delete").value
                            }
                            deleteUser(data);
                            modals.closeCurrent();
                    });
                    document.querySelector("#cancelButton").addEventListener("click", function () {
                            modals.closeCurrent();
                    });

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
                            let name_clicked = e.target.parentNode.parentNode.querySelector(".infos").querySelector(".name").innerHTML;
                            let mail_clicked = e.target.parentNode.parentNode.querySelector(".infos").querySelector(".mail").innerHTML;
                            let phone_clicked = e.target.parentNode.parentNode.querySelector(".infos").querySelector(".phone").innerHTML;
                            document.querySelector("#name_show").innerText = name_clicked;
                            document.querySelector("#mail_show").innerText = mail_clicked;
                            document.querySelector("#phone_show").innerText = phone_clicked;
                            let get_user = all_user.find(user => user.lastname == name_clicked.split(" ")[0] && user.firstname == name_clicked.split(" ")[1] && user.mail == mail_clicked && user.phone == phone_clicked);
                            document.querySelector("#profile_show").src = "../img/profile_pictures/" + get_user.firstname + get_user.lastname + get_user.licenceNumber + ".jpg";
                            let day = get_user.birthdate.split("T")[0].split("-")[2];
                            let month = get_user.birthdate.split("T")[0].split("-")[1];
                            let year = get_user.birthdate.split("T")[0].split("-")[0];
                            document.querySelector("#birthdate_show").innerText = day + "/" + month + "/" + year;
                            document.querySelector("#licence_show").value = get_user.licenceNumber;
                            document.querySelector("#diver_qualif_show").value = get_user.diverQualification;
                            document.querySelector("#instru_qualif_show").value = get_user.instructorQualification;
                            document.querySelector("#nitrox_qualif_show").value = get_user.noxLevel;
                            document.querySelector("#additionnal_qualif_show").value = get_user.additionnalQualification;
                            document.querySelector("#licence_date_show").value = get_user.licenceExpiration;
                            document.querySelector("#medic_date_show").value = get_user.medicalExpiration;
                    }
            });
    });
    loadingClose();
};
function loadingClose() {
    document.querySelector(".loading_animation").style.opacity = "0";
    setTimeout(function () {
            document.querySelector(".loading_animation").style.display = "none";
    }, 500);
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
    confirm_button.disabled = true;
    if (confirm_button.innerHTML != "Modifier le compte") {
            confirm_button.innerHTML = "<img src='../../img/loading_animation.svg' alt='loading' class='loading_gif'>";
            confirm_button.style.width = "200px";
            modals.closeCurrent();
            setTimeout(function () {
                    modals.show("confirmation_creation");
            }, 500);
            document.querySelector("#cancelButton").addEventListener("click", function () {
                    modals.closeCurrent();
                    confirm_button.style.width = "200px";
                    confirm_button.innerHTML = "Créer le compte";
            });
            document.querySelector("#validateButton_creation").addEventListener("click", function () {
                    let firstname = document.querySelector("#firstname").value;
                    let lastname = document.querySelector("#lastname").value;
                    let mail = document.querySelector("#mail").value;
                    let phone = document.querySelector("#phone").value;
                    let birthdate = document.querySelector("#birthdate").value;
                    let diver_qualif = document.querySelector("#diver_qualif").value;
                    let instru_qualif = document.querySelector("#instru_qualif").value;
                    let nitrox_qualif = document.querySelector("#nitrox_qualif").value;
                    let additionnal_qualif = document.querySelector("#additionnal_qualif").value;
                    let licence = document.querySelector("#licence").value;
                    let licence_date = document.querySelector("#licence_date").value;
                    let medic_date = document.querySelector("#medic_date").value;
                    let user_to_create = {
                            Firstname: firstname,
                            Lastname: lastname,
                            Mail: mail,
                            Phone: phone,
                            Birthdate: birthdate,
                            Diver_Qualification: diver_qualif,
                            Instructor_Qualification: instru_qualif,
                            Nox_Level: nitrox_qualif,
                            Additional_Qualifications: additionnal_qualif,
                            License_Number: licence,
                            License_Expiration_Date: licence_date,
                            Medical_Certificate_Expiration_Date: medic_date
                    }
                    user_to_create.password = document.querySelector("#password_create").value;
                    createUser(user_to_create);
            })
    } else {
            confirm_button.innerHTML = "<img src='../../img/loading_animation.svg' alt='loading' class='loading_gif'>";
            confirm_button.style.width = "200px";
            modals.closeCurrent();
            setTimeout(function () {
                    modals.show("confirmation_creation");
            }, 500);
            document.querySelector("#cancelButton").addEventListener("click", function () {
                    modals.closeCurrent();
                    confirm_button.style.width = "200px";
                    confirm_button.innerHTML = "Créer le compte";
            });
            document.querySelector("#validateButton_creation").addEventListener("click", function () {
                    let firstname = document.querySelector("#firstname").value;
                    let lastname = document.querySelector("#lastname").value;
                    let mail = document.querySelector("#mail").value;
                    let phone = document.querySelector("#phone").value;
                    let birthdate = document.querySelector("#birthdate").value;
                    let diver_qualif = document.querySelector("#diver_qualif").value;
                    let instru_qualif = document.querySelector("#instru_qualif").value;
                    let nitrox_qualif = document.querySelector("#nitrox_qualif").value;
                    let additionnal_qualif = document.querySelector("#additionnal_qualif").value;
                    let licence = document.querySelector("#licence").value;
                    let licence_date = document.querySelector("#licence_date").value;
                    let medic_date = document.querySelector("#medic_date").value;
                    let user_to_modify = {
                            Firstname: firstname,
                            Lastname: lastname,
                            Mail: mail,
                            Phone: phone,
                            Birthdate: birthdate,
                            Diver_Qualification: diver_qualif,
                            Instructor_Qualification: instru_qualif,
                            Nox_Level: nitrox_qualif,
                            Additional_Qualifications: additionnal_qualif,
                            License_Number: licence,
                            License_Expiration_Date: licence_date,
                            Medical_Certificate_Expiration_Date: medic_date
                    }
                    user_to_modify.password = document.querySelector("#password_create").value;
                    user_to_modify.oldMail = oldMail;
                    modifyUserInfo(user_to_modify);
            })
    }

});

function openModalConfirmCreate(created) {
    let valid = created;
    document.querySelector("#btn-submit").disabled = false;
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
                    // reload page
                    location.reload();
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
                    location.reload();
            }, 2500);
    }
}



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