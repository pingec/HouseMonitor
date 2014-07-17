/**
 * Created by pingo on 28.12.2013.
 */

var exec = require('child_process').exec,
    EventEmitter = require('events').EventEmitter,
    config = require('../config');

exports.tempEmitter = new EventEmitter();

var cmds = [];
var pendings = [];
config.tempMonitor.digiTempCfgs.forEach(function(cfgName){
    cmds.push('digitemp_DS9097 -a -q -c ' + cfgName);
    pendings.push(false);
});

//var cmds = [
//    'digitemp_DS9097 -a -q -c digitemp_pl2303_0',
//    'digitemp_DS9097 -a -q -c digitemp_pl2303_1'];

//var pendings = [];
//for(var i = 0; i < cmds.length; i++){
//    pendings[i] = false;
//}


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
