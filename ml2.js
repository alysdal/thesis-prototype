var brain = require('brain.js');
const fs = require('fs');
var mysql = require('mysql');

var log = function(){
    console.log.apply(console, arguments);
}

var net = new brain.NeuralNetwork();

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : 'thesis',
    multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
  //console.log("Connected!");
});

let args = process.argv.slice(2);

function classifyData(rows, net) {
    return new Promise((resolve, reject) => {
        let promises = [];
        rows.forEach(res => {
            let MLClassification = net.run(res.data);
            let best = brain.likely(res.data, net);
            let value = best;
            if (MLClassification[best] < 0.7) {
                value = 'unclassifyable';
            }
            promises.push(setClassification(res.id, value, JSON.stringify(MLClassification)));
        });
        return PromiseAllWithProgress(promises, drawProgress).then(() => {
            resolve();
        });
    })
}

function fastClassify(rows, net) {
    return new Promise((resolve, reject) => {
        let sqlQuery = "";
        let rowNumber = 0;
        rows.forEach(res => {
            let MLClassification = net.run(res.data);
            let best = brain.likely(res.data, net);
            let value = best;
            if (MLClassification[best] < 0.7) {
                value = 'unclassifyable';
            }
            sqlQuery += 'UPDATE training_data SET ml_classification = '+con.escape(best)
                +', ml_classification_all = '+con.escape(JSON.stringify(MLClassification))
                +' WHERE id = '+ con.escape(res.id) +';';
            drawProgress( (rowNumber*100) / rows.length);
            rowNumber++;
        });

        console.log('Updating DB');

        return con.query(sqlQuery, function (error, results, fields) {
            if (error) throw error;
            resolve();
        });
    })
}

let onlyNewData = false;
if (args.indexOf('--new') !== -1) {
    onlyNewData = true;
}

if (args.indexOf('--classify') !== -1) {
    let net;

    getMLModel().then(model => {
        log('got model #', model.id);
        net = new brain.NeuralNetwork();
        net.fromJSON(JSON.parse(model.content));
        log('loaded model');

        if (onlyNewData) {
            return getNewData();
        }

        return getAllData();

    }).then(results => {
        log(`got ${results.length} rows`);
        return classifyData(results, net);
    }).then(() => {
        log('Done.');
        process.exit();
    });


} else {
    let net = new brain.NeuralNetwork({
        activation: 'sigmoid', // activation function
        //hiddenLayers: [100],
        //learningRate: 0.6 // global learning rate, useful when training using streams
    });
    let trainingData = [];

    // train model and classify
    getClassifiedData().then(results => {


        // construct brain.js input object
        results.forEach(row => {

            let accData = row.data;

            //log(accData.length)
            let humanClassification = row.category;

            let thisPoint = {
                input: accData,
                output: {}
            };

            thisPoint.output[humanClassification] = 1;

            trainingData.push(thisPoint);
        });

        //log(trainingData[0]);

        log('Training model with ', trainingData.length, 'classified entries');


        net.train(trainingData, {
            // Defaults values --> expected validation
            iterations: 5000,    // the maximum times to iterate the training data --> number greater than 0
            errorThresh: 0.005, // default: 0.005  // the acceptable error percentage from training data --> number between 0 and 1
            log: true,           // true to use console.log, when a function is supplied it is used --> Either true or a function
            logPeriod: 10,        // iterations between logging out --> number greater than 0
            learningRate: 0.3,    // scales with delta to effect training rate --> number between 0 and 1
            momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
            callback: null,       // a periodic call back that can be triggered while training --> null or function
            callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
            timeout: Infinity     // the max number of milliseconds to train for --> number greater than 0
        });


    }).then(() => {
        log('Saving model..')
        return saveModel(JSON.stringify(net.toJSON()));
    }).then(() => {
        log('getting all row data')
        return getAllData();
    }).then(results => {
        log('Classifying..');
        return fastClassify(results, net);
    }).then(() => {
        log('Done!')
        process.exit();
    });

}



function processRowData(inputArray) {
    let arrayResults = [];

    // convert json acc data to object
    inputArray.forEach(row => {

        let frames = JSON.parse(row.data);

        let framesAdjusted = calcDeltas(frames);

        let frameSize = 100;

        if (framesAdjusted.length > frameSize) {
            framesAdjusted = framesAdjusted.slice(0, frameSize)
        } else if (framesAdjusted.length < frameSize) {
            return;
        }

        let newRow = {
            id: row.id,
            category: row.category,
            device: row.device,
            data: framesAdjusted
        };

        arrayResults.push(newRow);
    });

    return arrayResults;

}

