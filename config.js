var config = {};
config.powerMonitor = {};
config.tempMonitor = {};
config.powerLogger = {};
config.tempLogger = {};
config.powerDownsampler = {};
config.tempDownsampler = {};
config.dashboard = {};
config.liveDataToFileExporter = {};

/*
 * Set to falsy to disable verbosity 
 */
config.debug = true;

/*
 * Settings for powerMonitor.js
 */
config.powerMonitor.serialDev = "/dev/cp2102_0";
config.powerMonitor.baudRate = 9600;

/* 
 * Settings for tempMonitor.js
 * 
 * DigiTemp PRECONFIGURATION
 * DigiTemp config files must be manually generated
 * For each 1wire master run 'digitemp_DS9097 -i -q -s /dev/your1WMaster -o "%b %d %H:%M:%S Sensor %R C: %.2C F: %.2F"' and save 
 * the generated .digitemprc file with a unique name eg. "digitemp_pl2303_0".
 * 
 * Now populate config.tempMonitor.digiTempCfgs array with the names of the saved configs.
 * 
*/
config.tempMonitor.digiTempCfgs = [
    'digitemp_pl2303_0',
    'digitemp_pl2303_1'
];

/*
 * Settings for powerLogger.js
 */
config.powerLogger.logsFolder = "/mnt/usbdisk/datastore/power";
//config.powerLogger.logsFolder = "C:\\Users\\pingo\\Desktop\\datastore merged DONT TOUCH\\datastore\\power";
/*
 * Settings for tempLogger.js
 */
config.tempLogger.logsFolder = "/mnt/usbdisk/datastore/temperature";
//config.tempLogger.logsFolder = "C:\\Users\\pingo\\Desktop\\datastore merged DONT TOUCH\\datastore\\temperature";


/*
 * Settings for powerDownsampler.js
 */
//config.powerDownsampler.downsamplePath = "/mnt/usbdisk/datastore/powerPerHour2.txt";
config.powerDownsampler.downsamplePath = "C:\\Users\\pingo\\Desktop\\powerPerHour_testing_Sandy.txt";

/*
 * Settings for powerDownsampler.js
 */
//config.powerDownsampler.downsamplePath = "/mnt/usbdisk/datastore/tempPerHour2.txt";
config.tempDownsampler.downsamplePath = "C:\\Users\\pingo\\Desktop\\tempPerHour_testing_Sandy.txt";

/*
 * Settings for dashboard.js
 */
config.dashboard.port = 80;

/*
 * Settings for liveDataToFileExporter.js (make sure to mount logsFolder on a "RAM disk")
 */
config.liveDataToFileExporter.logsFolder = "/var/hm";
config.liveDataToFileExporter.temperatureFile = "temps.txt"; 
config.liveDataToFileExporter.powerFile = "power.txt";
config.liveDataToFileExporter.flowDataFile = "temps.txt";

module.exports = config;