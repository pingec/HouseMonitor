var MainsData = require('./MainsData');


//TODO: complete and use in powerDownsampler.js

function MainsDataAvgs(mainsData){
    //extend MainsData
    for(var prop in mainsData){
        if(mainsData.hasOwnProperty(prop)){
            this[prop] = mainsData[prop];
        }
    }

    
}

MainsDataAvgs.prototype.add = function(mainsData){
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
};


MainsDataAvgs.prototype.divide = function(number){
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



var mainsAvgs = new MainsDataAvgs(new MainsData("-0.0036,0.0453,0.9252,0.0483,-0.0844,-0.0121,0.1359,1.6861,0.0807,-0.0892,-0.0089,0.0849,1.1422,0.0745,-0.1037", new Date()));
console.log(mainsAvgs);