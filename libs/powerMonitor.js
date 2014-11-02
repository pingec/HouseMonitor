/**
 * Created by pingo on 29.12.2013.
 */

var SerialPort = require("serialport"),
    EventEmitter = require('events').EventEmitter,
    MainsData = require('./MainsData'),
    config = require('../config');







module.exports = function(EventEmitters) {
    
    //never create more than one instance
    if(EventEmitters.powerEmitter)
        return EventEmitters.powerEmitter;
    
    EventEmitters.powerEmitter = new EventEmitter(); 
        
    var serialPort = new SerialPort.SerialPort(config.powerMonitor.serialDev, {
        baudrate: config.powerMonitor.baudRate,
        parser: SerialPort.parsers.readline('\n')
    });

    serialPort.on("open", function () {
        console.log('Serial port connection open');
        serialPort.on('data', function(data) {
            var mains = new MainsData(data);
            EventEmitters.powerEmitter.emit("power", mains);
        });
    });
    
    return EventEmitters.powerEmitter;
};