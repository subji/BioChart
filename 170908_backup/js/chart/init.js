'use strict';

var Chart 					 = function ()						{};

Chart.prototype.view = function (url, params)	{
	if ((/pathway/i).test(url))	{
		d3.selectAll('text, rect')
			.attr('class', 'preserve_events');
	} else {
		d3.selectAll('svg').remove();
	}

	var chartname = url.replace(/(\/[a-z]+\/)|(plot)\?|\?/gi, '');
	// temparary code.
	// if (chartname === 'expressions')	{
	// 	chartname = 'expressionPlot';
	// }

	// if (chartname === 'needle')	{
	// 	chartname += 'plot';
	// }

	require(['loading', chartname], function (loading, chart)	{
		loading(chartname).start();

		$.ajax({ 
			 'type' : 'GET' 								   , 
			 'url'  : params ? url + makeReqQuery(params) : url,  
		 })
		 .done(function (data)	{
		 	console.log(new URLSearchParams(window.location.search));
			data.data.isERCSB 	   = url.indexOf('ForERCSB') > -1
													   ? true : false;
  		data.data.req_info    = {
  		 	 'patient_id'  : params ? params.sample_id 	 : '',
  		 	 'source'			 : params ? params.source 	 	 : '',
  		 	 'cancer_type' : params ? params.cancer_type : '',
  		 	 'filter'			 : params ? params.filter      : ''
  		};

			var start = new Date().getTime();

			chart(data, url, params);

			var end   = new Date().getTime();

			var time  = end - start;

			console.log('Excution time : ', time);

			loading(chartname).stop();
		});
	});
}

var makeReqQuery 		 = function (params)			{
	var res  = '';

	for (var key in params)	{
		res += key + '=' + params[key] + '&';
	}

	return res;
}