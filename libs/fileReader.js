var fs = require('fs');

/**
 * @callback getLastNonEmptyLineCallback
 * @param {String} line - Last non-empty line
 */

/**
 * Returns the last non-empty line in a file.
 * Should be able to handle files like "\nABCD", "\nABCD\n", "ABCD\r\n", "\nABCD\n\n\n\n". 
 * ASCII chars only!
 * 
 * @param {String} filePath
 * @param {getLastNonEmptyLineCallback} cb
 *
 * Example usage:
 * getLastNonEmptyLine("/path/to/my/log.txt", function(line){
 *    console.log(line);
 * });
*/
function getLastNonEmptyLine(filePath, callback){
    
    fs.stat(filePath, function(err, stat){
        
        //console.log(err, stat);
        
        fs.open(filePath, 'r', function(err, fd){
            if(err) {throw err;}
            
            var line = '';
            var i = 0;
            var readPrevious = function(buf){
                
                if(stat.size-1-i < 0){ //edge case, bginning of file reached
                    if(line.length === 0){
                        return callback(null);   
                    }
                    else{
                        return callback(line);
                    }    
                }
                
                //read 1 byte
                fs.read(fd, buf, 0, buf.length, stat.size-1-i, function(err, bytesRead, buffer){
                    if(err) {throw err;}
                    
                    if(buffer[0] === 0x0a){ //0x0a === '\n'
                        if(line.length === 0){
                            //nothing is stored yet, continue reading
                        }
                        else{
                            return callback(line); //return read line
                        }
                    }
                    else if(buffer[0] === 0x0d){  //0x0a === '\r'
                        //skip over
                    }
                    else{
                        line = String.fromCharCode(buffer[0]) + line; //store anything that is not a '\n' or a '\r'
                    }
                    
                    i++;
                    readPrevious(new Buffer(1));
                });
            };
            readPrevious(new Buffer(1));
        });
        
    });
}



module.exports.getLastNonEmptyLine = getLastNonEmptyLine;