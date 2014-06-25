javascript:
/*
    Save this as a bookmark in your browser, then go to it while viewing
    a Google Analytics realtime page.
*/

(function () {
    if (!($ = window.jQuery)) {
        script = document.createElement('script');
        script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
        script.onload = bmf;
        document.body.appendChild(script);
    } else {
        bmf();
    }

    function bmf() {
        var site = $('[class*="accounts-summary"]').find('li:last-child').find('span').text().split(' ')[0];
        var fn = function () {
            var count = $('#ID-overviewCounterValue').text();
            var referrals = [];
            $('#ID-overviewPanelSocialTable tbody tr, #ID-overviewPanelTrafficSourceNameTable tbody tr').each(function(index, val){
                if ($(val).children().length == 1) {
                    return false;
                }
                var cells = $(val).find('td:not(:first)');
                referrals.push({
                    source: $(cells[0]).find('span').html(),
                    users: $(cells[1]).html()
                });
            });
            $.ajax({
                url: 'http://localhost:9132',
                type: 'POST',
                data: {
                    site: site,
                    n: count,
                    referrals: referrals
                }
            });
        };
        var interval = setInterval(fn, 3000);
    }
}());