/* -------------------------------------------------------------------------- */
/*                              GLOBAL VARIABLES                              */
/* -------------------------------------------------------------------------- */
let my_role;

function openErrorModal(e) {
    modals.closeCurrent();
    setTimeout(function () {
        modals.show("error_occured");
        document.querySelector("#error_occured p").innerText = e;
        setTimeout(function () {
            modals.closeCurrent();
        }, 3000);
    }, 500);
}
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
        if (my_role == "user") {
            document.querySelector(".my_profile_menu").style.display = "flex";
            document.querySelector(".locations_menu").style.display = "none";
            document.querySelector(".club_members_menu").style.display = "none";
        }
        if (my_role == "dp") {
            document.querySelector(".my_profile_menu").style.display = "flex";
            document.querySelector(".locations_menu").style.display = "none";
            document.querySelector(".club_members_menu").style.display = "none";
        }
        if (my_role == "club") {
            document.querySelector(".my_profile_menu").style.display = "none";
            document.querySelector(".locations_menu").style.display = "flex";
            document.querySelector(".club_members_menu").style.display = "flex";
        }

    });

/* ----------------------------- PALANQUEE INFO ----------------------------- */
let ev_;
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
        ev_ = res.data.event;
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
            if (res.created) {
                modals.show("success");
                document.querySelector("#success_message").innerText = res.comment;
                setTimeout(function () {
                    modals.closeCurrent();
                    window.location.reload();

                }, 1500);
            } else {
                // Open error
                openErrorModal(res.comment);
                setTimeout(function () {
                    modals.closeCurrent();
                    window.location.reload();
                }, 1500);
            }
        })
}

/* ----------------------------- SAVE DIVE TEAM ----------------------------- */
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
            if (res.comment != "Palanquées correctement ajoutées") {
                // Open error
                openErrorModal(res.comment);
            } else {
                modals.show("success");
                document.querySelector("#success_message").innerText = res.comment;
                setTimeout(function () {
                    modals.closeCurrent();
                    window.location.reload();
                }, 1500);
            }
        })
}

