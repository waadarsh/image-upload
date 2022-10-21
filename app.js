const express = require('express');
const app = express();
const { Pool, Client } = require('pg');
const pgp = require('pg-promise')();
const base64 = require('base-64');
var utf8 = require('utf8');
const path = require('path');
const bodyParser = require('body-parser');
const { application } = require('express');
const { dirxml } = require('console');

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
const connectionString = 'postgresql://postgres:nissan@localhost:5432/rnaipl';

app.use(bodyParser.text());
app.use(express.json());

const pool = new Pool({connectionString,});
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
    console.log(data.workInstructions[0].workArea.inputField1);

    (async () => {
        const client = await pool.connect();

        try {
                await client.query('BEGIN')
                const chklstHdr = 'INSERT INTO chklst_hdr(chklst_name,station_name,total_no_instruction,status_code) VALUES ($1,$2,$3,90)'
                const chklstHdrVal = await client.query(chklstHdr,[data.templateName, data.stationName,data.totalNoOfInstruction])
                for (let i = 0; i < data.totalNoOfInstruction; i++) {
                    const chklstDtl = 'INSERT INTO chklst_dtl(chklst_seq_nbr,process_name,check_location,check_details,chklst_id) VALUES ($1,$2,$3,$4,(SELECT MAX(chklst_id) FROM chklst_hdr))'
                    const chklstDtlVal = await client.query(chklstDtl,[data.workInstructions[i].index,data.workInstructions[i].processName,data.workInstructions[i].checkLocation,data.workInstructions[i].checkDetails])
                    const key = Object.keys(data.workInstructions[i].workArea);
                    console.log('Inside For loop 1');
                    for(let j = 0; j<key.length;j++){
                        console.log('inside for loop 2');
                        if(key[j] === 'inputField1'){
                            console.log('Inside IF Part 1');
                            const chklstComponent = `INSERT INTO chklst_component(chklst_dtl_id,base_component_id,composite_component) VALUES ((SELECT MAX(chklst_dtl_id) FROM chklst_dtl),(SELECT component_id FROM component WHERE component_name = 'inputField1' ),$1)`
                            const chklstComponentVal = await client.query(chklstComponent,['Y'])
                            console.log('Inside IF Part 2');
                            const chklstCompositeComponentMapping = `INSERT INTO chklst_composite_component_mapping(chklst_component_id,chklst_child_component_id) VALUES ((SELECT MAX(chklst_component_id) FROM chklst_component),(SELECT composite_component_mapping_id FROM composite_component_mapping WHERE composite_component_id IN (SELECT component_id FROM component WHERE component_name = 'inputField1') AND child_component_id = 1))`
                            const chklstCompositeComponentMappingVal = await client.query(chklstCompositeComponentMapping)
                            console.log('Inside IF Part 3');
                            const chklstComponentProperty = `INSERT INTO chklst_component_property(chklst_component_id,property_name,property_value,property_type) VALUES ((SELECT MAX(chklst_component_id) FROM chklst_component),$1,$2,$3)`
                            const chklstComponentPropertyVal = await client.query(chklstComponentProperty,['innerHTML',data.workInstructions[i].workArea.inputField1,'display'])
                            console.log('Input Field ',i+1,' completed');
                        }
                    }
                }
                await client.query('COMMIT')
                console.log('COMMIT Successful'); 

        } catch (e) {
            await client.query('ROLLBACK');
            console.log('ROLLBACK',e)
            throw e;
        } finally {
            client.release();
        };
    })().catch(error => console.error(error.stack));
    
    res.send("Test");
});


