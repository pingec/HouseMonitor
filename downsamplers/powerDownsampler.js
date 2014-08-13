/**
 * Created by pingo on 31.12.2013.
 */


var config = require('../config'),
    powerLogsFolder = config.powerLogger.logsFolder,                    //where to look for power logs, it is assumed the folder contains only files with names going by date eg. "2013-11-23"
    downSampledTargetFile = config.powerDownsampler.downsamplePath,     //the target file to be filled with cumulative data per hourly intervals (if it already exists it will be updated with any new data)
    fs = require('fs'),
    path = require('path'),
    MainsData = require('../libs/MainsData'),
    dateUtils =  require('../libs/dateUtils'),
    findEarliestLog = require('./common').findEarliestLog,
    Promise = require('bluebird'),
    MainsDataAvgs = require('../libs/MainsDataAvgs');

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
        return promise(powerLogsFolder, downSampledTargetFile);
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
    //for(var dateIterator = oldestDate; dateIterator <= toDate; dateIterator.setHours(dateIterator.getHours() +1)){
    //dateIterator.setHours(dateIterator.getHours() +1) will get stuck at new Date(1396137600000) == Sun Mar 30 2014 01:00:00 GMT+0100 (Central Europe Standard Time) -> wont get incremented
    //this is because of daylight savings time, apparently the date here goes from Sun Mar 30 2014 01:00:00 to Sun Mar 30 2014 03:00:00, there is no Sun Mar 30 2014 02:00:00 and doing .setHours(2) will return
    //Sun Mar 30 2014 01:00:00 so the counter will be stuck http://stackoverflow.com/questions/5391177/javascript-sethours1-not-working-for-mar-27-2011-010000-gmt0100
    
    for(var dateIterator = oldestDate; dateIterator <= toDate; dateIterator.setTime(dateIterator.getTime() + (60*60*1000))){
    //for(var dateIterator = new Date(new Date().setHours(new Date().getHours()-1,0,0,0)); dateIterator >= oldestDate; dateIterator.setHours(dateIterator.getHours() -1)){
        console.log("Looking for any data on +1 hour interval since:", dateIterator);

        if(filePath !== path.join(powerLogsFolder, dateUtils.dateYYYYMMddString(dateIterator))){
            filePath = path.join(powerLogsFolder, dateUtils.dateYYYYMMddString(dateIterator));
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

        var mainsDataHourly = null;
        var matchCount = 0;
        if(array && array.length){
            console.log("Scanning file...");
            for(var i = 0; offset - i > -1 ;i++){   //offset-i is too loose of a constraint, no need to check whole file all the time, there should be an additional condition that equalByDateAndHour(timestamp, dateIterator) == true
                var line = array[offset-i];
                var split = line.split(",");
                var timestamp = new Date(split.splice(0,1)[0]);  //remove first element from array and store it
                var mains = new MainsData(split.join(","), new Date(dateIterator));

                if(dateUtils.equalByDateAndHour(timestamp, dateIterator) && mains.validate(3000, 3000, 200, 300)){
                    //console.log("Found data match!", timestamp);
                    matchCount++;
                    if(!mainsDataHourly){
                        mainsDataHourly = new MainsDataAvgs(mains);
                    }
                    else{
                        mainsDataHourly.add(mains);
                    }
                }
            }
            console.log("Finished scanning file.");
        }
        if(mainsDataHourly !== null){
            console.log("There were matches. (@matchCount matches)".replace("@matchCount", matchCount));
            mainsDataHourly.calcAvgs();
            mainsDataHourly.toFixed(2); //trim stored values to 2 decimal places
            var mains2 = mainsDataHourly;
            fs.appendFileSync(downSampledTargetFile, mains2.timestamp.toISOString() + "," + mains2.serialize() + "\n");
        }
        else{
            console.log("There were ZERO matches (sigh).");
            var mains3 = new MainsData(null, new Date(dateIterator));
            fs.appendFileSync(downSampledTargetFile, mains3.timestamp.toISOString() + "," + mains3.serialize() + "\n");
        }
    }

    console.log("Finished processing all data.");
}


module.exports.run = main;