async function saveDiveTeamPDF(data) {
    return new Promise((resolve, reject) => {
        fetch('/auth/dp/palanquee/dive_team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(res => res.json())
            .then(res => {
                console.log(res);
                if (res.comment != "Palanquées correctement ajoutées") {
                    // Open error
                    setTimeout(function () {
                        openErrorModal(res.comment);
                        window.location.reload();
                        resolve(false)
                    }, 3000);
                } else {
                    modals.show("success");
                    document.querySelector("#success_message").innerText = res.comment;
                    setTimeout(function () {
                        modals.closeCurrent();
                    }, 1500);
                    resolve(true)
                }
            })
    })
}

/* --------------------------- GENERATE DIVE TEAM --------------------------- */
function generateDiveTeam() {
    fetch('/auth/dp/palanquee/automatic_dive_team', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => res.json())
        .then(res => {
            console.log(res);
            if (res.dataError.success) {
                const data = {
                    palanquee: res.palanquee,
                    event: ev_
                }
                createAllPalanquee(data);
                add_buttons(data)   ;
            } else {
                // open error modal
                openErrorModal(res.dataError.comment);
            }
        })
}

/* -------------------------------- SEND PDF -------------------------------- */
function sendPdf(blob) {
    let formData = new FormData();
    formData.append('file', blob, "palanquee.pdf");
    fetch('/auth/dp/palanquee/upload', {
            method: 'POST',
            body: formData,
        }).then(res => res.json())
        .then(res => {
            console.log(res);
            if (res.success) window.location.href = "/auth/planning";
            else openErrorModal(res.comment);
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

    document.querySelector("#surface").value = data.dive.Surface_Security;
    if (data.dive.Last_Modif != "") {
        let date = new Date(data.dive.Last_Modif);
        document.querySelector(".last_modif").innerText = "Dernière modification le " + date.toLocaleDateString() + " à " + date.toLocaleTimeString();
    } else {
        document.querySelector(".last_modif").style.display = "none";
    }

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
    numberpalanquee = data.palanquee.length != 0 ? data.palanquee.length - 1 : 0;
    addPalanquee(data);

    loadingClose();
};

function addPalanquee(data) {
    numberpalanquee += 1;
    document.querySelector(".palanquee_" + numberpalanquee).style.display = "flex";
    if (numberpalanquee < Math.ceil(data.event.allDivers.length / 2)) {
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
    
    document.querySelectorAll(".diver_item_container").forEach(function (element_) {
        // get last select child in element_ and display none
        element_.children[element_.children.length - 1].style.display = "none";
        element_.children[element_.children.length - 1].style.opacity = "0";
    })

    let active = [];
    data.palanquee.forEach(function (palanquee) {
        palanquee.Diver.forEach(function (diver) {
            active.push(diver.Firstname + " " + diver.Lastname);
        })
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
                })
                changeSelectToDIV(active, data);
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
    document.querySelectorAll(".diver_item_container").forEach(function (list) {
        list.children[list.children.length - 1].style.display = "none";
        list.children[list.children.length - 1].style.opacity = "0";
        for (let select of list.children) {
            if (select.tagName == "LABEL") {
                active.forEach(function (diver) {
                    // get diver from all divers
                    let diver_ = data.event.allDivers.find(diver_ => diver_.Firstname + " " + diver_.Lastname == diver);
                    if (select.querySelector(".select-input").innerText == diver) {
                        select.querySelector(".select-input").innerHTML = "<div class=option_container><div class=name_item><h2>" + diver_.Firstname + " " + diver_.Lastname + "</h2><span>" + diver_.Mail + "</span></div><div class=level>" + (diver_.Temporary_Qualification != "" ? diver_.Temporary_Qualification : diver_.Diver_Qualification) + "</div></div>";
                    }
                })
                let list_ = select.querySelector(".option-list");
                let html_tag = "<li data-text='Sélectionnez un plongeur'><a>Sélectionnez un plongeur</a></li>";
                list_.innerHTML = html_tag;
                to_display.forEach(function (diver) {
                    html_tag = "<li data-value='" + diver.Mail + "' class=option><a><div class=option_container><div class=name_item><h2>" + diver.Firstname + " " + diver.Lastname + "</h2><span>" + diver.Mail + "</span></div><div class=level>" + (diver.Temporary_Qualification != "" ? diver.Temporary_Qualification : diver.Diver_Qualification) + "</div></div></a></li>";
                    list_.innerHTML += html_tag;
                })
            }
        }
    })
}

function setDiversImported(data) {
    let palanquee = data.palanquee;
    for (let i = 0; i < palanquee.length; i++) {
        let palanquee_ = palanquee[i];
        let divers = palanquee_.Diver;
        let container = document.querySelectorAll(".diver_item_container")[i];
        for (let j = 0; j < divers.length; j++) {
            let diver = divers[j];
            let select = container.querySelectorAll("select")[j];
            console.log(select)
            select.value = diver.Mail;
        }
    }
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
    document.querySelector(".scroll_container").scrollTo(scroll_value, 0);
    if (scroll_dot_value < dots.length - 1) scroll_dot_value += 1;
    updateDot();
})

document.querySelector(".button_prec").addEventListener("click", function () {
    scroll_value -= $(window).width();
    document.querySelector(".scroll_container").scrollTo(scroll_value, 0);
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
    document.querySelector(".save_change_level").disabled = true;
    setTimeout(function () {
        document.querySelector(".save_change_level").disabled = false;
    }, 1000);
    let data = [];
    document.querySelectorAll(".divers .diver_item").forEach(function (element) {
        let tmp = {
            userMail: element.children[1].children[0].innerText,
            tmpQualif: element.querySelector(".diver_level").value
        }
        data.push(tmp);
    })
    let to_send = {
        data: data,
        surface: document.querySelector("#surface").value,
    }
    savePalanqueeUserQualif(to_send);
})

let numberpalanquee = 1

function createAllPalanquee(data) {
    let final = "";
    for (let i = 1; i <= Math.ceil(data.event.allDivers.length / 2); i++) {

        let html_tag = '<div class="palanquee_item palanquee_' + i + '">'
        html_tag += '<div class="palanquee_title">'
        html_tag += '<h2>Palanquée ' + i + '</h2>'
        html_tag += '</div>'
        html_tag += '<div class="palanquee_infos">'
        html_tag += '<div class="button_auto">'
        html_tag += 'Générer les palanquées automatiquement'
        html_tag += '</div>'
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
        html_tag += '<option value="Plongeur">Plongeur</option>'
        html_tag += '<option value="GP">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="Plongeur">Plongeur</option>'
        html_tag += '<option value="GP">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="Plongeur">Plongeur</option>'
        html_tag += '<option value="GP">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="Plongeur">Plongeur</option>'
        html_tag += '<option value="GP">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="Plongeur">Plongeur</option>'
        html_tag += '<option value="GP">GP</option>'
        html_tag += '</select>'
        html_tag += '<select data-role="select" name="" id="" class="diver_item">'
        html_tag += '<option value="">Sélectionnez une fonction</option>'
        html_tag += '<option value="Plongeur">Plongeur</option>'
        html_tag += '<option value="GP">GP</option>'
        html_tag += '</select>'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '<div class="param_container">'
        html_tag += '<h2>Paramètres</h2>'
        html_tag += '<div class="contain">'
        html_tag += '<div class="prevu">'
        html_tag += '<h2>Prévus</h2>'
        html_tag += '<input type="number" data-role="input" data-prepend="Profondeur : " data-append="m">'
        html_tag += '<input type="time" data-role="input" data-prepend="Temps : " data-append="h">'
        html_tag += '</div>'
        html_tag += '<div class="prevu">'
        html_tag += '<h2>Réels</h2>'
        html_tag += '<input type="number" data-role="input" data-prepend="Profondeur : " data-append="m">'
        html_tag += '<input type="time" data-role="input" data-prepend="Temps : " data-append="h">'
        html_tag += '</div>'
        html_tag += '</div>'
        html_tag += '<div class="contain2">'
        html_tag += '<h2>Paliers</h2>'
        html_tag += '<input type="time" data-role="input" data-prepend="3m : " data-append="h">'
        html_tag += '<input type="time" data-role="input" data-prepend="6m : " data-append="h">'
        html_tag += '<input type="time" data-role="input" data-prepend="9m : " data-append="h">'
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
    if (data.event.Dive_Type == "Exploration") {
        document.querySelector(".button_auto").style.display = "flex";
    } else {
        document.querySelector(".button_auto").style.display = "none";
        document.querySelector(".palanquee_type").value = "Pe";
        document.querySelector(".palanquee_type").disabled = true;
    }
    
    setupSelect(data);
    setDiversImported(data);
    setPalanqueeReceived(data.palanquee);

    for (let i = data.palanquee.length + 1; i <= Math.ceil(data.event.allDivers.length / 2); i++) {
        try {
            document.querySelector(".palanquee_" + i).style.display = "none";
            document.querySelector(".palanquee_" + i).querySelector(".button_auto").style.display = "none";
        } catch (error) {}
    }
    numberpalanquee = data.palanquee.length != 0 ? data.palanquee.length : 1;
    add_buttons(data);
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
    html_tag += '<div class="checkbox_container">'
    html_tag += '<input type="checkbox" name="" id="checkbox_responsability">'
    html_tag += '<label for="checkbox">En cochant cette case, je reconnais que ma responsabilité est engagée pour cette plongée</label>'
    html_tag += '</div>'
    html_tag += '<button id="pdfButton">Sauvegarder définitivement et générer le PDF</button>'

    try {
        document.querySelectorAll(".button_auto").forEach(function (element) {
            element.removeEventListener("click", function Remov() {});
        })
        document.querySelector(".add_palanquee").removeEventListener("click", function () {});
        document.querySelector(".palanquee_table").removeChild(document.querySelector(".button_save_container_palanquee"));
        document.querySelector(".palanquee_table").removeChild(document.querySelector(".checkbox_container"));
        document.querySelector(".palanquee_table").removeChild(document.querySelector("#pdfButton"));
    } catch (error) {}
    // In palanquee table, add html_tag after palanquee_+numberpalanquee
    document.querySelector(".palanquee_" + numberpalanquee).insertAdjacentHTML('afterend', html_tag);
    document.querySelector("#checkbox_responsability").addEventListener("change", function () {
        if (this.checked) {
            document.querySelector("#pdfButton").style.display = "flex";
            document.querySelector(".palanquee_table").scrollTo(0, document.querySelector(".palanquee_table").scrollHeight);
        } else {
            document.querySelector("#pdfButton").style.display = "none";
        }
    })
    document.querySelectorAll(".button_auto").forEach(function (element) {
        element.removeEventListener("click", function removeee() {});
    })
    document.querySelectorAll(".button_auto").forEach(function (element) {
        element.addEventListener("click", function clickAuto (e) {
            document.querySelector(".button_auto").disabled = true;
            e.preventDefault();
            e.stopPropagation();
            generateDiveTeam();
            setTimeout(function () {
                document.querySelector(".button_auto").disabled = false;
            }, 1000);
        })
    })
    document.querySelector("#pdfButton").addEventListener("click", function () {
        generatePDF(data);
    })

    document.querySelector(".add_palanquee").addEventListener("click", function addPal() {
        document.querySelector(".add_palanquee").disabled = true;
        addPalanquee(data);
        setTimeout(function () {
            document.querySelector(".add_palanquee").disabled = false;
        }, 1000);
    })
    document.querySelector(".save_change_palanquee").addEventListener("click", function () {
        document.querySelector(".save_change_palanquee").disabled = true;
        savePalanquee(data, true);
        setTimeout(function () {
            document.querySelector(".save_change_palanquee").disabled = false;
        }, 1000);
    })
}

async function savePalanquee(d, bool) {
    let data = {};
    let palanquees = document.querySelectorAll(".palanquee_item");
    for (let i = 0; i < palanquees.length; i++) {
        let palanquee_ = {
            Index: i + 1,
            Divers: [],
            Params: {
                Palanquee_Type: "",
                Start_Date: "",
                End_Date: "",
                Max_Depth: "",
                Actual_Depth: "",
                Max_Duration: "",
                Actual_Duration: "",
                Floor_3: "",
                Floor_6: "",
                Floor_9: "",
                Dive_Type: ""
            }
        }
        for (let j = 1; j < 7; j++) {
            let diver = {
                Mail: "",
                Fonction: "",
                Qualification: ""
            }
            if (palanquees[i].querySelector(".diver_item_container  ").children[j - 1].querySelector(".select-input").innerText != "Sélectionnez un plongeur") {
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
        palanquee_.Params.Palanquee_Type = palanquees[i].querySelector(".palanquee_type").querySelector(".select-input").innerText == "Palanquée encadrée" ? "Pe" : "Pa";
        if(palanquees[i].querySelector(".palanquee_type").querySelector(".select-input").innerText == "Sélectionnez un type de palanquée") palanquee_.Params.Palanquee_Type = "";
        palanquee_.Params.Start_Date = palanquees[i].querySelector(".time_container").children[0].querySelector("input").value;
        palanquee_.Params.Start_Date = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.Start_Date);
        palanquee_.Params.End_Date = palanquees[i].querySelector(".time_container").children[1].querySelector("input").value;
        palanquee_.Params.End_Date = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.End_Date);
        palanquee_.Params.Max_Depth = palanquees[i].querySelector(".contain").children[0].querySelectorAll("input")[0].value;
        palanquee_.Params.Actual_Depth = palanquees[i].querySelector(".contain").children[1].querySelectorAll("input")[0].value;
        palanquee_.Params.Max_Duration = palanquees[i].querySelector(".contain").children[0].querySelectorAll("input")[1].value;
        palanquee_.Params.Max_Duration = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.Max_Duration);
        palanquee_.Params.Actual_Duration = palanquees[i].querySelector(".contain").children[1].querySelectorAll("input")[1].value;
        palanquee_.Params.Actual_Duration = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.Actual_Duration);
        palanquee_.Params.Floor_3 = palanquees[i].querySelector(".contain2").querySelectorAll("input")[0].value;
        palanquee_.Params.Floor_3 = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.Floor_3);
        palanquee_.Params.Floor_6 = palanquees[i].querySelector(".contain2").querySelectorAll("input")[1].value;
        palanquee_.Params.Floor_6 = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.Floor_6);
        palanquee_.Params.Floor_9 = palanquees[i].querySelector(".contain2").querySelectorAll("input")[2].value;
        palanquee_.Params.Floor_9 = new Date(d.event.Start_Date.split(" ")[0] + " " + palanquee_.Params.Floor_9);
        palanquee_.Params.Dive_Type = d.event.Dive_Type;
        if (palanquee_.Divers.length > 0) {
            let auth = true;
            // Iterate through param to check if all param are filled
            for (const [key, value] of Object.entries(palanquee_.Params)) {
                if (value == "") {
                    auth = false;
                }
            }
            if (auth) data[i + 1] = palanquee_;
            else {
                // Orange border for all input not filled
                palanquees[i].querySelectorAll("input").forEach(function (element) {
                    if (element.value == "") {
                        element.style.borderColor = "#f2574a";
                        openErrorModal("Veuillez remplir tous les champs");
                        setTimeout(function () {
                            element.style.borderColor = "#120B8F";
                            modals.closeCurrent();
                        }, 2000);
                    }
                })
            }
        }
    }
    if (bool) saveDiveTeam(data);
    else {
        let ok = await saveDiveTeamPDF(data);
        return ok;
    }
}

