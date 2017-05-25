'use strict';

var axis = (function (axis)	{
	var model = {};
	/** 
	 This functino is set context of canvas or return context of canvas.
	 */
	axis.context = function (ctx)	{
		return model.ctx = ctx, arguments.length ? axis : model.ctx;
	};
	/**
	 Draw base line of each axises.
	 */
	function base ()	{
		render
		.context(model.ctx)
		.line({
			left: this.position[0],
			top: this.position[1],
			edge: [
				this.direction === 'vertical' ? 
						this.position[0] : this.position[0] + this.position[2],
				this.direction === 'vertical' ? 
						this.position[1] + this.position[2] : this.position[1]
			],
		});
	};
	/**
	 It is a function that circulates data stored in todomain and returns each data to draw a tick.
	 */
	function tickLoop (callback)	{
		for (var i = 0; i < this.len; i++)	{
			callback.call(this, this.toDomain[i]);
		}
	};
	/**
	 To draw tick each axis.
	 */
	function ticks ()	{
		var rd = render.context(model.ctx),
				sign = this.location === 'bottom' || this.location === 'right' ? 1 : -1;

		this.tickSize = this.tickSize * sign;

		tickLoop.call(this, function (d)	{
			rd.line({
				top: this.direction === 'vertical' ? this.scale(d) : this.position[1],
				left: this.direction === 'vertical' ? this.position[0] : this.scale(d),
				edge: [
					this.direction === 'vertical' ? this.position[0] + this.tickSize : this.scale(d),
					this.direction === 'vertical' ? this.scale(d) : this.position[1] + this.tickSize
				],
			});
		});
	};

	function textLocation (value)	{
		var obj = { top: 0, left: 0 },
				bd = scale.getDistance(this.scale, this.toDomain),
				tw = draw.getTextWidth(this.font || '5px', value);

		switch(this.location)	{
			case 'top': 
				obj.top = this.position[1] - (this.tickSize + 2); 
				obj.left = this.scale(value) - (tw / 2); break;
			case 'left': 
				obj.top = this.scale(value) + bd / 2; 
				obj.left = this.position[0] - (tw + this.tickSize + 2); break;
			case 'bottom': 
				obj.top = this.position[1] + (this.tickSize + 2); 
				obj.left = this.scale(value) - (tw / 2); break;
			case 'right': 
				obj.top = this.scale(value) + bd / 2; 
				obj.left = this.position[0] + (this.tickSize + 2); break;
			default: break;
		}

		return obj;
	};

	function text ()	{
		console.log(this, this.toDomain)
		var rd = render.context(model.ctx);

		for (var i = 0, l = this.toDomain.length; i < l; i++)	{
			var td = this.toDomain[i],
					obj = textLocation.call(this, td);

			obj.text = td;
			obj.textBaseline = 'middle';

			rd.text(obj);
		}
	};
	/** 
	 Draw base axis.
	 {
	 	 scale: scale function of d3js,
	 	 location: top / bottom / left / right,
	   position: [left, top, height / width],
	   base: true / false (default: true),
	   ticks: true / false (default: true),
	   tickSize: Number,
	   text: true / false (default: true),
	 }
	 */
	function isDrawing (opts)	{
		if (opts.base) { base.call(opts, null); }
		if (opts.ticks) { ticks.call(opts, null) }
		if (opts.text) { text.call(opts, null); }
	};

	axis.horizontal = function (opts)	{
		opts.direction = 'horizontal';
		opts.toDomain = scale.getDomain();
		opts.len = scale.getDomainLength();
		opts.base = typeof opts.base === 'undefined' ? true : opts.base;
		opts.ticks = typeof opts.ticks === 'undefined' ? true : opts.ticks;
		opts.tickSize = (typeof opts.tickSize === 'undefined' ? 10 : opts.tickSize);

		return isDrawing(opts), axis;
	};

	axis.vertical = function (opts)	{
		opts.direction = 'vertical';
		opts.toDomain = scale.getDomain();
		opts.len = scale.getDomainLength();
		opts.base = typeof opts.base === 'undefined' ? true : opts.base;
		opts.ticks = typeof opts.ticks === 'undefined' ? true : opts.ticks;
		opts.tickSize = (typeof opts.tickSize === 'undefined' ? 5 : opts.tickSize);

		return isDrawing(opts), axis;
	};

	return axis;
}(axis || {}));
'use strict';

