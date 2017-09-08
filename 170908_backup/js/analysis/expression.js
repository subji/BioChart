(function ()	{
	'use strict';

	var sidebar = document.querySelector('#sidebar')
												.getBoundingClientRect(),
			navibar = document.querySelector('.navbar')
												.getBoundingClientRect();

	document.querySelector('#maincontent').style.height = 
	(sidebar.height - navibar.bottom * 1.55) + 'px';
	
	$.ajax({
		type: 'GET',
		url: expressionUrl,
		data: expressionReqParams,
		success: function (d)	{
			bio.expression({
				element: '#main',
				width: navibar.width - (sidebar.width + (sidebar.width / 5)),
				height: sidebar.height - (navibar.bottom * 1.5),
				url: expressionUrl,
				req: expressionReqParams,
				data: d.data,
			});
		},
		error: function (d)	{
			throw new Error ('Ajax request error');
		},
	})
}());