var socket = io.connect('/');
var history = [];
var maxHistory = 720;

$(function() {
    socket.on('traffic-res', function(res) {
        refresh(res);
    });

    setInterval(function() {
        getTrafficUpdate();
    }, 2500);
});

function getTrafficUpdate() {
    socket.emit('traffic-req');
}

function refresh(trafficData) {
    var list = $('.main ul'),
        totalTraffic = 0;

    list.empty();
    for (var site in trafficData) {
        appendSiteToList(list, trafficData, site);
        totalTraffic += +trafficData[site];
    }

    updateTotalTraffic(totalTraffic);
    drawSvg();
}


function appendSiteToList(list, trafficData, site) {
    var listItem = $('.template').children().first().clone();
    listItem.find('site').html(site);
    listItem.find('traffic').html(trafficData[site]);
    list.append(listItem);
}

function updateTotalTraffic(totalTraffic) {
    var changeClass = '';

    var mostRecentValue = getMostRecentHistory();
    if (mostRecentValue) {
        if (totalTraffic > mostRecentValue)
            changeClass = 'up';
        else if (totalTraffic < mostRecentValue)
            changeClass = 'down';
    }

    $('h1').remove();
    $('body').prepend('<h1 class="' + changeClass + '">' + totalTraffic + '</h1>');

    history.push(totalTraffic);
    if (history.length > maxHistory)
        history.shift();
}

function drawSvg() {
    var d = 'M 0 150',
        historyMaxIndex = history.length - 1,
        columnWidth = (historyMaxIndex === 0) ? 0 : 150 / historyMaxIndex;

    var chartMax = Math.ceil(history.max() / 50) * 50,
        chartMin = Math.floor(history.min() / 50) * 50,
        delta = chartMax - chartMin,
        chartZero = (chartMin > delta / 10) ? chartMin - delta / 10 : 0,
        chartRange = chartMax - chartZero,
        r = (chartRange === 0) ? 0 : 150 / chartRange;

    for (i = 0; i < history.length; i++) {
        d += ' L ' + i * columnWidth + ' ' + (150 - (history[i] - chartZero) * r);
    }
    d += ' L 150 150 z';

    $('.chart').html('<min>' + chartMin + '</min><max>' + chartMax + '</max><svg width="100%" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="none"><path d="' + d + '" fill="#53a63a" stroke="none" stroke-width="0" /></svg>');
}

function getMostRecentHistory() {
    if (history.length) {
        return history[history.length - 1];
    }
}

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};