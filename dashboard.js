/**
 * Created by pingo on 29.12.2013.
 */

var app = require('http').createServer(handler),
    fs = require('fs'),
    io = require('socket.io').listen(app, {
        log: false
    }),
    dateUtils = require('./libs/dateUtils'),
    tempCache = {},
    config = require('./config'),
    powerLogFolder = config.powerLogger.logsFolder,
    tempsLogFolder = config.tempLogger.logsFolder;


setInterval(function() {
    tempCache = {}; //purge tempCache every 5 minutes
}, 5 * 60 * 1000);


function handler(req, res) {

    if (req.url === "/index.html") {
        fs.readFile(__dirname + '/index.html',
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }
                res.writeHead(200);
                res.end(data);
            });
    }
    if (req.url === "/power/today") {
        fs.readFile(powerLogFolder + "/" + dateUtils.dateYYYYMMddString(new Date()),
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading log');
                }
                res.writeHead(200);
                res.end(data);
            });
    }
    if (req.url === "/temps/today") {
        fs.readFile(tempsLogFolder + "/" + dateUtils.dateYYYYMMddString(new Date()),
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading log');
                }
                res.writeHead(200);
                res.end(data);
            });
    }
    if (req.url === "/powerPerHour") {
        fs.readFile("/mnt/usbdisk/datastore/powerPerHour.txt",
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading log');
                }
                res.writeHead(200);
                res.end(data);
            });
    }
}
app.listen(8080);

io.sockets.on('connection', function(socket) {
    console.log("New connection from " + socket.request.connection.remoteAddress);

    var temps = [];
    for (var addr in tempCache) {
        temps.push({
            addr: addr,
            temp: tempCache[addr]
        });
    }
    if (temps.length) {
        socket.emit('temp', temps);
    }
});



module.exports = function(EventEmitters) {

    var tempEmitter = require('./libs/tempMonitor.js')(EventEmitters);
    var powerEmitter = require('./libs/powerMonitor.js')(EventEmitters);

    powerEmitter.on('power', function(mainsData) {
        //console.log(mainsData);
        io.sockets.emit('power', mainsData);
    });

    powerEmitter.on('flow', function(flowdata) {
        //console.log(flowdata);
        io.sockets.emit('flow', flowdata);
    });


    tempEmitter.on('temp', function(temps) {
        //    console.log(temps);
        io.sockets.emit('temp', temps);
        temps.forEach(function(sensr) {
            tempCache[sensr.addr] = sensr.temp;
        });
    });




};