/* -------------------------------------------------------------------------- */
/*                              GLOBAL VARIABLES                              */
/* -------------------------------------------------------------------------- */
let my_role;

/* -------------------------------------------------------------------------- */
/*                                   REQUEST                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------- USERTYPE -------------------------------- */
fetch('/auth/dp/palanquee')
    .then(response => {
        const userType = response.headers.get('userType');
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
        if (my_role == "dp") {
            document.querySelectorAll(".user_only").forEach(function (element) {
                element.style.display = "none";
            })
        }
    });

/* ----------------------------- PALANQUEE INFO ----------------------------- */
fetch('/auth/dp/palanquee/get_palanquee', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then(res => {
        console.log(res);
        setPage(res.data);
        let allMails = [];
        res.data.event.allDivers.forEach(user => {
            // if (user.Diver_Role != "DP") {
                allMails.push({
                    userMail: user.Mail
                });
            // }
        })
        createPalanqueeUserQualif(allMails);
    })

/* ---------------------- CREATE PALANQUEE USER QUALIF ---------------------- */
function createPalanqueeUserQualif(data) {
    fetch('/auth/dp/palanquee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            if (res.created == false) window.location.href = "/auth/planning";
            // saveDiveTeam(dataPalanquee)
        })
}
/* ----------------------- SAVE PALANQUEE USER QUALIF ----------------------- */
function savePalanqueeUserQualif(data) {
    fetch('/auth/dp/palanquee', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            window.location.reload();
        })
}

/* ----------------------------- SAVE DIVE TEAM ----------------------------- */
// let dataPalanquee = {
//     1: {    // Numéro palanquée
//         Divers: [{
//                 Mail: "p1@gmail.fr",
//                 Fonction: "Diver",
//                 Qualification: "P2"
//             },
//             {
//                 Mail: "p2@gmail.fr",
//                 Fonction: "Diver",
//                 Qualification: "P2"
//             },
//             {
//                 Mail: "dp@gmail.fr",
//                 Fonction: "GP",
//                 Qualification: "P5"
//             }
//         ],
//         Params: {
//             Palanquee_Type: "Pe",
//             Dive_Type: "Exploration",
//             Max_Depth: 20,
//             Actual_Depth: 10,
//             Max_Duration: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
//             Actual_Duration: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
//             Floor_3: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
//             Floor_6: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
//             Floor_9: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
//             Start_Date: new Date(),
//             End_Date: new Date(),
//         }
//     },
// }

