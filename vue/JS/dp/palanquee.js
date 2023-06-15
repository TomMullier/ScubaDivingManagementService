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
    })

/* ----------------------- SAVE PALANQUEE USER QUALIF ----------------------- */
function savePalanqueeUserQualif(data){
    fetch('/auth/dp/palanquee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then(res => {
        console.log(res)
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

    let divers = data.event.allDivers;
    document.querySelector(".allDivers").innerHTML = "";
    document.querySelector(".number_divers_").innerText = divers.length - 1 + " plongeur(s)";
    divers.forEach(function (diver) {
        if (diver.Diver_Role == "DP") {
            document.querySelector(".DP_name").innerText = " " + diver.Firstname + " " + diver.Lastname;
        } else {
            let html_ = '<div class="diver_item"><div><p>' + diver.Firstname + ' ' + diver.Lastname + '</p></div><div><p>' + diver.Mail + '</p></div><div><p>' + diver.Phone + '</p></div><div><select name="" id="" class="diver_level">'
            html_ += '<option value="P1">' + diver.Diver_Qualification + '</option>'
            let currentLevel = diver.Diver_Qualification.split("P")[1];
            currentLevel = parseInt(currentLevel);
            currentLevel += 1;
            let nextLevel = data.listMaxDepth[currentLevel];

            html_ += '<option value="Pe' + nextLevel.Guided_Diver_Depth + '">' + "Pe" + nextLevel.Guided_Diver_Depth + '</option>'
            html_ += '<option value="Pa' + nextLevel.Autonomous_Diver_Depth + '">Pa' + nextLevel.Autonomous_Diver_Depth + '</option>'
            html_ += '</select><i style="opacity:0;color:#f2574a" class="fa-solid fa-triangle-exclamation"></i></div></div>';
            document.querySelector(".allDivers").innerHTML += html_;
        }
    })
    document.querySelectorAll(".diver_level").forEach(function (element) {
        element.addEventListener("change", function () {
            if (element.value.includes("Pe") || element.value.includes("Pa")) {
                element.parentElement.querySelector("i").style.opacity = "1";
                element.parentElement.title = "ATTENTION";

            } else {
                element.parentElement.querySelector("i").style.opacity = "0";
                element.parentElement.title = "";
            }
        })
    })
    loadingClose();
};


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