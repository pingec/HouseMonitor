/**
 * Created by pingo on 21.1.2014.
 */
var config = require('../config'),
    tempLogsFolder = config.tempLogger.logsFolder,
    downSampledTargetFile = config.tempDownsampler.downsamplePath,
    fs = require('fs'),
    path = require('path'),
    dateUtils =  require('./dateUtils'),
    TempData = require('./TempData'),
    TempDataHandler = require('./TempDataHandler'),
    TempDataAvgs = require('./TempDataAvgs');

findEarliestTempLog(tempLogsFolder, function(err, oldestDate){
    if(err)
        console.log("err happened:", err);
    console.log("Determined earliest date of interest:", oldestDate);
    console.log("Looking for data on interval from ", oldestDate, " to ", new Date(new Date().setMinutes(0,0,0)));
    var filePath = null; //current file that is loaded into array (split by \n)
    var array = null;    //current file is read into it
    var offset = null;
    var temperatureDataHourlyAvgs = [];
    //start with current date(-1 hour because current hour is not finished and we do not want to sum an unfinished interval) and unwind it until oldestDate
    for(var dateIterator = new Date(new Date().setHours(new Date().getHours()-1,0,0,0)); dateIterator >= oldestDate; dateIterator.setHours(dateIterator.getHours() -1)){
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
        if(array && array.length){
            console.log("Scanning file...");
            for(var i = 0, matchCount = 0; offset - i > -1 ;i++){   //TODO: offset-i is too loose of a constraint, no need to check whole file all the time, there should be an additional condition that equalByDateAndHour(timestamp, dateIterator) == true
                var line = array[offset-i];
                var temperatureData = new TempData(line);

                if(dateUtils.equalByDateAndHour(temperatureData.timestamp, dateIterator) && TempDataHandler.validate(temperatureData, -1, 70)){
                    matchCount++;
                    temperatureDataHourly.add(temperatureData);
                }
            }
        }
        console.log("Finished scanning file.");
        if(temperatureDataHourly.timestamp){    //if timestamp is not set, no temp datapoints have been added, the object is empty
            console.log("There were matches. (@matchCount matches)".replace("@matchCount", matchCount));
            temperatureDataHourly.calcAvgs();
            var hourlyAvg = [new Date(dateIterator), temperatureDataHourly];
            temperatureDataHourlyAvgs.push(hourlyAvg);
        }
        else{
            console.log("There were ZERO matches (sigh).");
            var hourlyAvg = [new Date(dateIterator), null];
            temperatureDataHourlyAvgs.push(hourlyAvg);
        }
    }
    console.log("Finished processing all data. Reversing results order...");
    temperatureDataHourlyAvgs.reverse();
    console.log("Appending results to ", downSampledTargetFile);
    temperatureDataHourlyAvgs.forEach(function(hourlyAvg){
        console.log(hourlyAvg);
        var hour = hourlyAvg[0];
        var temps = hourlyAvg[1];
        fs.appendFileSync(downSampledTargetFile, hour.toISOString() + "," + (temps ? temps.serialize() : "null") + "\n");
    });
});

function findEarliestTempLog(folder, callback){
    fs.readdir(folder, function (err, files) {
        if(err)
            callback(err);
        if(!files.length)
            callback("no files found");
        //all files in target folder are supposed to be named by date eg. "2013-11-25"
        files.sort(dateUtils.dateSort);   //sort earliest to latest
        var earliestDate = new Date(files[0]);

        fs.readFile(downSampledTargetFile, function (err, data) {
            if(err) {
                console.log(err);
                callback(null, earliestDate);
            }
            else{
                var lines = data.toString().split('\n');
                var lastLine = lines.slice(-2)[0];

                var lastLine = "";
                for(var i = 0; i < lines.length && lastLine === ""; i++)
                    lastLine = lines[lines.length -1 -i];
                //it might happen that the read file is empty and lastline is thus empty
                if(!lastLine.length){
                    callback(null, earliestDate);
                    return;
                }
                var split = lastLine.split(",");
                earliestDate = new Date(split.splice(0,1)[0]);  //remove first element from array and store it
                earliestDate.setHours(earliestDate.getHours()+1);//increment by 1 hour (this timestamp was the last to already have been processed and does not need to be processed again)
                console.log(lastLine, earliestDate);
                callback(null, earliestDate);
            }
        });
    });
}