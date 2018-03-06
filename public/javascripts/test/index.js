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
 //      // bio.loading().start(document.querySelector('#main'), 900, 600);
 //    },
 //    success: function (d) {
 //      bio.expression({
 //        element: '#main',
 //        width: 900,
 //        height: 600,
 //        requestData: {
 //          source: 'GDAC',
 //          cancer_type: 'luad',
 //          // sample_id: 'SMCLUAD1705230001',
 //          // signature: 'PAM50',
 //          // signature: '180117',
 //          signature: '180125',
 //          filter: ':'
 //        },
 //        data: d[0].data,
 //        riskFunctions: [
 //          { 
 //            name: 'Test', 
 //            isDefault: true, // default false
 //            func: function (data)  {
 //              var result = [];

 //              data.forEach(function (d, i) {
 //                var sum = 0, avg = 0;

 //                bio.iteration.loop(d.values, 
 //                function (v)  {
 //                  sum += v.tpm;
 //                });
                
 //                result.push({
 //                  pid: d.pid,
 //                  score: 0,
 //                  // score: i === data.length - 1 ? 0 : 1
 //                  // score: sum / d.values.length
 //                });
 //              });

 //              console.log(result);

 //              return result;
 //            },
 //          }
 //        ],
 //        divisionFunc: function (left, mid, right, geneList, allRnaList) {
 //          // console.log(left, mid, right, geneList, allRnaList)
 //        },
 //        onSubtypeSelection: function (subtypeName, subtypeColors, model) {
 //          // console.log(subtypeName, subtypeColors, model)
 //        },
 //      });

 //      // bio.loading().end();
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
 //      // bio.loading().start(document.querySelector('#main'), 900, 600);
 //    },
 //    success: function (d) {
 //      bio.landscape({
	// 			element: '#main',
	// 			width: 1200,
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
 //        divisionFunc: function (enable, disable, others)  {
 //          // console.log(enable, disable, others);
 //        },
 //        clinicalFunc: function (data, colors) {
 //          // console.log(data, colors);
 //        },
 //        onClickClinicalName: function (clinicalName)  {
 //          // console.log(clinicalName)
 //        },
	// 		});

 //      // bio.loading().end();
 //    },
 //  });


/* Variants */
// $.ajax({
//     'type': 'POST',
//     'url': '/files/datas',
//     data: {
//      name: 'variants',
//     },
//     beforeSend: function () {
//       // bio.loading().start(document.querySelector('#main'), 900, 600);
//     },
//     success: function (d) {
//       bio.variants({
//         element: '#main',
//         width: 900,
//         height: 400,
//         data: {
//           variants: d[0].data,
//           type: 'LUAD',
//         }
//       });
//     }
// });
