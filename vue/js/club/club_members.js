const signupForm = document.getElementById('signup_form');
const signupFormNodes = {
    lastname: signupForm.querySelector('input[name="lastname"]'),
    firstname: signupForm.querySelector('input[name="firstname"]'),
    mail: signupForm.querySelector('input[name="mail"]'),
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
    e.preventDefault;
    const data = {
        lastname: signupFormNodes.lastname.value,
        firstname: signupFormNodes.firstname.value,
        mail: signupFormNodes.mail.value,
        diver_qualif: signupFormNodes.diver_qualif.value,
        instru_qualif: signupFormNodes.instru_qualif.value,
        nox_lvl: signupFormNodes.nox_lvl.value,
        additional_qualif: signupFormNodes.additional_qualif.value,
        license_nb: signupFormNodes.license_nb.value,
        license_expi: signupFormNodes.license_expi.value,
        medic_certif_expi: signupFormNodes.medic_certif_expi.value,
        birthdate: signupFormNodes.birthdate.value,
        isDp: signupFormNodes.isDp.checked,
        password: signupFormNodes.password.value
    };
    // console.log(data);

    fetch('/auth/club/club_members', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        console.log(res);
    })
})