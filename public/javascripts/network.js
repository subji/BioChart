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