function getClassifiedData() {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM training_data WHERE category is not NULL AND deleted_at is NULL', function (error, results, fields) {
            if (error) throw error;

            let arrayResults = processRowData(results);

            resolve(arrayResults);
        });
    })
}

function getAllData() {
    return new Promise((resolve, reject) => {
        //con.query('SELECT * FROM training_data WHERE category is NULL AND deleted_at is NULL', function (error, results, fields) {
        con.query('SELECT * FROM training_data WHERE deleted_at is NULL ORDER BY id DESC', function (error, results, fields) {
            if (error) throw error;
            let arrayResults = processRowData(results);
            resolve(arrayResults);
        });
    });
}

function getNewData() {
    return new Promise((resolve, reject) => {
        //con.query('SELECT * FROM training_data WHERE category is NULL AND deleted_at is NULL', function (error, results, fields) {
        con.query('SELECT * FROM training_data WHERE deleted_at is NULL AND ml_classification is NULL ORDER BY id DESC', function (error, results, fields) {
            if (error) throw error;
            let arrayResults = processRowData(results);
            resolve(arrayResults);
        });
    });
}

function calcDeltas(frames) {
    let result = [];

    let lastData = {
        x: null,
        y: null,
        z: null,
        d: null,
    };

    frames.forEach(row => {

        let x = row.x;
        let y = row.y;
        let z = row.z;

        if (lastData.x === null) {
            lastData.x = 0;
        }
        if (lastData.y === null) {
            lastData.y = 0;
        }
        if (lastData.z === null) {
            lastData.z = 0;
        }

        x = lastData.x - x;
        y = lastData.y - y;
        z = lastData.z - z;

        let d = Math.round(Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2)));


        lastData.x = row.x;
        lastData.y = row.y;
        lastData.z = row.z;
        lastData.d = d;


        let processedRow;

        //let processedRow = {
        //    x: map(x, -25000, 25000, -1, 1),
        //   y: map(y, -25000, 25000, -1, 1),
        //    z: map(z, -25000, 25000, -1, 1),
        //    d:map(d, 0, 100000, 0, 1),
        //};

        /*
        processedRow = {
            x: map(x, -65535, 65535, 0, 1),
            y: map(y, -65535, 65535, 0, 1),
            z: map(z, -65535, 65535, 0, 1),
            //d:map(d, 0, 100000, 0, 1),
        };
        */

        processedRow = [
            map(x, -65535, 65535, 0, 1),
            map(y, -65535, 65535, 0, 1),
            map(z, -65535, 65535, 0, 1),
            map(d, 0, 120000, 0, 1),
        ];

        //processedRow = map(d, 0, 100000, 0, 1);


        result.push(processedRow[0]);
        result.push(processedRow[1]);
        result.push(processedRow[2]);
        result.push(processedRow[3]);
    })
    //progress.exit();
    //console.log(result);
    return result;
}

function map (num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function setClassification(rowId, value, all) {
    return new Promise((resolve, reject) => {
        con.query('UPDATE training_data SET ml_classification = ?, ml_classification_all = ? WHERE id = ?', [value, all, rowId], function (error, results, fields) {
            if (error) throw error;
            // Neat!
            //console.log('Updated!', rowId)
            //log('Classifying #' +rowId, ' ', '\tas', value, 'all:', all);
            resolve();
        });
    });
}

function saveModel(jsonString) {
    return new Promise((resolve, reject) => {
        con.query('INSERT INTO `training_models` (`id`, `content`, `created_at`, `updated_at`) VALUES (NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [jsonString], function (error, results, fields) {
            if (error) throw error;
            resolve();
        });
    });
}
function getMLModel(id) {
    let sql;
    if (typeof id === 'undefined') {
        sql = "SELECT * FROM training_models ORDER BY id DESC LIMIT 1";
    } else {
        sql = "SELECT * FROM training_models WHERE id = " + id + " LIMIT 1";
    }
    return new Promise((resolve, reject) => {
        con.query(sql, function (error, results, fields) {
            if (error) throw error;
            resolve(results[0]);
        });
    })
}

function drawProgress(p)  {
    process.stdout.write(`${p.toFixed(2)}% done classifying..`);
    if (p === 100) {
        log();
    } else {
        process.stdout.write(`\r`);
    }
    //console.log();
}

function PromiseAllWithProgress(proms, progress_cb) {
    let d = 0;
    progress_cb(0);
    proms.forEach((p) => {
        p.then(()=> {
            d ++;
            progress_cb( (d * 100) / proms.length );
        });
    });
    return Promise.all(proms);
}
