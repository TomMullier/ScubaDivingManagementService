require('dotenv').config()

let data = {
    grant_type: 'password',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.PROCESS_SECRET,
    username: "",
    password: ""
}
function getAcessToken() {
    fetch(process.env.URL_GET_TOKEN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: { data }
    })
        .then((res) => res.json())
        .catch((err) => {
            console.log(err);
        });
}

function getRole() { }

module.exports = {
    getRole,
}