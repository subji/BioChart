'use strict';

(function (window)	{
	var sidebar = document.querySelector('#sidebar'),
			navbar = document.querySelector('.navbar'),
			container = document.querySelector('.container');

	var sbcr = sidebar.getBoundingClientRect(),
			nbcr = navbar.getBoundingClientRect();

	container.style.width = (nbcr.width - sbcr.width * 1.3) + 'px';
	container.style.height = (sbcr.height - nbcr.height * 1.8) + 'px';
	container.style.margin = '0px';

	document.querySelector('#maincontent').style.marginBottom = '0px';

	var width = parseFloat(container.style.width),
			height = parseFloat(container.style.height);

	$.ajax({
		type: 'GET',
		url: pathwayURL,
		data: pathwayReqParams,
		beforeSend: function ()	{
			bio.loading().start(document.querySelector('#main'), width, height * 0.99);
		},
		success: function(d)	{
			bio.pathway({
				width: width,
				height: height * 0.99,
				element: '#main',
				data: {
					pathway: d.data.pathway_list,
					patient: d.data.gene_list,
				},
				cancer_type: d.data.cancer_type,
			});

			bio.loading().end();
		},
	});
} (window));

// (function (factory)	{
// 	if (typeof define === 'function' && define.amd)	{
// 		define('pathway', ['tooltip', 'loading'], factory);
// 	} else {
// 		factory(pathway);
// 	}

// } (function (tooltip, loading)	{
// 	var clickDrug 		   = function (d)												{
// 		var gene = this.id.split('_')[1];

// 		$('#drugTitle').html('<big class="drug-gene-name">'
// 									+ gene.toUpperCase() + '</big>');

// 		$('#drugContentsTable').bootstrapTable('refresh', {
// 			'url' : '/models/drug/getPathwayDrugList?pathway_gene='
// 						+ gene + '&cancer_type=' + d.cancer
// 		});
// 	}

// 	var overDrug  		   = function (d)												{
// 		d3.select(this)
// 			.transition().duration(200)
// 			.attr('transform', function ()	{
// 				return 'matrix(' 
// 						 + (d.scalex + 0.02) + ', 0, 0, '
// 						 + (d.scaley + 0.02) + ', ' 
// 						 + (d.transx - 5) 	 + ', ' 
// 						 + (d.transy - 5) 	 + ')';
// 			})
// 			.selectAll('path')
// 			.style({
// 				'stroke' 				: '#FBFD24',
// 				'stroke-width' 	: 20
// 			});

// 		frontTo(this.parentNode, this);
// 	}

// 	var outDrug   		   = function (d)												{
// 		d3.select(this)
// 			.transition().duration(200)
// 			.attr('transform', function ()	{
// 				return 'matrix(' 
// 				   	 + d.scalex + ', 0, 0, '
// 						 + d.scaley + ', ' 
// 						 + d.transx + ', ' 
// 						 + d.transy + ')';
// 			})
// 			.selectAll('path')
// 			.style({
// 				'stroke' 				: '#FFF',
// 				'stroke-width' 	: 0
// 			});

// 		behindTo(this.parentNode.parentNode, this.parentNode);
// 	}

// 	var addEvtToDrugs    = function (ctype)										{
// 		return d3.selectAll('g[id*="drug_"]')
// 						 .datum(function (d)	{
// 						 		var t = d3.transform(d3.select(this)
// 						 							.attr('transform'));

// 						 		return {
// 						 			'cancer' : ctype 				 ,
// 						 			'scalex' : t.scale[0]    ,
// 						 			'scaley' : t.scale[1]    ,
// 						 			'transx' : t.translate[0],
// 						 			'transy' : t.translate[1],
// 						 		}
// 						 })
// 						 .attr('cursor', 'pointer')
// 						 .on({
// 						 	'click' 		: clickDrug,
// 						 	'mouseover' : overDrug ,
// 						 	'mouseout' 	: outDrug  ,
// 						 });
// 	}

