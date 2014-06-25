var express = require('express')
,   app = express()
,   server = app.listen(9132)
,   io = require('socket.io').listen(server)
,   _ = require('underscore');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(__dirname + '/public'));

var trafficData = {};
var allReferrals = {};
var topReferrals = {};
var maxReferrals = 4;

/* 
    parameters:
    site - the string of the site name
    n - the count
    referrals - an array of the top referrals
        source - the name of the referral source
        users - the number of active users from the referral
*/
app.post('/', function (req, res) {
    trafficData[req.body.site] = req.body.n;
    allReferrals[req.body.site] = req.body.referrals;
    topReferrals = getNewTopReferrals();
    res.send(200);
});

io.sockets.on('connection', function (socket) {
    socket.on('traffic-req', function () {
        socket.emit('traffic-res', {traffic: trafficData, topReferrals: topReferrals});
    });
});

function getNewTopReferrals() {
    var mergedReferrals = {};
    var mergeReferral = function (referral) {
        if (mergedReferrals[referral.source]) {
            mergedReferrals[referral.source].users += referral.users;
        }
        else {
            mergedReferrals[referral.source] = referral;
        }
    };

    for (var site in allReferrals) {
        _.each(allReferrals[site], mergeReferral);
    }
    
    return _.sortBy(
        mergedReferrals,
        function (referral) {
            return -referral.users;
        }).slice(0, maxReferrals);
}
