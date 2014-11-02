/**
 * Dumps current data to files for other programs to use. 
 * WARNING: This will do a lot of writes so it is strongly advised to use a RAM disk for this purpose!
 */


var MainsData = require('../libs/MainsData'),
    fs = require('fs'),
    dateUtils = require('../libs/dateUtils'),
    config = require('../config'),
    path = require('path'),
    tempsCache = {};



var logFolder = config.liveDataToFileExporter.logsFolder;
var temperatureFile = path.join(logFolder, config.liveDataToFileExporter.temperatureFile);
var powerFile = path.join(logFolder, config.liveDataToFileExporter.powerFile);
var flowDataFile = path.join(logFolder, config.liveDataToFileExporter.flowDataFile);



    
module.exports = function(EventEmitters) {
    
    if(!config || !config.liveDataToFileExporter || !config.liveDataToFileExporter.logsFolder)
        return;
    
    
    if (!fs.existsSync(logFolder))
        return;
        
    var tempEmitter = require('../libs/tempMonitor.js')(EventEmitters);
    var powerEmitter = require('../libs/powerMonitor.js')(EventEmitters);
        
    if(powerFile){
        powerEmitter.on('power', function(mainsData) {
            //console.log(mainsData);
            var output = mainsData.phase1.Irms + 'A ' + mainsData.phase2.Irms + 'A ' + mainsData.phase3.Irms + 'A ';
            fs.writeFile(powerFile, output);
        });
    }

    if(temperatureFile){    
        tempEmitter.on('temp', function(temps) {
            //    console.log(temps);
            for(var i = 0; i < temps.length; i++){
                var entry = temps[i];   //example structure: { addr: '289547CE0400004E', temp: '41.25' }
                tempsCache[entry.addr] = entry.temp;
            }
            var output = [];
            for (var addr in tempsCache) {
              if (tempsCache.hasOwnProperty(addr)) {
                output.push(tempsCache[addr]);
              }
            }
            fs.writeFile(temperatureFile, output.join(','));
        });
    }

    if(flowDataFile){
        //todo...
    }
    
};