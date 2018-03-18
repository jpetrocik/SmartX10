// Copyright 2015-2016 the project authors as listed in the AUTHORS file.
// All rights reserved. Use of this source code is governed by the
// license that can be found in the LICENSE file.

//TODO Implement current status
//TODO Implement toogle
var mqtt = require('mqtt');
var x10 = require('node-x10-comm');
var config = require('./config.json');
const fs = require('fs');

var x10device = x10.device();

var processCommand = function(device, command) {
	if (command == 3) {
		console.log('Sending status command ' + device.house + device.module);
		var status = fs.existsSync('/var/lock/X10/' + device.house + device.module)?"ON":"OFF";
		mqttClient.publish(device.status,'{"status":"' + status + '"}');

	} else {
		x10device.open(config.serialPort, () => {
			x10device.sendCommand(device.house.charCodeAt(0) - 'A'.charCodeAt(0), device.module - 1, parseInt(command), () => {
					if (command == 1) {
						console.log('Turned on ' + device.house + device.module);
						fs.closeSync(fs.openSync('/var/lock/X10/' + device.house + device.module, 'w'));
						mqttClient.publish(device.status,'{"status":"ON"}');
					} else if (command == 0) {
						console.log('Turned off ' + device.house + device.module);
						fs.unlink('/var/lock/X10/' + device.house + device.module, (err) => {});
						mqttClient.publish(device.status,'{"status":"OFF"}');
					}
				}, () => {
					console.log('X10 command failed');
				});
		}, (err) => {
	 		console.log("Failed to open " + config.serialPort);
	 		console.log("Details");
	 		console.log(err);
		});
	}
};

// setup mqtt
var mqttOptions;
if (config.mqttServerUrl.indexOf('mqtts') > -1) {
	mqttOptions = { key: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.key')),
									cert: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.cert')),
									ca: fs.readFileSync(path.join(__dirname, 'mqttclient', '/ca.cert')),
									checkServerIdentity: function() { return undefined }
	}
}

var mqttClient = mqtt.connect(config.mqttServerUrl, mqttOptions);
mqttClient.on('connect', function() {
		console.log("Connected to " + config.mqttServerUrl);
		console.log("Subscribing to house/command");
		mqttClient.subscribe("house/command");
		Object.keys(config.topics).forEach(function(key) {
			console.log("Subscribing to " + key);
			mqttClient.subscribe(key);
		});
	});

mqttClient.on('message', function(topic, message) {
	console.log("Message recieved on " + topic);
		if (topic == "house/command") {
			Object.keys(config.topics).forEach(function(key) {
				processCommand(topics[key], command);
			}
		} else {
			var command = message.toString();
			var device = config.topics[topic];
			processCommand(device, command);
		}
	});
