const signupForm = document.getElementById('signup_form');
const listMembers = document.getElementById('listMembers');

const signupFormNodes = {
    lastname: signupForm.querySelector('input[name="lastname"]'),
    firstname: signupForm.querySelector('input[name="firstname"]'),
    mail: signupForm.querySelector('input[name="mail"]'),
    phone: signupForm.querySelector('input[name="phone"]'),
    diver_qualif: signupForm.querySelector('input[name="diver_qualif"]'),
    instru_qualif: signupForm.querySelector('input[name="instru_qualif"]'),
    nox_lvl: signupForm.querySelector('input[name="nox_lvl"]'),
    additional_qualif: signupForm.querySelector('input[name="additional_qualif"]'),
    license_nb: signupForm.querySelector('input[name="license_nb"]'),
    license_expi: signupForm.querySelector('input[name="license_expi"]'),
    medic_certif_expi: signupForm.querySelector('input[name="medic_certif_expi"]'),
    birthdate: signupForm.querySelector('input[name="birthdate"]'),
    isDp: signupForm.querySelector('input[name="isDp"]'),
    password: signupForm.querySelector('input[name="password"]')
};

document.getElementById("btn-submit").addEventListener('click', (e) => {
    e.preventDefault();
    const data = {
        Lastname: signupFormNodes.lastname.value,
        Firstname: signupFormNodes.firstname.value,
        Mail: signupFormNodes.mail.value,
        Phone: signupFormNodes.phone.value,
        Diver_Qualification: signupFormNodes.diver_qualif.value,
        Instructor_Qualification: signupFormNodes.instru_qualif.value,
        Nox_Level: signupFormNodes.nox_lvl.value,
        Additional_Qualifications: signupFormNodes.additional_qualif.value,
        License_Number: signupFormNodes.license_nb.value,
        License_Expiration_Date: signupFormNodes.license_expi.value,
        Medical_Certificate_Expiration_Date: signupFormNodes.medic_certif_expi.value,
        Birthdate: signupFormNodes.birthdate.value,
        isDp: signupFormNodes.isDp.checked,
        password: signupFormNodes.password.value
    };
    data.Mail = (data.Mail).toLowerCase()
    console.log(data.Mail)
    fetch('/auth/club/club_members', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then((res) => res.json())
        .then((res) => {
            console.log(res);
        });
});


// requete db utilisateurs 
fetch('/auth/club/get_club_members', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
}).then(res => res.json())
    .then(users => {
        users.forEach(user => {
            let li = document.createElement("li");
            let p = document.createElement("p");
            let p_mail = document.createElement("p");
            p.innerText = user.Lastname + user.Firstname + "\t" + user.Phone + "\t";
            p_mail.innerText = user.Mail;
            p_mail.className = "mail";
            let buttonModif = document.createElement("button");
            let buttonDelete = document.createElement("button");
            buttonModif.innerText = "Modifier";
            buttonModif.className = "btnModif";
            buttonDelete.innerText = "Supprimer";
            buttonDelete.className = "btnDelete";
            li.appendChild(p);
            li.appendChild(p_mail);
            li.appendChild(buttonModif);
            li.appendChild(buttonDelete);
            listMembers.appendChild(li);
        });

        let btnDelete = document.querySelectorAll(".btnDelete");
        let btnModif = document.querySelectorAll(".btnModif");

        btnModif.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                getUserInfo(e.target.parentElement.querySelector(".mail").innerText);
            })
        })

        btnDelete.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                deleterUser(e.target.parentElement.querySelector(".mail").innerText);
            })
        })
    })

function getUserInfo(target) {
    console.log(target);

    // const data = {
    //     oldMail: target,
    //     phone: "0987654321",
    //     diver_qualif: signupFormNodes.diver_qualif.value,
    //     instru_qualif: signupFormNodes.instru_qualif.value,
    //     nox_lvl: signupFormNodes.nox_lvl.value,
    //     additional_qualif: signupFormNodes.additional_qualif.value,
    //     license_nb: signupFormNodes.license_nb.value,
    //     license_expi: signupFormNodes.license_expi.value,
    //     medic_certif_expi
    // }

    fetch('/auth/club/get_member_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Mail: target })
    }).then(res => res.json())
        .then(res => {
            console.log(res)

            let data = res;
            data.Mail = "b@b.b"
            delete data.Lastname;
            delete data.Firstname;
            delete data.Birthdate;
            data.License_Expiration_Date = "1234-12-12";
            data.Medical_Certificate_Expiration_Date = "1234-12-12";
            

            modifyUserInfo(data, signupFormNodes.password.value)
        })
}

function modifyUserInfo(data, clientPassword) {
    data.clientPassword = clientPassword;
    fetch('/auth/club/club_members', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data )
    }).then(res => res.json())
        .then(res => console.log(res))
}

function deleterUser(target) {
    console.log(target);
    fetch('/auth/club/club_members', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Mail: target, password: signupFormNodes.password.value })
    }).then((res) => res.json())
        .then((res) => {
            console.log(res);
        });

}