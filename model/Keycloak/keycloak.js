require('dotenv').config()
const axios = require('axios');
const qs = require('qs');
axios.defaults.baseURL = `http://${process.env.IP_PERSO}:8080`

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
        console.log("\t->Failed to find user ID");
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

    let dataReq = JSON.stringify({
        "email": userData.Mail,
        "firstName": userData.Firstname,
        "lastName": userData.Lastname,
        "credentials": [
            {
                "type": "password",
                "value": userData.License_Number,
                "temporary": true
            }
        ],
        "enabled": true
    });

    let role_name = 'app_user'; //or app_dp
    const adminToken = await getAcessToken(); // return token, undefined if err
    dataClient.username = "";
    dataClient.password = "";

    if (!adminToken) return false;
    const successUser = await addUser(adminToken, dataReq); // return true, undefined if err
    if (!successUser) return false;
    const userId = await getUserId(adminToken, userData.Mail); // return user id, undefined if err
    if (!userId) return false;
    let roleId = await getRoleId(adminToken, role_name); // return role id, undefined if err
    if (!roleId) return false;
    let successRole = await setRole(roleId, userId, role_name, adminToken); // return true, undefined if err
    if (!successRole) return false;

    if (userData.Diver_Qualification === "P5") { // if diver is P5, it's a DP
        role_name = 'app_dp';
        roleId = await getRoleId(adminToken, role_name); // return role id, undefined if err
        if (!roleId) return false;
        successRole = await setRole(roleId, userId, role_name, adminToken); // return true, undefined if err
        if (!successRole) return false;
    }
    return true;
}

async function deleteUser(mail, clientUsername = "", clientPassword = "") {
    if (clientUsername !== "" && clientPassword !== "") {
        dataClient.username = clientUsername;
        dataClient.password = clientPassword;
    }
    const adminToken = await getAcessToken(); // return token, undefined if err
    dataClient.username = "";
    dataClient.password = "";

    if (!adminToken) return false;
    const userId = await getUserId(adminToken, mail); // return user id, undefined if err
    if (!userId) return false;



    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: process.env.URL_USER + "/" + userId,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
    };
    const deleteUser = await axios.request(config)
        .then((response) => {
            console.log("Success deleting user")
            return true
        })
        .catch((error) => {
            console.log("Failed deleting user")
            console.log("\t->", error.response.data['errorMessage']);
            return false
        });
    return deleteUser;
}

async function modifyUser(oldMail, newMail, firstname, lastname, clientUsername = "", clientPassword = "") {
    if (clientUsername != "" && clientPassword != "") {
        dataClient.username = clientUsername;
        dataClient.password = clientPassword;
    }
    const adminToken = await getAcessToken(); // return token, undefined if err
    dataClient.username = "";
    dataClient.password = "";

    if (!adminToken) return false;
    const userId = await getUserId(adminToken, oldMail); // return user id, undefined if err
    if (!userId) return false;

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: process.env.URL_USER + "/" + userId,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        data: JSON.stringify({ "email": newMail, "firstName": firstname, "lastName":lastname })
    };
    const modifUser = await axios.request(config)
        .then((response) => {
            console.log("Success modifying user")
            return true
        })
        .catch((error) => {
            console.log("Failed modifying user")
            console.log("\t->", error.response.data['errorMessage']);
            return false
        });
    return modifUser;
}

module.exports = {
    createUser,
    deleteUser,
    modifyUser
}