var config = {};

config.mutualExColor = function (value)	{
	return {
		'A': { bg: '#D3D3D3', ins: '#FFBDE0' },
		'B': { bg: '#FFBDE0', ins: '#5CB755' },
		'D': { bg: '#D3D3D3', ins: '#BDE0FF' },
		'E': { bg: '#BDE0FF', ins: '#5CB755' },
		'M': { bg: '#D3D3D3', ins: '#5CB755' },
		'.': { bg: '#D3D3D3', ins: '#D3D3D3' },
	}[value];
}

config.variantColor = function ()	{

};

config.groupColor = function ()	{

};


'use strict';

var draw = (function (draw)	{
	draw.ctx = null;

	draw.getTextWidth = function (font, text)	{
		var canv = document.createElement('canvas'),
				ctx = canv.getContext('2d'),
				width = 0;

		canv.id = 'get-text-width'
		ctx.font = font;

		document.body.appendChild(canv);

		width = ctx.measureText(text).width;

		document.body.removeChild(document.getElementById('get-text-width'));

		return width;
	};

	draw.randomDraw = function (start, end)	{
		return Math.floor(Math.random() * start) + (end || 0);
	};

	/*
		각의 0 은 아래로 부터 시작된다. 오른쪽은 + ~180, 왼쪽은 - ~ 180 이다.
	 */
	draw.getDegree = function (x1, y1, x2, y2)	{
		var dx = x2 - x1,
				dy = y2 - y1,
				radian = Math.atan2(dx, dy);

		return {
			radian: radian,
			degree: Math.floor((radian * 180) / Math.PI),
		};
	};

	draw.noOverlap = function (ctx, data, comp)	{
		var da = 50,
				nodes = data.filter(function (d) { return d.type === 'node'; }),
				edges = data.filter(function (d) { return d.type === 'edge'; });

		for (var i = 0, l = nodes.length; i < l; i++)	{
			var n = nodes[i];

			n.textWidth = draw.getTextWidth(ctx, '14px Calibri', n.text);
			n.width = n.width || n.textWidth * 1.2;
			n.height = n.height || 300 * 0.08;
			n.radius = 5;

			if (comp)	{
				n.top = comp.members.indexOf(n.text) > -1 ? 
								draw.randomDraw(comp.top + n.height / 2, 
								comp.height * 0.7 - n.height / 2) : 
								(comp.top - 0) / 2 - n.height / 2;
				n.left = draw.randomDraw(comp.left + comp.width - comp.left - n.width, 
								comp.left);	
			} 
			// TODO.
			// compound 가 없는 상황에서는 특정 canvas 내에서 network 가 그려져야 한다.

			edges.forEach(function (e)	{
				e.source = e.source.substring(0, n.text.length) === n.text ? 
				n.text : e.source;
				e.target = e.target.substring(0, n.text.length) === n.text ? 
				n.text : e.target;
				e.id = e.id.substring(0, e.source.length + e.target.length);
			});
		}	
		
		return data;
	};

	return draw;
}(draw || {}));
'use strict';

var event = (function (event)	{
	var model = {};

	event.context = function (ctx)	{
		return model.ctx = ctx, 
		arguments.length ? event : model.ctx;
	};

	event.data = function (data)	{
		return model.data = data,
		arguments.length ? event : model.data;
	};

	function addMoveEventOnCanvas (callback)	{
		if (!model.ctx)	{
			throw new Error('Not found context of canvas.');
		}

		function getCoord (evt)	{
			callback({
				x: evt.pageX - model.ctx.canvas.offsetLeft,
				y: evt.pageY - model.ctx.canvas.offsetTop
			});
		};

		model.ctx.canvas.removeEventListener('mousemove', getCoord);
		model.ctx.canvas.addEventListener('mousemove', getCoord);
	};

	event.hover = function (callback)	{
		addMoveEventOnCanvas(function (crd)	{
			// console.log(crd);
		});
	};

	return event;
}(event || {}));
'use strict';

