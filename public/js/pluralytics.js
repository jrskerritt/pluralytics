$(function() {
    var socket = io.connect('/'),
        history = [],
        maxHistory = 720,
        requestInterval = 2500,
        siteList = $('.main ul'),
        siteTemplate = _.template('<li><site><%= name %></site><traffic><%= traffic %></traffic></li>'),
        graphTemplate = _.template('<min><%= chartMin %></min><max><%= chartMax %></max><svg width="100%" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="<%= d %>" fill="#53a63a" stroke="none" stroke-width="0" /></svg>');

    socket.on('traffic-res', function(res) {
        refresh(res);
    });

    setInterval(function() {
        getTrafficUpdate();
    }, requestInterval);



    function getTrafficUpdate() {
        socket.emit('traffic-req');
    }

    function refresh(trafficData) {
        var totalTraffic = 0;

        for (var siteName in trafficData) {
            var traffic = trafficData[siteName],
                li = siteList.find('li:has(site:contains(' + siteName + '))');
            if (li[0])
                updateSite(li, traffic);
            else
                addSite(siteName, traffic);
            totalTraffic += +traffic;
        }

        updateTotalTraffic(totalTraffic);
        drawGraph();
    }

    function addSite(name, traffic) {
        siteList.append(siteTemplate({name: name, traffic: traffic}));
    }

    function updateSite(li, traffic) {
        li.find('traffic').html(traffic);
    }

    function updateTotalTraffic(totalTraffic) {
        var changeClass = getTrafficChangeDirection(totalTraffic);
        $('h1').removeClass('up down')
               .addClass(changeClass)
               .html(totalTraffic);
        updateHistory(totalTraffic);
    }

    function updateHistory(totalTraffic) {
        history.push(totalTraffic);
        if (history.length > maxHistory)
            history.shift();
    }

    function getMostRecentHistory() {
        if (history.length) {
            return history[history.length - 1];
        }
    }

    function getTrafficChangeDirection(totalTraffic) {
        var mostRecentValue = getMostRecentHistory();
        if (mostRecentValue) {
            if (totalTraffic > mostRecentValue)
                return 'up';
            else if (totalTraffic < mostRecentValue)
                return 'down';
        }
        return '';
    }

    function drawGraph() {
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

        $('.chart').html(graphTemplate({chartMin: chartMin, chartMax: chartMax, d: d}));
    }

    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };

    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
});