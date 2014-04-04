var socket = io.connect('http://localhost:3000/');

$(function() {
    socket.on('traffic-res', function(res){
        refreshTraffic(res);
    });

    setInterval(function(){ getTrafficUpdate(); }, 1000);
});

function getTrafficUpdate() {
    socket.emit('traffic-req');
}

function refreshTraffic(trafficData) {
    var container = $('.main');
    var template = $('.template').children().first();

    container.empty();
    for (var site in trafficData) {
        var template = $('.template').clone().children().first();
        template.find('.site-text').html(site);
        template.find('.traffic-count').html(trafficData[site]);
        container.append(template);
    }
}