var exclusive = (function ()	{
	function makeFrame(ele, sizes)	{
		// console.log(sizes);

		for (var s in sizes)	{
			var e = document.createElement('div');
					e.id = s;
					e.style.width = sizes[s].w + 'px';
					e.style.height = sizes[s].h + 'px';

			ele.appendChild(e);
		}
	};

	function toNetwork(key, data) {
		var id_regex = /id:\w+/ig,
				result = [];

		function toRgb(txt)	{
			return 'rgb(' + txt.split(' ').join(',') + ')';
		}

		data.split('\n').splice(1).filter(function (d, i)	{
			var obj = {};

				if(d.match(id_regex)[0].replace(key, '') === 'id:')	{
					d.split('\t').filter(function (ts)	{
						obj[ts.split(':')[0]] = 
						ts.split(':')[0].indexOf('color') > -1 ? 
						toRgb(ts.split(':')[1]) : ts.split(':')[1];	
					});

					result.push(obj);
				}
		});

		return result;
	};

	function toHeatmap(key, data) {
		var k = key.replace(/\s/g, ''),
				genes = key.split(' '),
				result = [];

		var targeted = data.split('\n\n').filter(function (d, i)	{
			if (d !== '')	{
				var m = (/[\[][\w(\s|,)]+[\]]/g)
								.exec(d.split('\n'))[0]
								.replace((/\[|\]|\s/g), '');

				if (k.indexOf(m) > -1)	{
					return d;
				}	
			}
		})[0].split('\n').filter(function (d, i)	{
			if (i > 0)	{
				var idx = 0,
						len = 0,
						tg = '';

				genes.forEach(function (g)	{
					if (d.indexOf(g) > -1)	{
						idx = d.indexOf(g);
						len = g.length;
					}
				});

				tg = d.substring(idx, idx + len);

				d.substring(0, idx - 2).split('').forEach(function (d, i)	{
					result.push({
						x: i,
						y: tg,
						value: d,
					});
				})
			}
		});

		return result;
	};

	function toHeatmapAxis (data)	{
		var y = {}, x = 0, len = 0;

		for (var i = 0, l = data.length; i < l; i++)	{
			y[data[i].y] = 1;
		}

		return {
			x: [0, data.length / Object.keys(y).length],
			y: Object.keys(y),
		};
	};

	function toSurvival() {

	};

	function toGrouping()	{

	};

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = parseFloat(opts.width || dq.style.width || 800),
				h = parseFloat(opts.height || dq.style.height || 400);

		makeFrame(dq, size.chart.mutualExt(dq, w, h));

		var sample = 'MAPK1 BRAF KRAS NF1 EGFR HGF';
		var test = new RegExp(sample.replace(/\s/g, '|'), 'ig');
		var hm = toHeatmap(sample, opts.heatmap); 

		// network({
		// 	data: toNetwork(test, opts.network),
		// 	element: '#network',
		// });
		/** 
		 data: heatmap data [{x:'x', y:'y', value:'value'}, ...],
		 margin: heatmap margin [top, left, bottom, right],
		 axis: { x: {
		 		scale: 'scale type', 
		 		data: 'only list or array',
		 		location: 'top / left / bottom / right',
		 		range: 'normal / riverse' normal is 0 - n, riverse is n - 0,
		 		ticks: 'true / false' is ticks showing or not,
		 		base: 'true / false' is baseline showing or not,
				text: 'true / false' is text of axis showing or not,
		 	}
		 },
		 element: 'targeted div or other element',
		 rect: if you are defined overlap over 0 then use this options. it is only array.
		 */
		heatmap({
			data: hm,
			margin: [20, 40, 20, 20],
			element: '#heatmap',
			axis: {
				x: { 
					location: 'bottom',
					scale: 'ordinal', 
					data: toHeatmapAxis(hm).x,
					ticks: false,
					base: false, 
					text: false,
				},
				y: { 
					location: 'left',
					scale: 'ordinal', 
					data: toHeatmapAxis(hm).y,
					ticks: false,
					base: false, 
				},
			},
			rect: [
				function (d) {
					var bdx = scale.compatibleBand(d.scaleX),
							bdy = scale.compatibleBand(d.scaleY);

					return {
						top: d.scaleY(d.y) + 1,
						left: d.scaleX(d.x) + 0.25,
						width: bdx + 0.5,
						height: bdy - 2,
						fillStyle: config.mutualExColor(d.value).bg,
					};
				},
				function (d) {
					var bdx = scale.compatibleBand(d.scaleX),
							bdy = scale.compatibleBand(d.scaleY),
							topAdd = 0, heiAdd = bdy;

					if (d.value === 'M' || d.value === 'B' || d.value === 'E')	{
						topAdd = bdy / 3;
						heiAdd = topAdd;
					}

					return {
						top: d.scaleY(d.y) + topAdd + 1,
						left: d.scaleX(d.x) + 0.25,
						width: bdx + 0.5,
						height: heiAdd - 2,
						fillStyle: config.mutualExColor(d.value).ins,
					};
				}
			]
		});
		survival({
			element: '#survival',
		});
		// grouping();
	};
}());
'use strict';

