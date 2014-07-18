/**
 * Created by pingo on 21.1.2014.
 */
var config = require('../config'),
    tempLogsFolder = config.tempLogger.logsFolder,
    downSampledTargetFile = config.tempDownsampler.downsamplePath,
    fs = require('fs'),
    path = require('path'),
    dateUtils =  require('../libs/dateUtils'),
    TempData = require('../libs/TempData'),
    TempDataHandler = require('../libs/TempDataHandler'),
    TempDataAvgs = require('../libs/TempDataAvgs'),
    findEarliestLog = require('./common').findEarliestLog,
    Promise = require('bluebird');

Promise.promisifyAll(fs);


main().then(function(){
    console.log('ALL DONE!');
});

/*
 * Will process power logs according to configuration in config.js
 */
function main(){
    return fs.statAsync(downSampledTargetFile).catch(function(err){
        if(err.cause.errno === 34){ //file does not exist
            return fs.openAsync(downSampledTargetFile, 'a');
        }
        else{
            throw(err);
        }
    }).then(function(){
        var promise = Promise.promisify(findEarliestLog);
        return promise(tempLogsFolder, downSampledTargetFile);
    }).then(function(oldestDate){
        walkLogsSync(oldestDate);
        return Promise.resolve();
    });
}

/*
 * This method is blocking and might take a while (depending on unprocessed logs size)
 */
function walkLogsSync(oldestDate){


    console.log("Determined earliest date of interest:", oldestDate);
    console.log("Looking for data on interval from ", oldestDate, " to ", new Date(new Date().setMinutes(0,0,0)));
    
    var filePath = null;
    var array = null;
    var offset = null;
    //start with current date(-1 hour because current hour is not finished and we do not want to sum an unfinished interval) and unwind it until oldestDate
    var toDate = new Date(new Date().setHours(new Date().getHours()-1,0,0,0));
    
    for(var dateIterator = oldestDate; dateIterator <= toDate; dateIterator.setTime(dateIterator.getTime() + (60*60*1000))){
        console.log("Looking for any data on +1 hour interval since:", dateIterator);

        if(filePath !== path.join(tempLogsFolder, dateUtils.dateYYYYMMddString(dateIterator))){
            filePath = path.join(tempLogsFolder, dateUtils.dateYYYYMMddString(dateIterator));
            console.log("Looking for a new file:", filePath);
            if(fs.existsSync(filePath)){
                console.log("File exists. Will be read to memory.");
                array = fs.readFileSync(filePath).toString().split('\n');
                offset = array.length-2;    //-2 because last elemnt is an empty string
            }
            else{
                console.log("File not found.");
                array = null;   //flush "cache"
            }
        }
        
        var temperatureDataHourly = new TempDataAvgs();
        var matchCount = 0;
        if(array && array.length){
            console.log("Scanning file...");
            for(var i = 0; offset - i > -1 ;i++){   //offset-i is too loose of a constraint, no need to check whole file all the time, there should be an additional condition that equalByDateAndHour(timestamp, dateIterator) == true
                var line = array[offset-i];
                var temperatureData = new TempData(line);
                
                if(dateUtils.equalByDateAndHour(temperatureData.timestamp, dateIterator) && TempDataHandler.validate(temperatureData, -1, 70)){
                    matchCount++;
                    temperatureDataHourly.add(temperatureData);
                }
            }
            console.log("Finished scanning file.");
        }
        var hourlyAvg, hour, temps;
        if(temperatureDataHourly.timestamp){ //if timestamp is not set, no temp datapoints have been added, the object is empty
            console.log("There were matches. (@matchCount matches)".replace("@matchCount", matchCount));
            temperatureDataHourly.calcAvgs();
            hourlyAvg = [new Date(dateIterator), temperatureDataHourly];
            hour = hourlyAvg[0];
            temps = hourlyAvg[1];
            fs.appendFileSync(downSampledTargetFile, hour.toISOString() + "," + temps.serialize() + "\n");
        }
        else{
            console.log("There were ZERO matches (sigh).");
            hourlyAvg = [new Date(dateIterator), null];
            hour = hourlyAvg[0];
            temps = hourlyAvg[1];
            fs.appendFileSync(downSampledTargetFile, hour.toISOString() + "," +  "null" + "\n");
        }
    }

    console.log("Finished processing all data.");

}

module.exports.run = main;