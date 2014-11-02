/**
 * Created by pingo on 28.12.2013.
 */

var EventEmitters = {};    //global holder of EventEmitters

require('./loggers/tempLogger.js')(EventEmitters);
require('./loggers/powerLogger.js')(EventEmitters);
require('./dashboard.js')(EventEmitters);
require('./loggers/liveDataToFileExporter.js')(EventEmitters);