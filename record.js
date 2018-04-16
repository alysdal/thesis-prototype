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
  // message is Buffer

  if (msg == 'STARTFRAME') {
    var d = new Date();
    var dateformated = d.toISOString().replace('T', ' ').replace('Z', '');
    currentFile = "recording " + dateformated + ".log";
    console.log('Frame started on', device)
    currentFrame = [];
    return;
  } else if (msg == 'STOPFRAME') {
    console.log('Frame stopped on', device);
    z
    currentFrame = [];
    return;
  }

  var splitMsg = msg.split("\t");

  var points = {
    x: splitMsg[0],
    y: splitMsg[1],
    z: splitMsg[2],
    t: splitMsg[3],
  }

  currentFrame.push(points);

  process.stdout.write('.');

  //fs.appendFileSync('./data/' + currentFile, msg + "\n");
  //client.end()
})

function save(data) {
  var query = con.query('INSERT INTO training_data SET ?', data, function (error, results, fields) {
    if (error) throw error;
    // Neat!
    console.log('SAVED!')
  });
}