var force = (function (force)	{
	force.setConstant = function (cons)	{
		force.constant = cons || 50;

		return model;
	};

	force.getConstant = function ()	{
		return force.constant || 50;
	};

	force.getKvalue = function (width, height)	{
		var constant = force.getConstant();

		return Math.sqrt(width * height) / constant;
	};

	force.aForce = function (k, d)	{
		return (d * d) / k;
	};

	force.rForce = function (k, d)	{
		return (k * k) / d;
	};

	return force;

}(force || {}));
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
'use strict';

(function (window)	{
	window.bio = {
		draw: draw,
		render: render,
		variants: variants,
		pathways: '',
		expression: '',
		landscape: '',
		exclusive: exclusive,
		chart: {
			legend: '',
			needle: '',
			graph: '',
			procbar: '',
			title: '',
			network: network,
			heatmap: heatmap,
			survival: survival,
		},
		size: size,
		scale: scale,
		event: event,
	};
}(window||{}));
'use strict';

var network = (function ()	{
	function drawCompound(ctx, comp)	{
		var w = parseFloat(ctx.canvas.style.width),
				h = parseFloat(ctx.canvas.style.height),
				mw = draw.getTextWidth(ctx, '14px Calibri', comp.text),
				mh = 300 * 0.08;

		render
		.context(ctx)
		.rect({
			top: comp.top = h * 0.2, 
			left: comp.left = w * 0.15,
			width: comp.width = w * 0.7 < mw ? mw * 2 : w * 0.7,
			height: comp.height = h * 0.7 < mh + mh * 2 ? mh + mh * 2 : h * 0.7,
			fillStyle: comp.bgcolor || '#000000',
			lineWidth: 1,
			strokeStyle: comp.bordercolor || '#600017',
		})
		.line({
			top: h * 0.83,
			left: w * 0.15,
			edge: [w * 0.85 < mw ? mw * 2 : w * 0.85, h * 0.83],
			strokeStyle: comp.bordercolor || '#600017',
		})
		.text({
			top: h * 0.83 + (h * 0.08) / 2,
			left: (w * 0.85 + w * 0.15) / 2 - mw / 2,
			text: comp.text,
			font: (comp.textcolor || '#000000') + '14px Calibri',
			textBaseline: 'middle',
		});
	};

	function compound(ctx, data)	{
		var comp = data.filter(function (d) {
			return d.type === 'compound';
		})[0];

		if (comp)	{
			drawCompound(ctx, comp);
		}

		return comp;
	};

	function nodes(ctx, data, comp)	{
		var rd = render.context(ctx);

		data = draw.noOverlap(ctx, data, comp);
		data.filter(function (d) { return d.type === 'node'; })
				.forEach(function (d, i)	{

			rd
			.rounded({
				top: i - 1 > 0 ? d.top : d.top,
				left: i - 1 > 0 ? d.left : d.left,
				width: d.width,
				height: d.height,
				radius: 5,
				lineWidth: 2,
				strokeStyle: d.bordercolor || '#000000',
				fillStyle: d.bgcolor || '#000000',
			})
			.text({
				top: d.top + d.height / 1.8,
				left: d.left + d.textWidth * 0.1,
				text: d.text,
				font: (d.textcolor || '#000000') + '14px Calibri',
				textBaseline: 'middle',
			});
		});
	};

	function edges(ctx, data)	{
		var nodes = data.filter(function (d) { return d.type === 'node'; }),
				rd = render.context(ctx);

		function getDirection(dg)	{
			switch (true)	{
				case dg < 181 && dg > 135: return 1; break;
				case dg < 136 && dg > 90: return 2; break;
				case dg < 91 && dg > 45: return 3; break;
				case dg < 46 && dg > 0: return 4; break;
				case dg < 1 && dg > -45: return 5; break;
				case dg < -46 && dg > -90: return 6; break;
				case dg < -91 && dg > -135: return 7; break;
				case dg < -136 && dg > -180: return 8; break;
			}
		}

		data.filter(function (d) { return d.type === 'edge'; })
				.filter(function (d)	{
					var from = '',
							to = '',
							frombase = 0,
							fromhei = 0,
							tobase = 0,
							tohei = 0,
							adjtop = 0,
							adjleft = 0;

					nodes.forEach(function (n)	{
						if (n.text === d.source)	{
							from = n;
						} else if (n.text === d.target)	{
							to = n;
						}
					});

					d.fromTop = from.top + from.height / 2;
					d.fromLeft = from.left + from.width / 2;
					d.toTop = to.top + to.height / 2;
					d.toLeft = to.left + to.width / 2;

					var ag = draw.getDegree(d.fromLeft, d.fromTop, d.toLeft, d.toTop),
							dg = ag.degree,
							ri = ag.radian,
							sign = ag.degree < 0 ? -1 : 1,
							drc = getDirection(dg);

					if (Math.abs(dg) > 0 && Math.abs(dg) < 91)	{
						dg = Math.min(Math.abs(0 - dg * sign), Math.abs(90 - dg * sign));
					} else if (Math.abs(dg) > 90 && Math.abs(dg) < 181)	{
						dg = Math.min(Math.abs(90 - dg * sign), Math.abs(180 - dg * sign));
					}

					frombase = drc === 3 || drc === 4 || drc === 7 || drc === 8 ? 
					Math.floor(from.width / 2) : Math.floor(from.height / 2);
					tobase = frombase;
					fromhei = Math.abs(frombase * Math.tan(ri));
					tohei = Math.abs(tobase * Math.tan(ri));

					// console.log('Edges: ', d, '\nDegree: ', dg, 
					// 	'\nDirection: ', drc,
					// 	'\nBase From: ', frombase, '\nBase To: ', tobase,
					// 	'\nHeight From: ', fromhei, '\nHeight To: ', tohei);

					if (drc === 2 || drc === 7)	{
						adjtop = fromhei;
						
						d.fromLeft = drc === 2 ? from.left + from.width : from.left;
						d.toLeft = drc === 2 ? to.left : to.left + to.width;
					} else if (drc === 3 || drc === 6)	{
						adjtop = fromhei * -1;

						d.fromLeft = drc === 3 ? from.left + from.width : from.left;
						d.toLeft = drc === 6 ? to.left : to.left + to.width;
					} 

					if (drc === 1 || drc === 4)	{
						adjleft = fromhei;

						d.fromTop = drc === 1 ? from.top : from.top + from.height;
						d.toTop = drc === 1 ? to.top + to.height : to.top;
					} else if (drc === 8 || drc === 5)	{
						adjleft = fromhei * -1;

						d.fromTop = drc === 8 ? from.top : from.top + from.height;
						d.toTop = drc === 8 ? to.top + to.height : to.top;
					}

					rd.arrow({
						top: d.fromTop + adjtop,
						left: d.fromLeft + adjleft,
						width: d.toLeft + (adjleft * -1),
						height: d.toTop + (adjtop * -1),
						headLen: 10,
						dashed: (d.style === 'Dashed' ? true : false),
						lineWidth: 1,
						strokeStyle: d.linecolor,
					});
				});
	};

	return function (opts)	{
		// var e = opts.element || null,
		// 		dq = document.querySelector(e),
		// 		w = parseFloat(opts.width || dq.style.width || 252),
		// 		h = parseFloat(opts.height || dq.style.height || 300),
		// 		canv = render.createCanvas(dq.id, w, h),
		// 		ctx = canv.getContext('2d');

		// dq.appendChild(canv);
		var data = [],
				nodes = {},
				members = '';

		opts.data.map(function (d)	{
			if (d.type === 'compound')	{
				members = d.members;
				data.push({
					group: 'nodes',
					data: {
						id: 'n0',
						bgcolor: d.bgcolor,
						bdcolor: d.bordercolor || 'rgb(0, 0, 0)',
						width: 100,
						height: 100,
						isComp: true,
						per: d.text,
					},
					position: {
						// x: 150,
						// y: 150,
					}
				});
			} else if (d.type === 'node')	{
				var obj = {
					data: {
						id: (members.indexOf(d.text) > -1 ? 'n0:' + d.text : d.text),
						name: d.text,
						bgcolor: d.bgcolor,
						bdcolor: d.bordercolor || 'rgb(0, 0, 0)',
						width: draw.getTextWidth('14px Calibri', d.text),
						height: 15,
						isComp: false,
					},
					group: 'nodes',
				};

				nodes[d.text] = {
					parent: members.indexOf(d.text) > -1 ? 'n0:' : '',
				};

				if (members.indexOf(d.text) > -1)	{
					obj.data.parent = 'n0';
				} 

				data.push(obj);
			} else if (d.type === 'edge')	{
				var source = '', target = '', sep = '';

				for (var n in nodes)	{
					if (d.source.substring(0, n.length) === n)	{
						source = nodes[n].parent + n;
						sep = d.source.substring(n.length, d.source.length);
						target = nodes[d.target.substring(0, d.target.indexOf(sep))].parent + 
										d.target.substring(0, d.target.indexOf(sep));
					}					
				}

				data.push({
					data: {
						id: source + target,
						source: source,
						target: target,
						color: d.linecolor,
					},
					group: 'edges',
				});
			}
		});

		var cy = cytoscape({
			container: document.querySelector(opts.element),
			boxSelectionEnabled: false,
			autoungrabify: true,
			autounselectify: true,
			// zoomingEnabled: false,
			fit: true,
			padding: 10,
			pixelRatio: 'auto',
			elements: data,
			style: cytoscape.stylesheet()
			.selector('node')
			.css({
				'shape': 'rectangle',
				'width': 'data(width)',
				'height': 'data(height)',
				'font-size': '10',
				'content': 'data(name)',
				'text-valign': 'center',
				'background-color': 'data(bgcolor)',
				'border-color': 'data(bdcolor)',
				'border-width': '1',
			})
			.selector(':parent')
			.css({
				'background-color': 'rgba(255, 255, 255, 0.5)',
				'border-color': 'rgb(150, 0, 0)',
				'border-width': '1',
				'content': 'data(per)',
				'font-size': '12',
				'text-valign': 'top',
			})
			.selector('edge')
			.css({
				'curve-style': 'bezier',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': 'data(color)',
				'arrow-scale': '1',
				'line-color': 'data(color)',
			}),
			layout: {
				name: 'cose-bilkent',
				animate: false,
			}
		});
		 
		// var comp = compound(ctx, opts.data);
		// var nds = nodes(ctx, opts.data, (comp ? comp : null));
		// edges(ctx, opts.data);
	};
}());
'use strict';

