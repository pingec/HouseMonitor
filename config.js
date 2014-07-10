var config = {};
config.powerMonitor = {};
config.tempMonitor = {};
config.powerLogger = {};
config.tempLogger = {};
config.powerDownsampler = {};
config.tempDownsampler = {};
config.dashboard = {};

config.powerMonitor.serialDev = "/dev/ttyACM0";
config.powerMonitor.baudRate = 9600;

/* 
    DigiTemp PRECONFIGURATION
    DigiTemp config files must be manually generated
    
    For each 1wire master run 'digitemp_DS9097 -i -q -s /dev/your1WMaster -o "%b %d %H:%M:%S Sensor %R C: %.2C F: %.2F"' and save 
    the generated .digitemprc file with a unique name eg. "digitemp_pl2303_0".
    
    Now populate config.tempMonitor.digiTempCfgs array with the names of the saved configs.
*/
config.tempMonitor.digiTempCfgs = [
    'digitemp_pl2303_0',
    'digitemp_pl2303_1'
];

config.powerLogger.logsFolder = "/mnt/usbdisk/datastore/power";
config.tempLogger.logsFolder = "/mnt/usbdisk/datastore/temperature";

config.powerDownsampler.downsamplePath = "/mnt/usbdisk/datastore/powerPerHour.txt";

config.dashboard.port = 80;

module.exports = config;