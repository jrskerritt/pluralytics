$(function() {
    var socket = io.connect('/'),
        history = [],
        maxHistory = 720,
        requestInterval = 2500,
        siteList = $('.primary ul'),
        topReferralsList = $('referrals ul'),
        siteTemplate = _.template('<li data-lastupdate="<%= lastupdate %>"><site><%= name %></site><traffic><%= traffic %></traffic></li>'),
        referralsTemplate = _.template('<% _.each(topReferrals, function (referral) { %> <li><div><%= referral.source %></div><div><%= referral.users %></div></li><% }); %>');
        graphTemplate = _.template('<min><%= chartMin %></min><max><%= chartMax %></max><svg width="100%" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="<%= d %>" fill="#ffffff" stroke="none" stroke-width="0" /></svg>');

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

        for (var siteName in trafficData.traffic) {
            var traffic = trafficData.traffic[siteName],
                li = siteList.find('li:has(site:contains(' + siteName + '))');
            if (li[0])
                updateSite(li, traffic);
            else
                addSite(siteName, traffic);
            totalTraffic += +traffic;
        }

        var siteListLi = siteList.find('li');

        siteListLi.sort(function (a, b) {
            var an = 1*$(a).find('traffic').text(),
                bn = 1*$(b).find('traffic').text();

            if(an > bn) {
                return -1;
            }
            if(an < bn) {
                return 1;
            }
            return 0;
        });

        siteListLi.detach().appendTo(siteList);

        updateTotalTraffic(totalTraffic);
        updateTopReferrals(trafficData.topReferrals);
        drawGraph();
    }

    function addSite(name, traffic) {
        siteList.append(siteTemplate({name: name, traffic: traffic, lastupdate: new Date().getTime()}));
    }

    function updateSite(li, traffic) {
        var currentTraffic = li.find('traffic').text();
        var currentTime = new Date().getTime();

        li.find('traffic').html(traffic);
        if (traffic != currentTraffic) {
            li.removeClass('frozen');
            li.attr('data-lastupdate', new Date().getTime());
        } else if (currentTime - li.attr('data-lastupdate') > 300000) { // 5 mins
            li.addClass('frozen');
        }
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

    function updateTopReferrals(topReferrals) {
        topReferralsList.html(referralsTemplate({topReferrals: topReferrals}));
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