/**
 * Created by pingo on 29.12.2013.
 */

var SerialPort = require("serialport"),
    EventEmitter = require('events').EventEmitter,
    MainsData = require('./MainsData'),
    config = require('../config');







module.exports = function(EventEmitters) {
    
    //never create more than one instance
    if(EventEmitters.powerEmitter){
        return EventEmitters.powerEmitter;
    }
    
    EventEmitters.powerEmitter = new EventEmitter(); 
        
    var serialPort = new SerialPort.SerialPort(config.powerMonitor.serialDev, {
        baudrate: config.powerMonitor.baudRate,
        parser: SerialPort.parsers.readline('\n')
    });

    serialPort.on("open", function () {
        console.log('Serial port connection open');
        serialPort.on('data', function(data) {
            
            //if data begins with 'FM' it contains flowmeter data, first two values must be extracted
            if(data.indexOf('FM') === 0){
                var array = data.split(",");
                var flow = array.shift().replace('FM', '');
                var temp = array.shift();
                data = array.join(',');
                EventEmitters.powerEmitter.emit('flow', {
                    flow: flow, 
                    temp: temp});
            }
            
            var mains = new MainsData(data);
            EventEmitters.powerEmitter.emit("power", mains);
        });
    });
    
    return EventEmitters.powerEmitter;
};