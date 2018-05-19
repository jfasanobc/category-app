const express = require('express');
const router = express.Router();
const BigCommerce = require('node-bigcommerce');
const mysql = require('mysql');

router.get('/', (req,res) => {
    res.send('api');
})

router.get('/single', (req,res) => {
    const connection = mysql.createConnection({
        host: process.env.SQLHOST,
        user: process.env.SQLUN,
        password: process.env.SQLPW,
        database: 'cat_app_db'
      });
    
    connection.connect();
    
    connection.query('SELECT * FROM bc_config WHERE id=1', (error, results) => {
        let accessToken, hash, clientId, secret;
    
        if (error) {
            throw Error(`query fail ${error}`);
        }
        const db_result = results[0];
        
        accessToken = db_result.access_token;
        hash = db_result.hash;
        clientId = db_result.client_id;
        secret = db_result.secret;
    
        prepare_bc_config(accessToken, hash, clientId, secret);
    })
    
    function prepare_bc_config(accessToken, hash, clientId, secret) {
        connection.end();
    
        const bc = new BigCommerce({
            clientId: clientId,
            secret: secret,
            storeHash: hash,
            accessToken: accessToken,
            responseType: 'json',
            apiVersion: 'v3'
        });
        createSampleCategory(bc);
    }

    function createSampleCategory(bc) {
        console.log(`did we get bc: ${JSON.stringify(bc)}`);
        let category = {
            parent_id: 0,
            name: `Sample Category ${Math.round(Math.random() * 1000000)}`,
            description: 'A sample category generated by the app'
        }
        bc.post('/categories', category)
        .then(data => res.send(data))
        .catch(err => res.send(`There was an error ${err}. BC: ${JSON.stringify(bc)}`))
    }
    
})

module.exports = router;