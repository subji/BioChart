  /*
    Exclusivity
   */
	// $.ajax({
 //    'type': 'POST',
 //    'url': '/files/datas',
 //    data: {
 //    	name: 'exclusivity',
 //    },
 //    beforeSend: function () {
 //      bio.loading().start(document.querySelector('#main'), 900, 600);
 //    },
 //    success: function (d) {
 //      bio.exclusivity({
 //        element: '#main',
 //        width: 900,
 //        height: 600,
 //        data: {
 //          heatmap: d[0],
 //          network: d[2],
 //          sample: d[3].data.sample_variants,
 //          survival: {
 //            patient: d[4].data,
 //            types: d[5].data,
 //          },
 //          type: 'LUAD',
 //        }
 //      });

 //      bio.loading().end();
 //    },
 //  });

 /*
    Expression
  */
 // $.ajax({
 //    'type': 'POST',
 //    'url': '/files/datas',
 //    data: {
 //     name: 'expression',
 //    },
 //    beforeSend: function () {
 //      bio.loading().start(document.querySelector('#main'), 900, 600);
 //    },
 //    success: function (d) {
 //      bio.expression({
 //        element: '#main',
 //        width: 900,
 //        height: 600,
 //        requestData: {
 //          source: 'GDAC',
 //          cancer_type: 'luad',
 //          sample_id: 'SMCLUAD1705230001',
 //          signature: 'PAM50',
 //          filter: ':'
 //        },
 //        data: d[0].data,
 //      });

 //      bio.loading().end();
 //    },
 //  });

 /*
    Landscape
  */
 // $.ajax({
 //    'type': 'POST',
 //    'url': '/files/datas',
 //    data: {
 //     name: 'landscape',
 //    },
 //    beforeSend: function () {
 //      bio.loading().start(document.querySelector('#main'), 900, 600);
 //    },
 //    success: function (d) {
 //      bio.landscape({
	// 			element: '#main',
	// 			width: 1600,
	// 			height: 800,
	// 			data: {
	// 				pq: 'p',
	// 				type: 'LUAD',
	// 				data: d[0].data,
	// 				title:d[0].data.name,
	// 			},
 //        plot: {
 //          patient: false, // true
 //          pq: false, // true
 //        },
	// 		});

 //      bio.loading().end();
 //    },
 //  });
