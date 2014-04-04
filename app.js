var express = require('express')
,   app = express()
,   server = app.listen(9132)
,   io = require('socket.io').listen(server);

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(__dirname + '/public'));


var trafficData = {};

// parameters:
// site - the string of the site name
// n - the count
app.post('/', function (req, res) {
    trafficData[req.body.site] = req.body.n;
});

io.sockets.on('connection', function (socket) {
    socket.on('traffic-req', function () {
        socket.emit('traffic-res', trafficData);
    });
});