function saveDiveTeam(data) {
    fetch('/auth/dp/palanquee/dive_team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
        .then(res => {
            console.log(res);
            // window.location.reload();
        })
}


/* -------------------------------------------------------------------------- */
/*                                    CODE                                    */
/* -------------------------------------------------------------------------- */

function setPage(data) {
    document.querySelector(".plongeeInfos .date p").innerText = data.dive.Start_Date.split(" ")[0].split("-")[2] + "/" + data.dive.Start_Date.split(" ")[0].split("-")[1] + "/" + data.dive.Start_Date.split(" ")[0].split("-")[0];
    document.querySelector(".plongeeInfos .heure p").innerText = data.dive.Start_Date.split(" ")[1].split(":")[0] + "h" + data.dive.Start_Date.split(" ")[1].split(":")[1];
    document.querySelector(".plongeeInfos .heure p").innerText += " - " + data.dive.End_Date.split(" ")[1].split(":")[0] + "h" + data.dive.End_Date.split(" ")[1].split(":")[1];
    document.querySelector(".plongeeInfos .location .adress_title").innerText = data.event.Location.Site_Name
    document.querySelector(".plongeeInfos .location .adress").innerText = data.event.Location.Track_Number + " " + data.event.Location.Track_Type + " " + data.event.Location.Track_Name + " " + data.event.Location.City_Name + " " + data.event.Location.Zip_Code + " " + data.event.Location.Country_Name;
    document.querySelector(".plongeeInfos .type p").innerText = data.event.Dive_Type;

    let divers = data.event.allDivers;
    document.querySelector(".allDivers").innerHTML = "";
    document.querySelector(".number_divers_").innerText = divers.length - 1 + " plongeur(s)";
    divers.forEach(function (diver) {
        if (diver.Diver_Role == "DP") {
            document.querySelector(".DP_name").innerText = " " + diver.Firstname + " " + diver.Lastname;
        } else {
            let html_ = '<div class="diver_item"><div><p>' + diver.Firstname + ' ' + diver.Lastname + '</p></div><div><p>' + diver.Mail + '</p></div><div><p>' + diver.Phone + '</p></div><div><select name="" id="" class="diver_level">'

            html_ += '<option value="' + diver.Diver_Qualification + '">' + diver.Diver_Qualification + '</option>'
            let currentLevel = diver.Diver_Qualification.split("P")[1];
            if (currentLevel != 5) {
                currentLevel = parseInt(currentLevel);
                currentLevel += 1;
                let nextLevel = data.listMaxDepth[currentLevel + 4];

                html_ += '<option value="Pe' + nextLevel.Guided_Diver_Depth + '">' + "Pe" + nextLevel.Guided_Diver_Depth + '</option>'
                html_ += '<option value="Pa' + nextLevel.Autonomous_Diver_Depth + '">Pa' + nextLevel.Autonomous_Diver_Depth + '</option>'
                html_ += '</select><i style="opacity:0;color:#f2574a" class="fa-solid fa-triangle-exclamation"></i></div></div>';
                document.querySelector(".allDivers").innerHTML += html_;
            }
            document.querySelectorAll(".diver_level").forEach(function (element) {
                divers.forEach(function (diver_) {
                    if (diver_.Temporary_Qualification != "" && diver_.Firstname + " " + diver_.Lastname == element.parentElement.parentElement.children[0].children[0].innerText) {
                        element.value = diver_.Temporary_Qualification;
                    }
                    if (element.value.includes("Pe") || element.value.includes("Pa")) {
                        element.parentElement.querySelector("i").style.opacity = "1";
                        element.parentElement.title = "Vous êtes responsable du changement de niveau du plongeur";

                    } else {
                        element.parentElement.querySelector("i").style.opacity = "0";
                        element.parentElement.title = "";
                    }
                })
            })
        }
    })
    document.querySelectorAll(".diver_level").forEach(function (element) {
        element.addEventListener("change", function () {
            if (element.value.includes("Pe") || element.value.includes("Pa")) {
                element.parentElement.querySelector("i").style.opacity = "1";
                element.parentElement.title = "Vous êtes responsable du changement de niveau du plongeur";

            } else {
                element.parentElement.querySelector("i").style.opacity = "0";
                element.parentElement.title = "";
            }
        })
    })
    createAllPalanquee(data);
    numberpalanquee = 0;
    addPalanquee(data);

    loadingClose();
};

function addPalanquee(data) {
    numberpalanquee += 1;
    document.querySelector(".palanquee_" + numberpalanquee).style.display = "flex";
    if (numberpalanquee < Math.floor(data.event.allDivers.length / 2)) {
        add_buttons(data);
    } else {
        add_buttons(data);
        document.querySelector(".add_palanquee").style.display = "none";
    }

}



function setupSelect(data) {
    let divers = data.event.allDivers;
    let container = document.querySelectorAll(".diver_item_container");
    container.forEach(function (element_) {
        element_.querySelectorAll("select").forEach(function (select) {
            select.innerHTML = "";
            let option = document.createElement("option");
            option.value = "";
            option.innerText = "Sélectionnez un plongeur";
            select.appendChild(option);
            divers.forEach(function (diver) {
                    option = document.createElement("option");
                    option.value = diver.Mail;
                    option.innerText = diver.Firstname + " " + diver.Lastname;
                    select.appendChild(option);
            })
        })
    })

    document.querySelectorAll(".diver_item_container").forEach(function (element_) {
        element_.querySelectorAll("select").forEach(function (select) {
            select.removeEventListener("change", function () {});
        })
    })
    let active = [];
    document.querySelectorAll(".diver_item_container").forEach(function (element_) {
        // get last select child in element_ and display none
        element_.children[element_.children.length - 1].style.display = "none";
        element_.children[element_.children.length - 1].style.opacity = "0";
    })
    document.querySelectorAll(".diver_item_container").forEach(function (element_) {
        element_.querySelectorAll(".diver_item").forEach(function (select) {
            select.addEventListener("change", function () {
                changeSelectToDIV(active, data);
                active = [];
                document.querySelectorAll(".diver_item_container").forEach(function (e) {
                    e.querySelectorAll(".select").forEach(function (element) {
                        if (element.querySelector(".select-input").innerText != "Sélectionnez un plongeur") {
                            active.push(element.querySelector(".select-input").innerText.split("\n")[0]);
                        }

                    })
                    changeSelectToDIV(active, data);
                })
            })
        })
    })
}

function changeSelectToDIV(active, data) {
    let to_display = [];
    //remove active array to all divers array
    data.event.allDivers.forEach(function (diver) {
        if (!active.includes(diver.Firstname + " " + diver.Lastname)) {
            to_display.push(diver);
        }
    })
    console.log(to_display);
    document.querySelectorAll(".diver_item_container").forEach(function (list) {
        list.children[list.children.length - 1].style.display = "none";
        list.children[list.children.length - 1].style.opacity = "0";
        for (let select of list.children) {
            if (select.tagName == "LABEL") {
                try {
                    let s = select.querySelectorAll("li")
                    s.forEach(function (element) {
                        select.removeChild(element);
                    })
                    select.removeChild(s);
                } catch (error) {}
                let list_ = select.querySelector(".option-list");
                let html_tag = "<li data-text='Sélectionnez un plongeur' class=active><a>Sélectionnez un plongeur</a></li>";
                list_.innerHTML = html_tag;
                to_display.forEach(function (diver) {
                        html_tag = "<li class=option><a><div class=option_container><div class=name_item><h2>" + diver.Firstname + " " + diver.Lastname + "</h2><span>" + diver.Mail + "</span></div><div class=level>" + (diver.Temporary_Qualification != "" ? diver.Temporary_Qualification : diver.Diver_Qualification) + "</div></div></a></li>";
                        list_.innerHTML += html_tag;
                })
            }
        }
    })
}

function loadingClose() {
    document.querySelector(".loading_animation").style.opacity = "0";
    setTimeout(function () {
        document.querySelector(".loading_animation").style.display = "none";
    }, 500);
}

var emergencyButton = document.getElementById("emergencyButton");
var emergencyModal = document.getElementById("emergencyModal");

emergencyButton.addEventListener("click", function () {
    modals.show("emergencyModal", function () {
        menutoggle.classList.remove('active');
    });
    menutoggle.classList.toggle('active');
    menutoggle.classList.toggle('close-modal');
    document.querySelector("#emergencyModal .download_button").addEventListener("click", function () {
        location.href = "/auth/incident_rapport"
        modals.closeCurrent();
    })
});

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

let scroll_value = 0; // scroll from left in vw
let scroll_dot_value = 0;
let dots = document.querySelectorAll(".dot");
document.querySelector(".button_next").addEventListener("click", function () {
    scroll_value += $(window).width();
    document.querySelector(".scroll").scrollTo(scroll_value, 0);
    if (scroll_dot_value < dots.length - 1) scroll_dot_value += 1;
    updateDot();
})

document.querySelector(".button_prec").addEventListener("click", function () {
    scroll_value -= $(window).width();
    document.querySelector(".scroll").scrollTo(scroll_value, 0);
    if (scroll_dot_value > 0) scroll_dot_value -= 1;
    updateDot();
})

function updateDot() {
    dots.forEach(function (element) {
        element.classList.remove("active");
    })
    dots[scroll_dot_value].classList.add("active");
    if (scroll_dot_value == 0) {
        document.querySelector(".button_prec").style.display = "none";
        document.querySelector(".button_prec").style.opacity = "0";

    } else {
        document.querySelector(".button_prec").style.display = "flex";
        document.querySelector(".button_prec").style.opacity = "1";
    }
    if (scroll_dot_value == dots.length - 1) {
        document.querySelector(".button_next").style.display = "none";
        document.querySelector(".button_next").style.opacity = "0";
    } else {
        document.querySelector(".button_next").style.display = "flex";
        document.querySelector(".button_next").style.opacity = "1";
    }
}

document.querySelector(".save_change_level").addEventListener("click", function () {
    let data = [];
    document.querySelectorAll(".divers .diver_item").forEach(function (element) {
        let tmp = {
            userMail: element.children[1].children[0].innerText,
            tmpQualif: element.querySelector(".diver_level").value
        }
        data.push(tmp);
    })
    console.log("Change Level");
    console.log(data);
    //? Save button change level
    savePalanqueeUserQualif(data);
})

let numberpalanquee = 1

function createAllPalanquee(data) {
    let final = "";
    // for (let i = 1; i <= data.event.allDivers.length / 2; i++) {
    for (let i = 1; i <= Math.floor(data.event.allDivers.length / 2); i++) {

        let html_tag = '<div class="palanquee_item palanquee_' + i + '">'
        html_tag += '<div class="palanquee_title">'
        html_tag += '<h2>Palanquée ' + i + '</h2>'
        html_tag += '</div>'
        html_tag += '<div class="palanquee_infos">'
        html_tag += '<select required data-role="select" name="" id="" class="palanquee_type">'
        html_tag += '<option value="">Sélectionnez un type de palanquée</option>'
        html_tag += '<option value="Pe">Palanquée encadrée</option>'
        html_tag += '<option value="Pa">Palanquée autonome</option>'
        html_tag += '</select>'
        html_tag += '</div>'
        html_tag += '<div class="infos_container">'
        html_tag += '<div class="diver_list">'
        html_tag += '<h2>Plongeurs</h2>'
        html_tag += '<div class="diver_item_container diver_item_container' + i + '">'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item" style="display:none;">'
        html_tag += '</select>'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '<div class="fonction_container">'
        html_tag += '<h2>Fonction</h2>'
        html_tag += '<div class="fonction_select_container">'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="">Plongeur</option>'
        html_tag += '<option value="">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="">Plongeur</option>'
        html_tag += '<option value="">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="">Plongeur</option>'
        html_tag += '<option value="">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="">Plongeur</option>'
        html_tag += '<option value="">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="">Plongeur</option>'
        html_tag += '<option value="">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">GP</option>'
        html_tag += '</select>'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '<div class="param_container">'
        html_tag += '<h2>Paramètres</h2>'
        html_tag += '<div class="contain">'
        html_tag += '<div class="prevu">'
        html_tag += '<h2>Prévus</h2>'
        html_tag += '<input type="number" data-role="input" data-prepend="Profondeur : " data-append="m">'
        html_tag += '<input type="time" data-role="input" data-prepend="Temps : " data-append="min">'
        html_tag += '</div>'
        html_tag += '<div class="prevu">'
        html_tag += '<h2>Réels</h2>'
        html_tag += '<input type="number" data-role="input" data-prepend="Profondeur : " data-append="m">'
        html_tag += '<input type="time" data-role="input" data-prepend="Temps : " data-append="min">'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '<div class="contain2">'
        html_tag += '<h2>Paliers</h2>'
        html_tag += '<input type="number" data-role="input" data-prepend="3m : " data-append="min">'
        html_tag += '<input type="number" data-role="input" data-prepend="6m : " data-append="min">'
        html_tag += '<input type="number" data-role="input" data-prepend="9m : " data-append="min">'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '<div class="time_container">'
        html_tag += '<div class="time">'
        html_tag += '<h2>Heure de départ</h2>'
        html_tag += '<input type="time" data-role="input">'
        html_tag += '</div>'
        html_tag += '<div class="time">'
        html_tag += '<h2>Heure de retour</h2>'
        html_tag += '<input type="time" data-role="input">'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '</div>'

        final += html_tag;
    }
    document.querySelector(".palanquee_table").innerHTML = final;


    setupSelect(data);
    for (let i = 2; i <= Math.floor(data.event.allDivers.length / 2); i++) {
        try {
            document.querySelector(".palanquee_" + i).style.display = "none";
        } catch (error) {}
    }


}

function add_buttons(data) {
    let html_tag = '<div class="button_save_container_palanquee">'
    html_tag += '<div class="save_button add_palanquee" style="margin-top:0px;">'
    html_tag += '<i class="fas fa-plus"></i>'
    html_tag += '</div>'
    html_tag += '<div class="save_button save_change_palanquee">'
    html_tag += 'Sauvegarder'
    html_tag += '</div>'
    html_tag += '</div>'

    try {
        document.querySelector(".add_palanquee").removeEventListener("click", function () {});
        document.querySelector(".palanquee_table").removeChild(document.querySelector(".button_save_container_palanquee"));
    } catch (error) {}
    // In palanquee table, add html_tag after palanquee_+numberpalanquee
    document.querySelector(".palanquee_" + numberpalanquee).insertAdjacentHTML('afterend', html_tag);
    document.querySelector(".add_palanquee").addEventListener("click", function () {
        addPalanquee(data);
    })
    document.querySelector(".save_change_palanquee").addEventListener("click", function () {
        savePalanquee(data);
    })
}

function savePalanquee(d) {
    let data = [];
    let palanquees = document.querySelectorAll(".palanquee_item");
    for (let i = 0; i < palanquees.length; i++) {
        let palanquee_ = {
            Index: i + 1,
            Divers: [],
            Params: {
                Palanquee_Type: "",
                Time_Start: "",
                Time_End: "",
                Max_Depth_Prevu: "",
                Max_Depth_Actuel: "",
                Max_Duration_Prevu: "",
                Max_Duration_Actuel: "",
                Floor_3: "",
                Floor_6: "",
                Floor_9: "",
            }
        }
        for (let j = 1; j < 7; j++) {
            let diver = {
                Mail: "",
                Fonction: "",
                Qualification: ""
            }
            if (palanquees[i].querySelector(".diver_item_container  ").children[j - 1].querySelector(".select-input").innerText != "Sélectionnez un plongeur") {
                console.log("Un diver")
                let diver_ = palanquees[i].querySelector(".diver_item_container ").children[j - 1];
                let user = diver_.querySelector(".select-input").innerText.split("\n")[0];
                // find mail of user using find
                let user_ = d.event.allDivers.find(x => x.Firstname + " " + x.Lastname == user);
                diver.Mail = user_.Mail;
                let function_ = palanquees[i].querySelector(".fonction_select_container").children[j - 1].querySelector(".select-input").innerText;
                diver.Fonction = function_;
                let qualification = diver_.querySelector(".select-input").innerText.split("\n")[1];
                diver.Qualification = qualification;
                palanquee_.Divers.push(diver);
            }
        }
        palanquee_.Params.Palanquee_Type = palanquees[i].querySelector(".palanquee_type").querySelector(".select-input").innerText;
        palanquee_.Params.Time_Start = palanquees[i].querySelector(".time_container").children[0].querySelector("input").value;
        palanquee_.Params.Time_End = palanquees[i].querySelector(".time_container").children[1].querySelector("input").value;
        palanquee_.Params.Max_Depth_Prevu = palanquees[i].querySelector(".contain").children[0].querySelectorAll("input")[0].value;
        palanquee_.Params.Max_Depth_Actuel = palanquees[i].querySelector(".contain").children[1].querySelectorAll("input")[0].value;
        palanquee_.Params.Max_Duration_Prevu = palanquees[i].querySelector(".contain").children[0].querySelectorAll("input")[1].value;
        palanquee_.Params.Max_Duration_Actuel = palanquees[i].querySelector(".contain").children[1].querySelectorAll("input")[1].value;
        palanquee_.Params.Floor_3 = palanquees[i].querySelector(".contain2").querySelectorAll("input")[0].value;
        palanquee_.Params.Floor_6 = palanquees[i].querySelector(".contain2").querySelectorAll("input")[1].value;
        palanquee_.Params.Floor_9 = palanquees[i].querySelector(".contain2").querySelectorAll("input")[2].value;

        data.push(palanquee_);
    }
    console.log(data);
    // TODO : champs temps paliers
    // TODO : index début objet (0/1)
    // saveDiveTeam(data);
}