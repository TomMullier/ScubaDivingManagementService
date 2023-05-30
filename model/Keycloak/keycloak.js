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
            console.log("\t->", error.response.data['errorMessage']);
            return undefined
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
            console.log("Success getting all roles")
            return response.data;
        })
        .catch((error) => {
            console.log("Failed getting all role")
            console.log("\t->", error.response.data['errorMessage']);
            return undefined

        });
    const role_user = roles.find(item => item.name === role); //change role here
    if (role_user && role_user.id) {
        console.log("\t->Success finding role ID");
        return role_user.id
    } else {
        console.log("\t->Failed finding role ID");
        return undefined
    }
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
            console.log("Success getting all user")
            return response.data;
        })
        .catch((error) => {
            console.log("Failed getting all user")
            console.log("\t->", error.response.data['errorMessage']);
            return undefined
        });

    let user = "";
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === userMail) {
            console.log("\t->Success finding user ID");
            user = users[i];
            return user.id;
        };
    }
    if (user === "") {
        console.log("Failed to find user ID");
        console.log("\t->", error.response.data['errorMessage']);
        return undefined
    }
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
    const success = await axios.request(config)
        .then((res) => {
            console.log("Success setting role");
            return true;
        })
        .catch((error) => {
            console.log("Failed setting role");
            console.log("\t->", error.response.data['errorMessage']);
            return undefined
        });
    return success;
}

async function addUser(adminToken, dataReq) {
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
    const add = await axios.request(config)
        .then((response) => {
            console.log("Success adding new user")
            return true
        })
        .catch((error) => {
            console.log("Failed adding new user")
            console.log("\t->", error.response.data['errorMessage']);
            return undefined
        });
    return add;
}


async function createUser(userData, clientUsername) {
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
                "value": userData.license_nb,
                "temporary": true
            }
        ],
        "enabled": true
    });

    let role_name = 'app_user'; //or app_dp
    const adminToken = await getAcessToken(); // return token, undefined if err
    if (!adminToken) return false;
    const successUser = await addUser(adminToken, dataReq); // return true, undefined if err
    if (!successUser) return false;
    const userId = await getUserId(adminToken, userData.mail); // return user id, undefined if err
    if (!userId) return false;
    let roleId = await getRoleId(adminToken, role_name); // return role id, undefined if err
    if (!roleId) return false;
    let successRole = await setRole(roleId, userId, role_name, adminToken); // return true, undefined if err
    if (!successRole) return false;

    if (userData.isDp) {
        role_name = 'app_dp';
        roleId = await getRoleId(adminToken, role_name); // return role id, undefined if err
        if (!roleId) return false;
        successRole = await setRole(roleId, userId, role_name, adminToken); // return true, undefined if err
        if (!successRole) return false;
    }
    return true;
}

module.exports = {
    createUser
}