'use strict';

var heatmap = (function (heatmap)	{
	var model = {};

	function setAxisPosition (location, width, height, margin)	{
		switch (location)	{
			case 'top': return [margin.left, margin.top, width - margin.right]; break;
			case 'left': return [margin.left, margin.top, height - margin.bottom]; break;
			case 'bottom': return [margin.left, height - margin.bottom, width - margin.right]; break;
			case 'right': return [width - margin.right, margin.top, height - margin.bottom]; break;
			default: throw new Error('Not defined location information.'); break;
		}
	};

	return function (opts)	{
		console.log(opts)

		// var dq = document.querySelector(opts.element),
		// 		w = parseFloat(opts.width || dq.style.width || 588),
		// 		h = parseFloat(opts.height || dq.style.height || 300),
		// 		aSvg = d3.select(opts.element).append('svg')
		// 		.attr('width', 50)
		// 		.attr('height', h - 50)
		// 		.append('g')
		// 		.attr('transform', 'translate(50, 0)'),
		// 		hSvg = d3.select(opts.element).append('svg')
		// 		.attr('width', w - 50)
		// 		.attr('height', h - 50)
		// 		.style('background-color', 'rgb(211, 211, 211)')
		// 		.append('g')
		// 		.attr('transform', 'translate(0, 0)'),
		// 		lSvg = d3.select(opts.element).append('svg')
		// 		.attr('width', w - 50)
		// 		.attr('height', 50)
		// 		.append('g')
		// 		.attr('transform', 'translate(50, 0)');

		// var tempYarr = [], lData = ['A', 'B', 'M'];

		// for (var i = 0, l = opts.axis[0][1]; i < l; i++)	{
		// 	tempYarr.push(i);
		// }

		// var scaleX2 = d3.scaleLinear()
		// 							.domain([opts.axis[0][0], opts.axis[0][1] - 1])
		// 							.range([0, w - 50]);
		// var scaleX = d3.scaleBand()
		// 							.domain(tempYarr)
		// 							.rangeRound([0, w - 50]),											
		// 		scaleY = d3.scaleBand()
		// 							.domain(opts.axis[1])
		// 							.rangeRound([0, h - 50]),
		// 		scaleL = d3.scaleBand()
		// 							.domain(lData)
		// 							.rangeRound([0, w - 50]);

		// aSvg.call(d3.axisLeft(scaleY))
		// 	.selectAll('path, line').remove();

		// hSvg.selectAll('#sample')
		// 	.data(opts.data)
		// 	.enter().append('rect')
		// 	.attr('id', '#sample')
		// 	.attr('x', function (d)	{
		// 		return scaleX2(d.x);
		// 	})
		// 	.attr('y', function (d)	{
		// 		return d.value === 'M' ? 
		// 		(scaleY(d.y) + scaleY.bandwidth() / 3) : scaleY(d.y);
		// 	})
		// 	.attr('width', scaleX.bandwidth())
		// 	.attr('height', function (d)	{
		// 		return d.value === 'M' ? scaleY.bandwidth() / 3 : scaleY.bandwidth();
		// 	})
		// 	// .style('stroke', '#000')
		// 	.style('fill', function (d)	{
		// 		switch(d.value)	{
		// 			case '.': return 'rgb(211, 211, 211)'; break;
		// 			case 'A': return 'rgb(255, 0, 0)'; break;
		// 			case 'B': return 'rgb(0, 0, 255)'; break;
		// 			case 'M': return 'rgb(0, 255, 0)'; break;
		// 			default: return 'rgb(255, 255, 255)'; break;
		// 		}
		// 	});

		// var legend = lSvg.selectAll('#legend')
		// 		.data(lData)
		// 		.enter().append('g');

		// legend.append('rect')
		// 			.attr('x', function (d)	{
		// 				return scaleL(d);
		// 			})
		// 			.attr('y', function (d)	{
		// 				return d === 'M' ? 18 : 10;
		// 			})
		// 			.attr('width', 10)
		// 			.attr('height', function (d)	{
		// 				return d === 'M' ? 15 : 30;
		// 			})
		// 			.style('fill', function (d)	{
		// 				switch(d)	{
		// 					case 'A': return 'rgb(255, 0, 0)'; break;
		// 					case 'B': return 'rgb(0, 0, 255)'; break;
		// 					case 'M': return 'rgb(0, 255, 0)'; break;	
		// 				}
		// 			});
		// legend.append('text')
		// 			.attr('x', function (d)	{
		// 				return scaleL(d) + 20;
		// 			})
		// 			.attr('y', 30)
		// 			.text(function (d)	{
		// 				return {
		// 					'A': 'Amplification',
		// 					'B': 'Homozygous Deletion',
		// 					'M': 'Mutation',
		// 				}[d];
		// 			});

		var dq = document.querySelector(opts.element),
				w = parseFloat(opts.width || dq.style.width || 588),
				h = parseFloat(opts.height || dq.style.height || 300),
				m = size.setMargin(opts.margin) || { top: 0, left: 0, bottom: 0, right: 0 };

		var canvas = render.createCanvas(opts.element.replace('#', ''), w, h),
				ctx = canvas.getContext('2d'),
				rd = render.context(ctx);

		var ax = opts.axis.x,
				ay = opts.axis.y,
				lx = ax.location || 'bottom',
				ly = ay.location || 'left',
				rx = ax.range || 'normal',
				ry = ay.range || 'normal';

		var sx = scale[ax.scale](ax.data, rx === 'riverse' ? 
						[w - m.right, m.left] : [m.left, w - m.right]),
				sy = scale[ay.scale](ay.data, ry === 'riverse' ? 
						[h - m.bottom, m.top] : [m.top, h - m.bottom]);

		var rects = opts.rect.length < 1 ? [opts.rect] : opts.rect; 

		var testp = setAxisPosition(lx, w, h, m);
		
		dq.appendChild(canvas);

		axis.context(ctx)
				.horizontal({
					scale: sx,
					location: lx,
					position: setAxisPosition(lx, w, h, m),
					ticks: typeof ax.ticks === 'undefined' ? true : ax.ticks,
					base: typeof ax.base === 'undefined' ? true : ax.base,
					text: typeof ax.text === 'undefined' ? true : ax.text,
				})
				.vertical({
					scale: sy,
					location: ly,
					position: setAxisPosition(lx, w, h, m),
					ticks: typeof ay.ticks === 'undefined' ? true : ay.ticks,
					base: typeof ay.base === 'undefined' ? true : ay.base,
					text: typeof ay.text === 'undefined' ? true : ay.text,
				});

		for (var i = 0, l = opts.data.length; i < l; i++)	{
			opts.data[i].scaleX = sx;
			opts.data[i].scaleY = sy;

			for (var r = 0, rl = rects.length; r < rl; r++)	{
				rd.rect(rects[r](opts.data[i]));
			}
		}
	}
}(heatmap||{}));