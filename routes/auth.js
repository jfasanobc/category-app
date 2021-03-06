const express = require('express');
const router = express.Router();
const BigCommerce = require('node-bigcommerce');
const session = require('express-session');
const mysql = require('mysql');

router.get('/', (req, res) => {
    if (!req.query.code) {
        console.log(req.query);
        res.status('403').end();
    }
    const connection = mysql.createConnection({
        host: process.env.SQLHOST,
        user: process.env.SQLUN,
        password: process.env.SQLPW,
        database: 'cat_app_db'
      });

    connection.connect();

    connection.query('SELECT * FROM bc_config WHERE id=1', (error, results) => {
        let clientId, secret;

        if (error) {
            throw error;
        }

        const db_result = results[0];

        clientId = db_result.client_id;
        secret = db_result.secret;
        
        completeAuth(clientId, secret);
      });
    
    function completeAuth(clientId, secret){
        const bc = new BigCommerce({
            logLevel: 'info',
            clientId: clientId,
            secret: secret,
            callback: 'https://category-app.dreamhosters.com/auth',
            responseType: 'json',
            apiVersion: 'v3'
        });

        bc.authorize(req.query)
        .then(data => {

            connection.query(`UPDATE bc_config SET access_token="${data.access_token}" WHERE id=1`, (error,results) => {
                if (error) {
                    throw error;
                }
            });
            connection.end(() => res.render('index', {loaded: true}));
        })
        .catch(err => res.render('index', {data: `error:${err}`}))
    }
    

    
})

module.exports = router;