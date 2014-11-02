/**
 * Created by pingo on 29.12.2013.
 */

var fs = require('fs'),    
    MainsData = require('../libs/MainsData'),
    dateUtils = require('../libs/dateUtils'),
    config = require('../config');

// Config
var logFolder = config.powerLogger.logsFolder;


var sums;
var counter = 0;



function addToSum(mainsData){

    counter++;

    if(!sums){
        sums = mainsData;
        return;
    }

    sums.phase1.realPower += mainsData.phase1.realPower;
    sums.phase1.apparentPower += mainsData.phase1.apparentPower;
    sums.phase1.Vrms += mainsData.phase1.Vrms;
    sums.phase1.Irms += mainsData.phase1.Irms;
    sums.phase1.powerFactor += mainsData.phase1.powerFactor;
    sums.phase2.realPower += mainsData.phase2.realPower;
    sums.phase2.apparentPower += mainsData.phase2.apparentPower;
    sums.phase2.Vrms += mainsData.phase2.Vrms;
    sums.phase2.Irms += mainsData.phase2.Irms;
    sums.phase2.powerFactor += mainsData.phase2.powerFactor;
    sums.phase3.realPower += mainsData.phase3.realPower;
    sums.phase3.apparentPower += mainsData.phase3.apparentPower;
    sums.phase3.Vrms += mainsData.phase3.Vrms;
    sums.phase3.Irms += mainsData.phase3.Irms;
    sums.phase3.powerFactor += mainsData.phase3.powerFactor;

}

function calcAverages(){
        
    if(!sums){        
        return;
    }
        

//    var avgs = extend({}, sums); //shallow copy
    var avgs = new MainsData(sums.serialize(), sums.timestamp);

    avgs.phase1.realPower = sums.phase1.realPower / counter;
    avgs.phase1.apparentPower = sums.phase1.apparentPower / counter;
    avgs.phase1.Vrms = sums.phase1.Vrms / counter;
    avgs.phase1.Irms = sums.phase1.Irms / counter;
    avgs.phase1.powerFactor = sums.phase1.powerFactor / counter;
    avgs.phase2.realPower = sums.phase2.realPower / counter;
    avgs.phase2.apparentPower = sums.phase2.apparentPower / counter;
    avgs.phase2.Vrms = sums.phase2.Vrms / counter;
    avgs.phase2.Irms = sums.phase2.Irms / counter;
    avgs.phase2.powerFactor = sums.phase2.powerFactor / counter;
    avgs.phase3.realPower = sums.phase3.realPower / counter;
    avgs.phase3.apparentPower = sums.phase3.apparentPower / counter;
    avgs.phase3.Vrms = sums.phase3.Vrms / counter;
    avgs.phase3.Irms = sums.phase3.Irms / counter;
    avgs.phase3.powerFactor = sums.phase3.powerFactor / counter;

    //round all values to 4 decimal places
    for(var prop in avgs){
        if(prop === "timestamp"){
            continue;
        }
        else{
            for(var prop2 in avgs[prop]){
                avgs[prop][prop2] = Math.round(avgs[prop][prop2]*10000)/10000;
            }
        }
    }

    //reset sums
    sums = undefined;
    counter = 0;

    return avgs;
}


function logMinute(date){
    var averages = calcAverages();
    if(!averages){
        console.log('No power data has been collected in this minute, if this message repeats there might be a problem with acquiring power data.');
        return;
    }
        
    var data = date.toISOString() + "," + averages.serialize() + "\n";
    var path = 	logFolder + "/" + dateUtils.dateYYYYMMddString(date);

    console.log(path, "+=", data);
    fs.appendFile(path, data, function (err) {
        if(err){
            console.log(err);
        }
    });
}

//function dateYYYYMMddString(date){
//    return [date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate()].join("-");
//}




module.exports = function(EventEmitters) {
        
    var powerEmitter = require('../libs/powerMonitor.js')(EventEmitters);
        
    powerEmitter.on('power', function(mainsData) {
        //console.log(mainsData);
        addToSum(mainsData);
    });
    
    setInterval(function(){
        var date = new Date();
        if(date.getUTCSeconds() === 59){
            logMinute(date);
        }
    }, 1000);
    
};