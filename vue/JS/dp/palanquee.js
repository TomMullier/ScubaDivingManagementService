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
            if (user.Diver_Role != "DP") {
                allMails.push({
                    userMail: user.Mail
                });
            }
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
            window.location.reload();
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
            
            html_ += '<option value="'+diver.Diver_Qualification+'">' + diver.Diver_Qualification + '</option>'
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
                if(diver.Temporary_Qualification != ""){
                        element.value = diver.Temporary_Qualification;
                }
                if (element.value.includes("Pe") || element.value.includes("Pa")) {
                    element.parentElement.querySelector("i").style.opacity = "1";
                    element.parentElement.title = "Vous êtes responsable du changement de niveau du plongeur";
    
                } else {
                    element.parentElement.querySelector("i").style.opacity = "0";
                    element.parentElement.title = "";
                }
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

    // Set all selects
    document.querySelector(".diver_item_container").querySelectorAll(".select").forEach(function (select) {
        let list = select.querySelector(".option-list");
        let html_tag = "<li data-text='Sélectionnez un plongeur' class=active><a>Sélectionnez un plongeur</a></li>";
        list.innerHTML = html_tag;
        divers.forEach(function (diver) {
            if (diver.Diver_Role != "DP") {
                html_tag = "<li class=option><a><div class=option_container><div class=name_item><h2>" + diver.Firstname + " " + diver.Lastname + "</h2><span>" + diver.Mail + "</span></div><div class=level>" + diver.Diver_Qualification + "</div></div></a></li>";
                list.innerHTML += html_tag;
            }
        })
    })
    document.querySelector(".diver_item_container").querySelectorAll(".select").forEach(function (select) {
        select.addEventListener("change", function () {
            let diver = select.querySelector(".option-list").querySelector(".active");
            updateSelectDivers(data, diver, select);
        })
    })
    loadingClose();
};

function updateSelectDivers(data, diver_selected, select) {
    let diver_to_eliminate;
    try {
        diver_to_eliminate = diver_selected.querySelector("h2").innerText;
    } catch (e) {
        diver_to_eliminate = ""
    }
    let to_display = [];
    data.event.allDivers.forEach(function (diver) {
        if (diver.Firstname + " " + diver.Lastname != diver_to_eliminate) {
            to_display.push(diver);
        }
    })
    updateAllSelect(diver_to_eliminate, to_display, select);
}

function updateAllSelect(diver_to_eliminate, to_display, select_to_avoid) {
    document.querySelector(".diver_item_container").querySelectorAll(".select").forEach(function (select) {
        if (select != select_to_avoid) {
            let list = select.querySelector(".option-list");
            let html_tag = "<li data-text='Sélectionnez un plongeur' class=active><a>Sélectionnez un plongeur</a></li>";
            list.innerHTML = html_tag;
            to_display.forEach(function (diver) {
                if (diver.Diver_Role != "DP") {
                    html_tag = "<li class=option><a><div class=option_container><div class=name_item><h2>" + diver.Firstname + " " + diver.Lastname + "</h2><span>" + diver.Mail + "</span></div><div class=level>" + diver.Diver_Qualification + "</div></div></a></li>";
                    list.innerHTML += html_tag;
                }
            })
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