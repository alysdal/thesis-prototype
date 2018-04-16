var brain = require('brain.js');
const fs = require('fs');
var mysql = require('mysql');


var net = new brain.NeuralNetwork();

let data = [
    {input: { r: 0.03, g: 0.7 }, output: { black: 1 }},
    {input: { r: 0.16, b: 0.2 }, output: { white: 1 }},
    {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}];

net.train(data, {
  log: true,
    iterations: 20000,
    logPeriod: 100,
});


let baba = net.run({ r: 1, g: 0.4, b: 0 });  // [0]

console.log(baba);

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : 'thesis'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

getClassifiedData(results => {
    var net = new brain.NeuralNetwork();


    for (let row in results) {
    console.log(row.data);
    exit();


      let thisPoint = {
        input: d,
        output: {}
      }
      thisPoint.output[row.category] = 1;

      data.push(thisPoint);
    }

    /*let data = [
        {input: { r: 0.03, g: 0.7 }, output: { black: 1 }},
        {input: { r: 0.16, b: 0.2 }, output: { white: 1 }},
        {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}];*/

    net.train(data, {
        log: true,
        iterations: 20000,
        logPeriod: 100,
    });


    let baba = net.run({ r: 1, g: 0.4, b: 0 });  // [0]
});

function getClassifiedData(cb) {
    let query = con.query('SELECT * FROM training_data WHERE category is not NULL', data, function (error, results, fields) {
        if (error) throw error;

        results.forEach(row => {

            let cordsData = new Array(row.data).map(r => {
                let cords = JSON.parse(r);
                console.log(cords);
                return cords;
            })
            row.data = cordsData;

        })

        //console.log(results);

        cb(results);
    });

}


function save(data) {
  var query = con.query('INSERT INTO training_data SET ?', data, function (error, results, fields) {
    if (error) throw error;
    // Neat!
    console.log('SAVED!')
  });
}
