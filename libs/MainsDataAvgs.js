var MainsData = require('./MainsData');

// Since MainsData constructor requires arguments, inheritance in this case is split in two parts:
//  - private properties are copied over when they are available (in the MainsDataAvgs constructor) (1)
//  - properties on the MainsData prototype are added to the MainsDataAvgs prototype chain through a dummy constructor function (2)

function MainsDataAvgs(mainsData){
    // 1. copy over all private props of MainsData "instance" - mainsData
    for(var prop in mainsData){
        if(mainsData.hasOwnProperty(prop)){
            this[prop] = mainsData[prop];   //copy over all instance properties
        }
    }
    
    this.count = 1;
    this.readOnly = false;
}

// 2. inherit from MainsData.prototype without executing the MainsData constructor (since it requires arguments)
function tmp(){}
tmp.prototype = MainsData.prototype;
MainsDataAvgs.prototype = new tmp();
MainsDataAvgs.prototype.constructor = MainsDataAvgs;


MainsDataAvgs.prototype.add = function(mainsData){
    if(this.readOnly){
        throw 'MainsDataAvgs instance cannot modified in readonly mode';
    }
    
    this.phase1.realPower += mainsData.phase1.realPower;
    this.phase1.apparentPower += mainsData.phase1.apparentPower;
    this.phase1.Vrms += mainsData.phase1.Vrms;
    this.phase1.Irms += mainsData.phase1.Irms;
    this.phase1.powerFactor += mainsData.phase1.powerFactor;
    this.phase2.realPower += mainsData.phase2.realPower;
    this.phase2.apparentPower += mainsData.phase2.apparentPower;
    this.phase2.Vrms += mainsData.phase2.Vrms;
    this.phase2.Irms += mainsData.phase2.Irms;
    this.phase2.powerFactor += mainsData.phase2.powerFactor;
    this.phase3.realPower += mainsData.phase3.realPower;
    this.phase3.apparentPower += mainsData.phase3.apparentPower;
    this.phase3.Vrms += mainsData.phase3.Vrms;
    this.phase3.Irms += mainsData.phase3.Irms;
    this.phase3.powerFactor += mainsData.phase3.powerFactor;
    
    this.count++;
};


MainsDataAvgs.prototype.divide = function(number){
    if(this.readOnly){
        throw 'MainsDataAvgs instance cannot modified in readonly mode';
    }
    
    this.phase1.realPower /= number;
    this.phase1.apparentPower /= number;
    this.phase1.Vrms /= number;
    this.phase1.Irms /= number;
    this.phase1.powerFactor /= number;
    this.phase2.realPower /= number;
    this.phase2.apparentPower /= number;
    this.phase2.Vrms /= number;
    this.phase2.Irms /= number;
    this.phase2.powerFactor /= number;
    this.phase3.realPower /= number;
    this.phase3.apparentPower /= number;
    this.phase3.Vrms /= number;
    this.phase3.Irms /= number;
    this.phase3.powerFactor /= number;
};

MainsDataAvgs.prototype.calcAvgs = function(){
    if(this.readOnly){
        throw 'MainsDataAvgs instance cannot modified in readonly mode';
    }
    
    this.divide(this.count);
    this.readOnly = true;
};


module.exports = MainsDataAvgs;