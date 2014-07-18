
var fileReader = require('../libs/fileReader'),
    fs = require('fs'),
    dateUtils =  require('../libs/dateUtils');

module.exports.findEarliestLog = function(folder, downSampledTargetFile, callback){
    
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
            if(lastLine === null){
                return callback(null, earliestDate);
            }
            
            var split = lastLine.split(",");
            earliestDate = new Date(split.splice(0,1)[0]);  //remove first element from array and store it
            earliestDate.setHours(earliestDate.getHours()+1);//increment by 1 hour (this timestamp was the last to already have been processed and does not need to be processed again)
            console.log(lastLine, earliestDate);
            return callback(null, earliestDate);
        });
    });
};