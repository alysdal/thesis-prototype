var brain = require('brain.js');
const fs = require('fs');
var mysql = require('mysql');

var log = function(){
    console.log.apply(console, arguments);
}

var net = new brain.NeuralNetwork();

/*let data = [
    {input: { r: 0.03, g: 0.7 }, output: { black: 1 }},
    {input: { r: 0.16, b: 0.2 }, output: { white: 1 }},
    {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}];

net.train(data, {
  log: true,
    iterations: 20000,
    logPeriod: 100,
});
*/

//let baba = net.run({ r: 1, g: 0.4, b: 0 });  // [0]
//console.log(baba);

var con = mysql.createConnection({
  host: "localhost",
  user: "nicklasjust",
  password: "just3044",
  database : 'thesis'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

getClassifiedData(results => {
    var net = new brain.NeuralNetwork();

    let trainingData = [];


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

    log(trainingData[0]);

    log('Training model with ', trainingData.length, 'classified entries');

    /*let data = [
        {input: { r: 0.03, g: 0.7 }, output: { black: 1 }},
        {input: { r: 0.16, b: 0.2 }, output: { white: 1 }},
        {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}];*/

    net.train(trainingData, {
        log: true,
        iterations: 1000,
        logPeriod: 10,
    });

    log();
    getUnclassifiedData(results => {
        results.forEach(res => {
            let MLClassification = net.run(res.data);
            let best = brain.likely(res.data, net)
            log('Classifying #' +res.id, ' ', res.device, '\tas', JSON.stringify(MLClassification));
            setClassification(res.id, best);
        });
        saveModel(JSON.stringify(net.toJSON()));
    });
});

function processRowData(inputArray) {
    let arrayResults = [];

    // convert json acc data to object
    inputArray.forEach(row => {

        let frames = JSON.parse(row.data);

        let framesAdjusted = calcDeltas(frames);

        let frameSize = 50;

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

function getClassifiedData(cb) {
    con.query('SELECT * FROM training_data WHERE category is not NULL AND deleted_at is NULL', function (error, results, fields) {
        if (error) throw error;

        let arrayResults = processRowData(results);

        cb(arrayResults);
    });
}

function getUnclassifiedData(cb) {

    con.query('SELECT * FROM training_data WHERE category is NULL AND deleted_at is NULL', function (error, results, fields) {
        if (error) throw error;

        let arrayResults = processRowData(results);

        cb(arrayResults);
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
            lastData.x = x;
        }
        if (lastData.y === null) {
            lastData.y = y;
        }
        if (lastData.z === null) {
            lastData.z = z;
        }

        x = lastData.x - x;
        y = lastData.y - y;
        z = lastData.z - z;

        let d = Math.round(Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2)));


        lastData.x = row.x;
        lastData.y = row.y;
        lastData.z = row.z;
        lastData.d = d;


        let processedRow = {
        //    x: map(x, -25000, 25000, -1, 1),
        //   y: map(y, -25000, 25000, -1, 1),
        //    z: map(z, -25000, 25000, -1, 1),
            d:map(d, -25000, 25000, -1, 1),
        };

        processedRow = map(d, -25000, 25000, -1, 1);


        result.push(processedRow)
    })
    return result;
}

function map (num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function setClassification(rowId, value) {
    con.query('UPDATE training_data SET ml_classification = ? WHERE id = ?', [value, rowId], function (error, results, fields) {
        if (error) throw error;
        // Neat!
        console.log('Updated!', rowId)
    });
}

function saveModel(jsonString) {

    con.query('INSERT INTO `training_models` (`id`, `content`, `created_at`, `updated_at`) VALUES (NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [jsonString], function (error, results, fields) {
        if (error) throw error;
        // Neat!
        console.log('Saved net!');
    });
}


