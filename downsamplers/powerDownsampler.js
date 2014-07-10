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
    fileReader = require('../libs/fileReader');



findEarliestPowerLog2(powerLogsFolder, function(err, oldestDate){
    if(err){
        console.log("err happened:", err);
    }

    console.log("Determined earliest date of interest:", oldestDate);
    console.log("Looking for data on interval from ", oldestDate, " to ", new Date(new Date().setMinutes(0,0,0)));
    
    var filePath = null;
    var array = null;
    var offset = null;
    var mainsDataHourlyAvgs = [];
    //start with current date(-1 hour because current hour is not finished and we do not want to sum an unfinished interval) and unwind it until oldestDate
    var toDate = new Date(new Date().setHours(new Date().getHours()-1,0,0,0));
    for(var dateIterator = oldestDate; dateIterator <= toDate; dateIterator.setHours(dateIterator.getHours() +1)){
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
                    console.log("Found data match!", timestamp);
                    matchCount++;
                    if(!mainsDataHourly){
                        mainsDataHourly = mains;
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
            mainsDataHourly.divide(matchCount);  //average
            mainsDataHourly.toFixed(2); //trim stored values to 2 decimal places
            mainsDataHourlyAvgs.push(mainsDataHourly);
        }
        else{
            console.log("There were ZERO matches (sigh).");
            mainsDataHourlyAvgs.push(new MainsData(null, new Date(dateIterator)));
        }
    }

    console.log("Finished processing all data. Reversing results order...");
    //mainsDataHourlyAvgs.reverse();
    console.log("Appending results to ", downSampledTargetFile);
    var targetFile = fs.createWriteStream(downSampledTargetFile, { flags: 'a'});
    targetFile.on('error', function(err) { console.log(err);});
    mainsDataHourlyAvgs.forEach(function(mains){
        console.log(mains);
        targetFile.write(mains.timestamp.toISOString() + "," + mains.serialize() + "\n");
    });
    targetFile.end();
});

//
//findEarliestPowerLog(powerLogsFolder, function(err, oldestDate){
//    if(err){
//        console.log("err happened:", err);
//    }
//
//    console.log("Determined earliest date of interest:", oldestDate);
//    console.log("Looking for data on interval from ", oldestDate, " to ", new Date(new Date().setMinutes(0,0,0)));
//    
//    var filePath = null;
//    var array = null;
//    var offset = null;
//    var mainsDataHourlyAvgs = [];
//    //start with current date(-1 hour because current hour is not finished and we do not want to sum an unfinished interval) and unwind it until oldestDate
//    for(var dateIterator = new Date(new Date().setHours(new Date().getHours()-1,0,0,0)); dateIterator >= oldestDate; dateIterator.setHours(dateIterator.getHours() -1)){
//        console.log("Looking for any data on +1 hour interval since:", dateIterator);
//
//        if(filePath !== path.join(powerLogsFolder, dateUtils.dateYYYYMMddString(dateIterator))){
//            filePath = path.join(powerLogsFolder, dateUtils.dateYYYYMMddString(dateIterator));
//            console.log("Looking for a new file:", filePath);
//            if(fs.existsSync(filePath)){
//                console.log("File exists. Will be read to memory.");
//                array = fs.readFileSync(filePath).toString().split('\n');
//                offset = array.length-2;    //-2 because last elemnt is an empty string
//            }
//            else{
//                console.log("File not found.");
//                array = null;   //flush "cache"
//            }
//        }
//
//        var mainsDataHourly = null;
//        var matchCount = 0;
//        if(array && array.length){
//            console.log("Scanning file...");
//            for(var i = 0; offset - i > -1 ;i++){   //offset-i is too loose of a constraint, no need to check whole file all the time, there should be an additional condition that equalByDateAndHour(timestamp, dateIterator) == true
//                var line = array[offset-i];
//                var split = line.split(",");
//                var timestamp = new Date(split.splice(0,1)[0]);  //remove first element from array and store it
//                var mains = new MainsData(split.join(","), new Date(dateIterator));
//
//                if(dateUtils.equalByDateAndHour(timestamp, dateIterator) && mains.validate(3000, 3000, 200, 300)){
//                    console.log("Found data match!", timestamp);
//                    matchCount++;
//                    if(!mainsDataHourly){
//                        mainsDataHourly = mains;
//                    }
//                    else{
//                        mainsDataHourly.add(mains);
//                    }
//                }
//            }
//        }
//        console.log("Finished scanning file.");
//        if(mainsDataHourly !== null){
//            console.log("There were matches. (@matchCount matches)".replace("@matchCount", matchCount));
//            mainsDataHourly.divide(matchCount);  //average
//            mainsDataHourly.toFixed(2); //trim stored values to 2 decimal places
//            mainsDataHourlyAvgs.push(mainsDataHourly);
//        }
//        else{
//            console.log("There were ZERO matches (sigh).");
//            mainsDataHourlyAvgs.push(new MainsData(null, new Date(dateIterator)));
//        }
//    }
//
//    console.log("Finished processing all data. Reversing results order...");
//    mainsDataHourlyAvgs.reverse();
//    console.log("Appending results to ", downSampledTargetFile);
//    var targetFile = fs.createWriteStream(downSampledTargetFile, { flags: 'a'});
//    targetFile.on('error', function(err) { console.log(err);});
//    mainsDataHourlyAvgs.forEach(function(mains){
//        console.log(mains);
//        targetFile.write(mains.timestamp.toISOString() + "," + mains.serialize() + "\n");
//    });
//    targetFile.end();
//
//});



function findEarliestPowerLog2(folder, callback){
   fs.readdir(folder, function (err, files) {
        if(err){
            return callback(err);
        }
        if (!files.length){
            return callback("no files found");
        }
        //all files in target folder are supposed to be named by date eg. "2013-11-25"
        files.sort(dateUtils.dateSort);   //sort earliest to latest
        var earliestDate = new Date(files[0]);
       
        fileReader.getLastNonEmptyLine(downSampledTargetFile, function(lastLine){
            var split = lastLine.split(",");
            earliestDate = new Date(split.splice(0,1)[0]);  //remove first element from array and store it
            earliestDate.setHours(earliestDate.getHours()+1);//increment by 1 hour (this timestamp was the last to already have been processed and does not need to be processed again)
            console.log(lastLine, earliestDate);
            return callback(null, earliestDate);
        });
       
    });
}



//function findEarliestPowerLog(folder, callback){
//    fs.readdir(folder, function (err, files) {
//        if(err){
//            callback(err);
//        }
//        if (!files.length){
//            callback("no files found");
//        }
//        //all files in target folder are supposed to be named by date eg. "2013-11-25"
//        files.sort(dateUtils.dateSort);   //sort earliest to latest
//        var earliestDate = new Date(files[0]);
//
//        fs.readFile(downSampledTargetFile, function (err, data) {
//            if(err) {
//                console.log(err);
//                callback(null, earliestDate);
//            }
//            else{
//                var lines = data.toString().split('\n');
//                var lastLine = lines.slice(-2)[0];
//                var split = lastLine.split(",");
//                earliestDate = new Date(split.splice(0,1)[0]);  //remove first element from array and store it
//                earliestDate.setHours(earliestDate.getHours()+1);//increment by 1 hour (this timestamp was the last to already have been processed and does not need to be processed again)
//                console.log(lastLine, earliestDate);
//                callback(null, earliestDate);
//            }
//        });
//    });
//}

