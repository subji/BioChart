// (function ()	{
// 	'use strict';
//   /*
//     Exclusivity
//    */
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

//  /*
//     Expression
//   */
//  // $.ajax({
//  //    'type': 'POST',
//  //    'url': '/files/datas',
//  //    data: {
//  //     name: 'expression',
//  //    },
//  //    beforeSend: function () {
//  //      bio.loading().start(document.querySelector('#main'), 900, 600);
//  //    },
//  //    success: function (d) {
//  //      console.log(d)
//  //      // bio.expression({
//  //      //   element: '#main',
//  //      //   width: 900,
//  //      //   height: 600,
//  //      //   requestData: expressionReqParams,
//  //      //   data: d.data,
//  //      // });

//  //      bio.loading().end();
//  //    },

//  /*
//     Landscape
//   */
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
 //      var t = 'test';
 //      console.log(t.substring(0, 1) + '00' + t.substring(3))

 //      bio.landscape({
	// 			element: '#main',
	// 			width: 1200,
	// 			height: 600,
	// 			data: {
	// 				pq: 'p',
	// 				type: 'LUAD',
	// 				data: d[0].data,
	// 				title:d[0].data.name,
	// 			},
	// 		});

 //      bio.loading().end();
 //    },
 //  });

//  /*
//     Landscape
//   */
//  $.ajax({
//     'type': 'POST',
//     'url': '/files/datas',
//     data: {
//      name: 'pathway',
//     },
//     beforeSend: function () {
//       bio.loading().start(document.querySelector('#main'), 900, 600);
//     },
//     success: function (d) {
//       bio.pathway({
//         width: 900,
//         height: 600,
//         element: '#main',
//         data: {
//           pathway: d[0].data.pathway_list,
//           patient: d[0].data.gene_list,
//           drugs: d[0].data.drug_list,
//           // drugs_list 로 붙어서 drug list 가 존재하는 gene 에 한해서만, 
//           // [gene_name:[각 gene 별 drug 리스트.]]
//         },
//         cancer_type: d[0].data.cancer_type,
//       });

//       bio.loading().end();
//     },
//   });
// })();