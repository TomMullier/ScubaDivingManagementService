const data = {
    grant_type: 'password',
    client_id: '',
    client_secret: "",
    username: '',
    password: ''
}
function getAcessToken() {
    fetch("", {
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