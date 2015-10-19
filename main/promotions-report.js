function main(request, response) { // initial function called as default function in script

    if (request.getMethod() == 'GET') { // as script is run

        function1();
    } else // after submit
    {
        function2();
    }
}

function function1() {

    var form = nlapiCreateForm('Facebook Promotions');
    form.addField('date_start', 'date', 'Start Date').setDefaultValue('9/1/2015');
    form.addField('date_end', 'date', 'End Date').setDefaultValue('9/15/2015');

    form.addSubmitButton('Submit');
    response.writePage(form);
}

function function2() {

    var setStartDate = new Date(request.getParameter('date_start')); // Import start
    var setEndDate = new Date(request.getParameter('date_end')); // end

    // Search for Sales Order information based on date range
    var filters = new Array();
    filters[0] = new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);
    filters[1] = new nlobjSearchFilter('type', null, 'anyof', 'SalesOrd');
    filters[2] = new nlobjSearchFilter('mainline', null, 'is', 'T');

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('internalid').setSort();
    columns[1] = new nlobjSearchColumn('trandate');
    columns[2] = new nlobjSearchColumn('type');
    columns[3] = new nlobjSearchColumn('entity');
    columns[4] = new nlobjSearchColumn('amount');
    columns[5] = new nlobjSearchColumn('datecreated', 'customer');
    columns[6] = new nlobjSearchColumn('line');
    columns[7] = new nlobjSearchColumn('promocode');


    // Search results #0-999
    var results = nlapiSearchRecord('transaction', null, filters, columns);

    // Storage location for complete result set.
    var allResults = new Array();
    allResults = allResults.concat(results);

    // Search results #1000+
    while (results.length == 1000) {
        var lastId2 = results[999].getValue('internalid');
        var lastLine = results[999].getValue('line');

        filters[3] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId2);

        var results = nlapiSearchRecord('transaction', null, filters, columns);

        for (var i = 0; i < results.length; i++) {

            var result = results[i];

            if (Number(result.getValue('internalid')) == Number(lastId2) && Number(result.getValue('line')) > Number(lastLine)) {

                allResults = allResults.concat(result);
            } else if (result.getValue('internalid') > lastId2) {

                allResults = allResults.concat(result);
            }
        }
    }

    // Get a list of unique customers
    var unsortedCustomers = new Array();
    for (var x = 0; x <= allResults.length; x++) {

        var result = allResults[x];

        try {

            var code = result.getText('promocode');

            if (code.indexOf('fb') != -1 || code.indexOf('FB') != -1) {

                if (code != '20offbible') {

                    unsortedCustomers = unsortedCustomers.concat(allResults[x].getValue('entity'));
                }
            }
        } catch (err) {

        }

    }

    var listofCustomers = new Array();
    listofCustomers = trim(unsortedCustomers);
    listofCustomers.sort();

    // Search for all purchases made by list of customers
    var filters = new Array();
    filters[0] = new nlobjSearchFilter('entity', null, 'anyof', listofCustomers);
    filters[1] = new nlobjSearchFilter('type', null, 'anyof', 'SalesOrd');
    filters[2] = new nlobjSearchFilter('mainline', null, 'is', 'T');

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('internalid').setSort();
    columns[1] = new nlobjSearchColumn('trandate');
    columns[2] = new nlobjSearchColumn('type');
    columns[3] = new nlobjSearchColumn('entity');
    columns[4] = new nlobjSearchColumn('amount');
    columns[5] = new nlobjSearchColumn('datecreated', 'customer');
    columns[6] = new nlobjSearchColumn('line');
    columns[7] = new nlobjSearchColumn('promocode');


    // Search results #0-999
    var results = nlapiSearchRecord('transaction', null, filters, columns);

    // Storage location for complete result set.
    var allResultsCustDetail = new Array();
    allResultsCustDetail = allResultsCustDetail.concat(results);

    // Search results #1000+
    while (results.length == 1000) {
        var lastId2 = results[999].getValue('internalid');
        var lastLine = results[999].getValue('line');

        filters[3] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId2);

        var results = nlapiSearchRecord('transaction', null, filters, columns);

        for (var i = 0; i < results.length; i++) {

            var result = results[i];

            if (Number(result.getValue('internalid')) == Number(lastId2) && Number(result.getValue('line')) > Number(lastLine)) {

                allResultsCustDetail = allResultsCustDetail.concat(result);
            } else if (result.getValue('internalid') > lastId2) {

                allResultsCustDetail = allResultsCustDetail.concat(result);
            }
        }
    }

    // Array of arrays based on list of names
    w = window;
    for (var i = 0; i < listofCustomers.length; i++) {

        w["codesfor" + listofCustomers[i]] = new Array();
        w["nonFBSales" + listofCustomers[i]] = Number(0);
        w["noCodeSales" + listofCustomers[i]] = Number(0);
        w["firsttime" + listofCustomers[i]] = Number(0);
    }

    // populate array of arrays
    for (var x = 0; x < allResultsCustDetail.length; x++) {

        var result = allResultsCustDetail[x];

        if (result.getText('promocode') != '') {

            w["codesfor" + result.getValue('entity')] = w["codesfor" + result.getValue('entity')].concat(result.getText('promocode'));
            w["nonFBSales" + result.getValue('entity')] += Number(result.getValue('amount'));
            w["firsttime" + result.getValue('entity')]++;

        } else {

            w["noCodeSales" + result.getValue('entity')] += Number(result.getValue('amount'));
            w["firsttime" + result.getValue('entity')]++;
        }
    }

    // get length of longest array
    var longest = 0;
    for (var x = 0; x < listofCustomers.length; x++) {

        if (Number(w["codesfor" + listofCustomers[x]].length) > Number(longest)) {

            longest = Number(w["codesfor" + listofCustomers[x]].length);

        }
        /*
        print('customer', listofCustomers[x]);
        for(var x2 = 0; x2 < w["codesfor" + listofCustomers[x]].length; x2++){
        	
        	print(w["codesfor" + listofCustomers[x]][x2]);
        }*/
    }
    print('longest', longest);


    html = '<html>';
    html += '<head>';
    html += '<script src="https://system.netsuite.com/core/media/media.nl?id=359359&c=811217&h=65afe36a877be122622c&_xt=.js"></script>'; // table sort
    html += '<link rel="stylesheet" type="text/css" href="https://system.netsuite.com/core/media/media.nl?id=400790&c=811217&h=c3d4ce9af7d71b7160e3&_xt=.css">';
    //html += '<script src="http://code.jquery.com/jquery-1.5.1.min.js" type="text/javascript"></script>';
    //html += '<script src="https://system.netsuite.com/core/media/media.nl?id=420986&c=811217&h=4117b836519d6a473b55&_xt=.js" type="text/javascript"></script>';
    html += '</head>';
    html += '<body>';

    html += '<table id = "myTable">';
    html += '<tr id="myTRBlue">' +
        '<td id="myTDBlueData">Customer</td>' +
        '<td id="myTDBlueData">First Time Customer (Y/N)</td>' +
        '<td id="myTDBlueData">SO Date</td>' +
        '<td id="myTDBlueData">Customer Creation Date</td>' +
        '<td id="myTDBlueData">Promotion</td>';
    /*
    // variable length additional promotions based on list of promotions
    for(var x = 1; x < longest; x++){
    	
    	html += '<td>Additional Promotion #' + x + '</td>';
    }
    */
    html += '<td id="myTDBlueData">FB Sales Amount</td>' +
        '<td id="myTDBlueData">Non-FB Sales Amount</td>' +
        '<td id="myTDBlueData">No Code Sales Amount</td>' +
        '</tr>';

    var namesposted = new Array();

    var colorcounter = 0;

    for (var x = 0; x < allResults.length; x++) {



        result = allResults[x];

        if (namesposted.indexOf(result.getText('entity')) > -1) {

            // in array

        } else {



            // not in array

            var code = result.getText('promocode');

            if (code.indexOf('fb') != -1 || code.indexOf('FB') != -1) {



                if (code != '20offbible') {

                    d1 = new Date(result.getValue('trandate'));
                    d2 = new Date(result.getValue('datecreated', 'customer'));
                    // Initial date check to see if customer is new
                    if (d1.format("m/d/yy") == d2.format("m/d/yy")) {

                        if (colorcounter % 2 == 0) {
                            color = 'myTDWhiteData';
                            tabbed = 'tabbedodd';
                            color2 = 'odd';
                        } else {
                            color = 'myTDBlueData';
                            color2 = 'even';
                            tabbed = 'tabbed';
                        }

                        html += '<tr>' +
                            '<td id="' + color + '">' + result.getText('entity') + '</td>';

                        if (Number(w["firsttime" + result.getValue('entity')]) == Number(1)) {

                            html += '<td id="' + color + '"> Y </td>';
                        } else {

                            // New check to see if there were sales made after the initial coupon
                            if (new Date(result.getValue('trandate')).format('mm/dd/yyyy') == new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy')) {

                                html += '<td> Y </td>';
                            } else {

                                html += '<td> N </td>';
                            }
                        }
                        html += '<td id="' + color + '">' + result.getValue('trandate') + '</td>' +
                            '<td id="' + color + '">' + new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy') + '</td>' +
                            '<td id="' + color + '">' + result.getText('promocode') + '</td>';

                        var currentCode = result.getText('promocode');
                        /*
                        // variable to count how many codes have been printed
                        var printed = 0;
                        for(var y = 0; y < w["codesfor" + result.getValue('entity')].length; y++){
                        	
                        	if(result.getText('promocode') != w["codesfor" + result.getValue('entity')][y]){
                        		
                        		html += '<td>' + w["codesfor" + result.getValue('entity')][y] + '</td>';
                        		printed++;
                        	}
                        }
						
                        while(printed < (longest - 1)){
                        	html += '<td> </td>';
                        	printed++;
                        }
                        */
                        html += '<td id="' + color + '">' + result.getValue('amount') + '</td>';
                        var tempNonSales = Number(w["nonFBSales" + result.getValue('entity')]) - Number(result.getValue('amount'));
                        html += '<td id="' + color + '">' + tempNonSales.toFixed(2) + '</td>';
                        html += '<td id="' + color + '">' + w["noCodeSales" + result.getValue('entity')].toFixed(2) + '</td>';
                        html += '</tr>';

                        colorcounter++;

                    } else {

                        if (colorcounter % 2 == 0) {
                            color = 'myTDWhiteData';
                            tabbed = 'tabbedodd';
                            color2 = 'odd';
                        } else {
                            color = 'myTDBlueData';
                            color2 = 'even';
                            tabbed = 'tabbed';
                        }

                        html += '<tr>' +
                            '<td id="' + color + '">' + result.getText('entity') + '</td>';

                        if (Number(w["firsttime" + result.getValue('entity')]) == Number(1)) {

                            html += '<td id="' + color + '"> Y </td>';
                        } else {

                            if (new Date(result.getValue('trandate')).format('mm/dd/yyyy') == new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy')) {

                                html += '<td id="' + color + '"> Y </td>';
                            } else {

                                html += '<td id="' + color + '"> N </td>';
                            }
                        }

                        html += '<td id="' + color + '">' + result.getValue('trandate') + '</td>' +
                            '<td id="' + color + '">' + new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy') + '</td>' +
                            '<td id="' + color + '">' + result.getText('promocode') + '</td>';

                        var currentCode = result.getText('promocode');

                        /*
                        // variable to count how many codes have been printed
                        var printed = 0;
                        for(var y = 0; y < w["codesfor" + result.getValue('entity')].length; y++){
                        	
                        	if(result.getText('promocode') != w["codesfor" + result.getValue('entity')][y]){
                        		
                        		html += '<td>' + w["codesfor" + result.getValue('entity')][y] + '</td>';
                        		printed++;
                        	}
                        }
						
                        while(printed < (longest - 1)){
                        	html += '<td> </td>';
                        	printed++;
                        }
                        */
                        html += '<td id="' + color + '">' + result.getValue('amount') + '</td>';
                        var tempNonSales = Number(w["nonFBSales" + result.getValue('entity')]) - Number(result.getValue('amount'));
                        html += '<td id="' + color + '">' + tempNonSales.toFixed(2) + '</td>';
                        html += '<td id="' + color + '">' + w["noCodeSales" + result.getValue('entity')].toFixed(2) + '</td>';
                        html += '</tr>';
                        colorcounter++;

                    }
                }

            } else {


            }


        }
        namesposted = namesposted.concat(result.getText('entity'));
    }


    html += '</table>';
    html += '</body>' +
        '</html>';

    var form2 = nlapiCreateForm('Facebook Promotions');
    var myInlineHtml = form2.addField('custpage_btn', 'inlinehtml');
    myInlineHtml.setDefaultValue(html);

    response.writePage(form2);
}
