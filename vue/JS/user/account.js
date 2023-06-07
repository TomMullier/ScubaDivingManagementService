fetch('/auth/user/account')
    .then(response => {
        // Obtenir le header "admin" de la rÃ©ponse
        const userType = response.headers.get('userType');

        // Faire ce que vous souhaitez avec la valeur "isAdmin"
        console.log('userType:', userType);
    });

fetch('/auth/user/account/get_info', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(res => res.json())
    .then(res => {
        console.log(res)

    })

document.getElementById('modify').addEventListener('click', modifyUserInfo)

function modifyUserInfo(data, clientPassword) {
    console.log("ici");
    //data.clientPassword = clientPassword;
    fetch('/auth/user/account/modif', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        // body: JSON.stringify(data)
    }).then(res => res.json())
        .then(res => console.log(res))
}