// 	var setDrugTable     = function ()												{
// 		var table  = $('#drugContentsTable');

// 		table.bootstrapTable({
// 			'url' 		: ''		,
// 			'height'  : 'auto',
// 			'cache'   : false ,
// 			'columns' : [
// 				setColumns('drug-agent' , 'agent' 		, 'Drug',
// 									 formatAgent  , 'center'		, 'middle') 				 ,
// 				setColumns('drug-class' , 'drug_class', 'Levels of approval'
// 									, formatClass , 'center' 	  , 'middle', 'center'),
// 				setColumns('drug-cancer', 'cancer'		, 'Treated Cancer'
// 									, formatSpan	, 'center'		, 'middle') 				 ,
// 				setColumns('drug-ref'   , 'source'		, 'Reference',
// 									 formatSpan 	, 'center'		, 'middle')					 ,
// 			]
// 		})
// 		.on('load-success.bs.table', function ()	{
// 			$('#drugModal')
// 			.css({ 'top' : 0, 'left' : 0 })
// 			.draggable({ 'handle' : '.modal-header' })
// 			.on('show.bs.modal', function ()	{
// 				$('.fixed-table-container').css('padding-bottom', '0px');
// 			})
// 			.on('hide.bs.modal', function ()	{
// 				table.bootstrapTable('removeAll');
// 			})
// 			.modal({ 'keyboard' : false, 'backdrop' : 'static' });
// 		})
// 	}

// 	var setColumns 			 = function ()												{
// 		var columns = [ 'class' , 'field' , 'title', 'formatter',
// 										'halign', 'valign', 'align' ];
// 		var result  = {};

// 		for (var i = 0, l = columns.length; i < l; i++)	{
// 			result[columns[i]] = arguments[i] || null;
// 		}

// 		return result;
// 	}

// 	var getDrugColorType = function (row)	  									{
// 		return {
// 			'type1' : { 'class' : 'agent-red'	 , 'color' : 'red' 	 },
// 			'type2' : { 'class' : 'agent-blue' , 'color' : 'blue'  },
// 			'type3' : { 'class' : 'agent-black', 'color' : 'black' },
// 		}[row.drug_type];
// 	}

// 	var getDrugUrlCase   = function (row)											{
// 		return row.nci_id
// 				 ? 'http://www.cancer.gov/about-cancer/treatment/drugs/'
// 				 + row.nci_id 		 : (!row.nci_id && row.dailymed_id)
// 				 ? 'http://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid='
// 				 + row.dailymed_id : null;
// 	}

// 	var formatAgent 		 = function (val, row)								{
// 		var icon = document.getElementById('legend_icon_'
// 						 + getDrugColorType(row).color).cloneNode(true);
// 		var svg  = document.createElement('svg');

// 		icon.setAttribute('transform', 'matrix(0.023, 0, 0, 0.032, 0, 0)');

// 		svg.setAttribute('width' , 15);
// 		svg.setAttribute('height', 15);
// 		svg.appendChild(icon);

// 		return getDrugUrlCase(row) != null
// 		? svg.outerHTML + '<a href='  + getDrugUrlCase(row)
// 		+ ' target=\'drug\'><span class="underline '
// 		+ getDrugColorType(row).class + '">' + val + '</span></a>'
// 		: svg.outerHTML + '<span class="' 	 + getDrugColorType(row).class
// 		+ '">' 					+ val 				+ '</span>';
// 	}

// 	var formatClass 		 = function (val, row)								{
// 		return val;
// 	}

// 	var formatSpan 		   = function (val, row)								{
// 		var val = val || 'NA';

// 		return '<span title="' + val + '">' + val + '</span>';
// 	}

// 	var isGene 				   = function (txt, pathway)						{
// 		for (var i = 0, l = pathway.length; i < l; i++)	{
// 			if (pathway[i].gene_id === txt)	{
// 				return { 'is' : true, 'd' : pathway[i] };
// 			}
// 		}

