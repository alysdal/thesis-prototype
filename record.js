const fs = require('fs');
var mqtt = require('mqtt')
var mysql = require('mysql');

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

var client  = mqtt.connect('mqtt://159.65.194.72:1883',{
    username: '1',
    password: 'f3e497e2b33b632572b4f624481f3853'
},function(err, client) {
    if (err) throw err;


});

client.on('connack', function(packet) {
    if (packet.returnCode !== 0) {
        throw 'Connect error'
    }
});

client.on('connect', function () {
    client.subscribe('1/#')
})

var currentFile = "";
var currentFrame = [];

client.on('message', function (topic, message) {

    var msg = message.toString();
    var device = topic.split('/')[1];
    var type = topic.split('/')[2];

    console.log('Got message from ', device, 'of type', type);

    if (type === 'motion') {
        saveMotion(msg, device);
    }

});

function saveMotion(message, device) {

    let coords = [];

    let lines = message.split("\n");
    lines.forEach((line) => {

        let splitMsg = line.split("\t");
        if (splitMsg.length !== 4) {
          return;
        }
        let points = {
            x: splitMsg[0],
            y: splitMsg[1],
            z: splitMsg[2],
            t: splitMsg[3],
        };

        coords.push(points);
    });



    var insertData  = {
        device: device,
        type: 'tool',
        data: JSON.stringify(coords)
    };
    save(insertData);
}

function save(data) {
    var query = con.query('INSERT INTO training_data SET ?', data, function (error, results, fields) {
        if (error) throw error;
        // Neat!
        console.log('SAVED!')
    });
}
