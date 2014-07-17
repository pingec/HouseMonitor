/**
 * Created by pingo on 23.3.2014.
 */
function TempDataAvgs(){
    this.timestamp = null;
    this.sensors = {};
    this.counters = {};
}

TempDataAvgs.prototype.add = function(tempData){
    this.timestamp = this.timestamp || tempData.timestamp;
    for(var sensor in tempData.sensors){
        // add value
        this.sensors[sensor] = this.sensors[sensor] || 0;
        this.sensors[sensor] += tempData.sensors[sensor];
        // update counter
        this.counters[sensor] = this.counters[sensor] || 0;
        this.counters[sensor]++;
    }
};

TempDataAvgs.prototype.calcAvgs = function(){
    for(var sensor in this.sensors){
        if(this.counters[sensor]){
            var val = this.sensors[sensor] / this.counters[sensor];
            this.sensors[sensor] = Math.floor(val * 100) / 100;
        }
        else{
            throw 'Unexpected result: sensor exists in this.sensors but not in this.counters!';
        }
    }
};

TempDataAvgs.prototype.serialize = function(){
    var data = [/*this.timestamp.toISOString()*/];

    for(var sensor in this.sensors){
        data.push(sensor + ':' + this.sensors[sensor]);
    }

    if(data.length == 1){   //only timestamp in there
        data.push("null");
    }

    return data.join(',');
};

module.exports = TempDataAvgs;