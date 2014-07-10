/**
 * Created by pingo on 2.1.2014.
 */

function dateSort(date1, date2) {
    return new Date(date1).getTime() - new Date(date2).getTime();
}

function dateYYYYMMddString(date){
    return [date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate()].join("-");
}

function equalByDateAndHour(date1, date2){
    var millis1 = new Date(date1).setMinutes(0,0,0);
    var millis2 = new Date(date2).setMinutes(0,0,0);
    return millis1 === millis2;
}

module.exports.dateSort = dateSort;
module.exports.dateYYYYMMddString = dateYYYYMMddString;
module.exports.equalByDateAndHour = equalByDateAndHour;
