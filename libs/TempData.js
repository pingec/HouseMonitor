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

module.exports = TempData;