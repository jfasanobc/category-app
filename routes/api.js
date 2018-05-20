const express = require('express');
const router = express.Router();
const BigCommerce = require('node-bigcommerce');
const mysql = require('mysql');
const bcAuth = require('../lib/bc_auth');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');

let bc;

bcAuth()
.then(data => bc = data)
.catch(err => console.log(err))

// TEST ROUTE to generate a category
router.get('/single', (req,res) => {

    function createSampleCategory(bc_api) {
        let category = {
            parent_id: 0,
            name: `Sample Category ${Math.round(Math.random() * 1000000)}`,
            description: 'A sample category generated by the app'
        }
        bc_api.post('/catalog/categories', category)
        .then(data => res.send(data))
        .catch(err => res.send(`There was an error: ${err}.}`))
    }

    if (bc) {
        createSampleCategory(bc);
    }
    
})
// When a user hits the export button all categories
// will be exported into a CSV file
router.get('/export', (req, res) => {

    function exportCategories(bc_api) {
        bc_api.get('/catalog/categories?limit=250')
        .then(data => {
            streamToCSV(data);
        })
        .catch(err => res.send(`Export error: ${err}.}`))
    }

    function streamToCSV(category_page){
        console.log('stream func running');
        
        const csv_headers = [
            'id',
            'parent_id',
            'name',
            'description',
            'views',
            'sort_order',
            'page_title',
            'meta_keywords',
            'meta_description',
            'layout_file',
            'image_url',
            'is_visible',
            'search_keywords',
            'default_product_sort',
            'custom_url'
        ]
        let category_list = category_page.data.map(category => Object.assign({}, category))
        
        let csvStream = csv.createWriteStream({headers: true});
        let writableStream = fs.createWriteStream('test.csv');
        
        csvStream.pipe(writableStream);
        csvStream.write(category_list[0]);
        writableStream.on('finish', function(){
            console.log('Done with CSV');
            res.download('test.csv', (err) => {
            if (err) {
                console.log(`csv send err: ${err}`)
            }
        });

        });
        csvStream.end();
        
        
        
    }

    

    if (bc) {
        exportCategories(bc);
    }
})

module.exports = router;