var render = (function (render)	{
	render.ctx = null;
	/**
	 This function is to initialize styles 
	 that it will apply to shapes or lines that draw on canvas. 
	 */
	function initStyle (ctx)	{
		ctx.fillStyle = '#000000';
		ctx.strokeStyle = '#000000';
		ctx.shadowColor = '#000000';
		ctx.shadowBlur = '0';
		ctx.shadowOffsetX = '0';
		ctx.shadowOffsetY = '0';
	};

	function setStyle(ctx, opts)	{
		initStyle(ctx);

		for (var opt in opts)	{
			if (ctx[opt])	{
				ctx[opt] = opts[opt];

				switch(opt)	{
					case 'fillStyle': ctx.fill(); break;
					case 'strokeStyle': ctx.stroke(); break;
					case 'dashed': ctx.setLineDash([3, 10]); break;
					default: break;
				}
			}
		};
	};

	render.text = function (opts)	{
		render.ctx.beginPath();
		setStyle(render.ctx, opts);
		render.ctx.fillText(opts.text, opts.left, opts.top);
		render.ctx.closePath();
		return render;
	};

	render.line = function (opts)	{
		function one ()	{
			render.ctx.lineTo(opts.edge[0], opts.edge[1]);
		};

		function more() {
			for (var i = 0, l = opts.edge.length; i < l; i++)	{
				render.ctx.lineTo(opts.edge[i][0], opts.edge[i][1]);
			};
		};
		// TODO.
		// 익명 함수를 사용해서 큰 배열을 이용하면 선 그리기도 다룰 수 있어야한다.
		render.ctx.beginPath();
		render.ctx.moveTo(opts.left, opts.top);
		opts.edge.length === 2 && typeof opts.edge[0] 
		!== 'object' ? one() : more();
		setStyle(render.ctx, opts);
		render.ctx.stroke();
		render.ctx.closePath();
		return render;
	};

	render.rect = function (opts)	{
		render.ctx.beginPath();
		render.ctx.rect(opts.left, opts.top, opts.width, opts.height);
		setStyle(render.ctx, opts);
		render.ctx.closePath();
		return render;
	};

	render.rounded = function (opts)	{
		render.ctx.beginPath();
		render.ctx.moveTo(opts.left + opts.radius, opts.top);
		render.ctx.lineTo(opts.left + opts.width - opts.radius, opts.top);
		render.ctx.arcTo(opts.left + opts.width, opts.top, opts.left + opts.width, 
			opts.top + opts.radius, opts.radius);
		render.ctx.lineTo(opts.left + opts.width, opts.top + opts.height - 
			opts.radius);
		render.ctx.arcTo(opts.left + opts.width, opts.top + opts.height, 
			opts.left + opts.width - opts.radius, opts.top + opts.height, 
			opts.radius);
		render.ctx.lineTo(opts.left + opts.radius, opts.top + opts.height);
		render.ctx.arcTo(opts.left, opts.top + opts.height, opts.left, 
			opts.top + opts.height - opts.radius, opts.radius);
		render.ctx.lineTo(opts.left, opts.top + opts.radius);
		render.ctx.arcTo(opts.left, opts.top, opts.left + opts.radius, 
			opts.top, opts.radius);
		setStyle(render.ctx, opts);
		render.ctx.closePath();
		return render;
	};

	render.arrow = function (opts)	{
    var angle = Math.atan2(opts.height - opts.top, opts.width - opts.left);

		render.ctx.beginPath();
    render.ctx.moveTo(opts.left, opts.top);
    render.ctx.lineTo(opts.width, opts.height);
    render.ctx.lineTo(opts.width - opts.headLen * Math.cos(angle - Math.PI / 6),
    	opts.height - opts.headLen * Math.sin(angle - Math.PI / 6));
    render.ctx.moveTo(opts.width, opts.height);
    render.ctx.lineTo(opts.width - opts.headLen * Math.cos(angle + Math.PI / 6),
    	opts.height - opts.headLen * Math.sin(angle + Math.PI / 6));
		setStyle(render.ctx, opts);
		render.ctx.closePath();
	};
	/**
	 this function is get a ratio that to apply 
	 when the screen resolutions are high resolution.
	 */
	render.getRatio = function () {
		var ctx = document.createElement('canvas').getContext('2d'),
				dpr = window.devicePixelRatio || 1,
				bsr = ctx.webkitBackingStorePixelRatio || 
							ctx.mozBackingStorePixelRatio || 
							ctx.msBackingStorePixelRatio || 
							ctx.oBackingStorePixelRatio || 
							ctx.backingStorePixelRatio || 1;

		return dpr / bsr;
	};

	render.context = function (ctx)	{
		render.ctx = ctx;
		return render;
	};

	render.createCanvas = function (id, width, height, ratio)	{
		ratio = ratio || render.getRatio();

		var canv = document.createElement('canvas');
				canv.id = id;
				canv.width = width * ratio;
				canv.height = height * ratio;
				canv.style.width = width + 'px';
				canv.style.height = height + 'px';
				canv.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);

		return canv;
	};

	return render;
}(render || {}));
'use strict';
// 일단, D3 에 있는 scale 함수를 사용하여 그리고
// 후에 scale 알고리즘을 파악하고 공부하여 새로 만드는것으로 하자.
var scale = (function (scale)	{
	var model = {
		data: [],
		len: [],
	};
	/**
	 It is a function that make a domain data that is available for scale of d3's function and
	 calculate data length. 
	 */
	function domainData (type, data)	{
		var result = [];

		if (typeof data[0] === 'number' && typeof data[0] === 'number')	{
			var max = Math.max(data[0], data[1]),
					min = Math.min(data[0], data[1]),
					len = max - min;

			for (var i = min; i < len; i++)	{
				result.push(i);
			}

			return (
				model.data.push(result), model.len.push(len), 
				type === 'ordinal' ? result : [min, max]
			);
		} else {
			return model.data.push(data), model.len.push(data.length), data;
		}
	};
	/**
	 It is a function that generate scale about ordinal. 
	 currently it is only use d3js but later it should changes to native code.
	 */
	scale.ordinal = function (domain, range)	{
		if (!d3.scaleBand)	{
			return d3.scale.ordinal()
							.domain(domainData('ordinal', domain))
							.rangeBands(range);
		}
		
		return d3.scaleBand().domain(domainData('ordinal', domain)).range(range);
	}
	/**
	 It is a function that generate scale about linear. 
	 currently it is only use d3js but later it should changes to native code.
	 */
	scale.linear = function (domain, range)	{
		if (!d3.scaleLinear)	{
			return d3.scale.linear()
							.domain(domainData('linear', domain))
							.range(range);

		}

		return d3.scaleLinear().domain(domainData('linear', domain)).range(range);
	};

	scale.compatibleBand = function (scale)	{
		return !scale.bandwidth ? scale.rangeBand() : scale.bandwidth();
	}

	scale.getDomain = function ()	{
		return model.data.shift();
	};

	scale.getDomainLength = function ()	{
		return model.len.shift();
	};

	scale.getDistance = function (scale, data)	{
		return data.length < 2 ? scale(data[0]) : scale(data[1]) - scale(data[0]);
	};

	scale.date = function ()	{
		console.log('Date');
	};

	return scale;
}(scale||{}));
'use strict';

