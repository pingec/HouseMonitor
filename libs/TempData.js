/**
 * Created by pingo on 21.1.2014.
 */

function TempData(data){
    if(typeof data === "string"){
        // 1. populate TempData.timestamp
        var split = data.split(",");
        this.timestamp =  new Date(split.splice(0,1)[0]);  //remove first element from array and store it

        // 2. populate TempData.sensors.<address> = <temperature>
        var that = this;
        split.forEach(function(pair){
            pair = pair.split(':');
            if(!pair.length || pair.length != 2){
                return;
            }
            var address = pair[0];
            var temperature = parseFloat(pair[1]);
            that.sensors = that.sensors || {};
            that.sensors[address] = temperature;
        });
    }
    else if(data instanceof TempData){
        var tempData = data;
        // 1. copy over timestamp
        this.timestamp = tempData.timestamp;
        // 2. copy over temps
        this.sensors = this.sensors || {};
        for(var sensor in tempData.sensors){
            this.sensors[sensor] = tempData.sensors[sensor];
        }
    }
    else{
        throw "cannot instantiate TempData, data parameter is invalid";
    }
}

TempData.prototype.validate = function (lowTempThreshold, highTempThreshold){
    var valid = true;
    var err = "";
    for(var sensor in this.sensors){
        var temperature = this.sensors[sensor];

        if(temperature < lowTempThreshold || temperature > highTempThreshold){
            err += "\nTemperature at timestamp: @ts @sensor @tempC is outside valid range."
                .replace("@ts", this.timestamp)
                .replace("@sensor", sensor)
                .replace("@tempC", temperature);
            valid = false; //todo: omit onli invalid sensors, not everything
        }
    }
    if(err){
        console.log("\nWARNING, INCORRECT DATA DETECTED!:", err, this.timestamp);
    }
    return valid;
};

TempData.prototype.serialize = function(){
    var data = [this.timestamp.toISOString()];

    for(var sensor in this.sensors){
        data.push(sensor + ':' + this.sensors[sensor]);
    }

    if(data.length == 1){   //only timestamp in there
        data.push("null");
    }

    return data.join(',');
};

module.exports = TempData;