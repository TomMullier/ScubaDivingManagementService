

document.getElementById('modify').addEventListener('click', modifyUserInfo)

function modifyUserInfo(data, clientPassword) {
    fetch('/auth/user/account/modif', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(res => res.json())
        .then(res => console.log(res))
}