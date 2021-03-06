/**
 * Created by pingo on 29.12.2013.
 */

var config = require('../config');

function MainsData(data, timestamp) {

    this.timestamp = timestamp || new Date();
    if (data === null) {
        return this;
    }

    var values = data.split(",");
    this.phase1 = {};
    this.phase2 = {};
    this.phase3 = {};
    var i = 0;
    this.phase1.realPower = parseFloat(values[i++]);
    this.phase1.apparentPower = parseFloat(values[i++]);
    this.phase1.Vrms = parseFloat(values[i++]);
    this.phase1.Irms = parseFloat(values[i++]);
    this.phase1.powerFactor = parseFloat(values[i++]);
    this.phase2.realPower = parseFloat(values[i++]);
    this.phase2.apparentPower = parseFloat(values[i++]);
    this.phase2.Vrms = parseFloat(values[i++]);
    this.phase2.Irms = parseFloat(values[i++]);
    this.phase2.powerFactor = parseFloat(values[i++]);
    this.phase3.realPower = parseFloat(values[i++]);
    this.phase3.apparentPower = parseFloat(values[i++]);
    this.phase3.Vrms = parseFloat(values[i++]);
    this.phase3.Irms = parseFloat(values[i++]);
    this.phase3.powerFactor = parseFloat(values[i++]);

    //process acquired values
    for (var prop in this) {
        if (prop === "timestamp") {
            continue;
        } else {
            for (var prop2 in this[prop]) {
                if (isNaN(this[prop][prop2]) || !isFinite(this[prop][prop2])) { //prevent NaN's and Inf's (will iterate over this.timestamp as well, but should leave it untouched)
                    console.log("fixing", this[prop][prop2]);
                    this[prop][prop2] = 0;
                }
            }
        }
    }
}

MainsData.prototype.serialize = function() {

    if (!this.phase1) {
        return "null";
    }

    return this.phase1.realPower + "," +
        this.phase1.apparentPower + "," +
        this.phase1.Vrms + "," +
        this.phase1.Irms + "," +
        this.phase1.powerFactor + "," +
        this.phase2.realPower + "," +
        this.phase2.apparentPower + "," +
        this.phase2.Vrms + "," +
        this.phase2.Irms + "," +
        this.phase2.powerFactor + "," +
        this.phase3.realPower + "," +
        this.phase3.apparentPower + "," +
        this.phase3.Vrms + "," +
        this.phase3.Irms + "," +
        this.phase3.powerFactor;
};

MainsData.prototype.toFixed = function(n) {
    this.phase1.realPower = parseFloat(this.phase1.realPower.toFixed(n));
    this.phase1.apparentPower = parseFloat(this.phase1.apparentPower.toFixed(n));
    this.phase1.Vrms = parseFloat(this.phase1.Vrms.toFixed(n));
    this.phase1.Irms = parseFloat(this.phase1.Irms.toFixed(n));
    this.phase1.powerFactor = parseFloat(this.phase1.powerFactor.toFixed(n));
    this.phase2.realPower = parseFloat(this.phase2.realPower.toFixed(n));
    this.phase2.apparentPower = parseFloat(this.phase2.apparentPower.toFixed(n));
    this.phase2.Vrms = parseFloat(this.phase2.Vrms.toFixed(n));
    this.phase2.Irms = parseFloat(this.phase2.Irms.toFixed(n));
    this.phase2.powerFactor = parseFloat(this.phase2.powerFactor.toFixed(n));
    this.phase3.realPower = parseFloat(this.phase3.realPower.toFixed(n));
    this.phase3.apparentPower = parseFloat(this.phase3.apparentPower.toFixed(n));
    this.phase3.Vrms = parseFloat(this.phase3.Vrms.toFixed(n));
    this.phase3.Irms = parseFloat(this.phase3.Irms.toFixed(n));
    this.phase3.powerFactor = parseFloat(this.phase3.powerFactor.toFixed(n));
};

MainsData.prototype.validate = function(aPThreshold, rPThreshold, vLowerThreshold, vUpperThreshold) {
    // should be called before .toFixed()

    var valid = true;
    var err = "";

    if (aPThreshold) {
        if (this.phase1.apparentPower > aPThreshold) {
            valid = false;
            err = "phase1.apparentPower too high! " + this.phase1.apparentPower + " > " + aPThreshold + " ";
        }
        if (this.phase2.apparentPower > aPThreshold) {
            valid = false;
            err = "phase2.apparentPower too high! " + this.phase2.apparentPower + " > " + aPThreshold + " ";
        }
        if (this.phase3.apparentPower > aPThreshold) {
            valid = false;
            err = "phase3.apparentPower too high! " + this.phase3.apparentPower + " > " + aPThreshold + " ";
        }
    }

    if (rPThreshold) {
        if (this.phase1.realPower > rPThreshold) {
            valid = false;
            err = "phase1.realPower too high! " + this.phase1.realPower + " > " + rPThreshold + " ";
        }
        if (this.phase2.realPower > rPThreshold) {
            valid = false;
            err = "phase2.realPower too high! " + this.phase2.realPower + " > " + rPThreshold + " ";
        }
        if (this.phase3.realPower > rPThreshold) {
            valid = false;
            err = "phase3.realPower too high! " + this.phase3.realPower + " > " + rPThreshold + " ";
        }
    }

    if (vLowerThreshold) {
        if (this.phase1.Vrms < vLowerThreshold) {
            valid = false;
            err = "phase1.Vrms too low! " + this.phase1.Vrms + " < " + vLowerThreshold + " ";
        }
        if (this.phase2.Vrms < vLowerThreshold) {
            valid = false;
            err = "phase2.Vrms too low! " + this.phase2.Vrms + " < " + vLowerThreshold + " ";
        }
        if (this.phase3.Vrms < vLowerThreshold) {
            valid = false;
            err = "phase3.Vrms too low! " + this.phase3.Vrms + " < " + vLowerThreshold + " ";
        }
    }

    if (vUpperThreshold) {
        if (this.phase1.Vrms > vUpperThreshold) {
            valid = false;
            err = "phase1.Vrms too high! " + this.phase1.Vrms + " > " + vUpperThreshold + " ";
        }
        if (this.phase2.Vrms > vUpperThreshold) {
            valid = false;
            err = "phase2.Vrms too high! " + this.phase2.Vrms + " > " + vUpperThreshold + " ";
        }
        if (this.phase3.Vrms > vUpperThreshold) {
            valid = false;
            err = "phase3.Vrms too high! " + this.phase3.Vrms + " > " + vUpperThreshold + " ";
        }
    }

    if (err && config.debug) {
        console.log("WARNING, INCORRECT DATA DETECTED:", err, this.timestamp);
    }

    return valid;
};


module.exports = MainsData;