// 		return { 'is' : false, 'd' : null };
// 	}

// 	var setGenes 				 = function (data)										{
// 		var pathway = data.pathway_list;
// 		var gtxt  	= d3.selectAll('text')[0];

// 		for (var i = 0, l = gtxt.length; i < l; i++)	{
// 			var txt 	 = gtxt[i];
// 			var isgene = isGene(txt.textContent, pathway).is;
// 			var pwdata = isGene(txt.textContent, pathway).d;

// 			if(isgene || (/gene_/i).test(txt.parentNode.id))	{
// 				var rect 		= d3.select(txt.parentNode).select('rect');
// 				var marker 	= $.inArray(txt.textContent, data.gene_list);
// 				var opt 		= {
// 					'x' 		 : parseInt(rect.attr('x'))		  		,
// 					'y' 		 : parseInt(rect.attr('y'))					,
// 					'width'  : parseInt(rect.attr('width'))			,
// 					'height' : parseInt(rect.attr('height')) + 2,
// 				};

// 				fillRect(rect 				 , pwdata, marker, opt);
// 				fillText(d3.select(txt), pwdata, opt);
// 			}
// 		}

// 		defineIndex(gtxt[0].parentNode.parentNode)

// 		d3.selectAll('text, rect').attr('class', '');
// 	}

// 	var fillRect 				 = function (rect, data, marker, opt)	{
// 		twinkle(rect, marker);

// 		rect
// 		.attr('cursor', 'pointer')
// 		.style('fill' , function (d)	{
// 			return colorScale(data);
// 		})
// 		.on({
// 			'mouseover' : function () { mOver(this, data, opt) },
// 			'mouseout'	: function () { mOut(this , data, opt) }
// 		});
// 	}

// 	var fillText 				 = function (txt, data, opt)					{
// 		txt
// 		.attr('cursor', 'pointer')
// 		.style('fill' , function (d)	{
// 			if (data)	{
// 				return data.frequency >= 30 ? '#f2f2f2' : '#333';
// 			}
// 		})
// 		.on({
// 			'mouseover' : function () { mOver(this, data, opt) },
// 			'mouseout'	: function () { mOut(this , data, opt)  }
// 		});
// 	}

// 	var defineIndex 		 = function (all)											{
// 		for (var i = 0, l = all.childNodes.length; i < l; i++)	{
// 			var node = $(all.childNodes[i]);

// 			if ((/gene_/i).test(node[0].id))	{
// 				node.data({ 'index' : i });
// 			}
// 		}
// 	}

// 	var colorScale 			 = function (data)							  		{
// 		if (data)	{
// 			var range  = d3.scale.linear()
// 										 .domain([0, 50])
// 										 .range([1, 0.5]);
// 			var base 	 = d3.hsl(data.active === 'Y' ? 'red' : 'blue');
// 					base.l = range(data.frequency);

// 			return base;
// 		} else {
// 			return '#d0d0d0';
// 		}
// 	}

// 	var twinkle 				 = function (rect, marker)			  		{
// 		if (marker > -1)	{
// 			var is = false;

// 			setInterval(function () {
// 				is = !is;

// 				rect.style({
// 					'stroke' 			 : is ? '#ff0000' : '#333',
// 					'stroke-width' : is ? '3px' 		: '1px'
// 				})
// 			}, 500);
// 		}
// 	}

// 	var mOver 					 = function (that, d, opt)						{
// 		var ua     = window.navigator.userAgent;
// 		var fullid = d3.select(that)[0][0].parentNode.id;
// 		var id 		 = fullid.substring(fullid.lastIndexOf('_') + 1,
// 								 fullid.length).toUpperCase();
// 		var rect   = $(d3.select(that)[0][0].parentNode)
// 									.find('rect')[0];
//     var brow   = false;

