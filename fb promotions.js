/**
 * Project
 * 
 * Version  	Date            Author     		Remarks
 * 1.00         9/15/15			Chris			Inital program creation			 		
 */



function main(request, response){	// initial function called as default function in script
	
	if(request.getMethod() == 'GET'){	// as script is run
	
		function1();
	}
	else								// after submit
	{
		function2();
	}
}

function function1(){
	
	var form = nlapiCreateForm('Facebook Promotions');
	form.addField('date_start', 'date', 'Start Date').setDefaultValue('9/1/2015');
	form.addField('date_end', 'date', 'End Date').setDefaultValue('9/15/2015');
	
	form.addSubmitButton('Submit');
	response.writePage(form);
}
function function2(){

	var setStartDate 	= new Date(request.getParameter('date_start'));	// Import start
	var setEndDate 		= new Date(request.getParameter('date_end')); // end
	
	// Search for Sales Order information based on date range
	var filters = new Array();
	filters[0]  = new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);
	filters[1]  = new nlobjSearchFilter('type', null, 'anyof', 'SalesOrd');
	filters[2]  = new nlobjSearchFilter('mainline', null, 'is', 'T');

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
	while(results.length == 1000)
	{
		var lastId2 = results[999].getValue('internalid');
		var lastLine = results[999].getValue('line');
		
		filters[3] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId2);
	
		var results = nlapiSearchRecord('transaction', null, filters, columns);
		
        for(var i = 0; i < results.length; i++){
        	
             var result = results[i];

             if(Number(result.getValue('internalid')) == Number(lastId2) && Number(result.getValue('line')) > Number(lastLine)){

            	 allResults = allResults.concat(result); 
             }
             else if(result.getValue('internalid') > lastId2){
                	  
                 allResults = allResults.concat(result); 
             }
        }
	}
	
	// Get a list of unique customers
	var unsortedCustomers = new Array();
	for(var x = 0; x <= allResults.length; x++){
		
		var result = allResults[x];
		
		try{
			
			var code = result.getText('promocode');
			
			if(code.indexOf('fb') != -1 || code.indexOf('FB') != -1){
				
				if(code != '20offbible'){
					
					unsortedCustomers = unsortedCustomers.concat(allResults[x].getValue('entity'));	
				}
			}			
		}
		catch(err){
			
		}

	}
	
	var listofCustomers = new Array();
	listofCustomers = trim(unsortedCustomers);
	listofCustomers.sort();

	// Search for all purchases made by list of customers
	var filters = new Array();
	filters[0]  = new nlobjSearchFilter('entity', null, 'anyof', listofCustomers);
	filters[1]  = new nlobjSearchFilter('type', null, 'anyof', 'SalesOrd');
	filters[2]  = new nlobjSearchFilter('mainline', null, 'is', 'T');

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
	while(results.length == 1000)
	{
		var lastId2 = results[999].getValue('internalid');
		var lastLine = results[999].getValue('line');
		
		filters[3] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId2);
	
		var results = nlapiSearchRecord('transaction', null, filters, columns);
		
        for(var i = 0; i < results.length; i++){
        	
             var result = results[i];

             if(Number(result.getValue('internalid')) == Number(lastId2) && Number(result.getValue('line')) > Number(lastLine)){

            	 allResultsCustDetail = allResultsCustDetail.concat(result); 
             }
             else if(result.getValue('internalid') > lastId2){
                	  
                 allResultsCustDetail = allResultsCustDetail.concat(result); 
             }
        }
	}
	
	// Array of arrays based on list of names
	w = window;
	for(var i = 0; i < listofCustomers.length; i++){
		
		w["codesfor" + listofCustomers[i]] = new Array();
		w["nonFBSales" + listofCustomers[i]] = Number(0);
		w["noCodeSales" + listofCustomers[i]] = Number(0); 
		w["firsttime" + listofCustomers[i]] = Number(0);
	}

	// populate array of arrays
	for(var x = 0; x < allResultsCustDetail.length; x++){
		
		var result = allResultsCustDetail[x];
		
		if(result.getText('promocode') != ''){
			
			w["codesfor" + result.getValue('entity')] = w["codesfor" + result.getValue('entity')].concat(result.getText('promocode'));
			w["nonFBSales" + result.getValue('entity')] += Number(result.getValue('amount'));
			w["firsttime" + result.getValue('entity')]++;

		}else{
			
			w["noCodeSales" + result.getValue('entity')] += Number(result.getValue('amount'));
			w["firsttime" + result.getValue('entity')]++;
		}
	}
	
	// get length of longest array
	var longest = 0;
	for(var x = 0; x < listofCustomers.length; x++){
		
		if(Number(w["codesfor" + listofCustomers[x]].length) > Number(longest)){
			
			longest = Number(w["codesfor" + listofCustomers[x]].length);
			
		}
		/*
		print('customer', listofCustomers[x]);
		for(var x2 = 0; x2 < w["codesfor" + listofCustomers[x]].length; x2++){
			
			print(w["codesfor" + listofCustomers[x]][x2]);
		}*/
	}
	print('longest', longest);
	
	
	html  = '<html>';
	html += '<head>';
	//html += '<script src="https://system.netsuite.com/core/media/media.nl?id=359359&c=811217&h=65afe36a877be122622c&_xt=.js"></script>';  // table sort
	//html += '<link rel="stylesheet" type="text/css" href="https://system.netsuite.com/core/media/media.nl?id=400790&c=811217&h=c3d4ce9af7d71b7160e3&_xt=.css">'; 
	//html += '<script src="http://code.jquery.com/jquery-1.5.1.min.js" type="text/javascript"></script>';
	//html += '<script src="https://system.netsuite.com/core/media/media.nl?id=420986&c=811217&h=4117b836519d6a473b55&_xt=.js" type="text/javascript"></script>';
	html += '</head>';
	html += '<body>';
	
	html += '<table>';
	html += '<tr>' +
				'<td>Customer</td>' +
				'<td>First Time Customer (Y/N)</td>' +
				'<td>SO Date</td>' +
				'<td>Customer Creation Date</td>' +
				'<td>Promotion</td>';
	/*
	// variable length additional promotions based on list of promotions
	for(var x = 1; x < longest; x++){
		
		html += '<td>Additional Promotion #' + x + '</td>';
	}
	*/
	html +=		'<td>FB Sales Amount</td>' +
				'<td>Non-FB Sales Amount</td>' +
				'<td>No Code Sales Amount</td>' +
			'</tr>';
	
	var namesposted = new Array();
		
	for(var x = 0; x < allResults.length; x++){
				
		result = allResults[x];

		if(namesposted.indexOf(result.getText('entity')) > -1){
			
			// in array
		}else{
			
			// not in array
			
			var code = result.getText('promocode');
			
			if(code.indexOf('fb') != -1 || code.indexOf('FB') != -1){
				
				if(code != '20offbible'){
					
					d1 = new Date(result.getValue('trandate'));
				    d2 = new Date(result.getValue('datecreated', 'customer'));
				    // Initial date check to see if customer is new
					if( d1.format("m/d/yy") == d2.format("m/d/yy") ){
						
						html += '<tr>' +
									'<td>' + result.getText('entity') + '</td>';
						
						if(Number(w["firsttime" + result.getValue('entity')]) == Number(1)){
							
							html += '<td> Y </td>';
						}else{
							
							// New check to see if there were sales made after the initial coupon
							if(new Date(result.getValue('trandate')).format('mm/dd/yyyy') == new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy')){
								
								html += '<td> Y </td>';
							}else{
								
								html += '<td> N </td>';
							}
						}
							html +=	'<td>' + result.getValue('trandate') + '</td>' +
									'<td>' + new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy') + '</td>' +
									'<td>' + result.getText('promocode') + '</td>';
						
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
						html +=		'<td>' + result.getValue('amount') + '</td>';		
						var tempNonSales = Number(w["nonFBSales" + result.getValue('entity')]) - Number(result.getValue('amount'));
						html +=		'<td>' + tempNonSales.toFixed(2) + '</td>';	
						html +=		'<td>' + w["noCodeSales" + result.getValue('entity')].toFixed(2) + '</td>';	
						html +=		'</tr>';
						
					}else{
						
						html += '<tr>' +
									'<td>' + result.getText('entity') + '</td>';
						
						if(Number(w["firsttime" + result.getValue('entity')]) == Number(1)){
							
							html += '<td> Y </td>';
						}else{
							
							if(new Date(result.getValue('trandate')).format('mm/dd/yyyy') == new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy')){
								
								html += '<td> Y </td>';
							}else{
								
								html += '<td> N </td>';
							}
						}				
						
						html += 	'<td>' + result.getValue('trandate') + '</td>' +
									'<td>' + new Date(result.getValue('datecreated', 'customer')).format('mm/dd/yyyy') + '</td>' +
									'<td>' + result.getText('promocode') + '</td>';
						
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
						html +=		'<td>' + result.getValue('amount') + '</td>';	
						var tempNonSales = Number(w["nonFBSales" + result.getValue('entity')]) - Number(result.getValue('amount'));
						html +=		'<td>' + tempNonSales.toFixed(2) + '</td>';	
						html +=		'<td>' + w["noCodeSales" + result.getValue('entity')].toFixed(2) + '</td>';
						html +=		'</tr>';
					}
				}
			}
		}
		namesposted = namesposted.concat(result.getText('entity'));
	}

	
	html += '</table>';
	html +=	'</body>' +
	'</html>';
	
	var form2 = nlapiCreateForm('Facebook Promotions');
	var myInlineHtml = form2.addField('custpage_btn', 'inlinehtml');
	myInlineHtml.setDefaultValue(html);
	
	response.writePage(form2);
}
/*-------------------------------------------------------------------------------------------------
	Function: print()
	Purpose:  Execution logs
-------------------------------------------------------------------------------------------------*/
function print(name, value)
{	
	var context        = nlapiGetContext();
	var usageRemaining = context.getRemainingUsage();
	nlapiLogExecution ('DEBUG', name + ' | ' + usageRemaining, value);
}

var dateFormat = function () {
    var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var    _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

function trim(arr)
{
var i,
len=arr.length,
out=[],
obj={};

for (i=0;i<len;i++) 
{
	obj[arr[i]]=0;
}
for (i in obj) 
{
	out.push(i);
}

return out;
}
