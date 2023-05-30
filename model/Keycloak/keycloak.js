require('dotenv').config()
const axios = require('axios');
const qs = require('qs');
axios.defaults.baseURL = 'http://127.0.0.1:8080'

let dataClient = {
    grant_type: 'password',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    username: "",
    password: ""
}

async function getAcessToken() {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.URL_GET_TOKEN,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(dataClient)
    };
    let adminTk = await axios.request(config)
        .then((res) => {
            let adminToken = res.data["access_token"];
            console.log("Success getting admin token");
            return adminToken;
        })
        .catch((error) => {
            console.log("Failed getting admin token");
            //console.log(error);
        });
    return adminTk;
}

async function getRoleId(token, role) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.URL_GET_ROLE,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    const roles = await axios.request(config)
        .then((response) => {
            console.log("Success getting role ID")
            return response.data;
        })
        .catch((error) => {
            console.log("Failed getting role ID")
            //console.log(error);
        });
    const role_user = roles.find(item => item.name === role); //change role here
    return role_user.id;
}

async function getUserId(token, userMail) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.URL_USER,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        data: qs.stringify({})
    };
    const users = await axios.request(config)
        .then((response) => {
            console.log("Success getting user")
            return response.data;
        })
        .catch((error) => {
            console.log("Failed getting user")
            //console.log(error);
        });

    let user = "";
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === userMail) {
            console.log("Success finding user ID");
            user = users[i];
        };
    }
    if (user === "") {
        user = "UNDEFINED";
        console.log("Failed to find user ID");
    }
    return user.id;
}

async function setRole(idRole, idUser, roleName, token) {
    const data = [{
        "id": idRole,
        "name": roleName,
        "composite": true,
        "containerId": "SDMS"
    }];

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `admin/realms/SDMS/users/${idUser}/role-mappings/realm`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify(data)
    };
    axios.request(config)
        .then((res) => {
            console.log("Success setting role");
        })
        .catch((error) => {
            console.log("Failed setting role");
            // console.log(error);
        });
}

async function create_user(userData, clientUsername) {
    dataClient.username = clientUsername;
    dataClient.password = userData.password;
    console.log(userData);

    let dataReq = JSON.stringify({
        "email": userData.mail,
        "firstName": userData.firstname,
        "lastName": userData.lastname,
        "credentials": [
            {
                "type": "password",
                "value": "pass",
                "temporary": true
            }
        ],
        "enabled": true
    });
    
    const adminToken = await getAcessToken();
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.URL_USER,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        data: dataReq
    };
    await axios.request(config)
        .then((response) => {
            console.log("Success adding new user")
            //console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log("Failed adding new user")
            //console.log(error);
        });

    const roleId = await getRoleId(adminToken, 'app_user')// change role here
    // if dp  const roleId = getRole(adminToken, 'app_dp')// change role here
    const userId = await getUserId(adminToken, userData.mail)

    await setRole(roleId, userId, "app_user", adminToken) //change if dp


}

module.exports = {
    create_user
}