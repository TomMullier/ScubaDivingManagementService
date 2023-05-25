const mysql = require('mysql');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


class BDD {
    constructor() {
        this.con = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
          //  database: process.env.DATABASE_NAME
        });

        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
          });
    }
}

module.exports = {
    BDD
}