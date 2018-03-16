# mqtt-x10-bridge

This project bridges the gap between X10 based devices and
newer SmartHome IoT devices that rely on mqtt. X10 has 
a signifacant install base and the cost to convert a complete
X10 install to modern IoT devices is cost prohibitive. This libary
allows X10 device to respond to mqtt messages and blend seemlessly 
into a modern IoT network.  A psudeo state of the device is stored
so the state can be queried.

A key part of the config.json file maps mqtt topics to devices. This 
tell mqtt-x10-bridge which topics to subscribe to and when a message
is recieved what x10 device to turn on/off.

<PRE>
	.
	.
 	"topics":{
		"house/livingroom/lamp/command":{
        	"house":"G",
        	"module":"2",
        	"status":"house/livingroom/lamp/status"
      	},
     .
     .
</PRE>

For each device an entry into topics to added.  The status 
entry is the queue to publish current status to.  The current
status is stored so it can be queries like modern IoT devices.

The bridge depends on the node-x10-comm module to send the commands
to the serial port and the serialport module to interface with the
serial port itself.

The message body is a simple 0 or 1 for on or off. An example of 
publishing a message to turn off the device using mosquitto_pub client:

<pre>
	mosquitto_pub -h 127.0.0.1 -t house/outside/landscaping/command -m 0
</pre>

The configuration entries that must be updated include:

* mqttServerUrl - url of the mqtt server to connect to.  This can either start
  with tcp:// or mqtts://. If it starts with mqtts://  there must be a subdirectory
  in the lib directory called mqttclient which contains ca.cert, client.cert,
  client.key which contain the key and associated certificates for a client
  which is authorized to connect to the mqtt server.
* serialPort - the serial port that should be used to send out the commands
* topics - a mapping of topics to devices
	house: X10 house code
	module: X10 module number
	status: mqtt topic to publish current device status 

# Installation

Clone this repository and then run npm install.  
Make sure you have installed both gcc-4.8 and g++-4.8 and they are the default compilers
as native compiles are required for the serialport module. 

# Running

To run the mqtt-x10-bridge app, add node.js to your path (currently requires 4.x or better) and
then run:

<PRE>
npm start
</PRE>

## other modules

* [serialport](https://www.npmjs.com/package/serialport)
* [node-x10-comm](https://www.npmjs.com/package/node-x10-comm)