function setPalanqueeReceived(data) {
    let palanquees = document.querySelectorAll(".palanquee_item");
    palanquees.forEach(function (element) {
        element.style.display = "none";
    })
    for (let i = 0; i < data.length; i++) {
        let palanquee = palanquees[i];
        palanquee.style.display = "flex";
        let palanquee_ = data[i];

        // Palanquee Type
        palanquee.querySelector(".palanquee_type").value = palanquee_.Params.Palanquee_Type == "Pe" ? "Pe" : "Pa";

        // Start and end date
        palanquee.querySelector(".time_container").children[0].querySelector("input").value = new Date(palanquee_.Params.Start_Date).toLocaleTimeString();
        palanquee.querySelector(".time_container").children[1].querySelector("input").value = new Date(palanquee_.Params.End_Date).toLocaleTimeString();
        // Max depth and duration
        palanquee.querySelector(".contain").children[0].querySelectorAll("input")[0].value = Math.round(palanquee_.Params.Max_Depth);
        palanquee.querySelector(".contain").children[0].querySelectorAll("input")[1].value = palanquee_.Params.Max_Duration.split(":")[0] + ":" + palanquee_.Params.Max_Duration.split(":")[1];
        palanquee.querySelector(".contain").children[1].querySelectorAll("input")[0].value = Math.round(palanquee_.Params.Actual_Depth);
        palanquee.querySelector(".contain").children[1].querySelectorAll("input")[1].value = palanquee_.Params.Actual_Duration.split(":")[0] + ":" + palanquee_.Params.Actual_Duration.split(":")[1];
        // Floor 3,6,9
        palanquee.querySelector(".contain2").querySelectorAll("input")[0].value = palanquee_.Params.Floor_3.split(":")[0] + ":" + palanquee_.Params.Floor_3.split(":")[1];
        palanquee.querySelector(".contain2").querySelectorAll("input")[1].value = palanquee_.Params.Floor_6.split(":")[0] + ":" + palanquee_.Params.Floor_6.split(":")[1];
        palanquee.querySelector(".contain2").querySelectorAll("input")[2].value = palanquee_.Params.Floor_9.split(":")[0] + ":" + palanquee_.Params.Floor_9.split(":")[1];
        // Divers
        let divers = palanquee_.Diver;
        for (let j = 0; j < divers.length; j++) {
            palanquee.querySelector(".diver_item_container").children[j].value = divers[j].Mail;
            palanquee.querySelector(".fonction_select_container").children[j].value = divers[j].Fonction;
        }
    }
}

