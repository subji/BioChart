function expressionConfig ()	{
	'use strict';

	var model = {};
	/*
		parameter 로 svg 가 존재하면 가로, 세로 값을 반환.
	 */
	function isSVG (svg)	{	
		return {
			width: svg ? svg.attr('width') : 0,
			height: svg ? svg.attr('height') : 0,
		};
	}

	function legend (type)	{
		var r = '.expression_bar_legend_svg.legend-shape-g-tag',
				t1 = '.expression_bar_legend_svg.legend-text-g-tag',
				c = '.expression_scatter_legend_svg.legend-shape-g-tag',
				t2 = '.expression_scatter_legend_svg.legend-text-g-tag';

		return {
			color_mapping: {
				margin: [10, 15, 0, 0],
				attr: {
					x: function (data, idx, that)	{
						return this.tagName === 'text' ? 
									 that.margin.left : 0;
					},
					y: function (data, idx, that)	{
						return this.tagName === 'text' ? idx * that.fontHeight + 
									 that.fontHeight / 2 - 1.5 : idx * that.fontHeight;
					},
					width: 8,
					height: 8,
				},
				style: {
					fill: function (data, idx, that)	{
						return this.tagName === 'text' ? '#333333' : 
									 data === 'NA' ? '#A4AAA7' : 
									 bio.boilerPlate.clinicalInfo[data].color;
					},
					fontSize: '11px',
				},
				on: {
					mouseover: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(r, nIdx),
								text = bio.drawing().nthChild(t1, nIdx),
								rgba = bio.rendering().opacity(
											 data === 'NA' ? '#A4AAA7' : 
											 bio.boilerPlate.clinicalInfo[data].color, 0.3);

						d3.select(rect).transition(10).style('fill', rgba);
						d3.select(text).style('font-weight', 'bold');
					},
					mouseout: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(r, nIdx),
								text = bio.drawing().nthChild(t1, nIdx);

						d3.select(rect).transition(10)
													 .style('fill', data === 'NA' ? 
													 	'#A4AAA7' : bio.boilerPlate.clinicalInfo[data].color);
						d3.select(text).style('font-weight', 'normal');
					},
				},
				text: function (data, idx, that)	{ 
					return bio.drawing().textOverflow(
							data, '11px', that.width * 0.75); 
				},
			},
			scatter: {
				margin: [15, 15, 20, 15],
				attr: {
					cx: 0,
					cy: function (data, idx, that)	{
						return idx * (that.fontHeight + 3);
					},
					r: 5,
					x: function (data, idx, that)	{ return that.margin.left; },
					y: function (data, idx, that)	{
						return idx * (that.fontHeight + 3) + 1;
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return data === 'Alive' ? '#5D5DD8' : '#D86561';
					},
					fontSize: '11px',
				},
				on: {
					mouseover: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(c, nIdx),
								text = bio.drawing().nthChild(t2, nIdx),
								rgba = bio.rendering().opacity(
											 data === 'Alive' ? 
											 '#5D5DD8' : '#D86561', 0.3);

						d3.select(rect).transition(10)
													 .style('fill', rgba);
						d3.select(text).style('font-weight', 'bold');
					},
					mouseout: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(c, nIdx),
								text = bio.drawing().nthChild(t2, nIdx);

						d3.select(rect).transition(10)
													 .style('fill', data === 'Alive' ? 
													 						'#5D5DD8' : '#D86561');
						d3.select(text).style('font-weight', 'normal');
					},
				},
				text: function (data, idx, that)	{ return data; },
			},
		}[type];
	};
	/*
		Scatter axis, chart 관련 설정.
	 */
	function scatter (type, leftMargin)	{
		return {
			shape: {
				margin: [10, leftMargin, 30, 20],
				attr: {
					cx: function (data, idx, that)	{ return that.scaleX(data.x); },
					cy: function (data, idx, that)	{ return that.scaleY(data.y); },
					r: 5,
				},
				style: {
					fill: function (data, idx, that)	{
						return data.value === undefined ? '#333333' : 
									 data.value === 1 ? '#D86561': '#5D5DD8';
					},
					fillOpacity: 0.6,
				},
				on: {
					mouseover: function (data, idx, that)	{
						bio.tooltip({
							element: this,
							contents: 'ID: <b>' + data.x + '</b></br>' + 
												'Months: <b>' + data.y + '</b></br>' + 
												'Status: <b>' + (data.value === '0' ? 
												'Alive' : 'Dead') + '</b>',
						});
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');
					},
				},
			},
			axis: {
				top: 0,
				left: leftMargin,
				margin: [0, 0, 0, 0],
				exclude: 'path, line',
			},
		}[type];
	};
	/*
		Heatmap axis, chart 관련 설정.
	 */
	function heatmap (type, leftMargin)	{
		return {
			shape: {
				margin: [0, leftMargin, 0, 20],
				attr: {
					id: function (data, idx, that)	{
						return 'expression_heatmap_rect';
					},
					x: function (data, idx, that)	{ return that.scaleX(data.x); },
					y: function (data, idx, that)	{ return that.scaleY(data.y); },
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX);
					},
					height: function (data, idx, that)	{
						return bio.scales().band(that.scaleY);
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						bio.tooltip({
							element: this,
							contents: 'ID: <b>' + data.x + '</b></br>' + 
												'Gene: <b>' + data.y + '</b></br>' + 
												'TPM: <b>' + data.value + '</b></br>',
						});
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');
					},
				},
			},
			axis: {
				top: 0,
				left: leftMargin,
				margin: [0, 0, 0, 0],
				exclude: 'path, line',
			},
		}[type];
	};

	function patient (leftMargin)	{
		return {
			margin: [0, leftMargin, 0, 20],
			attr: {
				points: function (data, idx, that)	{
					var y = that.id.indexOf('bar') > -1 ? 
									data.y - data.value < 0 ? 
									that.scaleY(data.y) + 8 : 
									that.scaleY(data.y) + 3 : that.height,
							dir = that.id.indexOf('bar') > -1 ? 
										data.y - data.value < 0 ? 'top' : 'bottom' : 'bottom';

					return bio.rendering().triangleStr(
						that.scaleX(data.x), y, 10, dir);
				},
			},
			style: { fill: '#333333' },
			on: {
				mouseover: function (data, idx, that)	{
					bio.tooltip({
						element: this,
						contents: '<b>' + data.x + '</b></br>' + 
											'Value: <b>' + data.value + '</b></br>',
					});
				},
				mouseout: function (data, idx, that)	{
					bio.tooltip('hide');
				},
			},
		};
	};
	/*
		bar axis, chart 관련 설정.
	 */
	function bar (type, leftMargin)	{
		return {
			shape: {
				margin: [20, leftMargin + 1, 15, 19],
				attr: {
					id: function (data, idx, that)	{
						return 'expression_bar_plot_rect';
					},
					x: function (data, idx, that)	{
						return that.scaleX(data.x);
					},
					y: function (data, idx, that)	{
						if (that.extremeValue)	{
							return data.value === bio.math.max(that.copyY) ? 
										 that.scaleY(bio.math.max(that.copyY)) : 
										 that.height;	
						}

						return data.y - data.value < 0 ?
									 that.scaleY(data.value) : that.scaleY(data.y);
					},
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX);
					},
					height: function (data, idx, that)	{
						if (that.extremeValue)	{
							return that.scaleY(bio.math.max(that.copyY)) - 
										 that.scaleY(bio.math.min(that.copyY));
						}

						return data.y - data.value < 0 ? 
									 that.scaleY(data.y) - that.scaleY(data.value) : 
									 that.scaleY(data.value) - that.scaleY(data.y);
					},
				},
				style: {
					fill: function (data, idx, that)	{
						if (that.extremeValue)	{
							return bio.math.max(that.copyY) - 
										 bio.math.min(that.copyY) ? 
										 '#62C2E0' : '#FFFFFF';
						}

						return data.y - data.value === 0 ? '#000000' : '#62C2E0';
					},
					stroke: function (data, idx, that)	{
						if (that.extremeValue)	{
							return bio.math.max(that.copyY) - 
										 bio.math.min(that.copyY) ? 
										 '#62C2E0' : '#FFFFFF';
						}

						return data.y - data.value === 0 ? '#000000' : '#62C2E0';
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						bio.tooltip({
							element: this,
							contents: 'pid: <b>' + data.x + '</b></br>' + 
												'score: <b>' + data.value + '</b>',
						});
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');
					},
				},
			},
			axis: {
				top: 0,
				left: leftMargin,
				margin: [10, 0, 10, 0],
			},
		}[type];
	};
	/*
		Gradient axis, bar 관련 설정.
	 */
	function gradient (type, svg)	{
		var svgAttr = isSVG(svg);

		return {
			axis: {
				top: 20,
				left: 0,
				margin: [0, 5, 0, 10],
				exclude: 'path, line',
				range: [5, svgAttr.width - 10],
			},
			shape: {
				attr: {
					x: 5, y: 5,
					rx: 3, ry: 3,
					width: function (data, idx, that)	{
						return d3.select(bio.drawing().getParentSVG(this))
										 .attr('width') - 10;
					},	
					height: 15,
				},
				style: {
					fill: function (data, idx, that)	{
						return 'url(#' + that.data.colorGradient.id + ')';
					},
				}
			},
		}[type];
	};

	function division (type, leftMargin)	{
		var low_path = '.division-path-0-g-tag path',
				high_path = '.division-path-1-g-tag path',
				rect = '#expression_division_svg_division_shape_rect';

		function redrawMarker (marker, data, value)	{
			marker.attr('points', function (d, i, t)	{
				return bio.rendering().triangleStr(
							value + data.additional, data.path_y, 10, data.direction);
			});
		};

		function redrawLine (line, value)	{
			var target = line.attr('d'),
					linePos = target.substring(
						target.indexOf('M') + 1, target.indexOf(','));
			// Redraw line.
			line.attr('d', target.replace(new RegExp(linePos,"gi"), value));
		};

		return {
			bar: {
				margin: [0, leftMargin, 0, 20],
			},
			division: {
				margin: [0, leftMargin, 0, 20],
				attr: {
					x: function (data, idx, that)	{
						that.position.init.low = that.position.init.low ? 
						that.position.init.low : data.path_x;
						that.position.init.high = that.position.init.high ? 
						that.position.init.high : data.path_x;
						that.position.now.low = that.position.init.low;
						that.position.now.high = that.position.init.high;

						return this.tagName === 'text' ? 
									 data.text.indexOf('Low') > -1 ? 
									 data.start + 5 :  data.end - 
									 data.textWidth - 15 : 
									 this.tagName === 'path' ? 
									 data.path_x : data.start;
					},
					y: function (data, idx, that)	{
						return this.tagName === 'text' ? that.height / 2 : 
									 this.tagName === 'path' ? 
									 data.text.indexOf('Low') > -1 ? 
									 idx === 0 ? data.path_y - 5 : data.path_y : 
									 idx === 0 ? data.path_y : data.path_y + 5 : 0;
					},
					points: function (data, idx, that)	{
						return bio.rendering().triangleStr(
										data.path_x + data.additional, 
										data.path_y, 10, data.direction);
					},
					width: function (data, idx, that)	{ return data.end - data.start; },
					height: function (data, idx, that)	{ return that.height; },
					rx: 3, ry: 3,	
				},
				style: {
					fill: function (data, idx, that)	{
						return this.tagName === 'text' ? '#FFFFFF' : 
									 data.text.indexOf('Low') > -1 ? '#00AC52' : '#FF6252';
					},
					stroke: function (data, idx, that)	{
						return this.tagName === 'text' ? 
									 data.text.indexOf('Low') > -1 ? 
									 '#00AC52' : '#FF6252' : 'none';
					},
					strokeWidth: '0.5px', fontSize: '12px', fontWeight: 'bold',
					cursor: function (data, idx, that)	{
						return this.tagName === 'polygon' ? 'pointer' : 'normal';
					},
				},
				call: {
					drag: function (data, idx, that)	{
						if (data.text.indexOf('Low') > -1)	{
							that.position.init.low = that.position.init.low ? 
							that.position.init.low : data.path_x;
							that.position.now.low = that.position.now.low ? 
							that.position.now.low += d3.event.dx: data.path_x;

							var pos = that.position.now.low = 
									Math.max(data.start, 
									Math.min(that.position.now.high || data.path_x, 
													 that.position.now.low));

							redrawMarker(
								d3.select(this), data, that.position.now.low);
							redrawLine(d3.select(low_path), pos);
							d3.selectAll(rect)
								.attr('width', function (d, i, t)	{
									return d.text === data.text ? pos - d.start : 
												 d.end - that.position.now.high;
							});

						} else {
							that.position.init.high = that.position.init.high ? 
							that.position.init.high : data.path_x;
							that.position.now.high = that.position.now.high ? 
							that.position.now.high += d3.event.dx: data.path_x;

							var pos = that.position.now.high = 
									Math.max(that.position.now.low || data.path_x, 
									Math.min(data.end, that.position.now.high)),
									line = d3.select(low_path).attr('d'),
									linePos = line.substring(line.indexOf('M') + 1, 
																					 line.indexOf(','));
							
							redrawMarker(
								d3.select(this), data, that.position.now.high);
							redrawLine(d3.select(high_path), pos);
							d3.selectAll(rect)
								.attr('x', function (d, i, t)	{
									return d.text === data.text ? pos : d.start;
								})
								.attr('width', function (d, i, t)	{
									return d.text === data.text ? d.end - pos : 
												 that.position.now.low - d.start;
							});
						}
					},
				},
				text: function (data, idx, that)	{ return data.text; },
			},
			scatter: {
				margin: [0, leftMargin, 0, 20],
			},
		}[type];
	};

	function survival (type)	{
		return {
			legend: {
				attr: {
					x: function (data, idx, that)	{
						var bcr = d3.select('.legend').node()
												.getBoundingClientRect();

						return bcr.right - bcr.left;
						return that.data.patient.data === data.text ? 
									 bcr.right - bcr.left : -5;
					},
					y: function (data, idx, that)	{
						var bcr = d3.select('.legend text').node()
												.getBoundingClientRect(),
								txt = bio.drawing().textSize.height('11px');

						return bcr.height / 2.5;
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return that.data.patient.data === data.text ? 
									 data.color : '#FFFFFF';
					},
				},
				text: function (data, idx, that)	{
					return that.data.patient.data === data.text ? 
								 that.data.patient.data === ' **' ? '' : ' **' : '';
				},
			}
		}[type];
	};

	return function ()	{
		return {
			bar: bar,
			legend: legend,
			scatter: scatter,
			heatmap: heatmap,
			patient: patient,
			gradient: gradient,
			division: division,
			survival: survival,
		};
	};
};