const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const base64 = require('base-64');
var utf8 = require('utf8');
const path = require('path');
const bodyParser = require('body-parser');
const { application } = require('express');

app.listen(3000, () => {
    console.log('listening on port 3000');
});

app.use("/static", express.static("static"));

const cn = {
    user: 'postgres',
    host: 'localhost',
    database: 'rnaipl',
    port: 5432,
    password: 'nissan'
};

app.use(bodyParser.text());
app.use(express.json());

const db = pgp(cn);
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    db.any("SELECT image FROM test")
    .then((temp) => {
       //// const image1 = temp[1].image;
        const temp1 = temp[2].image;
        //res.send(temp[0].image);
        //const temp2 = temp1.toString();
        console.log(temp1.toString().slice(1,-1));
        res.render("index",{
            temp2 : temp1.toString().slice(1,-1)
        });
        

        }).catch(error => res.send(error));        
});
app.get('/imgStoreAndRetrieve', (req, res) => {
    res.sendFile(path.join(__dirname + '/imgStoreAndRetrieve.html'));
});

app.post('/imgStoreAndRetrieve', (req, res) => {
    const data = req.body;
    console.log(data);
    db.none('INSERT INTO test(image) VALUES ($1)', [data])
    .then(() => {
        console.log("Success");
    })
    .catch(error => console.log(error));
    
});

app.get('/cameraFunction', (req, res) => {
    res.sendFile(path.join(__dirname + '/cameraFunction.html'));
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname + '/test.html'));
});
app.post('/test', (req, res) => {
    const data = req.body;
    // // res.send(data);
    // //const finalJSON = JSON.parse(data);
    // //const dt2 = JSON.stringify(data);
    // //console.log("data" + data);
    // // db.none('INSERT INTO chklst_hdr(chklst_name,station_name,total_no_instruction) VALUES ($1,$2,$3)', [data.templateName, data.stationName, data.totalNoOfInstruction])
    // // .then(() => {
    // //     console.log("Success");
    // // })
    // // .catch(error => console.log(error));

    console.log(typeof(data));
    res.send("Test");
});


