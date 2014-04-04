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
    var list = $('.main ul');
    var total = 0;
    list.empty();

    for (var site in trafficData) {
        var listItem = $('.template').children().first().clone();
        listItem.find('site').html(site);
        listItem.find('traffic').html(trafficData[site]);
        list.append(listItem);
        total += +trafficData[site];
    }

    $('h1').remove();
    $('body').prepend('<h1>' + total + '</h1>');
}