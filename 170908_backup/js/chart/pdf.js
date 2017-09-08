'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('pdf', ['html2Canvas', 'pdfmake', 'vfs_fonts'], factory);
	} else {
		factory(pdf);
	}
} (function ()	{
	return function (target)	{
		html2canvas(target, {
			'background': '#fff',
			'onrendered': function (canvas)	{
				var doc = new jsPDF('landscape');

				doc.addImage(canvas, 15, 40, 267, 130);

				doc.output('dataurlnewwindow');

				// var docDefinition = {
				// 	'content': [
				// 		// 'This is an sample PDF printed with pdfMake',
				// 		{
				// 			'image': canvas.toDataURL(),
				// 			'width': 845,
				// 			'height': 595,
				// 			// 'alignment': 'center'
				// 		}
				// 	],
				// 	'pageOrientation': 'landscape',
				// 	'pageMargins': [0, 0, 0, 0]
				// };
				
				// pdfMake.createPdf(docDefinition).open();
			}
		});
	}
}));