/**
 * Created by pingo on 29.12.2013.
 */

var SerialPort = require("serialport"),
    EventEmitter = require('events').EventEmitter,
    MainsData = require('./MainsData');

exports.powerEmitter = new EventEmitter();



var serialPort = new SerialPort.SerialPort("/dev/ttyACM0", {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\n')
});

serialPort.on("open", function () {
    console.log('Serial port connection open');
    serialPort.on('data', function(data) {
        var mains = new MainsData(data);
        exports.powerEmitter.emit("power", mains);
        //addToSum(mains);
        //io.sockets.emit('power', mains);
    });
});