function generatePDF(data) {
    let date = new Date();
    document.querySelector(".last_modif").innerText = "Dernière modification le " + date.toLocaleDateString() + " à " + date.toLocaleTimeString();
    // open loading animation
    document.querySelector(".loading_animation").style.display = "flex";
    setTimeout(function () {
        document.querySelector(".loading_animation").style.opacity = "1";
    }, 500);
    setTimeout(function () {
        let div =
            document.querySelector(".palanquee_table");
        div.style.height = "fit-content";
        $(".palanquee_table").css("max-height", "none");
        document.querySelector(".scroll_container div").style.flexDirection = "column";
        document.querySelector(".scroll_container div").style.height = "auto";

        document.querySelector(".scroll_container").style.height = "auto";
        document.querySelector(".scroll_container").scrollTo(0, 0);
        document.querySelector(".scroll_container").style.overflow = "visible";
        div.scrollTo(0, 0);
        div.style.overflow = "visible";
        document.querySelector(".button_save_container_palanquee").style.display = "none";
        document.querySelector("#pdfButton").style.display = "none";
        document.querySelector(".save_change_level").style.display = "none";
        document.querySelector(".scrollDots").style.display = "none";

        let pdf;
        html2canvas(document.querySelector(".diveInfos")).then(function (canvas) {
            // set to pdf and scale to A4 without changing ratio
            let imgData = canvas.toDataURL('image/png');
            pdf = new jsPDF('l', 'pt', [canvas.width, canvas.height + 20]);
            const pdfWidth = pdf.internal.pageSize.width;
            const pdfHeight = canvas.height * pdfWidth / canvas.width;
            pdf.setFontSize(10);
            pdf.setFont('helvetica');
            pdf.setTextColor(0, 0, 0);
            // pdf.text(pdfWidth / 2 - 30, pdf.internal.pageSize.height / 2 - 20, "Résumé de la plongée");
            pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);

            html2canvas(document.querySelector(".divers")).then(function (canvas) {
                let imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.width;
                const pdfHeight = canvas.height * pdfWidth / canvas.width;
                pdf.addPage(pdfWidth, pdfHeight + 20);
                pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
                html2canvas(div).then(async function (canvas) {
                    // set to pdf and scale to A4 without changing ratio
                    let imgData = canvas.toDataURL('image/png');
                    const pdfWidth = pdf.internal.pageSize.width;
                    const pdfHeight = canvas.height * pdfWidth / canvas.width;
                    pdf.addPage(pdfWidth, pdfHeight + 25);

                    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
                    let name = "PAL_"
                    let ok = await savePalanquee(data, false)
                    if (ok) {
                        name += ".pdf"
                        let pdf_ = pdf.output('blob');
                        sendPdf(pdf_);
                    }
                })
            })
        })


    }, 1000);
}