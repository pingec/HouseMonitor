
HouseMonitor
============

Tested on RasperryPi type A running Raspbian.

Manual configuration is required, please look at config.js for more information.

Should be started as sudo eg.

    sudo /opt/node/bin/node main.js

And to make it autostart on bootup you can put this in your /etc/rc.local file (before the exit 0 line):

    screen -dmS housemonitor bash
    screen -S housemonitor -X stuff "cd /home/pi/HouseMonitor; /opt/node/bin/node /home/pi/HouseMonitor/main.js\n"
    
Then you can attach to the screen session with

    sudo screen -r housemonitor
    
and detach with 

    CTRL+A+D




When socket.io is installed, copy  ~/HouseMonitor/node_modules/socket.io/node_modules/socket.io-client/socket.io.js to dashboard/public/socket.io.js (FIXME)

Due to raspberry corrupting file on power loss (even on usb flash storage) I strongly advise setting up an automated log backup process to a remote storage. For example a cron job that commits logs to github.

###Power Monitor ![Progress](http://progressed.io/bar/90)   
describe serial data format and link to arduino .c files

    var powerEmitter = require('./libs/powerMonitor.js').powerEmitter;
    powerEmitter.on('power', function(mainsData) {
    //console.log(mainsData);
    });
Example output:

    TODO...
    


###Temperature monitor ![Progress](http://progressed.io/bar/90)  
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


###Log downsampler ![Progress](http://progressed.io/bar/80)  
this should be a deamon that runs periodically and downsamples temperature and power data so that they can be used in
charts

###Dashboard  ![Progress](http://progressed.io/bar/00)  
The actual web page with charts and other controls



##TODO
* update readme
* provide screenshots
* add tests
* add the webpage part
* move libs/* to node_modules/
* in tempLogger.js use MEDIAN instead of AVG to mitigate erroneous outliers
* Add in config filtering thresholds for power and temperatures to use to filter out bad data