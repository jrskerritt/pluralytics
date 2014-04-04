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
    var list = $('.main ul'),
        total = 0,
        changeClass = '';

    list.empty();

    for (var site in trafficData) {
        var listItem = $('.template').children().first().clone();
        listItem.find('site').html(site);
        listItem.find('traffic').html(trafficData[site]);
        list.append(listItem);
        total += +trafficData[site];
    }

    $('h1').remove();
    if (prevVals.length) {
        console.log(total,prevVals[prevVals.length-1]);
        if (total > prevVals[prevVals.length-1])
            changeClass = 'up';
        else if (total < prevVals[prevVals.length-1])
            changeClass = 'down';    
    }

    $('body').prepend('<h1 class="' + changeClass + '">' + total + '</h1>');

    prevVals.push(total);

    if (prevVals.length > 720)
        prevVals.shift();

    drawSvg();
}

function drawSvg() {

    var d = 'M 0 150';
    var columnWidth = 150/(prevVals.length-1);

    var chartMax = prevVals.max(),
        chartMin = prevVals.min(),
        delta = chartMax - chartMin,
        chartZero = (chartMin > delta/10) ? chartMin-delta/10 : 0,
        r = 150 / (chartMax - chartZero);

    for (i = 0; i < prevVals.length; i++) {
        d+= ' L ' + i*columnWidth + ' ' + (150 - (prevVals[i]-chartZero)*r); 
    }
    d += ' L 150 150 z';

    $('.chart').html('<svg width="100%" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="none"><path d="' + d + '" fill="#53a63a" stroke="none" stroke-width="0" /></svg>');
}

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};
