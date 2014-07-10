/**
 * Created by pingo on 28.12.2013.
 */

var exec = require('child_process').exec,
    EventEmitter = require('events').EventEmitter;

exports.tempEmitter = new EventEmitter();

//region Example usage
//var tempMonitor = require('./tempMonitor.js');
//var tempEmitter = tempMonitor.tempEmitter;
//tempEmitter.on('temp', function(temps) {
//    console.log(temps);
//});
//Example output:
//[ { addr: '289547CE0400004E', temp: '41.25' },
//    { addr: '28B517CE0400006D', temp: '36.62' },
//    { addr: '289F50CE040000AC', temp: '39.12' } ]
//endregion

//region Temps Config
//pi@raspberrypi ~/node_testing $ cat digitemp_pl2303_0
//TTY /dev/pl2303_0
//READ_TIME 1000
//LOG_TYPE 1
//LOG_FORMAT "%b %d %H:%M:%S Sensor %R C: %.2C F: %.2F"
//CNT_FORMAT "%b %d %H:%M:%S Sensor %s #%n %C"
//HUM_FORMAT "%b %d %H:%M:%S Sensor %s C: %.2C F: %.2F H: %h%%"
//SENSORS 4
//ROM 0 0x28 0xBE 0x24 0xCE 0x04 0x00 0x00 0x5F
//ROM 1 0x28 0x95 0x47 0xCE 0x04 0x00 0x00 0x4E
//ROM 2 0x28 0xB5 0x17 0xCE 0x04 0x00 0x00 0x6D
//ROM 3 0x28 0x9F 0x50 0xCE 0x04 0x00 0x00 0xAC
//pi@raspberrypi ~/node_testing $ cat digitemp_pl2303_1
//TTY /dev/pl2303_1
//READ_TIME 1000
//LOG_TYPE 1
//LOG_FORMAT "%b %d %H:%M:%S Sensor %R C: %.2C F: %.2F"
//CNT_FORMAT "%b %d %H:%M:%S Sensor %s #%n %C"
//HUM_FORMAT "%b %d %H:%M:%S Sensor %s C: %.2C F: %.2F H: %h%%"
//SENSORS 1
//ROM 0 0x28 0xF3 0x81 0xCE 0x04 0x00 0x00 0x81
var cmds = [
    'digitemp_DS9097 -a -q -c digitemp_pl2303_0',
    'digitemp_DS9097 -a -q -c digitemp_pl2303_1'];
//endregion

var pendings = [];
for(var i = 0; i < cmds.length; i++){
    pendings[i] = false;
}


//setInterval(function(){
//    for(var i = 0; i < pendings.length; i++){
//        if(!pendings[i]){
//            pendings[i] = true;
//            var cmd = cmds[i];
//            queryTemp(cmd, function(i){
//                return function(temps){
//                    exports.tempEmitter.emit('temp', temps, i);
//                    pendings[i] = false; //i is closed over
//                };
//            }(i));
//        }
//    }
//}, 100);
function doQueryTemp(i){
    queryTemp(cmds[i], function(err, temps){
        pendings[i] = false; //clear flag in any case
        if(err === null){
            exports.tempEmitter.emit('temp', temps, i);
        }
    });
}
setInterval(function(){
    for(var i = 0; i < pendings.length; i++){
        if(!pendings[i]){
            pendings[i] = true;
            doQueryTemp(i);
        }
    }
}, 100);


function queryTemp(cmd, callback){
    exec(cmd, function(err, stdout, stderr){
        if (err !== null) {
            console.log('exec error: ' + err);
            console.log('stderr: ' + stderr);
            callback(err);
        }
        var str = stdout;
        var regex = /Sensor (.*?) C: (-?\d{1,3}\.\d{2})/g;
        var temps = [];
        var match = null;
        while (match = regex.exec(str)){
            var sensrAddr = match[1];
            var temperature = match[2];
            temps.push({
                addr: sensrAddr,
                temp: temperature
            });
        }
        callback(null, temps);
    });
}
