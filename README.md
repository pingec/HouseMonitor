HouseMonitor
============

Tested on RasperryPi type A running Raspbian.



Manual configuration is required, please look at config.js for more information.


When socket.io is installed, copy  ~/HouseMonitor/node_modules/socket.io/node_modules/socket.io-client/socket.io.js to dashboard/public/socket.io.js (FIXME)



###Power Monitor
describe serial data format and link to arduino .c files

    var powerEmitter = require('./libs/powerMonitor.js').powerEmitter;
    powerEmitter.on('power', function(mainsData) {
    //console.log(mainsData);
    });
Example output:

    TODO...
    


###Temperature monitor
relies on digitemp which should be installed on your system, more info in config.js


    var tempMonitor = require('./libs/tempMonitor.js');
    var tempEmitter = tempMonitor.tempEmitter;
    tempEmitter.on('temp', function(temps) {
        console.log(temps);
    });
    
Example output:

    [ { addr: '289547CE0400004E', temp: '41.25' },
        { addr: '28B517CE0400006D', temp: '36.62' },
        { addr: '289F50CE040000AC', temp: '39.12' } ]


###Log downsampler
this should be a deamon that runs periodically and downsamples temperature and power data so that they can be used in
charts

###Dashboard
The actual web page with charts and other controls



##TODO
* provide screenshots
* add tests
* add the webpage part
* move libs/* to node_modules/
* in tempLogger.js use MEDIAN instead of AVG to mitigate erroneous outliers
* Add in config filtering thresholds for power and temperatures to use to filter out bad data