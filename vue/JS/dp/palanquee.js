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
        })







/* -------------------------------------------------------------------------- */
/*                                    CODE                                    */
/* -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function setPage() {
        loadingClose();
});


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
let scroll_dot_value=0;
let dots = document.querySelectorAll(".dot");
document.querySelector(".button_next").addEventListener("click", function () {
        scroll_value += $(window).width();
        document.querySelector(".scroll").scrollTo(scroll_value, 0);
        if(scroll_dot_value<dots.length-1) scroll_dot_value+=1;
        updateDot();
})

document.querySelector(".button_prec").addEventListener("click", function () {
        scroll_value -= $(window).width();
        document.querySelector(".scroll").scrollTo(scroll_value, 0);
        if(scroll_dot_value>0) scroll_dot_value-=1;
        updateDot();
})

function updateDot(){
        dots.forEach(function(element){
                element.classList.remove("active");
        })
        dots[scroll_dot_value].classList.add("active");
        if(scroll_dot_value==0){
                document.querySelector(".button_prec").style.display="none";
                document.querySelector(".button_prec").style.opacity="0";

        }else{
                document.querySelector(".button_prec").style.display="flex";
                document.querySelector(".button_prec").style.opacity="1";
        }
        if(scroll_dot_value==dots.length-1){
                document.querySelector(".button_next").style.display="none";
                document.querySelector(".button_next").style.opacity="0";
        }else{
                document.querySelector(".button_next").style.display="flex";
                document.querySelector(".button_next").style.opacity="1";
        }
}