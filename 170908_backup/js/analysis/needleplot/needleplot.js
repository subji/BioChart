(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('needleplot', [
			'navigator', 'format', 'sizing', 
			'canvasContext', 'pdf', 'legend', 'tooltip'
			], factory);
	} else {
		factory(needleplot);
	}
} (function (navigator, format, sizing, cctx, pdf, legend, tooltip)	{
	var plot = function (ctx, data, ts)	{
		var size  = data.size,
				ts    = ts || 0;

		prePlotProccessing(data, function (d)	{
			var ypos = data.scale.y(d.idx) + size.margin * 0.25;

			if (d.shp > 1)	{
				ctx.oneLine(d.xpos + ts, ypos, d.xpos + ts, data.scale.y(d.cnt), '#4c4c4c');
			}	
		});

		prePlotProccessing(data, function (d)	{
			ctx.circle(d.xpos + ts, data.scale.y(d.cnt), d.cnt, d.colour);
		});
	}

	var prePlotProccessing = function (data, func)	{
		var index = 0,
				count = 1,
				beforeType, beforePos;

		for (var i = 0, l = data.public_list.length; i < l; i++)	{
			var p 			 = data.public_list[i];
					p.type   = format().mut(p.type).name;
					p.colour = format().mut(p.type).color;
			var result = {
						'xpos': data.scale.x(beforePos || p.position),
						'cnt': count, 'idx': index, 'shp': 2, 'colour': p.colour
					};

			if (beforePos)	{
				if (p.position !== beforePos)	{
					func(result);

					count  = 1;
				} else {
					if (p.type !== beforeType)	{
						result.shp = 1;

						func(result);
					}

					count += 1;
				}
			} else {
				func(result);
			}

			beforePos  = p.position;
			beforeType = p.type;
		}
	}

	var mainGraph = function (ctx, data)	{
		var size = data.size;

		ctx.roundRect(0, size.y.height - (size.margin * 3.5),
		size.x.width, size.margin * 1.1, 5, '#DADFE1');
	}

	var graph = function (ctx, data, ts)	{
		var size = data.size,
				ts   = ts || 0;

		for (var i = 0, l = data.graph.length; i < l; i++)	{
			var g 	= data.graph[i];
				  len = data.scale.x(g.end) - data.scale.x(g.start);

			if (g.display)	{
				ctx.beginPath();
				ctx.roundRect(data.scale.x(g.start) + ts, 
					size.y.height - (size.margin * 3.75), len, 
					size.margin * 1.6, 5, g.colour);
				ctx.font 				 = '12px Sans-Serif';
				ctx.fillStyle 	 = 'White';
				ctx.textBaseline = 'middle';
				ctx.textAlign    = 'right';
				ctx.wrapText(g.identifier, len, data.scale.x(g.start) + ts, 
										 size.y.height - size.margin * 3)
				ctx.closePath();
			}
		}
	}

	var patient = function (ctx, data, ts)	{
		console.log(ctx, data);
		// ctx.beginPath();
		// ctx.triangle(50, 50, 7);
		// ctx.closePath();
	}

	var getMax = function (data)	{
		var result = [];

		for (var i = 0, l = data.public_list.length; i < l; i++)	{
			var p = data.public_list[i].position;

			result[p] = !result[p] ? 1 : result[p] + 1;
		}

		return d3.max(result);
	}

	var getScale = function (d)	{
		d.scale = {
			'x': d3.scale.linear()
						 .domain([0, d.graph[0].length])
						 .range([0, d.size.x.width]),
			'y': d3.scale.linear()
						 .domain([0, d.size.max])
						 .range([(d.size.y.height - d.size.margin * 4), d.size.margin]),
			'rx': d3.scale.linear()
							.domain([0, d.size.x.width])
							.range([0, d.graph[0].length]),
		}
	}

	var getContext = function (id)	{
		var div 	 = d3.select(id),
				width  = parseInt(div.style('width')),
				height = parseInt(div.style('height')),
				canv 	 = div.append('canvas')
					 					.attr('width', width)
					 					.attr('height', height),
				ctx    = canv.node().getContext('2d');

		return { 
			'canvas' : canv, 	'ctx' 	: ctx,
			'width'	 : width, 'height': height
		};	 
	}

	var radius = function (count)	{
		return Math.sqrt(count) * 3 / 1.25;
	}

	var getType = function (data)	{
		var list 	 = $.merge(data.patient_list, data.public_list),
				result = [];

		for(var i = 0, l = list.length; i < l; i++)	{
			var type = format().mut(list[i].type).name;

			if (result.indexOf(type) < 0)	{
				result.push(type);
			}
		}

		return result;
	}

	return function (data, url, req)	{
		if (document.querySelectorAll('canvas'))	{
			var canvs = document.querySelectorAll('canvas');

			for (var i = 0, l = canvs.length; i < l; i++)	{
				if(canvs[i].parentNode)	{
					canvs[i].parentNode.removeChild(canvs[i]);
				}
			}
		}

		var size 	 = sizing.setArea('#genemutationplot', '.chart_container')
										 	 .setSize({'height': 420})
										 	 .setBase('needleplot')
									   	 .setGrid([
									 	 	 {
									 		 	 'id'	  : '#needleplot_yaxis',
									 		 	 'type' : 'row',
									 		 	 'ratio': 5,
									 		 	 'style': {'float': 'left'},
									 	 	 },
									 	 	 {
									 		 	 'type'	 : 'row',
									 		 	 'ratio' : 93,
									 		 	 'childs': [
									 		   { 
									 				 'id'	  : '#needleplot_chart',
									 			   'type' : 'column',
									 				 'ratio': 90,
									 			 }, 
									 			 { 
									 				 'id'	  : '#needleplot_xaxis',
									 				 'type' : 'column',
									 				 'ratio': 10,
									 			 }
									 		 ]
									 	 },
									 ]),
				title  = $('#cancer_transcript').text(data.data.title),
				xaxis  = getContext('#needleplot_xaxis'),
				yaxis  = getContext('#needleplot_yaxis'),
				chart  = getContext('#needleplot_chart'),
				max    = getMax(data.data),
				margin = 20,
				chctx  = cctx(chart.ctx),
				xctx   = cctx(xaxis.ctx),
				yctx   = cctx(yaxis.ctx),
				types  = getType(data.data);

				data.data.public_list.sort(function (a, b)	{
					return a.position > b.position ? 1 : -1;
				});

				data.data.size = {
					'x'			: {
						'width' : xaxis.width,
						'height': xaxis.height,
					},
					'y'			: {
						'width' : yaxis.width,
						'height': yaxis.height,
					},
					'max'		: max,
					'margin': margin,
				}
				
				getScale(data.data);

				xctx.clearRect(0, 0, xaxis.width, xaxis.height);
				xctx.axis.linear()
						 .range(0, data.data.graph[0].length)
						 .orient('bottom')
						 .scale(data.data.scale.x)
						 .position(0, 0)
						 .leng(data.data.size.x.width)
						 .style('12px Calibri')
						 .draw();

				yctx.clearRect(0, 0, yaxis.width, yaxis.height);
				yctx.axis.linear()
						 .range(0, data.data.size.max)
						 .orient('left')
						 .scale(data.data.scale.y)
						 .position(data.data.size.y.width, data.data.size.margin)
						 .leng(data.data.size.y.height - data.data.size.margin * 4)
						 .style('12px Calibri')
						 .draw();

				mainGraph(chctx, data.data);
				graph(chctx, data.data);
				plot(chctx, data.data);
				patient(chctx, data.data);
				legend({
					'canvas'	: true, 			 'div' : $('#legend'),
					'location': 'top-right', 'base': $('#needleplot'),
					'contents': types,			 'shapes': 'circle', // 이 부분은 배열 또는 객체로 한다.
																												// 문자열일 경우 모든 도형을 하나로
																												// 아닐경우 배열 또는 객체의 첨자를 
																												// 기준으로 도형을 선택한다.
				});

				navigator(data.data, chctx)
				.size(0, data.data.size.x.width)
				.zoom(function (d) { 
					xctx.clearRect (0, 0, data.data.size.x.width, data.data.size.x.height);
					chctx.clearRect(0, 0, data.data.size.x.width, data.data.size.y.height);

					data.data.scale.x.range([d.left, d.right]);

					xctx.axis.linear()
						  .range(0, data.data.graph[0].length)
						  .orient('bottom')
						  .scale(data.data.scale.x)
						  .position(d.count - d.ts, 0)
						  .leng(data.data.size.x.width + d.count * -1)
						  .style('12px Calibri')
						  .translate(d.ts)
						  .draw();

					mainGraph(chctx, data.data);
					graph(chctx, data.data, d.ts);
					plot(chctx, data.data, d.ts);
				})
				.move(function (d) {
					xctx.clearRect(0, 0, data.data.size.x.width, data.data.size.x.height);
					chctx.clearRect(0, 0, data.data.size.x.width, data.data.size.y.height);

					xctx.axis.linear()
						 .range(0, data.data.graph[0].length)
						 .orient('bottom')
						 .scale(data.data.scale.x)
						 .position(d.count - d.ts, 0)
						 .leng(data.data.size.x.width + d.count * -1)
						 .style('12px Calibri')
						 .translate(d.ts)
						 .draw();

					mainGraph(chctx, data.data);
					plot(chctx, data.data, d.ts);
					graph(chctx, data.data, d.ts);
				});

		$('#needle_pdf').click(function ()	{
			pdf($('#needleplot'));
		});
	};
}));