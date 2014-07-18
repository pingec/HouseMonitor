/**
 * Created by pingo on 23.3.2014.
 */
function validate(tempData, lowTempThreshold, highTempThreshold){
    var valid = true;
    var err = "";
    for(var sensor in tempData.sensors){
        var temperature = tempData.sensors[sensor];

        if(temperature < lowTempThreshold || temperature > highTempThreshold){
            err += "\nTemperature at timestamp: @ts @sensor @tempC is outside valid range."
                .replace("@ts", tempData.timestamp)
                .replace("@sensor", sensor)
                .replace("@tempC", temperature);
            valid = false; //todo: omit onli invalid sensors, not everything
        }
    }
    if(err){
        console.log("\nWARNING, INCORRECT DATA DETECTED!:", err, tempData.timestamp);
    }
    return valid;
}

function serialize(tempData){
    var data = [tempData.timestamp.toISOString()];

    for(var sensor in tempData.sensors){
        data.push(sensor + ':' + tempData.sensors[sensor]);
    }

    if(data.length == 1){   //only timestamp in there
        data.push("null");
    }

    return data.join(',');
}

module.exports = {
    validate: validate,
    serialize : serialize
};