var size = {};

size.setMargin = function (margin)	{
	if (typeof margin === 'number')	{
		return { top: margin, left: margin, bottom: margin, right: margin };
	} else {
		switch(margin.length)	{
			case 1: return { top: margin[0], left: margin[0], bottom: margin[0], right: margin[0] }; break;
			case 2: return { top: margin[0], left: margin[1], bottom: margin[0], right: margin[1] }; break;
			case 3: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[1] }; break;
			case 4: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
			default: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
		}
	}
};

size.chart = {};

size.chart.mutualExt = function (dom, width, height)	{
	dom.style.width = width + 'px';
	dom.style.height = height + 'px';

	return {
		survival: {w: (width * 0.3), h: height},
		selectBox: {w: (width * 0.7), h: (height * 0.05)},
		separateBar: {w: (width * 0.7), h: (height * 0.05)},
		group: {w: (width * 0.7), h: (height * 0.4)},
		network: {w: (width * 0.7) * 0.3, h: (height * 0.5)},
		heatmap: {w: (width * 0.7) * 0.7, h: (height * 0.5)},
	};
};
'use strict';

var survival = (function (survival)	{

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = parseFloat(opts.width || dq.style.width || 360),
				h = parseFloat(opts.height || dq.style.height || 600),
				canvas = render.createCanvas(e.substring(1, e.length), w, h),
				ctx = canvas.getContext('2d');

		dq.appendChild(canvas);

		

		event.context(ctx)
				 .hover(function (obj)	{
				 	console.log(obj);
				 });
	}
}(survival || {}));
'use strict';

var variants = (function ()	{

	function render() {

	}

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = opts.width || dq.style.width || 1200,
				h = opts.height || dq.style.height || 600;

		console.log('Variants', '\nElement: ', e,
			'\nWidth: ', w, '\nHeight: ', h);
	};
}());