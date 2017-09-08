'use strict';

(function ()	{
	var bcr = document.querySelector('.chart_container')
										.getBoundingClientRect();

	$.ajax({
		type: 'GET',
		url: landscapeURL,
		data: landscapeReqParams,
		success: function (d)	{
			console.log(d)
			landscape({
				element: '#main',
				width: bcr.left + bcr.width,
				height: 860,
				data: {
					pq: 'p',
					type: landscapeReqParams.cancer_type.toUpperCase(),
					data: d.data,
					title: d.data.name,
					// mutation: d.data.mutation_list,
					// patient: d.data.patient_list,
					// group: d.data.group_list,
					// gene: d.data.gene_list.map(function (d) {
					// 	return d.gene;
					// }),
					// pq: d.data.gene_list,
					// pqValue: 'p',
					// title: d.data.name,
					// type: landscapeReqParams.cancer_type
					// 												.toUpperCase(),
				}
			});
		},
		error: function (e)	{
			console.log(e);
		},
	});
}());