// 		tooltip.show(rect, "<b>" + id + "</b></br>frequency : "
// 			+ (!d ? "NA" 			: d.frequency) 		 + "</br><span style='color : "
// 			+ (!d ? "#E8E8E8" : d.active === "Y" ? "red" 		: "blue") + "'><b>"
// 			+ (!d ? "NA" 			: d.active === "Y" ? "Activated" : "Inactivated")
// 			+ "</b></span>", "rgba(15, 15, 15, 0.6)");

// 		// frontTo(that.parentNode.parentNode, that.parentNode);

// 		mTransition(that, d3.event, opt);
// 	}

// 	var mOut 						 = function (that, d, opt)						{
// 		tooltip.hide();

// 		mTransition(that, d3.event, opt);

// 		behindTo(that.parentNode.parentNode, that.parentNode);
// 	}

// 	var mTransition 		 = function (ele, evt, opt)						{
// 		if (evt.isOver && evt.isOver > 1)	{
// 			return false;
// 		}

// 		var font = 14, loc = 0, size = 0, bold = '';
// 		var rect = d3.select(ele.parentNode).select('rect');
// 		var text = d3.select(ele.parentNode).select('text');

// 		loc  = evt.type === 'mouseover' ? -5 		 : 0;
// 		size = evt.type === 'mouseover' ? 10 		 : 0;
// 		font = evt.type === 'mouseover' ? 16 		 : 14;
// 		bold = evt.type === 'mouseover' ? 'bold' : '';

// 		rect.attr({
// 			'x' 		 : opt.x 			+ loc , 
// 			'y' 		 : opt.y 			+ loc ,
// 			'width'  : opt.width  + size, 
// 			'height' : opt.height + size,
// 		});

// 		text.style('font-size'  , font + 'px')
// 				.style('font-weight', bold);
// 	}

// 	var frontTo 				 = function (parent, child)			  		{
// 		if (child.nextSibling)	{
// 			parent.appendChild(child);
// 		}
// 	}

// 	var behindTo 				 = function (parent, child)			  		{
// 		parent.insertBefore(child,
// 		parent.childNodes[ ($(child).data().index - 1) ]);
// 	}

// 	return function (data)									  								{
// 		setDrugTable();
// 		setGenes(data.data);
// 		addEvtToDrugs(data.data.cancer_type);

// 		// svg to image.
//   	// var tmp  = document.getElementById('svg4601');
//    //  var simg = new Simg(tmp);
//    //  		simg.toImg(function (img)	{
//    //  			console.log('simg test');
//    //  			console.log(img.src);
//    //  			// var a = $('<a>');
//    //  			// 		a.attr('href', img.src)
//    //  			// 		 .attr('download', 'test.png')
//    //  			// 		 .appendTo('body');

//    //  			// 		a[0].click();
//    //  			// 		a.remove();
//    //  			// var pwin = window.open(img.src, '_blank');
//    //  			var pwin = window.open('about:blank', '_blank');
//    //  			var html = '<html><head>' +
//    //  								 '</head>' +
//    //  								 '<body style="-webkit-print-color-adjust:exact;">' +
//    //  								 '<img src=\'' + img.src + '\' onload=\'javascript:window.print();\'/>' +
//    //  								 '</body>';
//    //  					pwin.document.write(html);

//    //  					setTimeout(function ()	{
//    //  						pwin.close();
//    //  					}, 500)
//    //  					// pwin.close();
//    //  					// pwin.onload = function () {
//    //  					// 	window.print();
//    //  					// 	window.close();
//    //  					// }
//    //  		});

//     // var docDefinition = {
//     	// 'content' : 'This is an sample PDF printed with pdfMake'
//     // };
//     // // input pdf at iframe
//     // pdfMake.createPdf(docDefinition).getDataUrl(function (pdf)	{
//     	// 아래 pdf dataurl 을 iframe 에 새로 넣어주면 된다.
//     	// console.log(pdf);
//     	// var iframe = $('<iframe src="' + pdf + '"></iframe>');
//     	// iframe.appendTo('body');
//     // });
	// }
// }));