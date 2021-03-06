/**
 * Created by pingo on 28.12.2013.
 */


var fs = require('fs'),
dateUtils = require('../libs/dateUtils'),
config = require('../config'),
latestTemps = {};

var logFolder = config.tempLogger.logsFolder;


function logPerMinuteTemps(date){

    var data = date.toISOString();

    for(var addr in latestTemps){
        var average = 0;    //todo: use median instead
        for(var i = 0; i < latestTemps[addr].length; i++){
            average += parseFloat(latestTemps[addr][i]);
        }
        average = average / i;
        data += ",@addr:@avgTemp".replace("@addr", addr).replace("@avgTemp", average.toFixed(2));
    }
    data += "\n";
    latestTemps = {};
    var path = 	logFolder + "/" + dateUtils.dateYYYYMMddString(date);

    console.log(path, "+=", data);
    fs.appendFile(path, data, function (err) {
        if(err){
            console.log(err);
        }
    });
}

module.exports = function(EventEmitters) {
        
    var tempEmitter = require('../libs/tempMonitor.js')(EventEmitters);
    
    tempEmitter.on('temp', function(temps) {
    //    console.log(temps);

        for(var i = 0; i < temps.length; i++){
            var entry = temps[i];   //example structure: { addr: '289547CE0400004E', temp: '41.25' }
            latestTemps[entry.addr] = latestTemps[entry.addr] || [];
            latestTemps[entry.addr].push(entry.temp);
        }

    });

    setInterval(function(){
        var date = new Date();
        if(date.getUTCSeconds() === 59){
            logPerMinuteTemps(date);
        }
    }, 1000);
    
};
