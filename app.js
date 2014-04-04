var express = require('express')
,   app = express()
,   server = app.listen(3000)
,   io = require('socket.io').listen(server);

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(__dirname + '/public'));


var trafficData = {};

// parameters:
// site - the string of the site name
// n - the count
app.post('/', function (req, res) {
    console.log(req.body.site);
    console.log(req.body.n);
    trafficData[req.body.site] = req.body.n;
    console.log(trafficData);
});

io.sockets.on('connection', function (socket) {
    socket.on('traffic-req', function () {
        socket.emit('traffic-res', trafficData);
    });
});