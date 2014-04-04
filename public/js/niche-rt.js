var socket = io.connect('/');
var prevVals = [];

$(function() {
    socket.on('traffic-res', function(res){
        refreshTraffic(res);
    });

    setInterval(function(){ getTrafficUpdate(); }, 2500);
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

    prevVals.push(total);

    if (prevVals.length > 720)
        prevVals.shift();

    drawSvg();
}

function drawSvg() {

    var d = 'M 0 150';
    var columnWidth = 150/prevVals.length;

    var max = prevVals.max(),
        r = 150 / max;

    for (i = 0; i < prevVals.length; i++) {
        d+= ' L ' + i*columnWidth + ' ' + (150 - prevVals[i]*r); 
    }
    d += ' L 150 150 z';

    $('.chart').html('<svg width="100%" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="none"><path d="' + d + '" fill="#53a63a" stroke="none" stroke-width="0" /></svg>');
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};
