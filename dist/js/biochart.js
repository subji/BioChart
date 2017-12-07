function commonConfig ()	{
	'use strict';

	var model = {};
	/*
		Ins & del => Indel 과 같은 통합 표기법 형태로
		Type 을 변경해주는 함수.
	 */
	model.typeFormat = function (type)	{
		return type.replace(
					/(_ins|_del)$/ig, '_indel').pronoun();
	};

	return function ()	{
		return model;
	};
};
function exclusivityConfig ()	{
	'use strict';

	var model = {};
	/*
		여러 Variant 로 이루어진 값을 분해하는 함수.
	 */
	function separate (value)	{
		// 0th element 는 배경, 1st element 는 실제 엘리먼트가 되어야 한다.
		return value === 'B' ? ['A', 'M'] : 
					 value === 'E' ? ['D', 'M'] : 
					 value === 'M' ? ['.', 'M'] : [value];
	};
	/*
		Mutation case 을 Exclusivity 용으로 전환.
	 */
	function byCase (value, name)	{
		if (value === 'var')	{
			return 'Mutation';
		} else {
			if (name.toUpperCase().indexOf('AMP') > -1)	{
				return 'Amplipication';
			} else {
				return 'Deletion';
			}
		}
	};

	function abbreviation (name)	{
		return name === 'Amplification' ? 'A' : 
					 name === 'Homozygous_deletion' ? 'D' : 'M';
	};

	function symbol (name)	{
		return {
			'Amplification': 'A',
			'Deletion': 'D',
			'Mutation': 'M',
			'None': '.',
		}[name];
	};

	function name (abbreviation)	{
		return {
			'A': 'Amplification',
			'D': 'Deletion',
			'M': 'Mutation',
			'.': 'None',
		}[abbreviation];
	};
	// To be delete. 알파뱃 순으로 정렬가능하기때문에.
	function priority (value)	{
		return { 
			'Amplification': 0, 
			'Deletion': 1, 
			'Mutation': 2, 
			'None': 3 
		}[value];
	};

	function sample (type, leftMargin, svg)	{
		var tempWidth = null;

		return {
			legend: {
				attr: {
					x: function (data, idx, that)	{
						var width = tempWidth ? tempWidth : 0,
								forSize = data.text.replace(' ', 'H');
						// To be modify
						tempWidth = tempWidth ? tempWidth + 
						bio.drawing().textSize.width(forSize, '14px') : 
						bio.drawing().textSize.width(forSize, '14px') + 5;

						return leftMargin + width;
					},
					y: function (data, idx, that)	{
						return data.text === '**' ? 18 : 15;
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return data.color;
					},
					fontSize: function (data, idx, that)	{
						// To be modify.
						return data.text === '**' ? '16px' : '14px';
					},
				},
				text: function (data, idx, that)	{ return data.text; },
			},
			division: {
				attr: {
					x: function (data, idx, that)	{
						// To be modify.
						var width = bio.drawing().textSize.width(
													data.text, '18px');

						return data.color === '#00AC52' ? 
									 svg.attr('width') - (10 + width) : leftMargin;
					},
					y: function (data, idx, that)	{
						return svg.attr('height') * 0.05;
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return data.color;
					},
					// To be modify
					fontSize: '18px',
				},
				text: function (data, idx, that)	{ 
					if (data.text === '**')	{ return data.text; }
				},
			},
		}[type];
	};

	function legend (leftMargin)	{
		var shape = '.exclusivity_legend_svg.legend-shape-g-tag',
				texts = '.exclusivity_legend_svg.legend-text-g-tag';

		return {
			margin: [0, leftMargin, 0, 0],
			attr: {
				x: function (data, idx, that)	{
					return this.tagName === 'text' ? 
								 idx * (that.fontWidth.value * 1.3) + 5 : 
								 idx * (that.fontWidth.value * 1.3);
				},
				y: function (data, idx, that)	{
					return this.tagName === 'text' ? 
								 that.height * 0.8 / 2 + that.height * 0.2 : 
								 data.indexOf('Mutation') > -1 ? 
								 that.height * 0.2 + that.height * 0.8 / 4.5 : 
								 that.height * 0.2;
				},
				width: 2.5,
				height: function (data, idx, that)	{
					return data === 'Mutation' ? 
								 that.height * 0.8 / 2 : that.height * 0.8;
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'text' ? '#333333' : 
								 bio.boilerPlate.exclusivityInfo[data]
				},
				fontSize: '11px',
			},
			on: {
				mouseover: function (data, idx, that)	{
					var nIdx = that.legendData.indexOf(data),
							rect = bio.drawing().nthChild(shape, nIdx),
							text = bio.drawing().nthChild(texts, nIdx),
							rgba = bio.rendering().opacity(
										 bio.boilerPlate
										 	  .exclusivityInfo[data], 0.3);

					d3.select(rect).transition(10)
												 .style('fill', rgba);
					d3.select(text).style('font-weight', 'bold');
				},
				mouseout: function (data, idx, that)	{
					var nIdx = that.legendData.indexOf(data),
							rect = bio.drawing().nthChild(shape, nIdx),
							text = bio.drawing().nthChild(texts, nIdx);

					d3.select(rect).transition(10)
												 .style('fill', bio.boilerPlate
												 	.exclusivityInfo[data]);
					d3.select(text).style('font-weight', 'normal');
				},
			},
			text: function (data, idx, that)	{ return data; },
		};
	};

	function network ()	{
		return {

		};
	};

	function heatmap (type, svg, leftMargin)	{
		var height = svg.attr('height');

		return {
			shape: {
				margin: [height * 0.2, leftMargin, 0, 10],
				attr: {
					x: function (data, idx, that)	{
						return that.scaleX(data.x);
					},
					y: function (data, idx, that)	{
						return data.value === 'Mutation' ? 
									 that.scaleY(data.y) + 
									 bio.scales().band(that.scaleY) / 3 : 
									 that.scaleY(data.y);
					},
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX);
					},
					height: function (data, idx, that)	{
						return data.value === 'Mutation' ? 
									 bio.scales().band(that.scaleY) / 3 : 
									 bio.scales().band(that.scaleY);
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return bio.boilerPlate.exclusivityInfo[data.value];
					},
				},
			},
			axis: {
				margin: [height * 0.2, leftMargin, 0, 10],
				range: [height * 0.2, height],
			},
		}[type];
	};

	function survival ()	{
		return {
			attr: {
				x: function (data, idx, that)	{
					var bcr = d3.select('.legend').node()
											.getBoundingClientRect();

					return bcr.width;
				},
				y: function (data, idx, that)	{
					var bcr = d3.select('.legend text').node()
											.getBoundingClientRect();

					return bcr.height / 3;
				},
			},
			style: {
				fill: function (data, idx, that)	{
					var color = null;

					bio.iteration.loop(that.data.sample.isAltered, 
					function (a)	{
						if (a.text === data.text)	{
							color = data.color;
						}
					});

					return color ? color : 'none';
				},
				fontSize: '25px',
			},
			text: function (data, idx, that)	{ return '**'; },
		};
	};

	function division (leftMargin)	{
		return {
			margin: [20, leftMargin, 0, 9],
			attr: {
				x: function (data, idx, that)	{
					return this.tagName === 'text' ? 
								 data.text.indexOf('Un') > -1 ? 
								 data.end - data.textWidth - that.margin.right : 
								 data.start + that.margin.right: 
								 this.tagName === 'path' ? 
								 data.path_x : data.start;
				},
				y: function (data, idx, that)	{
					return this.tagName === 'text' ? 
								 that.height * 0.05 + that.margin.top : 
								 this.tagName === 'path' ? idx === 0 ? 
								 that.margin.top : data.path_y : 
								 that.margin.top;
				},
				width: function (data, idx, that)	{
					return data.end - data.start;
				},
				height: function (data, idx, that)	{
					return that.height * 0.1;
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'text' ? 
								 '#FFFFFF' : data.color;	
				},
				stroke: function (data, idx, that)	{
					return this.tagName === 'path' ? '#333333' : 'none';	
				},
				fontSize: '11px',
			},
			text: function (data, idx, that)	{ return data.text; },
		};
	};

	return function ()	{
		return {
			name: name,
			symbol: symbol,
			byCase: byCase,
			legend: legend,
			sample: sample,
			network: network,
			heatmap: heatmap,
			survival: survival,
			separate: separate,
			priority: priority,
			division: division,
			abbreviation: abbreviation,
		};
	};
};
function expressionConfig ()	{
	'use strict';

	var model = {};

	var colorSet = [
		'#B82647', '#0A8D5E', '#F9D537', '#0B6DB7', '#E3DDCB',
		'#9F494C', '#CBDD61', '#ED9149', '#89236A', '#D8C8B2',
		'#CA5E59', '#006494', '#2E674E', '#9A6B31', '#403F95',
		'#616264', '#E2A6B4', '#5AC6D0', '#733E7F', '#45436C'
	];
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
									 data === 'NA' ? '#A4AAA7' : colorSet[idx];
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
											 colorSet[idx], 0.3);

						d3.select(rect).transition(10).style('fill', rgba);
						d3.select(text).style('font-weight', 'bold');
					},
					mouseout: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(r, nIdx),
								text = bio.drawing().nthChild(t1, nIdx);

						d3.select(rect).transition(10)
													 .style('fill', data === 'NA' ? 
													 	'#A4AAA7' : colorSet[idx]);
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
					x: function (data, idx, that)	{
						return that.scaleX(data.x);
					},
					y: function (data, idx, that)	{
						return data.y - data.value < 0 ?
									 that.scaleY(data.value) : that.scaleY(data.y);
					},
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX);
					},
					height: function (data, idx, that)	{
						return data.y - data.value < 0 ? 
									 that.scaleY(data.y) - that.scaleY(data.value) : 
									 that.scaleY(data.value) - that.scaleY(data.y);
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return data.y - data.value === 0 ? '#000000' : '#62C2E0';
					},
					stroke: function (data, idx, that)	{
						return data.y - data.value === 0 ? '#000000' : '#62C2E0';
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						bio.tooltip({
							element: this,
							contents: 'ID: <b>' + data.x + '</b></br>' + 
												'Average: <b>' + data.value + '</b>',
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
			colorSet: colorSet,
			division: division,
			survival: survival,
		};
	};
};
function landscapeConfig ()	{
	'use strict';

	var model = {};
	/*
		전달 받은 variant 가 CNV 인지 Variant 인지
		를 구분하는 함수.
	 */
	function byCase (variant)	{
		return bio.boilerPlate
							.variantInfo[bio.commonConfig()
														 	.typeFormat(variant)]
							.order < 2 ? 'cnv' : 'var';
	};

	function axis (part, direction, svg)	{
		if (part === 'common')	{
			return {
				on: {
					mouseover: function (data, idx)	{
						var id = this.parentNode
												 .parentNode.className.baseVal;

						if (id.indexOf('gene') > -1 && 
								id.indexOf('right') > -1 || 
								id.indexOf('group') > -1)	{
							var txt = id.indexOf('gene') > -1 ? 
							'Sort by <b>' + this.innerHTML + '</b>' : 
											'<b>' + this.innerHTML + '</b></br>' + 
											'Click to sort </br> Alt + Click ' + 
											'add to key';

							bio.tooltip({ element: this, contents: txt });

							d3.select(this).transition()
								.style('font-size', 11)
								.style('font-weight', 'bold');
						}
					},
					mouseout: function (data, idx)	{
						bio.tooltip('hide');

						d3.select(this).transition()
							.style('font-size', 10)
							.style('font-weight', 'normal');
					},
				}, 
			};
		}

		var w = parseFloat(svg.attr('width')),
				h = parseFloat(svg.attr('height'));

		return {
			sampleY: {
				top: 5,
				left: w - 5,
				direction: 'left', 
				range: [5, h - 25], 
				margin: [5, 0, 25, 0],
			},
			groupY: {
				top: 5,
				left: 30,
				range: [0, 0],
				direction: 'right', 
				margin: [0, 0, 0, 0], 
				exclude: 'path, line',
				on: {
					click: function (data, idx, that)	{
						/*
							정렬된 그룹 배열을 새로이 복사해준다.
						 */
						function mergedGroup (groups)	{
							var result = [];

							bio.iteration.loop(groups, function (g)	{
								result = result.concat(g);
							});

							return result;
						};

						bio.iteration.loop(that.data.axis.group.y, 
						function (ag, i)	{
							if (ag[0] === data)	{
								var group = [].concat(that.data.group.group[i]);

								that.now.group = bio.landscapeSort().group.call(
									that, group, d3.event.altKey ? true : false);
							}
						});

						var sorted = {
							axis: 'x',
							data: mergedGroup(that.now.group.axis.data),
						};

						return { sorted: sorted, model: that };		
					},
				},
			},
			geneY: {
				top: 0,
				left: w - 70,
				direction: 'right', 
				range: [10, h - 45],
				exclude: 'path, line',
				margin: [10, 0, 45, 0],
				on: {
					click: function (data, idx, that)	{
						var temp = [];

						bio.iteration.loop(that.data.heatmap, function (h)	{
							if (h.y === data)	{
								temp.push(h);
							}
						});

						return {
							sorted: bio.landscapeSort()
												 .gene(that.data.axis.heatmap.x, temp),
							model: that,
						};
					},
				},
			},
			geneX: {
				left: 15,
				top: h - 45,
				range: [15, w - 85],
				direction: 'bottom',
				margin: [0, 15, 0, 85], 
			},
			pqX: {
				left: 5,
				top: h - 45,
				direction: 'bottom', 
				range: [10, w - 20],
				margin: [0, 10, 20, 20], 
			},
		}[part + direction];
	};
	/*
		PQ, Sample, Gene 부분에 들어가는 Sorting title 렌더링 설정 함수.
	 */
	function sortTitle (part)	{
		return {
			pq: {
				margin: [5, 15, 13, 5],
				attr: {
					rx: 3, ry: 3,
					x: function (data, idx, that) {
						return this.tagName === 'text' ? 
									 that.margin.left : 
									 that.margin.left - that.margin.right;
					},
					y: function (data, idx, that) {
						return this.tagName === 'text' ? 
									 that.height - that.margin.bottom : 
									 that.height - that.margin.bottom * 1.75;
					},
					width: function (data, idx, that)	{
						return that.mostWidth.value + that.margin.right * 2;
					},
					height: function (data, idx, that)	{
						return that.mostHeight + that.margin.top;
					},
				},
			},
			gene: {
				margin: [5, 5, 13, 125],
				attr: {
					rx: 3, ry: 3,
					x: function (data, idx, that) {
						return this.tagName === 'text' ? 
									 that.width - that.margin.right : 
									 that.width - that.margin.right - 
									 that.margin.left;
					},
					y: function (data, idx, that) {
						return this.tagName === 'text' ? 
									 that.height - that.margin.bottom : 
									 that.height - that.margin.bottom * 1.75;
					},
					width: function (data, idx, that)	{
						return that.mostWidth.value - that.margin.left * 2;
					},
					height: function (data, idx, that)	{
						return that.mostHeight + that.margin.top;
					},
				},
			},
			sample: {
				margin: [10, 6.5, 25, 45],
				attr: {
					rx: 3, ry: 3,
					x: function (data, idx, that) {
						return this.tagName === 'text' ? 
								 	 that.height * -1 + that.margin.bottom : 
								 	 that.height * -1 + that.margin.bottom * 0.65;
					},
					y: function (data, idx, that) {
						return this.tagName === 'text' ? 
									 that.width - that.margin.right : 
									 that.width - that.margin.right - 
									 that.margin.top;
					},
					width: function (data, idx, that)	{
						return that.mostWidth.value - that.margin.left;
					},
					height: function (data, idx, that)	{
						return that.mostHeight + that.margin.top / 2;
					},
				},
			},
			common: {
				titles: ['#Mutations', '-log10(p-value)'],
				style: {
					fontSize: '10px',
					fontWeight: 'bold',
					filter: 'url(#drop_shadow)',
					fill: function (data, idx, that)	{
						return this.tagName === 'text' ? 
									'#FFFFFF' : '#595959';
					},
				},
				on: {
					click: function (data, idx, that)	{
						var res = bio.landscapeSort()
											[that.now.sort[that.sortName]](
											 that.sortName, that.data);

						return { sorted: res, model: that };
					},
					mouseover: function (data, idx, that)	{
						bio.tooltip({
							element: this.tagName === 'text' ? 
											 this.nextSibling ? this.nextSibling : 
											 this.previousSibling : this,
							contents: 'Sort by <b>' + data.text + '</b>',
						});
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');
					},
				},
				text: function (data, idx, that)	{ return data.text; },
			}
		}[part];
	};
	/*
		Bar 차트 설정 함수.
	 */
	function bar (part)	{
		return {
			pq: {
				margin: [10, 15, 45.5, 30],
				attr: {
					x: function (data, idx, that) {
						return bio.math.min(that.rangeX);
					},
					y: function (data, idx, that) {
						return that.scaleY(data.y) + 0.25;
					},
					width: function (data, idx, that)	{
						return that.scaleX(data.value);
					},
					height: function (data, idx, that)	{
						return bio.scales().band(that.scaleY) - 0.5;
					},
				},
				style: {
					fill: '#BFBFBF',
				},
				on: {
					mouseover: function (data, idx, that)	{
						bio.tooltip({ 
							element: this, 
							contents: '<b>' + data.y + '</b></br>' + 
				 				 'Value: <b>' + data.value + '</b>' });

						d3.select(this)
							.transition(10)
							.style('fill', '#7A7A7A')
							.style('filter', 'url(#drop_shadow)');
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');

						d3.select(this)
							.transition(10)
							.style('fill', '#BFBFBF')
							.style('filter', 'none');
					},
				},
			},
			gene: {
				margin: [10, 30, 45.5, 70],
				attr: {
					x: function (data, idx, that) {
						return that.scaleX(data.x + data.value) + 0.125;
					},
					y: function (data, idx, that) {
						return that.scaleY(data.y) + 0.25;
					},
					width: function (data, idx, that)	{
						return that.scaleX(data.x) - 
									 that.scaleX(data.x + data.value) - 0.25;
					},
					height: function (data, idx, that)	{
						return bio.scales().band(that.scaleY) - 0.5;
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return bio.boilerPlate.variantInfo[data.info].color;
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						var rgba = bio.rendering().opacity(
							bio.boilerPlate.variantInfo[data.info].color, 0.3);

						bio.tooltip({ 
							element: this, 
							contents: '<b>' + data.y + '</b></br>' + 
								  'Type: <b>' + data.info + '</b></br>' + 
								 'Count: <b>' + data.value + '</b>' });

						d3.select(this)
							.transition(10)
							.style('fill', rgba)
							.style('filter', 'url(#drop_shadow)');
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');

						d3.select(this)
							.transition(10)
							.style('fill', bio.boilerPlate
																.variantInfo[data.info].color)
							.style('filter', 'none');
					},
				},
			},
			sample: {
				margin: [10, 5, 20, 0],
				attr: {
					x: function (data, idx, that) {
						return that.scaleX(data.x) + 0.25;
					},
					y: function (data, idx, that) {
						return that.scaleY(data.y + data.value) + 0.25;
					},
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX) - 0.5; 
					},
					height: function (data, idx, that)	{
						return that.scaleY(data.y) - 
									 that.scaleY(data.y + data.value) - 0.5;
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return bio.boilerPlate.variantInfo[data.info].color;
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						var rgba = bio.rendering().opacity(
							bio.boilerPlate.variantInfo[data.info].color, 0.3);

						bio.tooltip({ 
							element: this, 
							contents: '<b>' + data.x + '</b></br>' + 
								  'Type: <b>' + data.info + '</b></br>' + 
								 'Count: <b>' + data.value + '</b>' });

						d3.select(this)
							.transition(10)
							.style('fill', rgba)
							.style('filter', 'url(#drop_shadow)');
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');

						d3.select(this)
							.transition(10)
							.style('fill', bio.boilerPlate
																.variantInfo[data.info].color)
							.style('filter', 'none');
					},
				},
			},
		}[part];
	};
	/*
		Heatmap 설정 함수.
	 */
	function heatmap (part)	{
		return {
			heatmap: {
				margin: [10, 5, 45.5, 0],
				attr: {
					x: function (data, idx, that)	{
						return that.scaleX(data.x);
					},
					y: function (data, idx, that)	{
						return byCase(data.value) !== 'cnv' ? 
									bio.scales().band(that.scaleY) / 3 + 
									that.scaleY(data.y) : that.scaleY(data.y);
					},
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX);
					},
					height: function (data, idx, that)	{
						return byCase(data.value) !== 'cnv' ? 
									bio.scales().band(that.scaleY) / 3 : 
									bio.scales().band(that.scaleY);
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return bio.boilerPlate.variantInfo[data.value].color;
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						var rgba = bio.rendering().opacity(
									bio.boilerPlate
										 .variantInfo[data.value].color, 0.3),
								typeStr = '';

						if (data.info.length > 0)	{
							bio.iteration.loop(data.info, function (i)	{
								typeStr += '</br><b>' + i + '</b>';
							});
						}

						bio.tooltip({
							element: this,
							contents: '<b>Gene mutations</b></br>' + 
										 'X: <b>' + data.x + '</b></br>' + 
										 'Y: <b>' + data.y + '</b></br>' + 
						 'Type: </br><b>' + data.value + '</b>' + typeStr,
						});

						d3.select(this)
							.transition(10)
							.style('fill', rgba)
							.style('filter', 'url(#drop_shadow)');
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');

						d3.select(this)
							.transition(10)
							.style('fill', bio.boilerPlate
																.variantInfo[data.value].color)
							.style('filter', 'none');
					},
				},
			},
			group: {
				margin: [0, 5, 7, 0],
				attr: {
					x: function (data, idx, that)	{
						return that.scaleX(data.x) || that.margin.left;
					},
					y: function (data, idx, that)	{
						return that.scaleY(data.y);
					},
					width: function (data, idx, that)	{
						return bio.scales().band(that.scaleX);
					},
					height: function (data, idx, that)	{
						return bio.scales().band(that.scaleY);
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return bio.boilerPlate
											.clinicalInfo[data.value].color;
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						var rgba = bio.rendering().opacity(
									bio.boilerPlate
										 .clinicalInfo[data.value].color, 0.3);

						bio.tooltip({
							element: this,
							contents: '<b>' + data.y + '</b></br>' + 
								'Sample: <b>' + data.x + '</b></br>' + 
								 'Value: <b>' + data.value + '</b></br>',
												
						});

						d3.select(this)
							.transition(10)
							.style('fill', rgba)
							.style('filter', 'url(#drop_shadow)');
					},
					mouseout: function (data, idx, that)	{
						bio.tooltip('hide');

						d3.select(this)
							.transition(10)
							.style('fill', bio.boilerPlate
																.clinicalInfo[data.value].color)
							.style('filter', 'none');
					},
				},
			},
		}[part];	
	};
	/*
		Legend 설정 함수. 
	 */
	function legend ()	{
		var shape = '.legend-shape-g-tag',
				texts = '.legend-text-g-tag';

		return {	
			margin: [20, 15, 5, 15],
			attr: {
				x: function (data, idx, that)	{ 
					return this.tagName === 'text' ? 
								 that.margin.left : 0; 
				},
				y: function (data, idx, that)	{
					var y = this.tagName === 'text' ? 
					 idx * (that.fontHeight + that.padding) : 
					 idx * (that.fontHeight + that.padding) - 
					 				that.fontHeight / 2 - 1;

					return this.tagName === 'rect' && 
								 byCase(data) === 'var' ? 
								 y + that.fontHeight / 4 : y;
				},
				width: function (data, idx, that)	{
					return that.fontHeight / 2;
				},
				height: function (data, idx, that)	{
					return byCase(data) === 'var' ? 
									that.fontHeight / 2 : that.fontHeight;
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'text' ? '#333333' : 
									bio.boilerPlate.variantInfo[data].color;
				},
				fontSize: '11px',
			},
			on: {
				mouseover: function (data, idx, that)	{
					var nIdx = that.legendData.indexOf(data),
							rect = bio.drawing().nthChild(shape, nIdx),
							text = bio.drawing().nthChild(texts, nIdx),
							rgba = bio.rendering().opacity(
										 bio.boilerPlate
										 	  .variantInfo[data].color, 0.3);

					d3.select(rect).transition(10)
												 .style('fill', rgba);
					d3.select(text).style('font-weight', 'bold');
				},
				mouseout: function (data, idx, that)	{
					var nIdx = that.legendData.indexOf(data),
							rect = bio.drawing().nthChild(shape, nIdx),
							text = bio.drawing().nthChild(texts, nIdx);

					d3.select(rect).transition(10)
												 .style('fill', bio.boilerPlate
												 	.variantInfo[data].color);
					d3.select(text).style('font-weight', 'normal');
				},
			},
			text: function (data, idx, that)	{ return data; },
		};
	};

	return function ()	{
		return {
			bar: bar,
			axis: axis,
			legend: legend,
			byCase: byCase,
			title: sortTitle,
			heatmap: heatmap,
		};
	};
};
function pathwayConfig ()	{
	'use strict';

	var model = {
		drug_color: {
			type1: { class: 'agent-red', color: 'red' },
			type2: { class: 'agent-blue', color: 'blue' },
			type3: { class: 'agent-black', color: 'black' },
		}
	};

	function color (data)	{
		if (data)	{
			var scale = bio.scales().get([0, 50], [1, 0.5]),
					base = d3.hsl(
						data.active === 'Y' ? 'red' : 'blue');
					base.l = scale(data.frequency);

			return base;
		} 

		return '#d0d0d0';
	};

	function getId (element)	{
		var full = d3.select(element).node().parentNode.id;

		return full.substring(full.lastIndexOf('_') + 1, 
													full.length).toUpperCase();
	};

	function node ()	{
		return {
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'rect' ? color(data) : 
								 data && data.frequency >= 30 ? 
								'#F2F2F2' : '#333333';;
				},
			},
			on: { 
				mouseover: function (data, idx, that)	{
					var elem = this.tagName === 'rect' ? this : 
								d3.select(this.parentNode).select('rect').node(),
							freq = data ? data.frequency : 'NA',
							color = data ? data.active === 'Y' ? 
											'RED' : 'BLUE' : '#E8E8E8',
							isAct = data ? data.active === 'Y' ? 
											'Activated' : 'Inactivated' : 'NA',
							id = getId(this);

					bio.tooltip({
						element: elem,
						contents: '<b>' + id + '</b></br>frequency : ' + 
						freq + '</br><span style="color : ' + color + 
						'"><b>' + isAct + '</b></span>',
					});
				},
				mouseout: function (data, idx, that)	{
					bio.tooltip('hide');
				},
			},
		};
	};

	function drug ()	{
		function geneTag (gene)	{
			return '<div id="modal_gene_name">' + gene + '</div>';
		};

		function onOverAndOut (data)	{
			var isOver = d3.event.type === 'mouseout' ? 0 : 1,
					sv = isOver ? 0.02 : 0,
					tv = isOver ? -5 : 0;

			d3.select(this).transition()
				.attr('transform', function ()	{
					return 'matrix(' + 
					(data.scaleX + sv) + ', 0, 0, ' + 
					(data.scaleY + sv) + ', ' + 
					(data.translateX + tv) + ', ' + 
					(data.translateY + tv) + ')';
				})
				.style('cursor', 'pointer')
				.selectAll('path')
				.style('stroke', isOver ? '#FBFD24' : '#FFFFFF')
				.style('stroke-width', isOver ? 20 : 0);
		};
		/*
			data 값에 따른 URL 요청 주소를 반환한다.
		 */
		function drugURL (data)	{
			return data.nci_id ? 
			'http://www.cancer.gov/about-cancer/treatment/drugs/' + 
			data.nci_id : !data.nci_id && data.dailymed_id ? 
			'http://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?' + 
			'setid=' + data.dailymed_id : null;	
		};
		/*
			type 구분을 위한 drug 모양을 반환한다.
		 */
		function drugShape (type)	{
			var color = model.drug_color[type].color,
					drug = document.querySelector(
						'#legend_icon_' + color).cloneNode(true),
					svg = document.createElement('svg');

			drug.setAttribute('transform', 
				'matrix(0.04, 0, 0, 0.04, 10, 0)');

			svg.setAttribute('width', 40);
			svg.setAttribute('height', 20);
			svg.appendChild(drug);

			return svg.outerHTML;
		};

		return {
			on: {
				click: function (data, idx, that)	{
					var gene = this.id.split('_')[1],
							title = document.querySelector('.modal-title'),
							body = document.querySelector('.modal-body');
					// Example are post, but real is get.
					$.ajax({
						// type: 'POST',
						// url: '/files',
						type: 'GET',
						url: '/models/drug/getPathwayDrugList?pathway_gene='
									+ gene + '&cancer_type=' + data.cancer,
						// data: { name: 'drug' },
						success: function (d)	{
							title.innerHTML = '<div id="modal_gene_title">' + 
															 	'Available drugs</div>' + 
															 	'<div id="modal_gene_name">' + 
															 	gene.toUpperCase() + '</div>';

							bio.table({
								height: 550,
								element: body,
								heads: ['Type', 'Drug', 'Level of approval', 
												'Treated Cancer', 'Reference'],
								// data: d.data.egfr,
								data: d,
								columns: function (col, row, head, data, that)	{
									if (col === 0) return drugShape(data.drug_type);
									else if (col === 1) 	{
										var urls = drugURL(data);
										
										return urls ? data.agent + 
										'<a class="drug-link" href=' + urls + 
										' target=\'drug\'>' + 
										'<i class="fa fa-external-link"></i></a>' : 
											data.agent;
									}										
									else if (col === 2) 	return data.drug_class;
									else if (col === 3) 	return data.cancer;
									else if (col === 4) 	return data.source;
								},
							});
						},
						error: function (err)	{
							console.log('Error: ', err);
						}
					});

					$('#drug_modal').modal({
						keyboard: false,
						backdrop: 'static',
					});
				},
				mouseover: onOverAndOut,
				mouseout: onOverAndOut,
			}
		}
	};

	return function ()	{
		return { node: node, drug: drug };
	};
};
function variantsConfig ()	{
	'use strict';

	var model = {};
	/*
		값에 따른 지름값 계산.
	 */
	function radius (count)	{
		return Math.sqrt(count) * 3 / 1.25;
	};
	/*
		Needle, Graph 의 x, y 축 설정 함수.
	 */
	function axis (part, direction, svg)	{
		if (part === 'common')	{ return {}; }

		var w = parseFloat(svg.attr('width')),
				h = parseFloat(svg.attr('height'));

		return {
			needleX: {
				top: h - 35, left: 0,
				direction: 'bottom', 
				range: [40, w - 40], 
				margin: [10, 40, 35, 40],
			},
			needleY: {
				top: 0, left: 40,
				direction: 'left', 
				range: [20, h - 80], 
				margin: [20, 40, 80, 0],
			},
		}[part + direction];
	};
	/*
		Needle, Patient 에 대한 Legend.
	 */
	function legend (part)	{
		var shape = '.legend-shape-g-tag',
				texts = '.legend-text-g-tag',
				pShape = '.variants_patient_legend_svg' + shape,
				pTexts = '.variants_patient_legend_svg' + texts;

		return {
			needle: {
				margin: [15, 10, 5, 15],
				attr: {
					cx: function (data, idx, that)	{
						return that.margin.left;
					},
					cy: function (data, idx, that)	{
						return idx * (that.fontHeight + 5);
					},
					r: 5, 
					x: function (data, idx, that)	{
						return this.tagName === 'text' ? 
									 that.margin.left * 2 : that.margin.left;
					},
					y: function (data, idx, that)	{
						return idx * (that.fontHeight + 5) + 1;	
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return this.tagName === 'text' ? '#333333' : 
									 bio.boilerPlate.variantInfo[data].color;
					},
				},
				on: {
					mouseover: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(shape, nIdx),
								text = bio.drawing().nthChild(texts, nIdx),
								rgba = bio.rendering().opacity(
											 bio.boilerPlate
											 	  .variantInfo[data].color, 0.3);

						d3.select(rect).transition(10)
													 .style('fill', rgba);
						d3.select(text).style('font-weight', 'bold');
					},
					mouseout: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(shape, nIdx),
								text = bio.drawing().nthChild(texts, nIdx);

						d3.select(rect).transition(10)
													 .style('fill', bio.boilerPlate
													 	.variantInfo[data].color);
						d3.select(text).style('font-weight', 'normal');
					},
				},
				text: function (data, idx, that)	{ return data; },
			},
			patient: {
				margin: [15, 10, 5, 15],
				attr: {
					x: function (data, idx, that)	{
						return this.tagName === 'text' ? 
									 that.margin.left * 2 : that.margin.left;
					},
					y: 0,
					points: function (data, idx, that)	{
						return bio.rendering().triangleStr(
										that.margin.left, -5, 8, 'top');
					},
				},
				style: {
					fill: function (data, idx, that)	{
						return this.tagName === 'text' ? '#333' : '#FFFFFF';
					},
					stroke: function (data, idx, that)	{
						return this.tagName === 'text' ? 'none' : '#333333';
					},
					strokeWidth: '1px',
				},
				on: {
					mouseover: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(pShape, nIdx),
								text = bio.drawing().nthChild(pTexts, nIdx),
								rgba = bio.rendering().opacity('#333333', 0.3);

						d3.select(rect).transition(10)
													 .style('stroke', rgba);
						d3.select(text).style('font-weight', 'bold');
					},
					mouseout: function (data, idx, that)	{
						var nIdx = that.legendData.indexOf(data),
								rect = bio.drawing().nthChild(pShape, nIdx),
								text = bio.drawing().nthChild(pTexts, nIdx);

						d3.select(rect).transition(10)
													 .style('stroke', '#333333');
						d3.select(text).style('font-weight', 'normal');
					},
				},
				text: function (data, idx, that)	{ return data; },
			},
		}[part];
	};

	function needle ()	{
		return {
			margin: [20, 40, 80, 40],
			attr: {
				cx: function (data, idx, that)	{
					var x = that.scaleX(data.x);

					return x > that.width - that.margin.right || 
								 x < that.margin.left? x * that.width : x;
				},
				cy: function (data, idx, that)	{
					return that.scaleY(data.y);
				},
				r: function (data, idx, that)	{
					return radius(data.value);
				},
				x: function (data, idx, that)	{
					var x = that.scaleX(data.x);

					return x > that.width - that.margin.right || 
								 x < that.margin.left? x * that.width : x;
				},
				y: function (data, idx, that)	{
					return that.scaleY(data.y);
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'path' ? '#A8A8A8' : 
								 that.id.indexOf('needle') > -1 ? bio.boilerPlate
									   .variantInfo[data.info[0].type].color : 
								 bio.rendering().opacity(bio.boilerPlate
									  .variantInfo[data.info[0].type].color, 0.3);

				},
				stroke: function (data, idx, that)	{
					return this.tagName === 'path' ? '#A8A8A8' : 'none';
				},
			},
			on: {
				mouseover: function (data, idx, that)	{
					var rgba = bio.rendering().opacity(
										 bio.boilerPlate.variantInfo[
										 data.info[0].type].color, 0.5);

					bio.tooltip({
						element: this,
						contents: 
						'Type: <b>' + data.info[0].type + 
						'</b></br>AAChange: <b>' + data.info[0].aachange +
						'</b></br>Counts: <b>' + data.y + 
						'</b></br>Position: <b>' + data.x + '</b>'
					});

					d3.select(this).transition(10).style('fill', rgba);
				},
				mouseout: function (data, idx, that)	{
					bio.tooltip('hide');

					d3.select(this).transition(10)
												 .style('fill', bio.boilerPlate
												 	.variantInfo[data.info[0].type].color);
				},
			},
		};
	};

	function navi ()	{
		return {
			margin: [0, 40, 5, 40],
			end: { init: 0, now: 0 },
			start: { init: 0, now: 0 },
			navi: { init: 0, now: 0, width: 0, nowWidth: 0 },
			attr: {
				x: function (data, idx, that)	{
					return data === 'main' ? that.start : 
								 data === 'end' ? that.end + that.margin.left - 
								 that.controls.width : 
								 that.start - that.controls.width;
				},
				y: function (data, idx, that)	{
					return data === 'main' ? 0 : that.height * 0.25;
				},
				width: function (data, idx, that)	{
					return data === 'main' ? 
								 that.end : that.controls.width * 2;
				},
				height: function (data, idx, that)	{
					return data === 'main' ? 
								 that.height - that.margin.bottom : 
								 that.controls.height;
				},
				rx: function (data, idx, that)	{
					return data === 'main' ? 3 : 5;
				},
				ry: function (data, idx, that)	{
					return data === 'main' ? 3 : 5;
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return data === 'main' ? 'rgba(255, 255, 50, 0.1)' : 
					'#A8A8A8';
				},
				stroke: function (data, idx, that)	{
					return data === 'main' ? '#FFDF6D' : '#EAECED';
				},
				strokeWidth: function (data, idx, that)	{
					return data === 'main' ? '1px' : '2px';
				},
				cursor: function (data, idx, that)	{
					return data === 'main' ? 'move' : 'ew-resize';
				},
			},
			call: {
				drag: function (data, idx, that)	{
					var main = d3.select(
						'#variants_navi_svg_navi_main_rect'),
							start = d3.select(
						'#variants_navi_svg_navi_start_rect'),
							end = d3.select(
						'#variants_navi_svg_navi_end_rect'),
							dg = that.opts.drag;
					/*
						Start, end 의 드래그 이동 값을 설정하는 함수.
					 */
					function getDragValue (type)	{
						dg[type].now += d3.event.dx;

						return dg[type].now = 
						Math.max(dg.start[type === 'end' ? 'now' : 'init'],
						Math.min(dg.end[type === 'end' ? 'init' : 'now'],
						dg[type === 'end' ? 'end' : 'start'].now)),
						dg[type].now;
					};

					if (data === 'start')	{
						d3.select(this).attr('x', getDragValue(data));

						dg.navi.now = dg.navi.init + (
						dg.start.now - dg.start.init);
						dg.navi.nowWidth = dg.navi.width - (
						dg.end.init - dg.end.now) - (
						dg.start.now - dg.start.init);

						main.attr('x', dg.navi.now)
								.attr('width', dg.navi.nowWidth);
					} else if (data === 'end') {
						d3.select(this).attr('x', getDragValue(data));

						dg.navi.nowWidth = dg.navi.width - (
						dg.start.now - dg.start.init) - (
						dg.end.init - dg.end.now);

						main.attr('width', dg.navi.nowWidth);
					}	else {
						dg.navi.now += d3.event.dx;

						var value = dg.navi.now = 
						Math.max(dg.navi.init, 
						Math.min((dg.navi.width + that.margin.left) - 
											dg.navi.nowWidth, dg.navi.now));

						dg.start.now = value - that.controls.width;
						dg.end.now = (value + dg.navi.nowWidth) - 
															that.controls.width;

						main.attr('x', value);
						start.attr('x', dg.start.now);
						end.attr('x', dg.end.now);
					}
				},
			},
		};
	};

	function graph ()	{
		return {
			margin: [20, 40, 80, 40],
			attr: {
				x: function (data, idx, that)	{
					var x = that.scaleX(data.x);

					return this.id.indexOf('base') > -1 ? 
								 that.margin.left : 
								 this.id.indexOf('text') > -1 ? x + 5 : 
								 x < that.margin.left ? that.margin.left : 
								 x > that.width - that.margin.right ? 
								 that.width - that.margin.right : x;
				},
				y: function (data, idx, that)	{
					var height = ((that.height - 10) - 
												(that.height - that.margin.bottom)) * 0.4

					return this.tagName !== 'text' ? 
								 that.height - that.margin.bottom : 
								 that.height - that.margin.bottom + height / 2;
				},
				width: function (data, idx, that)	{
					var x = that.scaleX(data.x),
							width = that.scaleX(data.x + data.width);

					if (x < that.margin.left)	{
						width -= (that.margin.left - x);

						if (width < 0)	{ return 0; }
					} else if (x + (width - x) > 
										that.width - that.margin.right) {
						width -= (x + width - x) - 
										 (that.width - that.margin.right);

						if (width - x < 0)	{ return 0; }
					}

					return this.id.indexOf('base') > -1 ? that.width - 
								 that.margin.left - that.margin.right : 
								 width - x;
				},
				height: function (data, idx, that)	{
					return ((that.height - 10) - 
									(that.height - that.margin.bottom)) * 0.4;
				},
				rx: function (data, idx, that)	{
					return this.id.indexOf('base') > -1 ? 1 : 3;
				}, 
				ry: function (data, idx, that)	{
					return this.id.indexOf('base') > -1 ? 1 : 3;
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return this.id.indexOf('base') > -1 ? '#DADFE1' : 
								 this.id.indexOf('text') > -1 ? '#FFFFFF' : 
								 data.color;
				},
			},
			on: {
				mouseover: function (data, idx, that)	{
					var tag = this.id.indexOf('base') > -1 ? null : 
										this.tagName === 'text' ? 
										this.previousSibling ? this.previousSibling : 
										this.nextSibling : this,
							rgba = bio.rendering().opacity(data.color, 0.5);

					if (tag)	{
						bio.tooltip({
							element: tag,
							contents: 
							'<b>' + data.info.identifier + 
							'</b></br>Desc: <b>' + data.info.description +
							'</b></br>Section: <b>' + data.x + ' - ' + 
								(data.x + data.width) + '</b>'
						});

						d3.select(tag).transition(10).style('fill', rgba);
					}	
				},
				mouseout: function (data, idx, that)	{
					var tag = this.id.indexOf('base') > -1 ? null : 
										this.tagName === 'text' ? 
										this.previousSibling ? this.previousSibling : 
										this.nextSibling : this;

					if (tag)	{
						bio.tooltip('hide');

						d3.select(tag).transition(10)
												 	.style('fill', data.color);
					}
				},
			},
			text: function (data, idx, that)	{
				var x = that.scaleX(data.x),
						width = that.scaleX(data.x + data.width);
				
				return bio.drawing().textOverflow(
							data.info.identifier, '10px', (width - x), 5);
			},
		};
	};
	/*
		Patient 표시 관련 설정 함수.
	 */
	function patient ()	{
		return {
			// To be modify.
			margin: [20, 40, 25, 40],
			attr: {
				points: function (data, idx, that)	{
					var x = that.scaleX(data.x);

					if (x < that.margin.left || 
							x > that.width - that.margin.right)	{
						x = that.width + that.margin.right;
					}

					return bio.rendering().triangleStr(
								x, that.scaleY(0) - that.margin.bottom, 
								10, 'top');
				},
			},
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'path' ? '#A8A8A8' : 
								 bio.boilerPlate
									  .variantInfo[data.info[0].type].color;
				},
				stroke: function (data, idx, that)	{
					return this.tagName === 'path' ? '#A8A8A8' : 'none';
				},
			},
		};
	};

	return function ()	{
		return {
			axis: axis,
			navi: navi,
			graph: graph,
			legend: legend,
			needle: needle,
			radius: radius,
			patient: patient,
		};
	};
};
function boilerPlate ()	{
	'use strict';

	var model = {};

	model.variantInfo = {
		// Mutation.
		'Amplification': { color: '#FFBDE0', order: 0},
		'Homozygous_deletion': { color: '#BDE0FF', order: 1},
		'Nonsense_mutation': { color: '#EA3B29', order: 2},
		'Splice_site': { color: '#800080', order: 3},
		'Translation_start_site': { color: '#AAA8AA', order: 4},
		'Missense_mutation': { color: '#3E87C2', order: 5},
		'Start_codon_snp': { color: '#3E87C2', order: 5 },
		'Nonstop_mutation': { color: '#070078', order: 6},
		'Frame_shift_indel': { color: '#F68D3B', order: 7},
		'Stop_codon_indel':{ color:  'F68D3B', order: 7},
		'In_frame_indel': { color: '#F2EE7E', order: 8},
		'Silent': { color: '#5CB755', order: 9},
		'Rna': { color: '#FFDF97', order: 10},
		'Intron': { color: '#A9A9A9', order: 11},
		'5\'utr': { color: '#A9A9A9', order: 11},
		'3\'utr': { color: '#A9A9A9', order: 11},
		'Igr': { color: '#A9A9A9', order: 11},
	};

	model.clinicalInfo = {
		// Group.
		// Vital Status of Group.
		'alive': { color: '#04CDA4', order: 1 },
		'dead': { color: '#C50E36', order: 2 },
		// Gender of Group.
		'female':{ color:  'E0A4E5', order: 1 },
		'male': { color: '#0F67B6', order: 2 },
		// Race of Group.
		'american indian or alaska native': { color: '#38120B', order: 1 },
		'asian': { color: '#CB771F', order: 2 },
		'black or african american': { color: '#302F24', order: 3 },
		'white': { color: '#9CB1CE', order: 4 },
		// Ethnicity of Group.
		'hispanic or latino': { color: '#B8642F', order: 1 },
		'not hispanic or latino': { color: '#55C53E', order: 2 },
		// Histological Type of Group.
		'lung acinar adenocarcinoma': { color: '#716190', order: 1 },
		'lung adenocarcinoma mixed subtype': { color: '#5154DE', order: 2 },
		'lung adenocarcinoma- not otherwise specified (nos)': { color: '#8E9A7E', order: 3 },
		'lung bronchioloalveolar carcinoma mucinous': { color: '#2F91DE', order: 4 },
		'lung bronchioloalveolar carcinoma nonmucinous': { color: '#ED6EBD', order: 5 },
		'lung clear cell adenocarcinoma': { color: '#1C8D7A', order: 6 },
		'lung micropapillary adenocarcinoma': { color: '#B2EE86', order: 7 },
		'lung mucinous adenocarcinoma': { color: '#785E54', order: 8 },
		'lung papillary adenocarcinoma': { color: '#69B4C4', order: 9 },
		'lung signet ring adenocarcinoma': { color: '#C1386E', order: 10 },
		'lung solid pattern predominant adenocarcinoma': { color: '#D7A355', order: 11 },
		'mucinous (colloid) carcinoma': { color: '#243833', order: 12 },
		// Anatomic Neoplasm Subdivision of Group.
		'bronchial': { color: '#F9E3B9', order: 1 },
		'l-lower': { color: '#FBA2A3', order: 2 },
		'l-upper': { color: '#0CA3C7', order: 3 },
		'other (please specify)': { color: '#D3A16C', order: 4 },
		'r-lower': { color: '#388A4E', order: 5 },
		'r-middle': { color: '#D61E43', order: 6 },
		'r-upper': { color: '#B81BCC', order: 7 },
		// Other Dx of Group.
		'no': { color: '#D73A64', order: 1 },
		'yes': { color: '#1990AA', order: 2 },
		'yes, history of prior malignancy': { color: '#3BDB11', order: 3 },
		'yes, history of synchronous/bilateral malignancy': { color: '#803F11', order: 4 },
		// History of Neoadjuvant Treatment of Group.
		'no': { color: '#D73A64', order: 1 },
		'yes': { color: '#1990AA', order: 2 },
		// Radiation Therapy of Group.
		'no': { color: '#D73A64', order: 1 },
		'yes': { color: '#1990AA', order: 2 },
		// Pathologic T of Group.
		't1': { color: '#060CDB', order: 1 },
		't1a': { color: '#696DE9', order: 2 },
		't1b': { color: '#CDCEF7', order: 3 },
		't2': { color: '#F6251D', order: 4 },
		't2a': { color: '#F96D69', order: 5 },
		't2b': { color: '#FDCECD', order: 6 },
		't3': { color: '#1AEB42', order: 7 },
		't4': { color: '#EBBD34', order: 8 },
		'tx': { color: '#9943DE', order: 9 },
		// Pathologic N of Group.
		'n0': { color: '#DC5B35', order: 1 },
		'n1': { color: '#217C1F', order: 2 },
		'n2': { color: '#18A6F3', order: 3 },
		'n3': { color: '#EA68C3', order: 4 },
		'nx': { color: '#F4E831', order: 5 },
		// Pathologic M of Group.
		'm0': { color: '#F0820D', order: 1 },
		'm1': { color: '#C45A43', order: 2 },
		'm1a': { color: '#A523C2', order: 3 },
		'm1b': { color: '#C97BDA', order: 4 },
		'mx': { color: '#EDD3F2', order: 5 },
		// Pathologic Stage of Group.
		'stage i': { color: '#01C606', order: 1 },
		'stage ia': { color: '#018404', order: 2 },
		'stage ib': { color: '#002C01', order: 3 },
		'stage ii': { color: '#0E22C3', order: 4 },
		'stage iia': { color: '#08136C', order: 5 },
		'stage iib': { color: '#040B41', order: 6 },
		'stage iiia': { color: '#BB0C2E', order: 7 },
		'stage iiib': { color: '#75081D', order: 8 },
		'stage iv': { color: '#F0CA53', order: 9 },
		// Residual Tumor of Group.
		'r0': { color: '#DB8EC0', order: 1 },
		'r1': { color: '#FFD046', order: 2 },
		'r2': { color: '#495C50', order: 3 },
		'rx': { color: '#0E5F8A', order: 4 },
		// EGFR Mutation Result.
		'exon 19 deletion': { color: '#4A312A', order: 1 },
		'l858r': { color: '#74C04C', order: 2 },
		'l861q': { color: '#FBED09', order: 3 },
		'other': { color: '#C91DAB', order: 4 },
		't790m': { color: '#2C517B', order: 5 },
		// KRAS Mutation Result.
		'g12a': { color: '#DED0D1', order: 1 },
		'g12c': { color: '#AE8A8E', order: 2 },
		'g12d': { color: '#5D161D', order: 3 },
		'g12s': { color: '#410F14', order: 4 },
		'g12v': { color: '#25080B', order: 5 },
		'other': { color: '#C91DAB', order: 6 },
		// Primary Therapy Outcome Success.
		'complete remission/response': { color: '#BDED73', order: 1 },
		'partial remission/response': { color: '#8649F3', order: 2 },
		'progressive disease': { color: '#C1746B', order: 3 },
		'stable disease': { color: '#CD4C2A', order: 4 },
		// Followup Treatment Success.
		'complete remission/response': { color: '#BDED73', order: 1 },
		'partial remission/response': { color: '#8649F3', order: 2 },
		'progressive disease': { color: '#C1746B', order: 3 },
		'stable disease': { color: '#CD4C2A', order: 4 },
		// Tobacco Smoking History.
		'Lifelong Non-Smoker': { color: '#C4B5BB', order: 1 },
		'Current Smoker': { color: '#896C78', order: 2 },
		'Current Reformed Smoker for > 15 yrs': { color: '#3B0A1E', order: 3 },
		'Current Reformed Smoker for < or = 15 yrs': { color: '#2F0818', order: 4 },
		'Current Reformed Smoker, Duration Not Specified': { color: '#17040C', order: 5 },
		'NA': { color: '#D6E2E3', order: 6 },
	};

	model.exclusivityInfo = {
		'Amplification': '#FFBDE0',
		'Deletion': '#BDE0FF',
		'Mutation': '#5CB755',
		'None': '#D3D3D3',
	};
	
	return model;
};
function layout ()	{
	'use strict';

	var model = {
		svg: {
			pathway: {},
			variants: {},
			landscape: {},
			expression: {},
			exclusivity: {},
		},
	};
	/*
		ID 목록에 포함된 (Except 파라미터를 제외한) svg 엘리먼트를 만든다.
	 */
	function create (expt, chart, ids)	{
		if (!ids)	return;

		bio.iteration.loop(ids, function (id)	{
			var isId = true;

			bio.iteration.loop(expt, function (e)	{
				if (id.indexOf(e) > -1)	{
					isId = !isId;
				}
			});

			if (isId)	{
				model.svg[chart][id] = bio.rendering().createSVG(id);
			}
		});

		return model.svg[chart];
	};
	// 배열의 원소에 해당하는 DIV 태그를 제외한 나머지 태그에 svg 를 생성한다.
	model.landscape = function (ids)	{
		return create(['option', 'title'], 'landscape', ids);
	};
	
	model.variants = function (ids)	{
		return create(['title'], 'variants', ids);
	};
	
	model.expression = function (ids)	{
		return create(
			['title', 'function', 'color_mapping', 'signature'], 
			'expression', ids);
	};
	
	model.exclusivity = function (ids)	{
		return create(
			['title', 'geneset', 'survival', 'empty'], 
			'exclusivity', ids);
	};

	model.pathway = function (ids)	{
		return create(['title'], 'pathway', ids);
	};
	/*
		SVG 관련 에러 핸들러.
	 */
	function getSVGError (args)	{
		args = Array.prototype.slice.call(args);

		var typeArr = args.map(function (a)	{
			return bio.objects.getType(a);
		});

		if (typeArr.indexOf('Object') < 0)	{
			throw new Error('Not found svg set');
		} else if (typeArr.indexOf('Function') < 0)	{
			throw new Error('Not found callback');
		}
	};
	/*
		SVG 파라미터에서 id 목록과 맞는 svg 만 반환해주는 함수.
	 */
	model.get = function (svgs, ids, callback)	{
		getSVGError(arguments);

		ids = bio.objects.getType(ids) === 'Array' ? 
		ids : [ids];

		bio.iteration.loop(svgs, function (id, value)	{
			bio.iteration.loop(ids, function (i)	{
				if (id.indexOf(i) > -1)	{
					return callback(id, value);
				}
			});
		});
	};
	/*
		Specific 된 svg 가 없을 경우,
		'g-tag' 클래스를 가진 g tag 를 모두 지워주는 함수.
	 */
	model.removeGroupTag = function (classify)	{
		if (classify)	{
			classify = bio.objects.getType(classify) === 'Array' ? 
			classify : [classify];

			bio.iteration.loop(classify, function (d)	{
				d3.selectAll((d.indexOf('.') > -1 ? d : '.' + d))
					.remove();
			});
		} else {
			d3.selectAll('svg g').remove();
		}
	};

	return function ()	{
		return model;
	};
};
function setting ()	{
	'use strict';

	var model = null;	
	/*
		ID 또는 ClassName 으로 된 노드를 찾아
		DOM 객체로 반환해주는 함수.
	 */
	function setTargetedElement (element)	{
		return model.dom = bio.dom().get(element), model.dom;
	};
	/*
		파라미터에 width, height 값이 있으면 그 값을 
		없는 경우 전달 된 Dom 의 가로, 세로 길이를 반환하는 함수.
	 */
	function setTargetedElementSize (opts)	{
		model.size.width = opts.width || 
		parseFloat(model.dom.style.width),
		model.size.height = opts.height || 
		parseFloat(model.dom.style.height)

		return { 
			width: model.size.width, 
			height: model.size.height,
		};
	};
	/*
		Layout 의 ID 목록 데이터를 만들어주는 함수.
		여기서 각각의 Layout 의 크기도 설정해준다.
	 */
	function setLayoutIdData (chart, element, width, height, add)	{
		model.ids = 
		bio.sizing.chart[chart](element, width, height, add);

		return model.ids;
	};
	/*
		구성된 Layout 에 svg 엘리먼트를 만들어준다.
	 */
	function setSVGElement (chart, ids)	{
		return bio.layout()[chart](ids);
	};

	return function (chart, opts)	{
		model = bio.initialize('setting');

		var groupLayout = null;

		if (opts.data.data && opts.data.data.name)	{
			groupLayout = opts.data.data.group_list;
		}

		return {
			defaultData: opts.data,
			targetedElement: setTargetedElement(opts.element),
			targetedElementSize: setTargetedElementSize(opts),
			preprocessData: bio.preprocess(chart)(opts.data),
			layoutIds: setLayoutIdData(
									chart,
									model.dom, 
									model.size.width, 
									model.size.height, groupLayout),
			svgs: setSVGElement(chart, model.ids),
		};
	};
};
function sizing ()	{
	'use strict';

	var model = { chart: {}, ids: [] };
	/*
		Tooltip Tag 를 만드는 함수.
	 */
	function makeTooltipNode ()	{
		if (document.getElementById('biochart_tooltip'))	{		
			document.body.removeChild(
			document.getElementById('biochart_tooltip'));
		}
		
		var div = document.createElement('div');

		div.id = 'biochart_tooltip';
		div.className = 'biochart-tooltip';

		document.body.appendChild(div);
	};
	/*
		Chart 별 알맞는 layout 을 구성해주는 함수.
	 */
	function makeLayout (ids)	{
		// 초기 화면 구성 시 Tooltip 도 추가해준다.
		makeTooltipNode();

		bio.iteration.loop.call(this, ids, function (id, size) {
			var div = document.createElement('div');
					div.id = id;
					div.style.width = size.width + 'px';
					div.style.height = size.height + 'px';
			// 각 layout 에 구성된 div 태그들의 id 값들을 리스트에 넣어준다.
			model.ids.push(id);	

			this.appendChild(div);
		});
	};
	/*
		Sizing 객체의 model 객체를 초기화하고 (나중에 ajax 재 요청시,
		svg 가 사라지지 않는 문제를 해결하기 위해) 
		전체 element 의 가로, 세로 크기를 설정한다.
	 */
	function setSize (ele, width, height)	{
		model = bio.initialize('sizing');

		ele.style.width = width + 'px';
		ele.style.height = height + 'px';

		return ele;
	};
	/*
		배열로 전달 받은 margin 값을 객체 형태의 margin
		값으로 변환하여 반환해주는 함수.
	 */
	model.setMargin = function (margin)	{
		if (!margin.length && 
				typeof(margin) === 'string')	{
			return { 
				top: margin, left: margin, 
				bottom: margin, right: margin 
			};
		} else if (bio.objects.getType(margin) === 
							'Object')	{
			return margin;
		} else {
			var len = margin.length;
			// Margin 리스트의 개수에 따라 알맞은 객체를 생성한다.
			return {
				top: margin[0],
				left: len > 1 ? margin[1] : margin[0],
				bottom: len > 2 ? margin[2] : margin[0],
				right: len === 1 ? margin[0] : 
							 len > 3 ? margin[3] : margin[1],
			};
		}
	};
	/*
		Title 과 Contents 부분으로 나눈다.
	 */
	function makeDivide (type, ele, w, h, tr)	{
		var title = document.createElement('div'),
				contents = document.createElement('div');

		title.id = type + '_title';
		contents.id = type + '_contents';

		title.style.width = w + 'px';
		title.style.height = h * tr + 'px';

		contents.style.width = w + 'px';
		contents.style.height = h * (100 - tr) + 'px';

		ele.appendChild(title);
		ele.appendChild(contents);

		return { title: title, contents: contents };
	};
	/*
		landscape 의 그룹 레이아웃을 만들어준다.
	 */
	function landGroupLayout (groups, id, width, height, type)	{
		var h = height * 0.16 / groups.length,
				prefixes = {
					patient: { w: width * 0.01, h: h },
					axis: { w: width * 0.14, h: h },
					group: { w: width * 0.65, h: h },
				};

		bio.iteration.loop(groups, function (group)	{
			var name = group.name.removeWhiteSpace(),
					prefix = prefixes[type] === 'group' ? '' : type;

			id['landscape_' + prefix + '_group_' + name] = 
				{ 
					width: prefixes[type].w.toFixed(1), 
					height: prefixes[type].h.toFixed(1), 
				};
		});

		return id;
	};
	// Chart 별 영역의 크기 설정 및 ID List 생성.
	model.chart.landscape = function (ele, w, h, group)	{
		var id = {
			landscape_temp_sample: { width: w * 0.1, height: h * 0.15 },
			landscape_axis_sample: { width: w * 0.14, height: h * 0.15 },
			landscape_patient_sample: { width: w * 0.01, height: h * 0.15 },
			landscape_sample: { width: w * 0.65, height: h * 0.15 },
			landscape_scale_option: { width: w * 0.1, height: h * 0.15 },
			landscape_temp_group: { width: w * 0.1, height: h * 0.16 },
			landscape_axis_group: { width: w * 0.14, height: h * 0.15 },
			landscape_patient_group: { width: w * 0.01, height: h * 0.16 },
			landscape_group: { width: w * 0.65, height: h * 0.16 },
			landscape_option: { width: w * 0.1, height: h * 0.16 },
			landscape_legend: { width: w * 0.1, height: h * 0.64},
			landscape_gene: { width: w * 0.14, height: h * 0.64 },
			landscape_patient_heatmap: { width: w * 0.01, height: h * 0.64 },
			landscape_heatmap: { width: w * 0.65, height: h * 0.64 },
			landscape_pq: { width: w * 0.1, height: h * 0.64 },
		};

		var divs = makeDivide('landscape', ele, w, h, 0.05);

		var ga = landGroupLayout(group, {}, w, h, 'axis'),
				gc = landGroupLayout(group, {}, w, h, 'group'),
				gp = landGroupLayout(group, {}, w, h, 'patient');

		makeLayout.call(setSize(divs.contents, w, h * 0.95), id);
		makeLayout.call(bio.dom().get('#landscape_group'), gc);
		makeLayout.call(bio.dom().get('#landscape_axis_group'), ga);
		makeLayout.call(bio.dom().get('#landscape_patient_group'), gp);

		return model.ids;
	};
	
	model.chart.variants = function (ele, w, h)	{
		var id = {
			variants_needle: {width: w * 0.825, height: h * 0.825},
			variants_legend: {width: w * 0.175, height: h * 0.5},
			variants_patient_legend: {width: w * 0.175, height: h * 0.425},
			variants_navi: {width: w * 0.825, height: h * 0.1},
		};

		var divs = makeDivide('variants', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};

	model.chart.expression = function (ele, w, h)	{
		var id = {
			expression_survival: {width: w * 0.4, height: h * 0.925},
			expression_bar_plot: {width: w * 0.4, height: h * 0.32},
			expression_function: {width: w * 0.2, height: h * 0.05},
			expression_color_mapping: {width: w * 0.2, height: h * 0.05},
			expression_bar_legend: {width: w * 0.2, height: h * 0.35},
			expression_division: {width: w * 0.4, height: h * 0.04},
			expression_scatter_plot: {width: w * 0.4, height: h * 0.3},
			expression_scatter_empty: {width: w * 0.2, height: h * 0.08},
			expression_scatter_legend: {width: w * 0.2, height: h * 0.2},
			expression_heatmap: {width: w * 0.4, height: h * 0.25},
			expression_signature: {width: w * 0.2, height: h * 0.05},
			expression_color_gradient: {width: w * 0.194, height: h * 0.075},
		};

		var divs = makeDivide('expression', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};
	
	model.chart.exclusivity = function (ele, w, h)	{
		var id =  {
			exclusivity_select_geneset: {width: w * 0.59, height: h * 0.12},
			exclusivity_survival: {width: w * 0.4, height: h * 0.925},
			exclusivity_network: {width: w * 0.25, height: h * 0.65},
			exclusivity_heatmap: {width: w * 0.35, height: h * 0.45},
			exclusivity_legend: {width: w * 0.35, height: h * 0.05},
			exclusivity_sample_legend: {width: w * 0.35, height: h * 0.05},
		};

		var divs = makeDivide('exclusivity', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};

	model.chart.pathway = function (ele, w, h)	{
		var id =  {};
		var divs = makeDivide('pathway', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};
	/*
		각 chart 별 기본 설정 반환함수.
	 */
	model.chart.default = function (that, opts)	{
		that.id = opts.element.attr('id');
		that.margin = opts.margin ? 
									bio.sizing.setMargin(opts.margin) : null;
		that.width = parseFloat(opts.element.attr('width'));
		that.height = parseFloat(opts.element.attr('height'));
		that.element = bio.objects.getType(opts.element) === 'Object' || 
									 bio.objects.getType(opts.element) === 'Array' ? 
									 opts.element : (/\W/).test(opts.element[0]) ? 
									 d3.select(opts.element) : 
									 d3.select('#' + opts.element);

		return that;
	};

	return model;
};
function axises ()	{
	'use strict';

	var model = {
		axises: {},
	};
	/*
		D3 v3 과 v4 에서 axis 코드 차이가 있으므로 아래 함수에서
		구분지어 줬다.
	 */
	model.byD3v = function (scale, orient, opts)	{
		var axis = (bio.dependencies.version.d3v4() ? 
							 d3['axis' + orient.pronoun()](scale) : 
							 d3.svg.axis().scale(scale).orient(orient)).ticks(5);
		// TickValues 가 존재할 경우 적용.
		if (opts && opts.tickValues)	{
			axis.tickValues(opts.tickValues);
		} else if (opts && opts.ticks)	{
			axis.ticks(opts.ticks);
		}

		return axis;
	};
	/*
		초기 세팅 함수.
	 */
	function setting (type, opts)	{
		var position = [opts.top || 0, opts.left || 0],
				group = bio.rendering().addGroup(
				opts.element, position[0], position[1], type + '-axis');

		return {
			group: group,
			position: position,
			margin: bio.sizing.setMargin(opts.margin),
			scale: bio.scales().get(opts.domain, opts.range),
		};
	};
	/*
		Path, Line, Text 중 제외시킬 부분을 받아
		Axis 에서 제외한다.
	 */
	function exclude (group, item)	{
		if (typeof(item) !== 'string')	{
			throw new Error ('2nd Parameter type is not a string');
		} else if (!item)	{
			return group;
		}

		return group.selectAll(item).remove(), group; 
	};
	/*
		최종 반환 함수.
	 */
	function returnGroup (setting, opts, direction)	{
		var set = model.byD3v(setting.scale, direction, opts);

		if (opts.tickValues)	{

		}

		return opts.exclude ? 
			exclude(setting.group.call(set), opts.exclude) : 
			 				setting.group.call(set);
	};
	/*
		Data structure: {
			element: 'SVG Element',
			top: 'Top of axis',
			left: 'Left of axis',
			domain: 'Axis's domain data',
			range: 'Axis's range data',
			margin: 'Margin for axis',
			exclude: 'Path, Line, Text' or '', ...,
		}
	 */
	model.top = function (opts)	{
		return returnGroup(setting('top', opts), opts, 'top');
	};

	model.left = function (opts)	{
		return returnGroup(setting('left', opts), opts, 'left');
	};

	model.bottom = function (opts)	{
		return returnGroup(setting('bottom', opts), opts, 'bottom');
	};

	model.right = function (opts)	{
		return returnGroup(setting('right', opts), opts, 'right');
	};

	return function ()	{
		return model;
	};
};
function bar ()	{
	'use strict';

	var model = {};
	/*
		Range 값을 구해주는 함수.
	 */
	function range (size, m1, m2, start)	{
		return start === 'left' || start === 'top' ? 
					[m1, size - m2]: [size - m2, m1];
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.startTo = opts.startTo || ['top', 'left'];
		model.rangeX = range(model.width, model.margin.left, 
												 model.margin.right, model.startTo[1]);
		model.rangeY = range(model.height, model.margin.top, 
												 model.margin.bottom, model.startTo[0]);
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'bar');

		model.opts = bio.objects.clone(opts);
		model.opts.id = model.id + '_bar_rect';
		model.opts.element = 
		model.group.selectAll('#' + model.id + '_bar_rect')

		bio.rectangle(model.opts, model);
	};
};
function circle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().circle({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d, i) { 
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_circle';
				},
				cx: function (d, i)	{
					return opts.attr.cx ? 
					typeof(opts.attr.cx) !== 'function' ?  
								 opts.attr.cx : 
								 opts.attr.cx.call(this, d, i, that) : 0;
				},
				cy: function (d, i)	{
					return opts.attr.cy ? 
					typeof(opts.attr.cy) !== 'function' ?  
								 opts.attr.cy : 
								 opts.attr.cy.call(this, d, i, that) : 0;
				},
				r: function (d, i)	{
					return opts.attr.r ? 
					typeof(opts.attr.r) !== 'function' ?  
								 opts.attr.r : 
								 opts.attr.r.call(this, d, i, that) : 0;
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#000000'; 
				},
				'fill-opacity': function (d, i)	{
					return opts.style.fillOpacity ? 
					typeof(opts.style.fillOpacity) !== 'function' ?  
								 opts.style.fillOpacity : 
								 opts.style.fillOpacity.call(
								 	this, d, i, that) : 1; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '0px'; 
				},
				'filter': function (d, i)	{
					return opts.style.filter ?
					typeof(opts.style.filter) !== 'function' ?  
								 opts.style.filter : 
								 opts.style.filter.call(
								 	this, d, i, that) : false; 
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
			},
			on: !opts.on ? null : {
				click: function (d, i)	{
					opts.on.click ? 
					opts.on.click.call(this, d, i, that) : false;
				},
				mouseover: function (d, i)	{
					opts.on.mouseover ? 
					opts.on.mouseover.call(this, d, i, that) : false;
				},
				mouseout: function (d, i)	{
					opts.on.mouseout ? 
					opts.on.mouseout.call(this, d, i, that) : false;
				},
			},
		});
	};
};
function divisionLine ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.position = { now: {}, init: {} };
		model.isMarker = typeof(opts.isMarker) === 'undefined' ? true : opts.isMarker;
		opts.pathElement = 
		bio.objects.getType(opts.pathElement) !== 'Array' ? 
		[opts.pathElement] : opts.pathElement;
		model.division_data = opts.data;
		model.division_info = opts.info || [
			{ 
				additional: 0, color: '#000000', direction: null, 
				text: 'Low', textWidth: 10,
			},
			{ 
				additional: 0, color: '#FFFFFF', direction: null, 
				text: 'High', textWidth: 10,
			}
		];

		bio.iteration.loop(model.division_info, function (di)	{
			di.textWidth = bio.drawing().textSize.width(
			di.text.replace(' ', 'a'), opts.style.fontSize || '10px');
		});

		model.axis = [].concat(opts.axis);
		model.range = [model.margin.left, model.width - 
										model.margin.right];
		model.scale = bio.scales().get(model.axis, model.range);
		model.invert = bio.scales().invert(model.scale);

		if (that.data.bar)	{
			bio.iteration.loop(that.data.bar, function (bar)	{
				if (bar.value === opts.idxes[0])	{
					model.division_info[0].start = model.scale(bar.x);
				} else if (bar.value === opts.idxes[1])	{	
					model.division_info[0].end = model.scale(bar.x);
					model.division_info[1].start = model.scale(bar.x);
				} else if (bar.value === opts.idxes[2])	{
					model.division_info[1].end = model.scale(bar.x);
				}
			});
		} else if (model.now.geneset)	{
			model.division_info[0].start = model.scale(model.axis[0]);
			model.division_info[0].end = model.scale(opts.idxes);
			model.division_info[1].start = model.scale(opts.idxes);
			model.division_info[1].end = 
			model.scale(model.axis.length - 1);
		}

		model.shapeGroup = bio.rendering().addGroup(
												opts.element, 0, 0, 'division-shape');
		model.textGroup = bio.rendering().addGroup(
												opts.element, 0, 0, 'division-text');
		model.opts = {
			text: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.text.id = model.id + '_division_text';
		model.opts.text.data = model.division_info;
		model.opts.text.element = 
		model.textGroup.selectAll(
			'#' + model.id + '_division_text');
		model.opts.shape.id = model.id + '_division_shape';
		model.opts.shape.data = model.division_info;
		model.opts.shape.element = 
		model.shapeGroup.selectAll(
			'#' + model.id + '_division_shape');

		bio.text(model.opts.text, model);
		bio.rectangle(model.opts.shape, model);

		bio.iteration.loop(opts.pathElement, function (path, i)	{
			var shape_key = 'shape_' + i,
					path_key = 'path_' + i,
					cp1 = bio.objects.clone(model.division_info[i]),
					cp2 = bio.objects.clone(model.division_info[i]),
					markers = [cp1, cp2];

			cp1.path_x = model.division_info[0].end;
			cp2.path_x = model.division_info[0].end;
			cp1.path_y = i === 0 ? 10 : 0;
			cp2.path_y = i === 0 ? 
			path.attr('height') : path.attr('height') - 18;

			model.opts[path_key] = bio.objects.clone(opts);
			model.opts[path_key].id = 
			model.id + '_division_path_' + i;
			model.opts[path_key].data = markers;
			model.opts[path_key].element = 
			bio.rendering().addGroup(path, 0, 0, 'division-path-' + i);

			model.opts[shape_key] = bio.objects.clone(opts);
			model.opts[shape_key].id = 
			model.id + '_division_shape_' + i;
			model.opts[shape_key].data = [markers[i]];
			model.opts[shape_key].element = 
			bio.rendering().addGroup(path, 0, 0, 'division-shape-' + i)
				 .selectAll('#' + model.id + '_division_shape_' + i);
			if (model.isMarker)	{
				bio.triangle({
					element: model.opts[shape_key].element,
					data: model.opts[shape_key].data,
					attr: model.opts[shape_key].attr,
					style: model.opts[shape_key].style,
					call: model.opts[shape_key].call,
				}, model);
			}

			bio.path({
				element: model.opts[path_key].element,
				data: model.opts[path_key].data,
				attr: model.opts[path_key].attr,
				style: {
					stroke: '#333333',
					strokeWidth: '0.5px',
				},
			}, model);
		});
	};
};
function drawing ()	{
	'use strict';

	var model = { textSize: {} };
	/*
		Text 가로 길이 구하는 함수.
	 */
	function textWidth (text)	{
		return text.getBoundingClientRect().width.toFixed();
	};
	/*
		Text 세로 길이 구하는 함수.
	 */
	function textHeight (text, block)	{
		// var result = {};

  //   block.style.verticalAlign = 'baseline';
  //   result.ascent = block.offsetTop - text.offsetTop;
  //   block.style.verticalAlign = 'bottom';
  //   result.height = block.offsetTop - text.offsetTop;
  //   result.descent = result.height - result.ascent;

    return text.getBoundingClientRect().height.toFixed();
    // return block.offsetTop - text.offsetTop - 2;
	  // return result.height - 2;
	};
	/*
		Text 의 가로, 세로 길이를 구해주는 중립 함수.
	 */
	function getTextSize (type, txt, font)	{
		var text = document.createElement('span'),
				block = document.createElement('div'),
				div = document.createElement('div');

		if (type === 'width') {
			font = font.split(' ');
		} else {
			txt = txt.split(' ');
		}

		div.id = 'get_text_' + type;

		text.style.fontSize = type === 'width' ? font[0] : txt[0];
		text.style.fontWeight = type === 'width' ? font[1] : txt[1];
		text.innerHTML = type === 'width' ? txt : 'Hg';

		block.style.display = 'inline-block';
		block.style.width = '1px';
		block.style.height = '0px';

		div.appendChild(text);
		div.appendChild(block);

		document.body.appendChild(div);

		try {
			var result = text.getBoundingClientRect()[type].toFixed();
			// var result = type === 'width' ? 
			// 		textWidth(text) : textHeight(text, block);
		} finally {
			document.body.removeChild(
    		document.getElementById('get_text_' + type));
		}

    return parseFloat(result);
	};
	/*
		문자열의 가로 길이를 반환하는 함수.
	 */
	model.textSize.width = function (txt, font)	{
		return getTextSize('width', txt, font);
	};
	/*
		Text 배열에서 가장 길이가 긴 문자열과 그 길이를 반환한다.
	 */
	model.mostWidth = function (txts, font)	{
		var result = [];

		bio.iteration.loop(txts, function (txt)	{
			result.push({
				text: txt,
				value: model.textSize.width(txt, font)
			});
		});

		// 내림차순 정렬 후 가장 큰 값 (0번째 값) 을 반환한다.
		return result.sort(function (a, b)	{
			return a.value < b.value ? 1 : -1;
		})[0];
	};
	/*
		문자열의 세로 길이를 반환하는 함수.
	 */
	model.textSize.height = function (font)	{
		return getTextSize('height', font);
	};
	/*
		전달 된 가로, 세로길이에 맞춰 font 의 크기를 정해주는 함수.
	 */
	model.fitText = function (txt, width, height, font)	{
		var num = 10,	// default 10px.
				fontStr =  num + 'px ' + (font || 'normal'); 

		while (model.textSize.height(fontStr) < height && 
					model.textSize.width(txt, fontStr) < width)	{
		
			fontStr = (num += 1, num) + 'px ' + font;
		}

		return (num - 1) + 'px';
	};
	/*
		영역안에서 문자열이 넘어갈 경우 그 부분을 제거 해준다.
	 */
	model.textOverflow = function (txt, font, width, padding)	{
		var result = '';
		
		padding = padding || 5;

		if (model.textSize.width(txt, font) < width - padding)	{
			return txt;
		}

		bio.iteration.loop(txt.split(''), function (t)	{
			var txtWidth = model.textSize.width(result += t, font);

			if (txtWidth > width - padding)	{
				result = result.substring(0, result.length - 2);

				return;
			}
		});

		return result;
	};
	/*
		현재 노드의 SVG 엘리먼트를 가져온다.
	 */
	model.getParentSVG = function (node)	{
		if (node.parentElement.tagName === 'svg')	{
			return node.parentElement;
		} 

		return model.getParentSVG(node.parentElement);
	};
	/*
		Legend 그룹의 자식노드들을 반환한다.
	 */
	model.nthChild = function (classify, idx)	{
		return d3.select(classify).node().children[idx];
	};
	/*
		Source 엘리먼트에서 destination 엘리먼트를 찾는 함수.
	 */
	model.findDom = function (source, destination)	{
		if (source.children < 1)	{
			throw new Error('There are no any child elements');
		}

		var sourceList = Array.prototype.slice.call(source.children),
				result = null;

		bio.iteration.loop(sourceList, function (child)	{
			if (child.tagName === destination.toUpperCase() || 
		'.' + child.className === destination || 
		'#' + child.id === destination)	{
				result = child;

				return;
			} 
		});

		return result;
	};
	/*
		Slide down 애니메이션 구현 함수.
	 */
	model.slideDown = function (target)	{
		var init = target.style.height ? 
				parseFloat(target.style.height) : 
				target.getBoundingClientRect().height,
				height = 0;

		target.style.height = 0 + 'px';

		var interval = setInterval(function ()	{
			height += 1;
			target.style.height = height + 'px';

			if (height === init)	{
				clearInterval(interval);
			}
		}, 5);
	};

	/*
		Slide down 애니메이션 구현 함수.
	 */
	model.slideUp = function (target)	{
		var init = target.style.height ? 
				parseFloat(target.style.height) : 
				target.getBoundingClientRect().height,
				height = parseFloat(target.style.height);

		var interval = setInterval(function ()	{
			height -= 1;
			target.style.height = height + 'px';

			if (height === 0)	{
				clearInterval(interval);

				target.style.height = init + 'px'
				target.style.display = 'none';
			}
		}, 5);
	};
	/*
		Client 에 존재하는 또는 서버에 있는 SVG 파일을 읽어와
		Callback 또는 SVG 를 반환하는 함수.
	 */
	model.importSVG = function (url, callback)	{
		var result = null;

		d3.xml(url).mimeType('image/svg+xml')
			.get(function (err, xml)	{
				if (err) throw err;

				return callback ? callback(xml) : result = xml;		
			});

		return result;
	};

	model.nodes = function (selection)	{
		var result = [];

		selection.each(function (d)	{
			result.push(this)
		});

		return result;
	}

	return function ()	{
		return model;
	};
};
function heat ()	{
	'use strict';

	var model = {};
	/*
		중복 처리 된 데이터들을 다시 재 가공 시켜주는 함수.
	 */
	function makeNoneDuplicateData (values)	{
		bio.iteration.loop(values, function (key, value)	{
			bio.iteration.loop(model.mutationType, function (m)	{
				if (value[m][0])	{
					model.duplicate.push({
						x: value.x,
						y: value.y,
						value: value[m][0],
						info: value[m].splice(1),
					});
				}
			});
		});

		return model.duplicate;
	};
	/*
		같은 위치에서 중복된 데이터가 여러개일 경우
		가장 우선순위가 높은 것을 제외하고는 객체로 만들어 저장한다.
	 */
	function removeDuplicate (data)	{
		bio.iteration.loop(data, function (d)	{
			var key = d.x + d.y,
					prio = bio.landscapeConfig().byCase(d.value);

			model.value[key] ? 
			bio.boilerPlate.variantInfo[model.value[key][prio][0]] > 
			bio.boilerPlate.variantInfo[d.value] ? 
			model.value[key][prio].unshift(d.value) : 
			model.value[key][prio].push(d.value) : 
		 (model.value[key] = { cnv: [], var: [], x: d.x, y: d.y }, 
		 	model.value[key][prio].push(d.value));
		});

		return makeNoneDuplicateData(model.value);
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		
		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.margin.top, 
			model.height - model.margin.bottom];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'heatmap');

		model.opts = bio.objects.clone(opts);
		model.opts.data = model.duplicate ? 
			removeDuplicate(model.opts.data) : model.opts.data;
		model.opts.id = model.id + '_heatmap_rect';
		model.opts.element = 
		model.group.selectAll('#' + model.id + '_heatmap_rect');

		bio.rectangle(model.opts, model);
	};
};
function legend ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.legendData = opts.data;

		model.padding = opts.padding || 5;
		model.fontSize = opts.style.font || '10px';
		model.fontWidth = bio.drawing().mostWidth(
												model.legendData, model.fontSize);
		model.fontHeight = bio.drawing()
				 .textSize.height(model.fontSize);
		model.shapeWidth = model.width - 
	 (model.margin.left + model.margin.right + 
	 	model.fontWidth.value);

		model.shapeGroup = bio.rendering().addGroup(
												opts.element, model.margin.top, 
												model.margin.left, 'legend-shape');
		model.textGroup = bio.rendering().addGroup(
												opts.element, model.margin.top, 
												model.margin.left, 'legend-text');

		model.opts = {
			text: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.text.id = model.id + '_legend_text';
		model.opts.text.element = 
		model.textGroup.selectAll('#' + model.id + '_legend_text');
		model.opts.shape.id = model.id + '_legend_shape';
		model.opts.shape.element = 
		model.shapeGroup.selectAll('#' + model.id + '_legend_shape');

		if (opts.attr && opts.attr.width)	{
			bio.rectangle(model.opts.shape, model);
		} else if (opts.attr && opts.attr.r)	{
			bio.circle(model.opts.shape, model);
		} else if (opts.attr && opts.attr.points)	{
			bio.triangle(model.opts.shape, model);
		}

		bio.text(model.opts.text, model);

		var div = opts.element.node().parentNode,
				bcr = model.textGroup.node().getBoundingClientRect();
		// Legend div 를 type 수에 맞는 세로 길이로 재 설정한다.
		div.style.height = bcr.height + 
		model.margin.top + model.padding + 'px';
		// 왼쪽에 바짝 붙은 div 를 조금 떨어뜨리기 위한 코드.
		div.style.width = model.width - 5 + 'px';
	};
};
function needle ()	{
	'use strict';

	var model = {};
	/*
		Range 값을 구해주는 함수.
	 */
	function range (size, m1, m2, start)	{
		return start === 'left' || start === 'top' ? 
					[m1, size - m2] : [size - m2, m1];
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.height - model.margin.bottom, 
										model.margin.top];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.lineGroup = bio.rendering().addGroup(
										opts.element, 0, 0, 'needle-line');
		model.shapeGroup = bio.rendering().addGroup(
										opts.element, 0, 0, 'needle-shape');

		model.opts = {
			line: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.line.element = model.lineGroup;
		model.opts.shape.data = opts.shapeData;
		model.opts.shape.element = 
		model.shapeGroup.selectAll('#' + model.id + '_needle_shape');

		bio.iteration.loop(opts.lineData, function (ld)	{
			model.opts.line.data = ld.value;		

			bio.path(model.opts.line, model);
		});

		bio.circle(model.opts.shape, model);
	};
};
function network ()	{
	'use strict';

	var model = {};
	/*
		Version 3/4 에 따라서 force 함수가 변경되었다.
	 */
	function v3 (nodes, links)	{
		return d3.layout.force()
										.nodes(nodes)
										.links(links)
										.charge(-300)
										.linkDistance(150);
	};

	function v4 (nodes, links)	{
		return d3.forceSimulation(nodes) 
      			 .force('charge',
      			 	d3.forceManyBody().strength(function (d, i)	{
      			 		return d.group ? 
      			 		-300 - (600 * (d.radius / 100)) : 
      			 		-300 - (600 * (d.radius / 100));
      			 	}))
      			 .force('link', 
      			 	d3.forceLink(links)
      			 		.id(function(d) { return d.text; })
      			 		.distance(function (d)	{
      			 			return d.source.group && d.target.group ? 
      			 						90 - (90 * (d.source.radius / 100)) : 
      			 						d.isOne === 1 ? 
      			 						10 + (1050 * (d.source.radius / 100)) : 
      			 						190 - (190 * (d.source.radius / 100));
      			 		})) 
      			 .force('x', d3.forceX(function (d)	{
      			 		return d.group ? model.width / 2.1 : 
      			 			model.width - model.width * (d.index / 10);
      			 }))
      			 .force('y', d3.forceY(function (d)	{
      			 		return d.group ? model.height / 2.5 : 
      			 										 model.height * 0.95;
      			 }));
	};

	function buildArea (className, top, left, width, height)	{
		var g = bio.rendering().addGroup(
						model.element, 0, 0, className);

		bio.rectangle({
			id: className,
			element: g,
			attr: {
				rx: 2, 
				ry: 2, 
				y: top,
				x: left, 
				width: width, 
				height: height,
			},
			style: {
				strokeWidth: 2,
				fill: '#FFFFFF',
				stroke: '#333333',
				filter: 'url("#drop_shadow")',
				fillOpacity: function (d)	{
					return className === 'compound' ? 1 : 0.3;
				},
			},
		}, model);
	};

	function writeInfo (text, top, left)	{
		var g = bio.rendering().addGroup(
						model.element, 0, 0, 'network-info');

		bio.text({
			element: g,
			text: text,
			id: 'network_info',
			attr: { x: left, y: top },
			style: { fontSize: '16px', fontWeight: 'bold' },
		});
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.bcr = model.element.node().getBoundingClientRect();
		model.network_data = opts.data;
		model.arrow_width = 5;

		var compound = null,
				nodes = [],
				links = [];
		// Compound, Nodes, Links 분류 작업.
		bio.iteration.loop(model.network_data, function (net)	{
			net.type === 'compound' ? compound = net : 
			net.type === 'node' ? nodes.push(net) : links.push(net);
		});
		// Member 는 그룹으로 분류.
		bio.iteration.loop(nodes, function (node)	{
			if (compound.members.indexOf(node.text) > -1)	{
				node.group = 1;
			}
			// 노드의 위치 고정 및 반지름 크기 설정.
			// node.fixed = true;
			node.radius = (bio.drawing().textSize
							.width(node.text, '12px') + 10) / 2;
		});
		// 여러개의 노드가 오직 하나의 선을 가지며 그 선은 오로지
		// 그룹 밖의 노드로 향할때.
		var linkIsOne = {};

		bio.iteration.loop(links, function (link)	{
			linkIsOne[link.target] = true;
		});

		bio.iteration.loop(links, function (link)	{
			link.isOne = Object.keys(linkIsOne).length;
		});
		// Grouping, Information 영역 설정 및 Line 의 marker 설정.
		bio.rendering().dropShadow(
					model.element.append('svg:defs'), 1, -0.1, 1);
		bio.rendering().marker({
			id: 'id',
			data: links,
			color: 'linecolor',
			width: model.arrow_width,
			height: model.arrow_width,
			svg: model.element.append('svg:defs'),
		});
		buildArea('infomation', model.height * 0.05, 10, 
					model.width - 20, model.height * 0.1);
		buildArea('compound', model.height * 0.15, 10, 
				model.width - 20, model.height * 0.54);
		writeInfo(compound.text, 
			model.height * 0.105, model.width / 2 - 
			bio.drawing().textSize.width(compound.text, '16px') / 2);
		// Force layout 생성.
		var force = bio.dependencies.version.d3v4() ? 
								v4(nodes, links) : v3(nodes, links);
		// Animation 없이 draw.
		for (var i = 0, n = 
			Math.ceil(Math.log(force.alphaMin()) /
			Math.log(1 - force.alphaDecay())); i < n; ++i) {
	    force.tick();
	  }
	  // Link 와 Node 의 그룹 태그 생성.
		var linkLayer = bio.rendering().addGroup(
					model.element, 0, 0, 'link-layer'),
				nodeLayer = bio.rendering().addGroup(
					model.element, 0, 0, 'node-layer');

		var link = linkLayer.selectAll('.link')
												.data(links).enter()
												.append('svg:path')
												.attr('class', 'link')
												.attr('marker-end', function (d)	{
													return 'url("#marker_' + d.id + '")';
												})
												.style('fill', '#FFFFFF')
												.style('fill-opacity', 0.1)
												.style('stroke', function (d)	{
													return d.linecolor;
												})
												.style('stroke-width', 1.5)
												.style('stroke-dasharray', function (d)	{
													return d.style === 'Dashed' ? '3, 3' : 'none';
												});

		var node = nodeLayer.selectAll('.node')
												.data(nodes)
												.enter().append('g')
												.attr('class',' node');

		node.append('circle')
				.attr('r', function (d)	{
					return (bio.drawing().textSize
										 .width(d.text, '12px') + 10) / 2;
				})
				.attr('fill', function (d)	{ return d.bgcolor; })
				.attr('stroke', '#333333')
				.attr('stroke-width', 1);

		node.append('text')
				.attr('dx', 0)
				.attr('dy', 5)
				.attr('text-anchor', 'middle')
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.text(function (d)	{ return d.text; });
		// Force.tick() 함수로 호출되는 함수.
		var ticked = force.on('tick', function ()	{
			node.attr('transform', function (d, i)	{
				d.x = d.group ? d.x : model.width / 2.5;
				d.y = d.group ? d.y : model.height * 0.78;
			});

			link.attr('d', function (d)	{
				// 타겟 원의 테두리로 화살표가 닿게끔 하는 코드.
				var dx = d.target.x - d.source.x,
						dy = d.target.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy);

				var offsetX = dx * (d.target.radius + 
											model.arrow_width) / dr,
						offsetY = dy * (d.target.radius + 
											model.arrow_width) / dr;

				return 'M' + d.source.x + ',' + d.source.y + 
							 'A' + dr + ',' + dr + ' 0 0,1 ' + 
          					(d.target.x - offsetX) + ',' + 
          					(d.target.y - offsetY);
			});

			node.attr('transform', function (d)	{
				return 'translate(' + d.x + ',' + d.y + ')';
			});
		});
	};
};
function path ()	{
	'use strict';

	var model = {};
	/*
		D3 Line 함수.
	 */
	function toLine (opts, that)	{
		var target = this;

		return (bio.dependencies.version.d3v4() ? 
						d3.line() : d3.svg.line())
							.x(function (d, i)	{
								return opts.attr.x ? 
								typeof(opts.attr.x) !== 'function' ?  
									 		 opts.attr.x : 
									 		 opts.attr.x.call(target, d, i, that) : 0; 
							})	
							.y(function (d, i)	{
								return opts.attr.y ? 
								typeof(opts.attr.y) !== 'function' ?  
											 opts.attr.y : 
											 opts.attr.y.call(target, d, i, that) : 0; 
							});
	};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().line({
			element: opts.element,
			attr: !opts.attr ? null : {
				id: function (d) { 
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_path';
				},
				d: function (d, i)	{
					return toLine.call(this, opts, that)(opts.data);
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#A8A8A8'; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : '#A8A8A8'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '1px'; 
				},
			},
		});
	};
};
function rectangle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		return bio.rendering().rect({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d) {
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_rect';
				},
				x: function (d, i)	{
					return opts.attr.x ? 
					typeof(opts.attr.x) !== 'function' ?  
								 opts.attr.x : 
								 opts.attr.x.call(this, d, i, that) : 0;
				},
				y: function (d, i)	{
					return opts.attr.y ? 
					typeof(opts.attr.y) !== 'function' ?  
								 opts.attr.y : 
								 opts.attr.y.call(this, d, i, that) : 0;
				},
				rx: function (d, i)	{
					return opts.attr.rx ? 
					typeof(opts.attr.rx) !== 'function' ?  
								 opts.attr.rx : 
								 opts.attr.rx.call(this, d, i, that) : 0;
				},
				ry: function (d, i)	{
					return opts.attr.ry ? 
					typeof(opts.attr.ry) !== 'function' ?  
								 opts.attr.ry : 
								 opts.attr.ry.call(this, d, i, that) : 0;
				},
				width: function (d, i)	{
					return opts.attr.width ? 
					typeof(opts.attr.width) !== 'function' ?  
								 opts.attr.width : 
								 opts.attr.width.call(this, d, i, that) < 0 ? 
								 Math.abs(opts.attr.width.call(this, d, i, that)) : 
								 opts.attr.width.call(this, d, i, that) : 1;
				},
				height: function (d, i)	{
					return opts.attr.height ? 
					typeof(opts.attr.height) !== 'function' ?  
								 opts.attr.height : 
								 opts.attr.height.call(this, d, i, that) < 0 ? 
								 Math.abs(opts.attr.height.call(this, d, i, that)) : 
								 opts.attr.height.call(this, d, i, that) : 1;
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#000000'; 
				},
				'fill-opacity': function (d, i) { 
					return opts.style.fillOpacity ? 
					typeof(opts.style.fillOpacity) !== 'function' ?  
								 opts.style.fillOpacity : 
								 opts.style.fillOpacity.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '0px'; 
				},
				'filter': function (d, i)	{
					return opts.style.filter ?
					typeof(opts.style.filter) !== 'function' ?  
								 opts.style.filter : 
								 opts.style.filter.call(
								 	this, d, i, that) : false; 
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
			},
			on: !opts.on ? null : {
				click: function (d, i)	{
					opts.on.click ? 
					opts.on.click.call(this, d, i, that) : false;
				},
				mouseover: function (d, i)	{
					opts.on.mouseover ? 
					opts.on.mouseover.call(this, d, i, that) : false;
				},
				mouseout: function (d, i)	{
					opts.on.mouseout ? 
					opts.on.mouseout.call(this, d, i, that) : false;
				},
			},
			call: !opts.call ? null : {
				start: function (d, i)	{
					opts.call.start ? 
					opts.call.start.call(this, d, i, that) : false;
				},
				drag: function (d, i)	{
					opts.call.drag ? 
					opts.call.drag.call(this, d, i, that) : false;
				},
				end: function (d, i)	{
					opts.call.end ? 
					opts.call.end.call(this, d, i, that) : false;
				},
			},
		});
	};
};
function rendering ()	{
	'use strict';

	var model = {};
	/*
		SVG 태그를 만들어 삽입해주는 함수.
	 */
	model.createSVG = function (element, width, height)	{
		var dom = bio.dom().get(element),
				classify = dom.id ? '#' + dom.id : 
						 '.' + dom.className,
				w = width || parseFloat(dom.style.width),
				h = height || parseFloat(dom.style.height);

		return d3.select(classify).append('svg')
						 .attr('id', dom.id + '_svg')
						 .attr('width', w)
						 .attr('height', h);
	};
	/*
		SVG 에 group 태그를 추가하는 함수.
	 */
	model.addGroup = function (svg, top, left, classify)	{
		svg = bio.dependencies.version.d3v4() ? svg : svg[0][0];
		svg = bio.objects.getType(svg) === 'Array' || 
					bio.objects.getType(svg) === 'Object' ? 
					svg : d3.select(svg);

		classify = classify || '';

		var id = svg.attr('id'),
				isExist = d3.selectAll('.' + id + 
															 '.' + classify + '-g-tag');

		return (isExist.node() ? isExist : svg).append('g')
			 		.attr('class', id + ' ' + classify + '-g-tag')
			 		.attr('transform', 
			 			'translate(' + left + ', ' + top + ')');
	};
	/*
		Attribute 를 적용한다.
	 */
	function setAttributes (shape, attrs)	{
		if (!attrs) { return false; }

		bio.iteration.loop(attrs, function (name, value)	{
			shape.attr(name, value);
		});
	};
	/*
		Style 을 적용한다.
	 */
	function setStyles (shape, styles)	{
		if (!styles) { return false; }

		bio.iteration.loop(styles, function (name, value)	{
			shape.style(name, value);
		});
	};
	/*
		Event 를 적용한다.
	 */
	function setEvents (shape, events)	{
		if (!events) { return false; }

		bio.iteration.loop(events, function (name, value)	{
			shape.on(name, value);
		});
	};
	/*
		Drag 를 적용한다.
	 */
	function setDrag (shape, drags)	{
		if (!drags) { return false; }

		var drag = bio.dependencies.version.d3v4() ? 
				d3.drag() : d3.behavior.drag().origin(Object);

		bio.iteration.loop(drags, function (name, value)	{
			name = bio.dependencies.version.d3v4() ? 
						 name : name !== 'drag' ? 'drag' + name : name;

			drag.on(name, value);
		});

		shape.call(drag);
	};
	/*
		Text 를 적용한다.
	 */
	function setText (shape, text)	{
		shape.text(text);
	};
	/*
		Attribute, Style, Event 등을 등록해주는 함수.
	 */
	function defineShapeConfig (shape)	{
		if (!this.element)	{
			throw new Error ('Not defined SVG Element');
		}

		var s = !this.data ? this.element.append(shape) : 
						 this.element.data(this.data).enter().append(shape);

		this.text ? setText(s, this.text) : false;

		setAttributes(s, this.attr);
		setStyles(s, this.style);
		setEvents(s, this.on);
		setDrag(s, this.call);

		return s;
	};
	/*
		Rectangle 함수.
	 */
	model.rect = function (configs)	{
		return defineShapeConfig.call(configs, 'rect');
	};
	/*
		Circle 함수.
	 */
	model.circle = function (configs)	{
		return defineShapeConfig.call(configs, 'circle');
	};
	/*
		Triangle 함수.
	 */
	model.triangle = function (configs)	{
		return defineShapeConfig.call(configs, 'polygon');
	};
	/*
		Triangle 을 만드는데 필요한 문자열을 생성해주는 함수.
	 */
	model.triangleStr = function (x, y, len, direction)	{
		var sign = direction === 'left' || 
							 direction === 'bottom' ? -1 : 1,
				x1, y1, x2, y2;

		if (direction === 'left' || direction === 'right')	{
			x1 = (len * sign);
			y1 = (len / 2 * -1);
			x2 = x1;
			y2 = len / 2;
		} else {
			x1 = (len / 2 * -1);
			y1 = (len * sign);
			x2 = len / 2;
			y2 = y1;
		}

		return x + ',' + y + 
		' ' + (x + x1) + ',' + (y + y1) + 
		' ' + (x + x2) + ',' + (y + y2) + 
		 ' ' + x + ',' + y;
	};
	/*
		Text 함수.
	 */
	model.text = function (configs)	{
		return defineShapeConfig.call(configs, 'text');
	};
	/*
		Line 함수.
	 */
	model.line = function (configs)	{
		var path = configs.element.append('path');

		setAttributes(path, configs.attr);
		setStyles(path, configs.style);

		return path;
	};
	/*
		CSS3 의 box-shadow 기능을 사용하기 위해 svg 에서 제공되는
		drop shadow filter 를 사용한다.
	 */
	model.dropShadow = function (svg, std, dx, dy)	{
		var defs = svg.append('defs'),
				filter = defs.append('filter')
										 .attr('id', 'drop_shadow');

		filter.append('feGaussianBlur')
					.attr('in', 'SourceAlpha')
					.attr('stdDeviation', std || 3)
					.attr('result', 'blur');

		filter.append('feOffset')
					.attr('in', 'blur')
					.attr('dx', dx || 2)
					.attr('dy', dy || 2)
					.attr('result', 'offsetBlur');

		var feMerge = filter.append('feMerge');

		feMerge.append('feMergeNode')
					 .attr('in', 'offsetBlur');
		feMerge.append('feMergeNode')
					 .attr('in', 'SourceGraphic');
	};
	/*
		Network, Tree 의 path 에 사용될 Arrow 를 그려주는 함수.
	 */
	model.marker = function (opts)	{
		opts.svg.selectAll('marker')
	     	.data(opts.data || [''])      
	  	 	.enter().append('svg:marker')
	     	.attr('id', function (d)	{
	     		return opts.id ? 'marker_' + d[opts.id] : 'marker';
	     	})
	     	.attr('viewBox', '0 -5 10 10')
	     	.attr('refX', 5)
	     	.attr('refY', 0)
	     	.attr('markerWidth', opts.width || 5)
	     	.attr('markerHeight', opts.height || 5)
	     	.attr('orient', 'auto')
	     	.append('svg:path')
	     	.attr('d', 'M0,-5L10,0L0,5')
	     	.attr('fill', function (d)	{
	     		return opts.color ? d[opts.color] : '#333333'; 
	     	});
	};
	/*
		파라미터 색상의 num 만큼의 opacity 가 적용된 색상을 반환한다.
	 */
	model.opacity = function (color, num)	{
		var rgba = d3.rgb(color);
				rgba.opacity = num || 0.3;

		return rgba;
	};
	/*
		D3V4 에서는 d3.transform 함수가 제거되었다.
		그러므로 아래와 같이 코드를 사용하여 구현하였다.
	 */
	model.translation = function (transform)	{
		var g = document.createElementNS(
						'http://www.w3.org/2000/svg', 'g');

		g.setAttributeNS(null, 'transform', transform);

		var matrix = g.transform.baseVal.consolidate().matrix;
		
		return {
			scale: [matrix.a, matrix.d],
			translate: [matrix.e, matrix.f],
			rotate: matrix.b,
			skew: matrix.c,
		};
	};

	return function ()	{
		return model;
	};
};
function scales ()	{
	'use strict';

	var model = {};
	/*
		Ordinal scale 반환.
	 */
	model.ordinal = function (domain, range)	{
		return bio.dependencies.version.d3v4() ? 
					 d3.scaleBand().domain(domain).range(range) : 
					 d3.scale.ordinal().domain(domain).rangeBands(range);
	};
	/*
	 	Linear scale 반환.
	 */
	model.linear = function (domain, range)	{
		return bio.dependencies.version.d3v4() ? 
					 d3.scaleLinear().domain(domain).range(range) : 
					 d3.scale.linear().domain(domain).range(range);
	};
	/*
		Domain 데이터에서 첫번째 값이 정수일 경우
		이는 Linear 데이터로 분류하고 그 외에는 Ordinal 로 분류한다. 
	 */
	function scaleType (domain)	{
		return bio.objects.getType(domain[0]) === 'Number' ? 
					 'linear' : 'ordinal';
	};
	/*
		Ordinal/ Linear 스케일을 반환하는 함수.
	 */
	model.get = function (domain, range)	{
		return model[scaleType(domain)](domain, range);
	};
	/*
		반전된 Scale 을 반환하는 함수.
	 */
	model.invert = function (scale)	{
		var domain = scale.domain(),
				range = scale.range();

		var sc = scaleType(domain) === 'linear' ? 
				bio.dependencies.version.d3v4() ? 
				d3.scaleLinear() : d3.scale.linear() : 
				bio.dependencies.version.d3v4() ? 
				d3.scaleQuantize() : d3.scale.quantize();

		return sc.domain(range).range(domain);
	};
	/*
		Scale bandWidth 값을 반환한다.
	 */
	model.band = function (scale)	{
		return bio.dependencies.version.d3v4() ? 
					scale.bandwidth() : scale.rangeBand();
	};	

	return function ()	{
		return model;
	};
};
function scatter ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.scatter_data = opts.data;
		
		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.margin.top, 
			model.height - model.margin.bottom];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'scatter');

		model.opts = bio.objects.clone(opts);
		model.opts.data = model.scatter_data;
		model.opts.id = model.id + '_scatter_shape';
		model.opts.element = 
		model.group.selectAll('#' + model.id + '_scatter_shape');

		bio.circle(model.opts, model);
	};
};
function survival ()	{
	'use strict';

	var model = {};
	/*
		Survival data (id, months, status) 반환 함수.
	 */
	function getSurvivalData (data)	{
		var month = {os: [], dfs: []},
				pure = {os: [], dfs: []},
				all = {os: [], dfs: []};

		function forPatient (id, month, status, array)	{
			var obj = {};

			obj[id] = {
				case_id: id,
				months: month,
				status: status,
			};

			array.push(obj);
		};

		bio.iteration.loop(data, function (d)	{
			if (d)	{
				var osm = (d.os_days / 30),
						dfsm = (d.dfs_days / 30);

				month.os.push(osm);
				month.dfs.push(dfsm);

				if (!(osm == null || d.os_status == null))	{
					forPatient(d.participant_id, osm, d.os_status, pure.os);
				}

				if (!(dfsm == null || d.dfs_status == null))	{
					forPatient(d.participant_id, dfsm, d.dfs_status, pure.dfs);
				}

				forPatient(d.participant_id, osm, d.os_status, all.os);
				forPatient(d.participant_id, dfsm, d.dfs_status, all.dfs);
			}
		});

		return { month: month, pure: pure, all: all };
	};
	/*
		Tab 의 input 을 만드는 함수.
	 */
	function tabInput (id, idx)	{
		var input = document.createElement('input');

		input.id = id + '_survival';
		input.name = 'tabs';
		input.type = 'radio';
		input.checked = idx === 0 ? true : false;

		return input;
	};
	/*
		Tab 의 제목을 그린다.
	 */
	function tabLabel (id, name)	{
		var label = document.createElement('label');

		label.htmlFor = id + '_survival';
		label.innerHTML = name;

		return label;
	};
	/*
		선택 된 Tab 의 내용이 들어갈 div 를 만든다.
	 */
	function tabContent (id, content)	{
		var div = document.createElement('div');

		return div.id = id, div;
	};
	/*
		Survival tab ui 만드는 함수.
	 */
	function makeTab (element, tabs)	{
		document.querySelector(element).innerHTML = '';

		var div = document.querySelector(element);

		for (var i = 0, l = tabs.length; i < l; i++)	{
			var name = tabs[i],
					id = tabs[i].toLowerCase();

			div.appendChild(tabInput(id, i));
			div.appendChild(tabLabel(id, name));
		}

		for (var i = 0, l = tabs.length; i < l; i++)	{
			var area = tabContent(tabs[i].toLowerCase());

			area.appendChild(
				tabContent(tabs[i].toLowerCase() + '_survival_curve'));
			area.appendChild(
				tabContent(tabs[i].toLowerCase() + '_stat_table'))
			div.appendChild(area);
		}
	};

	return function (opts)	{
		model.survival_data = getSurvivalData(opts.data);

		makeTab(opts.element, ['OS', 'DFS']);

		SurvivalTab.init(opts.division, model.survival_data.pure);

		return model;
	};
};
function text ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().text({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d) { 
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_text';
				},
				x: function (d, i)	{
					return opts.attr.x ? 
					typeof(opts.attr.x) !== 'function' ?  
								 opts.attr.x : 
								 opts.attr.x.call(this, d, i, that) : 0;
				},
				y: function (d, i)	{
					return opts.attr.y ? 
					typeof(opts.attr.y) !== 'function' ?  
								 opts.attr.y : 
								 opts.attr.y.call(this, d, i, that) : 0;
				},
				// title: function (d, i)	{
				// 	return opts.attr.title ? 
				// 	typeof(opts.attr.title) !== 'function' ?  
				// 				 opts.attr.title : 
				// 				 opts.attr.title.call(this, d, i, that) : 0;
				// },
			},
			style: !opts.style ? null : {
				'fill': function (d, i)	{
					return opts.style.fill ?
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : 
								 opts.style.fill.call(
								 	this, d, i, that) : '#000000';
				},
				'font-size': function (d, i)	{
					return opts.style.fontSize ? 
					typeof(opts.style.fontSize) !== 'function' ?  
								 opts.style.fontSize : 
								 opts.style.fontSize.call(
								 	this, d, i, that) : '10px';
				},
				'font-family': function (d, i) { 
					return opts.style.fontFamily ? 
					typeof(opts.style.fontFamily) !== 'function' ?  
								 opts.style.fontFamily : 
								 opts.style.fontFamily.call(
								 	this, d, i, that) : 'Arial'; 
				},
				'font-weight': function (d, i) {
					return opts.style.fontWeight ? 
					typeof(opts.style.fontWeight) !== 'function' ?  
								 opts.style.fontWeight : 
								 opts.style.fontWeight.call(
								 	this, d, i, that) : 'normal';
				},
				'alignment-baseline': function (d, i)	{
					return opts.style.alignmentBaseline ? 
					typeof(opts.style.alignmentBaseline) !== 'function' ?  
								 opts.style.alignmentBaseline : 
								 opts.style.alignmentBaseline.call(
								 	this, d, i, that) : 'middle';
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
				'stroke': function (d, i)	{
					return opts.style.stroke ?
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : false; 
				},
				'stroke-width': function (d, i)	{
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : false; 
				},	
			},
			on: !opts.on ? null : {
				click: function (d, i)	{
					opts.on.click ? 
					opts.on.click.call(this, d, i, that) : false;
				},
				mouseover: function (d, i)	{
					opts.on.mouseover ? 
					opts.on.mouseover.call(this, d, i, that) : false;
				},
				mouseout: function (d, i)	{
					opts.on.mouseout ? 
					opts.on.mouseout.call(this, d, i, that) : false;
				},
			},
			text: function (d, i)	{ 
				return opts.text ? typeof(opts.text) !== 'function' ?  
							 opts.text : opts.text.call(this, d, i, that) : '';
			},
		});
	};
};
function triangle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().triangle({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d) { 
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_triangle';
				},
				points: function (d, i)	{
					return opts.attr.points ? 
					typeof(opts.attr.points) !== 'function' ?  
								 opts.attr.points : 
								 opts.attr.points.call(this, d, i, that) : 0;
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#000000'; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '0px'; 
				},
				'filter': function (d, i)	{
					return opts.style.filter ?
					typeof(opts.style.filter) !== 'function' ?  
								 opts.style.filter : 
								 opts.style.filter.call(
								 	this, d, i, that) : false; 
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
			},
			on: !opts.on ? null : {
				click: function (d, i)	{
					opts.on.click ? 
					opts.on.click.call(this, d, i, that) : false;
				},
				mouseover: function (d, i)	{
					opts.on.mouseover ? 
					opts.on.mouseover.call(this, d, i, that) : false;
				},
				mouseout: function (d, i)	{
					opts.on.mouseout ? 
					opts.on.mouseout.call(this, d, i, that) : false;
				},
			},
			call: !opts.call ? null : {
				start: function (d, i)	{
					opts.call.start ? 
					opts.call.start.call(this, d, i, that) : false;
				},
				drag: function (d, i)	{
					opts.call.drag ? 
					opts.call.drag.call(this, d, i, that) : false;
				},
				end: function (d, i)	{
					opts.call.end ? 
					opts.call.end.call(this, d, i, that) : false;
				},
			},
		});
	};
};
function handler ()	{
	'use strict';

	var model = {};
	/*
		스크롤 이벤트 핸들러.
	 */
	function scroll (target, callback)	{
		bio.dom().get(target)
			 .addEventListener('scroll', callback, false);
	};
	/*
	 	특정 이벤트 중 이벤트가 바디태그에서는 Disable 하게 만들어주는 함수.
	 */
	function preventBodyEvent (ele, events)	{
		var DOEVENT = false;

		// 사용자가 지정한 DIV 에 마우스 휠을 작동할때는, 바디에 마우스 휠
		// 이벤트를 막아놓는다.
		document.body.addEventListener(events, function (e)	{
			if (DOEVENT)	{
				if (e.preventDefault) {
					e.preventDefault();
				}

				return false;
			}
		});

		ele.addEventListener('mouseenter', function (e)	{
			DOEVENT = true;
		});

		ele.addEventListener('mouseleave', function (e)	{
			DOEVENT = false;
		});
	};
	/*
		x, y 스크롤이 hidden 일 때, 스크롤을 가능하게 해주는 함수.
	 */
	function scrollOnHidden (element, callback)	{
		if (!element)	{
			throw new Error('No given element');
		}

		preventBodyEvent(element, 'mousewheel');

		element.addEventListener('mousewheel', function (e)	{
			element.scrollTop += element.wheelDelta;

			if (callback) {
				callback.call(element, e);
			}
		});
	};

	return function ()	{
		return {
			scroll: scroll,
			scrollOnHidden: scrollOnHidden,
		};
	};
};
function exclusivity ()	{
	'use strict';

	var model = {};
	/*
		현재 Patient 의 (Un)Altered 값을 반환.
	 */
	function isAltered (samples, heat)	{
		var sample = 'SMCLUAD1690060028',
		// var sample = document.getElementById('sample_id').value,
				genesetArr = model.now.geneset.split(' '),
				result = '.';

		if (samples.length < 1)	{
			return [ 
				{ text: '**', color: '#00AC52' }, 
				{ text: sample + ' Belongs to', color: '#333333' }, 
				{ text: 'Unaltered group', color: '#00AC52' } ];
		}

		bio.iteration.loop(samples, function (s)	{
			var geneStr = heat[genesetArr.indexOf(s.gene)];

			if (geneStr.indexOf(s.value) > -1)	{
				result = result !== '.' ? 
				result : geneStr[geneStr.indexOf(s.value)];
			}
		});

		return result === '.' ? 
		[ { text: '**', color: '#00AC52' }, 
			{ text: sample + ' Belongs to', color: '#333333' }, 
			{ text: 'Unaltered group', color: '#00AC52' } ] : 
		[ { text: '**', color: '#FF6252' }, 
			{ text: sample + ' Belongs to', color: '#333333' }, 
			{ text: 'Altered group', color: '#FF6252' } ];
	};

	function forPatient (samples)	{
		model.data.sample = { data: [], isAltered: false };

		var config = bio.exclusivityConfig(),
				landCnf = bio.landscapeConfig();

		bio.iteration.loop(samples, function (sample)	{
			if (model.now.geneset.indexOf(sample.gene) > -1)	{
				model.data.sample.data.push({
					gene: sample.gene,
					value: config.symbol(config.byCase(
								landCnf.byCase(sample.class), sample.class)),
				});
			}
		});

		model.data.sample.isAltered = 
			isAltered(model.data.sample.data,
								model.data.survival.heat[model.now.geneset]);
	};

	function drawLegend (data)	{
		bio.layout().get(model.setting.svgs, ['ty_legend'], 
		function (id, svg)	{
			var config = bio.exclusivityConfig(),
					lgdCnf = config.legend(data.mostGeneWidth.value);

			bio.legend({
				element: svg,
				on: lgdCnf.on,
				attr: lgdCnf.attr,
				text: lgdCnf.text,
				style: lgdCnf.style,
				margin: lgdCnf.margin,
				data: data.type[model.now.geneset].sort(function (a, b)	{
					return config.priority(a) > config.priority(b) ? 1 : -1;
				}),
			});

			document.querySelector('#exclusivity_legend')
							.style.height = svg.attr('height') + 'px';
		});
	};

	function drawSampleLegend (data)	{
		bio.layout().get(model.setting.svgs, ['sample_legend'], 
		function (id, svg)	{
			var group = bio.rendering()
										 .addGroup(svg, 0, 0, 'sample-legend'),
					config = bio.exclusivityConfig()
											.sample('legend', data.mostGeneWidth.value);

			bio.text({
				text: config.text,
				attr: config.attr,
				style: config.style,
				id: id + '_sample_legend',
				data: data.sample.isAltered,
				element: group.selectAll('#' + id + '_sample_legend'),
			}, model);
		});
	};

	function drawSampleDivision (data)	{
		bio.layout().get(model.setting.svgs, ['heatmap'], 
		function (id, svg)	{
			var group = bio.rendering()
										 .addGroup(svg, 0, 0, 'sample-division'),
					config = bio.exclusivityConfig().sample(
										'division', data.mostGeneWidth.value, svg);

			bio.text({
				text: config.text,
				attr: config.attr,
				style: config.style,
				id: id + '_sample_division',
				data: data.sample.isAltered,
				element: group.selectAll('#' + id + '_sample_division'),
			}, model);
		});
	};

	function drawPatientOnSurvivalTable (ostable, dfstable)	{
		for (var i = 0, l = ostable.length; i < l; i++)	{
			var os = ostable[i],
					dfs = dfstable[i];

			bio.iteration.loop(model.data.sample.isAltered, 
			function (a)	{
				if (a.text === os.innerHTML)	{
					os.innerHTML += ' **';
					dfs.innerHTML += ' **';	
				}
			});
		}
	};

	function drawPatientOnSurvivalLegend (legend)	{
		var config = bio.exclusivityConfig().survival();

		bio.text({
			element: legend,
			text: config.text,
			attr: {
				x: function (d, i) { return config.attr.x(d, i, model); },
				y: function (d, i) { return config.attr.y(d, i, model); },
			},
			style: {
				'fill': function (d, i) { 
					return config.style.fill(d, i, model); 
				},
				'fontSize': '14px',
			},
			text: function (d, i) { return config.text(d, i, model); },
		});
	};

	function drawSampleSurvival (data)	{
		var obj = {},
				isDoneSurvival = setInterval(function ()	{
					obj.os_tb = document.querySelectorAll(
						'#os_stat_table td b');
					obj.dfs_tb = document.querySelectorAll(
						'#dfs_stat_table td b');
					obj.legend = d3.selectAll('.legend');

					if (obj.os_tb.length > 0 && 
							obj.dfs_tb.length > 0 && obj.legend.node())	{
						drawPatientOnSurvivalTable(obj.os_tb, obj.dfs_tb);
						drawPatientOnSurvivalLegend(obj.legend);
						clearInterval(isDoneSurvival);
					}
				}, 10);
	};

	function drawSample (data)	{
		drawSampleLegend(data);
		drawSampleDivision(data);
		drawSampleSurvival(data);
	};

	function drawNetwork (data)	{
		bio.layout().get(model.setting.svgs, ['network'], 
		function (id, svg)	{
			var config = bio.exclusivityConfig().network();

			bio.network({
				element: svg,
				data: data.network[
							model.now.geneset.replaceAll(' ', '')],
			});
		});
	};

	function drawHeatmap (data, axis)	{
		bio.layout().get(model.setting.svgs, ['heatmap'], 
		function (id, svg)	{
			var mLeft = data.mostGeneWidth.value,
					heatCnf = bio.exclusivityConfig()
											 .heatmap('shape', svg, mLeft),
					axisCnf = bio.exclusivityConfig()
											 .heatmap('axis', svg, mLeft),
					height = svg.attr('height');
			
			bio.heat({
				element: svg,
				attr: heatCnf.attr,
				style: heatCnf.style,
				margin: heatCnf.margin,
				xaxis: axis.x[model.now.geneset],
				yaxis: axis.y[model.now.geneset],
				data: data.heatmap[model.now.geneset],
			});

			bio.axises().left({
				top: 0,
				left: mLeft,
				element: svg,
				direction: 'left',
				range: axisCnf.range,
				exclude: 'path, line',
				margin: axisCnf.margin,
				domain: axis.y[model.now.geneset],
			});
		});
	};
	/*
		Survival chart 의 데이터를 altered, unaltered 로 나눈다.
	 */
	function divideForSurvival (geneset, data)	{
		var result = {};

		bio.iteration.loop(data.survival.data[geneset], 
		function (sd, i)	{
			if (sd)	{
				result[sd.participant_id] = 
				i <= data.divisionIdx[geneset].idx ? 
				'altered' : 'unaltered';
			}
		});

		return result;
	};

	function drawSurvival (data)	{
		var element = document.querySelector('#exclusivity_survival'),
				width = parseFloat(element.style.width),
				height = parseFloat(element.style.height);

		SurvivalCurveBroilerPlate.settings = {
			canvas_width 			 : width * 0.9,
			canvas_height 		 : height * 0.59,
		 	chart_width 			 : width * 0.9,
	  	chart_height 			 : height * 0.59,
		  chart_left 				 : 50,
		  chart_top 				 : 15,
		  include_info_table : false,
			include_legend 		 : true,
			include_pvalue 		 : true,
			pval_x 						 : width / 1.95,
			pval_y 						 : 40,
		};

		SurvivalCurveBroilerPlate.style = {
		  censored_sign_size : 5,
		  axis_stroke_width  : 1,
		  axisX_title_pos_x  : width / 2,
		  axisX_title_pos_y  : height / 1.725,
		  axisY_title_pos_x  : -(width / 2),
		  axisY_title_pos_y  : 10,
		  axis_color 				 : "black",
			pval_font_size 		 : 10,
			pval_font_style 	 : 'normal',
		};

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: 'Unaltered group', high: 'Altered group',
		};

		bio.survival({
			element: '#exclusivity_survival',
			margin: [20, 20, 20, 20],
			data: data.survival.data[model.now.geneset],
			division: divideForSurvival(model.now.geneset, data),
		});
	};

	function drawDivision (data)	{
		bio.layout().get(model.setting.svgs, ['heatmap'], 
		function (id, svg)	{
			var config = bio.exclusivityConfig()
											.division(data.mostGeneWidth.value);

			bio.divisionLine({
				element: svg,
				isMarker: false,
				pathElement: [svg],
				info: [
					{ 
						text: 'Altered group', color: '#FF6252', 
					},
					{ text: 'Unaltered group', color: '#00AC52' }
				],
				text: config.text,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				axis: data.axis.heatmap.x[model.now.geneset],
				idxes: data.divisionIdx[model.now.geneset].idx + 1,
			}, model);
		});
	};

	function drawExclusivity (data)	{
		forPatient(model.setting.defaultData.sample);
		drawLegend(data);
		drawNetwork(data);
		drawHeatmap(data, data.axis.heatmap);
		drawSurvival(data);
		drawDivision(data);
		drawSample(data);
	};

	return function (opts)	{
		model = bio.initialize('exclusivity');
		model.setting = bio.setting('exclusivity', opts);
		model.data = model.setting.preprocessData;

		bio.title('#exclusivity_title', 'Mutual Exclusivity');

		model.now.geneset = model.data.geneset[0].join(' ');

		bio.selectBox({
			viewName: 'geneset',
			margin: [0, 0, 0, 0],
			fontSize: '14px',
			defaultText: model.now.geneset,
			className: 'exclusivity-geneset',
			id: '#exclusivity_select_geneset',
			items: model.data.geneset.map(function (gs)	{
				return gs.join(' ');
			}),
			clickItem: function (value)	{
				model.now.geneset = value.toUpperCase();

				bio.layout().removeGroupTag();

				drawExclusivity(model.data);
			},
		});

		drawExclusivity(model.data);

		console.log('>>> Exclusivity reponse data: ', opts);
		console.log('>>> Exclusivity setting data: ', model.setting);
		console.log('>>> Exclusivity model data: ', model);
	};
};
function colorGradient ()	{
	'use strict';

	var model = {};
	/*
		offset 과 color 를 설정하고 배열에 추가하는 함수.
	 */
	function setOffset (offset, color)	{
		model.offsets.show.push({ offset: offset, color: color });
		model.offsets.data.push({ offset: offset, color: color });
	};
	/*
		Gradient 색상과 비율을 설정하는 함수.
	 */
	function setColorRate (offset, colors)	{
		var copyOffset = [].concat(offset)
											 .splice(1, offset.length - 2);

		setOffset('0%', colors[0]);

		bio.iteration.loop(copyOffset, function (cp, idx)	{
			var value = Math.round((bio.math.max(offset) - 
															bio.math.min(offset)) / cp * 10);

			model.offsets.show.push({
				offset: value - model.adjustValue + '%',
				color: colors[idx + 1]  
			});

			model.offsets.data.push({
				offset: value + '%',
				color: colors[idx + 1]
			});
		});

		setOffset('100%', colors[offset.length - 1]);
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.offsets = bio.initialize('colorGradient');

		model.adjustValue = opts.adjustValue || 0;
		model.id = opts.id || 'linear_gradient';
		model.colors = opts.colors || ['#000000', '#FFFFFF'];
		model.offset = opts.offset || [0, 100];
		model.defs = model.element.append('defs');
		model.lineGradient = model.defs.append('linearGradient')
																	 .attr('id', model.id);

		setColorRate(model.offset, model.colors);

		model.lineGradient.selectAll('stop')
		 .data(model.offsets.show).enter()
		 .append('stop')
		 .attr('offset', function (data, idx)	{ 
		 		return data.offset; 
		 })
		 .attr('stop-color', function (data, idx)	{
		 		return data.color;
		 });

		 return model;
	};
};
function expression ()	{
	'use strict';

	var model = {};
	
	function drawFuncSelectBox ()	{
		bio.selectBox({
			fontSize: '14px',
			items: ['Average'],
			viewName: 'function',
			margin: [3, 3, 0, 0],
			defaultText: 'Average',
			id: '#expression_function',
			className: 'expression-function',
			clickItem: function (value)	{
				model.now.function = value;
			},
		});
	};

	function changeBarColor (data, idx, that)	{
		if (!model.now.colorSet)	{ return '#62C2E0'; }

		var state = data.info ? 
								data.info[model.now.color_mapping] : 'NA';
		if (model.now.color_mapping.indexOf('pathologic') > -1)	{
			state = state.replace(/[a-z]/ig, '');
		}

		return state === 'NA' ? '#A4AAA7' : 
					bio.expressionConfig().colorSet[
					model.now.colorSet.indexOf(state)];
	};
	
	function drawColorMapSelectBox (items)	{
		bio.selectBox({
			fontSize: '14px',
			margin: [3, 3, 0, 0],
			viewName: 'color_mapping',
			defaultText: 'Color Mapping',
			id: '#expression_color_mapping',
			className: 'expression-color-mapping',
			items: items.map(function (i)	{
				return i.key;
			}),
			clickItem: function (value)	{
				var barLegend = document.querySelector(
											'#expression_bar_legend');

				model.now.color_mapping = value;

				items.some(function (i)	{
					return model.now.colorSet = i.value,
								 model.now.color_mapping === i.key;
				});

				bio.layout().removeGroupTag([
					'expression_bar_legend_svg']);

				if (barLegend.className.indexOf('active') < 0)	{
					barLegend.className += 'active';
				}

				d3.selectAll('#expression_bar_plot_svg_bar_rect_rect')
					.style('fill', changeBarColor)
					.style('stroke', changeBarColor);

				drawLegend('color_mapping', model.now.colorSet);
				// Scatter legend 의 위치가 유동적이게 되므로 이를 고정하기
				// 위해서 아래 코드를 추가함.
				barLegend.style.marginBottom = 
				(parseFloat(model.init.bar_legend_height) - 
				 parseFloat(barLegend.style.height) - 5) + 'px';
			},
		});
	};
	
	function drawSigSelectBox (data)	{
		bio.selectBox({
			fontSize: '14px',
			margin: [3, 3, 0, 0],
			viewName: 'signature',
			id: '#expression_signature',
			className: 'expression-signature',
			defaultText: model.now.signature,
			items: data.map(function (d) { return d.signature; }),
			clickItem: function (value)	{
				if (!model.now.signature || 
						 model.now.signature === value)	{ return; }

				model.now.signature = value;
				model.requestData.signature = model.now.signature;
				
				$.ajax({
					type:'get',
					url: model.requestURL,
					data: model.requestData,
					// type: 'post',
					// url:'/files',
					// data: {name: 'expression'},
					beforeSend: function ()	{
						bio.loading().start(
							model.setting.targetedElement,
							model.setting.targetedElementSize.width,
							model.setting.targetedElementSize.height);
					},
					success: function (d)	{
						var selectedData = '';

						bio.dom().remove(
							model.setting.targetedElement, 
							[document.querySelector('#expression_title'), 
							 document.querySelector('#expression_contents')]);

						bio.layout().removeGroupTag();
						// To be delete.
						// if (model.now.signature.indexOf('50') > -1)	{
						// 	selectedData = d.data.data_pam50.data;
						// } else if (model.now.signature.indexOf('1') > -1)	{
						// 	selectedData = d.data.data_sig1.data;
						// }	else if (model.now.signature.indexOf('2') > -1)	{
						// 	selectedData = d.data.data_sig2.data;
						// }	else if (model.now.signature.indexOf('3') > -1)	{
						// 	selectedData = d.data.data_sig3.data;
						// }

						bio.expression({
							element: model.setting.targetedElement.id,
							width: model.setting.targetedElementSize.width,
							height: model.setting.targetedElementSize.height,
							requestData: {
								source: model.requestData.source,
								cancer_type: model.requestData.cancer_type,
								sample_id: model.requestData.sample_id,
								signature: model.now.signature,
								filter: model.requestData.filter,
							},
							// data: selectedData,
							data: d.data,
						});

						bio.loading().end();
					},
				});
				// To be Delete.
				// $.ajax({
				// 	type: 'GET',
				// 	url: model.requestURL,
				// 	data: model.requestData,
				// 	success: function (d)	{
				// 	},
				// });
			},
		});
	};
	/*
		Color mapping, Scatter plot 의 범례를 그리는 함수.
	 */
	function drawLegend (type, data)	{
		var ids = type === 'scatter' ? 'scatter_leg' : 'bar_leg';

		bio.layout().get(model.setting.svgs, [ids], 
		function (id, svg)	{
			var config = bio.expressionConfig().legend(type);

			if (data)	{
				bio.legend({
					data: data,
					element: svg,
					on: config.on,
					attr: config.attr,
					text: config.text,
					style: config.style,
					margin: config.margin,
				});
			}
		});
	}
	/*
		Gene x Sample 의 tpm 값 색 범례를 그려준다.
	 */
	function drawColorGradient (axis)	{
		bio.layout().get(model.setting.svgs, ['gradient'], 
		function (id, svg)	{
			var shapeCnf = bio.expressionConfig().gradient('shape'),
					axisCnf = bio.expressionConfig().gradient('axis', svg);

			model.data.colorGradient = bio.colorGradient({
				element: svg,
				offset: axis,
				adjustValue: 6,
				colors: ['#FF0000', '#000000', '#00FF00'],
			});

			bio.rectangle({
				element: bio.rendering()
										.addGroup(svg, 0, 0, 'gradient-shape'),
				attr: shapeCnf.attr,
				style: shapeCnf.style,
			}, model);

			bio.axises().bottom({
				element: svg,
				top: axisCnf.top,
				left: axisCnf.left,
				range: axisCnf.range,
				margin: axisCnf.margin,
				exclude: axisCnf.exclude,
				tickValues: axis,
				domain: [axis[0], axis[2]],
			}).selectAll('text').style('fill', '#999999');
		});
	};

	function drawHeatmap (data, axis, gradientAxis)	{
		bio.layout().get(model.setting.svgs, ['heatmap'], 
		function (id, svg)	{
			var colorScale = bio.scales().get(gradientAxis, [
								'#FF0000', '#000000', '#00FF00']),
					config = bio.expressionConfig(),
					shapeCnf = config.heatmap('shape', data.axisMargin),
					axisCnf = config.heatmap('axis', data.axisMargin);

			svg.attr('height', axis.y.length * 10);

			bio.heat({
				element: svg,
				xaxis: axis.x,
				yaxis: axis.y,
				on: shapeCnf.on,
				data: data.heatmap,
				attr: shapeCnf.attr,
				margin: shapeCnf.margin,
				style: {
					fill: function (data, idx, that)	{
						return colorScale(data.value);
					},
				},
			});

			bio.axises().left({
				element: svg,
				domain: axis.y,
				top: axisCnf.top,
				left: axisCnf.left,
				margin: axisCnf.margin,
				exclude: axisCnf.exclude,
				range: [0, axis.y.length * 10],
			});
		});
	};

	function drawFunctionBar (data, axis)	{
		bio.layout().get(model.setting.svgs, ['bar_plot'], 
		function (id, svg)	{
			var config = bio.expressionConfig(),
					shapeCnf = config.bar('shape', data.axisMargin),
					axisCnf = config.bar('axis', data.axisMargin);

			bio.bar({
				element: svg,
				xaxis: axis.x,
				data: data.bar,
				on: shapeCnf.on,
				attr: shapeCnf.attr,
				style: shapeCnf.style,
				margin: shapeCnf.margin,
				yaxis: [axis.y[2], axis.y[0]],
			});

			bio.axises().left({
				element: svg,
				top: axisCnf.top,
				left: axisCnf.left,
				tickValues: axis.y,
				margin: axisCnf.margin,
				domain: [axis.y[2], axis.y[0]],
				range: [20, svg.attr('height') - 15],
			}).selectAll('path, line').style('stroke', '#999999');
		});
	};
	/*
		Survival 을 그리기 위해 Function 의 중간값을 기준으로
		Altered / Unaltered 로 나눈다.
	 */
	function divideSurvivalData (bars, median)	{
		model.data.survival.divide = {};

		bio.iteration.loop(bars, function (bar)	{
			bar.value <= median ? 
			model.data.survival.divide[bar.x] = 'unaltered' : 
			model.data.survival.divide[bar.x] = 'altered';
		});
	};
	/*
		선택된 Tab 의 Scatter 를 보여준다.
	 */
	function callScatter (tab, data)	{
		if (model.now.osdfs !== tab)	{
			bio.layout().removeGroupTag([
				'scatter-g-tag', 'left-axis-g-tag']);

			model.now.osdfs = tab;

			drawScatter(data, data.axis.scatter, model.now.osdfs);

			if (model.divide.low_arr || model.divide.high_arr)	{
				toBlur(
				d3.selectAll('#expression_scatter_plot_svg_scatter_shape_circle'),
				model.divide.low_arr, model.divide.high_arr);
			}
		}
	};
	/*
		OS, DFS 탭 변경 함수.
	 */
	function tabChange (data)	{
		var input = document.querySelector('#expression_survival')
												.querySelectorAll('input');

		input[0].onclick = function (e) { callScatter('os', data); };
		input[1].onclick = function (e) { callScatter('dfs', data); };
	};

	function drawSurvivalPlot (data)	{
		var element = document.querySelector('#expression_survival'),
				width = parseFloat(element.style.width),
				height = parseFloat(element.style.height) / 1.4;

		SurvivalCurveBroilerPlate.settings = {
			canvas_width 			 : width * 0.92,
			canvas_height 		 : height * 0.9,
		 	chart_width 			 : width * 0.9,
	  	chart_height 			 : height * 0.9,
		  chart_left 				 : 50,
		  chart_top 				 : 15,
		  include_info_table : false,
			include_legend 		 : true,
			include_pvalue 		 : true,
			pval_x 						 : width / 1.95,
			pval_y 						 : 40,
		};

		SurvivalCurveBroilerPlate.style = {
		  censored_sign_size : 5,
		  axis_stroke_width  : 1,
		  axisX_title_pos_x  : width / 2,
		  axisX_title_pos_y  : height / 1.125,
		  axisY_title_pos_x  : -(width / 2),
		  axisY_title_pos_y  : 10,
		  axis_color 				 : "black",
			pval_font_size 		 : 10,
			pval_font_style 	 : 'normal',
		};

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: 'Low score group', high: 'High score group',
		};

		var divide = divideSurvivalData(data.bar, data.axis.bar.y[1]),
				plot = bio.survival({
					element: '#expression_survival',
					margin: [20, 20, 20, 20],
					data: model.divide.patient_list || 
								model.setting.defaultData.patient_list,
					division: model.divide.divide || data.survival.divide,
				});

		model.data.survival.data = plot.survival_data;
		model.data.scatter = 
		Object.keys(model.data.scatter).length < 1 ? 
		model.data.survival.data.all : model.data.scatter;

		tabChange(data);
	};
	/*
		For scatter plot data.
	 */
	function scatterData (data, xaxis)	{
		var result = [];

		bio.iteration.loop(data, function (d)	{
			bio.iteration.loop(d, function (key, value)	{
				if (xaxis.indexOf(key) > -1)	{
					result.push({ x: key, y: value.months, value: value.status });
				}
			});
		});

		return result;
	};

	function drawScatter (data, axis, osdfs)	{
		bio.layout().get(model.setting.svgs, ['scatter_p'], 
		function (id, svg)	{
			var config = bio.expressionConfig(),
					shapeCnf = config.scatter('shape', data.axisMargin),
					axisCnf = config.scatter('axis', data.axisMargin),
					yaxis = [].concat(axis.y[osdfs]).reverse();

			bio.scatter({
				element: svg,
				yaxis: yaxis,
				xaxis: axis.x,
				on: shapeCnf.on,
				attr: shapeCnf.attr,
				style: shapeCnf.style,
				margin: shapeCnf.margin,
				data: scatterData(data.scatter[osdfs], axis.x),
			});

			bio.axises().left({
				ticks: 15,
				element: svg,
				domain: yaxis,
				top: axisCnf.top,
				left: axisCnf.left,
				margin: axisCnf.margin,
				range: [10, svg.attr('height') - 30],	
			}).selectAll('path, line').style('stroke', '#999999');
		});
	};

	function drawPatientOnSurvivalTable (ostable, dfstable)	{
		for (var i = 0, l = ostable.length; i < l; i++)	{
			var os = ostable[i],
					dfs = dfstable[i];

			if (model.data.patient.data === os.innerHTML)	{
				os.innerHTML += ' **';
				dfs.innerHTML += ' **';
			}
		}
	};

	function drawPatientOnSurvivalLegend (legend)	{
		var config = bio.expressionConfig().survival('legend');

		bio.text({
			element: legend,
			attr: {
				x: function (d, i) { 
					return config.attr.x(d, i, model); 
				},
				y: function (d, i) { 
					return config.attr.y(d, i, model); 
				},
			},
			style: {
				fill: function (d, i) { 
					return config.style.fill(d, i, model); 
				},
			},
			text: function (d, i) { 
				return config.text(d, i, model); 
			},
		});
	};

	function drawPatientOnSurvival ()	{
		var obj = {},
				isDoneSurvival = setInterval(function ()	{
					obj.os_tb = document.querySelectorAll(
						'#os_stat_table td b');
					obj.dfs_tb = document.querySelectorAll(
						'#dfs_stat_table td b');
					obj.legend = d3.selectAll('.legend');

					if (obj.os_tb.length > 0 && 
							obj.dfs_tb.length > 0 && obj.legend.node())	{
						drawPatientOnSurvivalTable(obj.os_tb, obj.dfs_tb);
						drawPatientOnSurvivalLegend(obj.legend);
						clearInterval(isDoneSurvival);
					}
				}, 10);
	};

	function drawPatient (data)	{
		bio.layout().get(model.setting.svgs, ['bar_p', 'scatter_p'], 
		function (id, svg)	{
			var obj = {},
					name = id.indexOf('bar') > -1 ? 'bar' : 'scatter',
					config = bio.expressionConfig().patient(data.axisMargin);

			obj.group = bio.rendering()
										 .addGroup(svg, 0, 0, name + '-patient');
			obj.id = id + '_' + name + '_patient';
			obj.margin = bio.sizing.setMargin(config.margin);
			obj.width = parseFloat(svg.attr('width'));
			obj.height = parseFloat(svg.attr('height'));
			obj.scaleX = bio.scales().get(data.axis.heatmap.x, [
				obj.margin.left, obj.width - obj.margin.right]);
			obj.scaleY = bio.scales().get(
				[data.axis.bar.y[2], data.axis.bar.y[0]], 
				[obj.margin.top, obj.height - obj.margin.bottom]);

			bio.triangle({
				element: obj.group.selectAll(
					 '#' + obj.id + '_' + name + '_patient'),
				data: data.bar.filter(function (b)	{
					if (b.x === data.patient.name)	{ return b; }
				}),
				attr: {
					id: function (d, i, t)	{
						return obj.id + '_' + name + '_patient';
					},
					points: config.attr.points,
				},
				style: config.style,
				on: config.on,
			}, obj);
		});

		drawPatientOnSurvival();
	};
	/*
		Drag 후에 선택되지 않은 부분을 blur 처리 한다.
	 */
	function toBlur (element, low, high)	{
		element.style('fill-opacity', function (data, idx, that)	{
			return low.indexOf(data.x) < 0 && 
						 high.indexOf(data.x) < 0 ? 0.08 : 
						 element.attr('id').indexOf('shape') > -1 ? 0.6 : 1;
		})
		.style('stroke-opacity', function (data, idx, that)	{
			return low.indexOf(data.x) < 0 && 
						 high.indexOf(data.x) < 0 ? 0.08 : 1;
		});
	};

	function drawDivision (data)	{
		/*
			Low, High 별로 환자 배열을 순환.
		 */
		function patientByDrag (arr)	{
			bio.iteration.loop(arr, function (a)	{
				if (a !== model.data.patient.name)	{
					bio.iteration.loop(model.setting.defaultData.patient_list, 
					function (p)	{
						if (p.participant_id === a)	{
							model.divide.patient_list.push(p);
						}
					});

					model.divide.divide[a] = model.data.survival.divide[a];
				}
			});
		};
		/*
			Drag 후 변경 된 데이터를 차트에 적용한다.
		 */
		function changeByDrag (low, high)	{
			model.divide.divide = {};
			model.divide.patient_list = [];
			model.divide.scatter = { os: [], dfs: [] };
			// Pick up patients.
			patientByDrag(low);
			patientByDrag(high);
			// Survival chart update.
			drawSurvivalPlot(data);
			drawPatient(data);
			// to blur selected targets.
			toBlur(
				d3.selectAll('#expression_bar_plot_svg_bar_rect_rect'),
				low, high);
			toBlur(
				d3.selectAll('#expression_scatter_plot_svg_scatter_shape_circle'),
				low, high);
		};

		var cnf = bio.expressionConfig().division;
		// Disivion bar on disivion tag.
		bio.layout().get(model.setting.svgs, ['division'], 
		function (id, svg)	{
			var divCnf = cnf('division', data.axisMargin);

			bio.divisionLine({
				element: svg,
				pathElement: [
					d3.select('#expression_bar_plot_svg'),
					d3.select('#expression_scatter_plot_svg')
				],
				info: [
					{ 
						additional: -10,
						color: '#00AC52', 
						direction: 'right',
						text: 'Low score group', 
					},
					{ 
						additional: 10,
						color: '#FF6252',
						direction: 'left',
						text: 'High score group', 
					}
				],
				data: data.bar,
				text: divCnf.text,
				attr: divCnf.attr,
				call: {
					drag: divCnf.call.drag,
					end: function (data, idx, that)	{
						var axis = [].concat(that.axis);

						model.divide.low_sample = 
						that.invert(that.position.now.low);
						model.divide.high_sample = 
						that.invert(that.position.now.high);

						model.divide.high_arr = axis.splice(
							that.axis.indexOf(model.divide.high_sample), 
							axis.length - 1);
						model.divide.low_arr = axis.splice(0, 
							that.axis.indexOf(model.divide.low_sample));

						changeByDrag(model.divide.low_arr, model.divide.high_arr);
					},
				},
				style: divCnf.style,
				margin: divCnf.margin,
				axis: data.axis.bar.x,
				idxes: data.axis.bar.y,
			}, model);
		});
	};
	/*
		초기 실행 또는 새 데이터를 받았을 때 실행되는 함수.
	 */
	function drawExpression (data, origin)	{
		drawFuncSelectBox();
		drawColorMapSelectBox(data.subtype);
		drawSigSelectBox(origin.signature_list);
		drawLegend('color_mapping', model.now.colorSet || null);
		drawLegend('scatter', ['Alive', 'Dead']);
		drawColorGradient(data.axis.gradient.x);
		drawHeatmap(data, data.axis.heatmap, data.axis.gradient.x);
		drawFunctionBar(data, data.axis.bar);
		drawSurvivalPlot(data);
		drawScatter(data, data.axis.scatter, model.now.osdfs);
		drawPatient(data);
		drawDivision(data);
	};

	return function (opts)	{
		model = {};
		model = bio.initialize('expression');
		model.setting = bio.setting('expression', opts);
		model.data = model.setting.preprocessData;
		// About request configurations.
		model.requestData = opts.requestData || {};
		model.requestURL = opts.requestURL || '/rest/expressions';
		// To initialize signature.
		model.init.signature = opts.data.signature_list[0].signature;
		// model.now.signature = model.init.signature;
		model.now.signature = model.requestData.signature;
		model.init.bar_legend_height = 
		document.querySelector('#expression_bar_legend').style.height;
		// Make title of expression.
		bio.title('#expression_title', 'Expressions');

		drawExpression(model.data, model.setting.defaultData);

		console.log('>>> Expression reponse data: ', opts);
		console.log('>>> Expression setting data: ', model.setting);
		console.log('>>> Expression model data: ', model);
	};
};
function landscape ()	{
	'use strict';

	var model = {};
	/*
		Landscape 의 초기 가로, 세로 길이를 설정해주는 함수.
	 */
	function defaultSize (init)	{
		// 기준은 '#landscape_heatmap' 태그로 한다.
		var def = bio.dom().get('#landscape_heatmap');

		init.width = parseFloat(def.style.width) * 2;
		init.height = parseFloat(def.style.height);
	};
	/*
		Landscape scale option group 을 그리는 함수.
	 */
	function drawScaleSet (setting)	{
		bio.scaleSet({
			element: '#landscape_option',
			defaultValue: model.init.width,
			change: function (event, data)	{
				bio.layout().removeGroupTag();

				if (data.type === 'refresh')	{
					changeAxis({ axis: 'x', data: model.init.axis.x });
					changeAxis({ axis: 'y', data: model.init.axis.y });

					return drawLandscape(model.data, 
					(model.now.width = model.init.width, model.now.width));
				} 

				return drawLandscape(model.data, 
					(model.now.width = data.value, model.now.width));
			},
		});
	};
	/*
		Group 내에 만들어진 임시 svg 를 삭제하는 함수.
		이는 setting 객체가 완성된 후에 실행되어야 한다.
		이유는 setting 객체에서 layout 을 만들어야 svg 가 생성되기
		때문이다.
	 */
	function removeGroupTempSVG ()	{
		d3.selectAll('#landscape_group_svg, ' + 
								 '#landscape_axis_group_svg, ' + 
								 '#landscape_patient_group_svg').remove();
	};
	/*
		Type 배열을 Priority 순으로 정렬한다.
	 */
	function orderByTypePriority (types)	{
		types = types.sort(function (a, b)	{
			return bio.boilerPlate.variantInfo[a].order > 
						 bio.boilerPlate.variantInfo[b].order ? 1 : -1;
		});
	};
	/*
		Patient axis 를 다시 만들어 준다.
	 */
	function patientAxis (axis)	{
		// Heatmap 쪽 patient axis.
		axis.patient.heatmap = {
			x: axis.patient.x,
			y: axis.gene.y,
		};
		// Group 쪽 patient axis.
		axis.patient.group = {
			x: ['NA'],
			y: axis.group.y,
		};
		// Sample 쪽 patient axis.
		axis.patient.sample = {
			x: axis.patient.x,
			y: axis.sample.y,
		};
	};
	/*
		Heatmap 을 exclusive 하게 그려주는 함수.
	 */
	function changeAxis (data)	{
		var first = data.axis === 'x' ? 'group' : 'pq',
				secnd = data.axis === 'x' ? 'sample' : 'gene';

		model.data.axis[first][data.axis] = data.data;
		model.data.axis[secnd][data.axis] = data.data;
		model.data.axis.heatmap[data.axis] = data.data;
	};
	/*
		Sample, Group, Heatmap 의 가로 길이를 설정하는 함수.
	 */
	function setWidth (width)	{
		bio.layout().get(model.setting.svgs, ['e_gr', 'e_s', 'e_h'],
		function (id, svg)	{
			svg.attr('width', width || model.now.width || 
																 model.init.width);
		});
	};
	/*
		Click 이벤트로 변경된 정렬대로 다시 그려주는 함수.
	 */
	function redraw (result)	{
		if (!result)	{ return false;}

		model = result.model;
		
		bio.layout().removeGroupTag();
		changeAxis(result.sorted);
		drawLandscape(model.data, model.now.width);	
	};
	/*
		Landscape 축들을 그려주는 함수.
	 */
	function drawAxis (part, direction)	{
		var p = {
			sample: 's_s', gene: 'gene', pq: 'pq', group: 's_g'
		}[part];

		bio.layout().get(model.setting.svgs, [p], 
		function (id, svg)	{
			var config = bio.landscapeConfig().axis(
										part, direction, svg),
					common = bio.landscapeConfig().axis('common'),
					data = model.data.axis[part][direction.toLowerCase()];
			// Group 의 경우 각각에 데이터가 들어있으므로 Looping 을 하여
			// 맞은 값을 가져온다.
			if (part === 'group')	{
				bio.iteration.loop(data, function (g)	{
					if (id.indexOf(g[0].removeWhiteSpace()) > -1)	{
						data = g;
					}
				});
			} 
			
			bio.axises()[config.direction]({
				element: svg,
				domain: data,
				top: config.top,
				left: config.left,
				range: config.range,
				margin: config.margin,
				exclude: config.exclude,
			}).selectAll('text')
				.on('mouseout', common.on ? common.on.mouseout : false)
				.on('mouseover', common.on ? common.on.mouseover : false)
				.on('click', function (data, idx)	{
					var res = config.on ? config.on.click.call(
															this, data, idx, model) : false;
					console.log(res.model)
					redraw(res);
				});
		});
	};
	/*
		Sort 버튼이 어느 버튼인지 반환하는 함수.
	 */
	function getSortedTitle (id, common)	{
		return id.indexOf('pq') < 0 ? 
					 id.indexOf('gene') > -1 ? 
					[{ name: 'gene', text: common.titles[0] }] : 
				  [{ name: 'sample', text: common.titles[0] }] :
					[{ name: 'pq', text: common.titles[1] }];
	};
	/*
		Sort title 을 그려주는 함수.
	 */
	function drawSortTitle (id)	{
		bio.layout().get(model.setting.svgs, [id], 
		function (id, svg)	{
			var common = bio.landscapeConfig().title('common'),
					titles = getSortedTitle(svg.attr('id'), common),
					config = bio.landscapeConfig().title(titles[0].name);

			bio.sortTitle({
				data: titles,
				element: svg,
				attr: config.attr,
				text: common.text,
				style: common.style,
				margin: config.margin,
				titles: common.titles,
				on: {
					mouseover: common.on.mouseover,
					mouseout: common.on.mouseout,
					click: function (data, idx, that)	{
						model.sortName = titles[0].name;

						!model.now.sort[data.name] ? 
						 model.now.sort[data.name] = 'asc' : 
						 model.now.sort[data.name] === 'asc' ? 
						 model.now.sort[data.name] = 'desc' : 
						 model.now.sort[data.name] = 'asc';

						var res = common.on.click.call(
												this, data, idx, model);

						redraw(res);
					},
				},
			}, model);
		});
	};
	/*
		일반적인 형태의 bar 차트를 그리는 함수.
	 */
	function drawBar (part, data, axis, startTo)	{
		var parts = {
			sample: { id: 'e_s', config: 'sample' },
			samplePatient: { id: 't_s', config: 'sample' },
			gene: { id: part, config: part },
			pq: { id: part, config: part },
		}[part];

		bio.layout().get(model.setting.svgs, [parts.id], 
		function (id, svg)	{
			var config = bio.landscapeConfig().bar(parts.config);

			if (part.indexOf('Patient') > -1)	{
				config.margin[3] = 5;
			}
			
			bio.bar({
				data: data,
				element: svg,
				on: config.on,
				xaxis: axis.x,
				yaxis: axis.y,
				startTo: startTo,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
			});
		});
	};
	/*
		Heatmap 을 그릴때 ID 검색 시 필요한 그룹 이름을 반환한다.
	 */
	function getGroupTitle (part, axis)	{
		return part.indexOf('group') > -1 || 
					 part.indexOf('patientGroup') > -1 ? 
					 axis.y[0].removeWhiteSpace() : '';
	};
	/*
		Heatmap 차트를 그려주는 함수.
	 */
	function drawHeatmap (part, data, axis)	{
		var add = getGroupTitle(part, axis);
		var parts = {
			group: { id: 'p_group_', config: 'group' }, 
			patientGroup: { id: 't_group_', config: 'group' },
			heatmap: { id: 'e_h', config: 'heatmap' }, 
			patientHeatmap: { id: 't_h', config: 'heatmap' },
		};

		bio.layout().get(model.setting.svgs, [parts[part].id + add], 
		function (id, svg)	{
			var config = bio.landscapeConfig()
											.heatmap(parts[part].config),
					init = part.indexOf('map') > - 1 ? 
									bio.initialize('landscapeHeatmap') : null;

			if (part.indexOf('patientHeatmap') > -1 || 
					part.indexOf('patientGroup') > -1)	{
				config.margin[3] = 5;
			} 

			bio.heat({
				data: data,
				element: svg,
				xaxis: axis.x,
				yaxis: axis.y,
				on: config.on,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
			}, init);
		});
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend (data)	{
		bio.layout().get(model.setting.svgs, ['legend'], 
		function (id, svg)	{
			var config = bio.landscapeConfig().legend();

			bio.legend({
				data: data,
				element: svg,
				on: config.on,
				attr: config.attr,
				text: config.text,
				style: config.style,
				margin: config.margin,
			});
		});
	};
	/*
		Landscape 전체를 그려주는 함수.
	 */
	function drawLandscape (data, width)	{
		var md = model.data;

		setWidth(width);
		drawAxis('pq', 'X');
		drawAxis('gene', 'X');
		drawAxis('gene', 'Y');
		drawAxis('group', 'Y');
		drawAxis('sample', 'Y');
		drawSortTitle('pq');
		drawSortTitle('s_s');
		drawSortTitle('gene');
		drawBar('pq', md.pq, md.axis.pq, ['top', 'left']);
		drawBar('gene', md.stack.gene, md.axis.gene, ['top', 'left']);
		drawBar('sample', md.stack.sample, md.axis.sample, 
					 ['top', 'left']);
		drawBar('samplePatient', md.stack.patient, 
						md.axis.patient.sample, ['top', 'left']);
		drawHeatmap('heatmap', md.heatmap, md.axis.heatmap);
		drawHeatmap('patientHeatmap', md.patient, 
																	md.axis.patient.heatmap);

		bio.iteration.loop(md.axis.group.y, function (g, idx)	{
			var yaxis = md.axis.group.y[idx],
					group = { x: md.axis.group.x, y: yaxis },
					patient = { x: md.axis.patient.group.x, y: yaxis };

			drawHeatmap('group', md.group.group[idx], group);
			drawHeatmap('patientGroup', 
								 [md.group.patient[idx]], patient);
		});

		drawLegend(md.type);
	};

	return function (opts)	{
		model = bio.initialize('landscape');
		model.setting = bio.setting('landscape', opts);
		model.data = model.setting.preprocessData;

		removeGroupTempSVG();
		// Set landscape title.
		bio.title('#landscape_title', 
			model.setting.defaultData.title);

		defaultSize(model.init);
		drawScaleSet(model.setting);
		// 초기 exclusive 값을 설정한다.
		model.exclusive.init = bio.landscapeSort().exclusive(
			model.data.heatmap, model.data.gene);
		// 초기 x, y 축 값 설정. 초기화 동작을 위해서이다.
		model.init.axis.x = [].concat(model.exclusive.init.data);
		model.init.axis.y = [].concat(model.data.axis.gene.y);

		orderByTypePriority(model.data.type);
		patientAxis(model.data.axis);
		changeAxis(model.exclusive.init);
		drawLandscape(model.data, model.init.width);

		bio.handler().scroll('#landscape_heatmap', function (e)	{
			var sample = bio.dom().get('#landscape_sample'),
					group = bio.dom().get('#landscape_group');
			
			sample.scrollLeft = this.scrollLeft;
			group.scrollLeft = this.scrollLeft;
		});

		console.log('>>> Landscape reponse data: ', opts);
		console.log('>>> Landscape setting data: ', model.setting);
		console.log('>>> Landscape model data: ', model);
	};
};
function landscapeSort ()	{
	'use strict';

	var model = {};
	/*
		Stacked 데이터를 정렬하기위해선 해당 값에 대한
		Stacked 데이터를 합해주어야 한다.
	 */
	function byStack (data, what)	{
		var obj = {};

		bio.iteration.loop(data, function (d, i)	{
			obj[d[what]] = obj[d[what]] ? 
			obj[d[what]] += d.value : obj[d[what]] = d.value;
		});

		return obj;
	};
	/*
		Object 데이터를 sort 함수 사용을 위해
		배열로 변경시켜주는 함수.
	 */
	function toObject (data)	{
		var arr = [];

		bio.iteration.loop(data, function (key, value)	{
			arr.push({ key: key, value: value });
		});

		return arr;
	}
	/*
		중복, 정렬에 따른 값과, 그에 따른 정렬함수 실행을 하는 함수.
	 */
	function ascdesc (sort, data)	{
		var w = sort === 'asc' ? 1 : -1;

		return data.sort(function (a, b)	{
			return a.value > b.value ? 1 * w : -1 * w;
		});
	};
	/*
		Mutation 을 기준으로 오름차순,내림차순 정렬을 하는 함수.
	 */
	function byMutation (align, data)	{
		var dt = ascdesc(align, toObject(byStack(data, 'y')));

		return { 
			axis: 'y', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		Sample 을 기준으로 오름차순,내림차순 정렬을 하는 함수.
	 */
	function bySample (align, data)	{
		var dt = ascdesc(align, toObject(byStack(data, 'x')));
		
		return { 
			axis: 'x', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		PQ value 를 기준으로 오름차순,내림차순 정렬을 하는 함수.
	 */
	function byPQ (align, data)	{
		var dt = ascdesc(align, data);

		return { 
			axis: 'y', data: dt.map(function (d)	{ return d.y; })
		};
	};
	/*
		정렬 기준에 맞는 정렬 함수를 호출하는 함수.
	 */
	function toAlignment (type, align, data)	{
		switch (type)	{
			case 'gene': return byMutation(align, data); break;
			case 'sample': return bySample(align, data); break;
			case 'pq': return byPQ(align, data); break;
			default: throw new Error('Not matching function'); break;
		}
	};
	/*
		정렬 기준이 되는 데이터를 찾아 반환하는 함수.
	 */
	function getData (type, data)	{
		switch (type)	{
			case 'gene': return data.stack.gene; break;
			case 'sample': return data.stack.sample; break;
			case 'pq': return data.pq; break;
			case 'init': return data.init; break;
			default: throw new Error('No matching any data'); break;
		}
	};
	/*
		gene, sample, pq 오름차순 정렬 함수.
	 */
	function byAsc (type, data)	{
		return toAlignment(type, 'asc', getData(type, data));
	};
	/*
		gene, sample, pq 오름차순 내림 함수.
	 */
	function byDesc (type, data)	{
		return toAlignment(type, 'desc', getData(type, data));
	};
	/*
		개별 gene 에 대한 정렬 함수.
	 */
	function byGene (genes, data)	{
		var toExclusive = bio.landscapeSort()
												 .exclusive(data, data[0].y);

		bio.iteration.loop(genes, function (gene)	{
			if (toExclusive.data.indexOf(gene) < 0)	{
				toExclusive.data.push(gene);
			}
		});

		return toExclusive;
	};
	/*
		Obj 의 키값을 순서대로 정렬하고 각각의 데이터를 배열화 하는 함수.
	 */
	function resultGrouping (obj)	{
		var result = [];

		bio.iteration.loop(Object.keys(obj).sort(function (a, b)	{
			return bio.boilerPlate.clinicalInfo[a].order > 
						 bio.boilerPlate.clinicalInfo[b].order ? 1 : -1;
		}), function (d, i)	{
			result.push(obj[d]);
		});

		return result;		
	};
	/*
		Group 을 exclusive 하게 만들어주는 함수.
	 */
	function exclusiveGroup (groups)	{
		var heat = [];

		bio.iteration.loop.call(this, groups, function (group)	{
			var temp = [];

			bio.iteration.loop(group, function (g)	{
				temp = temp.concat(g.info);
			});

			heat.push(
				bio.landscapeSort().exclusive(temp, this.data.gene));
		});

		return heat;
	};
	/*
		그룹 별로 정렬된 데이터를 만들어 반환하는 함수.
	 */
	function groupSort (data)	{
		var obj = makeObjectByGroup(data),
				group = resultGrouping(obj),
				heatmap = exclusiveGroup.call(this, group),
				result = {};

		bio.iteration.loop(heatmap, function (h)	{
			result.axis = h.axis;
			result.data ? result.data.push(h.data) : 
										result.data = [h.data];
		});

		return { group: group, axis: result };
	};
	/*
		이전에 선택된 그룹과 새로 전달된 그룹을 비교해
		맞는 그룹 데이터를 뽑아주는 함수.
	 */
	function matching (data, nowGroup)	{
		var result = [];

		bio.iteration.loop(data, function (d)	{
			bio.iteration.loop(nowGroup, function (ng)	{
				if (d.x === ng.x)	{
					result.push(d);
				}
			});
		});

		return result;
	};
	/*
		그룹명을 클릭하였을 때, 재정렬한다.
	 */
	function byGroup (data, alt)	{
		if (alt)	{
			if (this.now.group.length < 1)	{
				throw new Error ('There are empty group data');
			}

			var temp = [],
					result = {
						group: [], axis: { axis: 'x', data: [] }
					};

			bio.iteration.loop.call(this, this.now.group.group, 
			function (ng)	{
				temp.push(groupSort.call(this, matching(data, ng)));
			});

			bio.iteration.loop(temp, function (t)	{
				result.group = result.group.concat(t.group);
				result.axis.data = 
				result.axis.data.concat(t.axis.data);
			});

			return result;
		} 

		return groupSort.call(this, data);
	};
	/*
		Type 을 문자열의 형태로 바꿔주는 함수.
	 */
	function typeToString (result, genes, data)	{
		var geneIdx = genes.indexOf(data.y) * 2,
				mutIdx = bio.landscapeConfig()
										.byCase(data.value) === 'cnv' ? 0 : 1;

		result.value = result.value.replaceAt(
									geneIdx, '00'.replaceAt(mutIdx, '1'));
	};
	/*
		앞서 만들어진 Exclusive 용 데이터를 여기 함수에서
		Sort 을 한다.
	 */
	function sortByExclusive (result)	{
		var res = result.sort(function (a, b)	{
			return a.value < b.value ? 1 : -1;
		}).map(function (r)	{
			return r.key;
		});

		return { axis: 'x', data: res };
	};
	/*
		Exclusive 하게 보여지는데 필요한 데이터를 만드는 함수.
	 */
	function exclusive (data, genes)	{
		var temp = {},
				result = [],
				idx = 0;

		bio.iteration.loop(data, function (d)	{
			if (!temp[d.x])	{
				temp[d.x] = true;

				result.push({
					key: d.x,
					// Type & Gene 두개의 문자가 합쳐진 문자열로 Gene 개수만큼
					// 문자열을 만든다.
					value: [].fill(genes.length, '00').join('')
				});

				idx += 1;
			} else {
				temp[d.x] = temp[d.x];
			}

			typeToString(result[idx - 1], genes, d);
		});

		return model.exclusive = result, sortByExclusive(result);
	};
	/*
		그룹 명 별로 키값을 만들어 각각의 데이터를 분류하는 함수.
	 */
	function makeObjectByGroup (data)	{
		var obj = {};

		bio.iteration.loop(data, function (d)	{
			!obj[d.value] ? obj[d.value] = [d] : 
											obj[d.value].push(d);
		});

		return obj;
	};

	return function ()	{
		model = bio.initialize('landscapeSort');

		return {
			asc: byAsc,
			desc: byDesc,
			gene: byGene,
			group: byGroup,
			exclusive: exclusive,
		};
	};
};
function scaleSet ()	{
	'use strict';

	var model = {};
	/*
		가장 테두리가 되는 Form 태그를 만드는 함수. 
	 */
	function makeDiv ()	{
		var e = document.createElement('div');
				e.id = 'scale_set_div';

		return e;
	};
	/*
		비율값을 보여 줄 Input 태그를 만드는 함수
	 */
	function makeInput (value)	{
		var e = document.createElement('input');
				e.id = 'scale_set_input';
				e.value = value || '100%';

		return e;
	};		
	/*
		Option 버튼의 종류를 반환하는 함수.
	 */
	function getOptionType (className)	{
		return className.indexOf('caret') > -1 ? 
					 className.indexOf('up') > -1 ? 
					 'up' : 'down' : 'refresh';
	}
	/*
		Scale button 들에 대한 이벤트 함수.
	 */
	function scaleEvent (event)	{
		if (!model.change)	{
			return;
		}	

		var type = getOptionType(this.className),
				sTerm = parseInt(model.defaultValue * 0.1),
				sign = { up: 1, down: -1 }[type];
		// 실제 크기에 변경 값 적용.
		model.scaleValue = type !== 'refresh' ? type === 'up' ? 
		model.scaleValue + (sign * sTerm) : 
		model.scaleValue + (sign * sTerm) : 
		model.defaultValue; 
		// Input 태그에 보여질 비율 값 변경 적용.
		model.scaleRate = type !== 'refresh' ? type === 'up' ? 
		(model.scaleRate += model.termRate, model.scaleRate) : 
		(model.scaleRate -= model.termRate, model.scaleRate) : 
		model.defaultRate;
		// Input 태그 값 범위 제한.
		model.scaleRate = 
		model.defaultValue / 2 > model.scaleValue ? 
		(model.scaleRate += model.termRate, model.scaleRate) : 
		model.defaultValue * 2 < model.scaleValue ? 
		model.defaultRate * 2 : model.scaleRate;
		// 실제 크기 값 범위 제한.
		model.scaleValue = 
		model.defaultValue / 2 > model.scaleValue ? 
		model.defaultValue / 2 : 
		model.defaultValue * 2 < model.scaleValue ? 
		model.defaultValue * 2 : model.scaleValue;
		// Input 태그 값 변경 적용.
		model.input.value = model.scaleRate + '%';
		// Option type 과 현재 실제 값을 반환한다.
		model.change.call(this, event, { 
			type: type, value: model.scaleValue,
		});
	};
	/*
		비율 증감 버튼 및 초기화 버튼을 만드는 함수.
	 */
	function makeButtons ()	{
		var div = document.createElement('div'),
				btns = ['caret-up', 'caret-down', 'refresh'];

		div.id = 'scale_options';

		bio.iteration.loop(btns, function (btn)	{
			var i = document.createElement('i'),
					d = document.createElement('div'),
					b = document.createElement('button');

			b.className = 'scale-' + btn;		
			i.className = 'fa fa-' + btn + ' fa-lg';
			b.addEventListener('click', scaleEvent);

			b.appendChild(i);
			d.appendChild(b);
			div.appendChild(d);
		});

		return div;
	};	

	return function (opts)	{
		if (!opts.element)	{
			throw new Error ('Please, pass the element');
		}

		var dom = bio.dom().get(opts.element);
		// scale set 의 기본 값들.
		model = {
			unit: opts.unit || '%',
			change: opts.change || null,
			termRate : opts.termRate || 10,
			scaleRate: opts.defaultRate || 100,			// 변경 뷰 적용 값.
			defaultRate: opts.defaultRate || 100,		// 기본 뷰 적용 값.
			scaleValue : opts.defaultValue || 100,	// 변경 스케일 적용 값.
			defaultValue: opts.defaultValue || 100, // 기본 스케일 적용 값.
		};

		model.div = makeDiv();
		model.input = makeInput();
		model.buttons = makeButtons();
		model.div.appendChild(model.input);
		model.div.appendChild(model.buttons);

		dom.appendChild(model.div);
	};
};
function sortTitle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);

		bio.rendering().dropShadow(opts.element, 1, -0.1, 1);

		model.font = opts.style.fontSize + ' ' + 
								 opts.style.fontWeight;
		model.mostWidth = bio.drawing().mostWidth(
												opts.titles, model.font);
		model.mostHeight = bio.drawing().textSize.height(model.font);
		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'sort-title');

		if (model.id.indexOf('sample') > -1)	{
			model.group.attr(
				'transform', 'translate(0, 0) rotate(270)');
		}

		model.opts = {
			text: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.text.id = model.id + '_sorttitle_text';
		model.opts.text.element = 
		model.group.selectAll('#' + model.id + '_text');
		model.opts.shape.id = model.id + '_sorttitle_shape';
		model.opts.shape.element = 
		model.group.selectAll('#' + model.id + '_shape');

		bio.rectangle(model.opts.shape, model);
		bio.text(model.opts.text, model);
	};
};
/*
	BioChart 를 window 객체에 넣어주는 객체.
 */
// 초기 실행 시 window 객체를 넘겨받는다. window 객체가
// 존재하지 않을경우 빈 객체를 받는다.
(function (whole)	{
	'use strict';
	// Window 객체에 bio 라는 이름의 객체를 포함 시킨다.

	var bio = {
		// >>> Model.
		initialize: initialize(),
		// >>> Common.
		sizing: sizing(),
		layout: layout(),
		setting: setting(),
		boilerPlate: boilerPlate(),
		// >>> Configuration.
		commonConfig: commonConfig(),
		pathwayConfig: pathwayConfig(),
		variantsConfig: variantsConfig(),
		landscapeConfig: landscapeConfig(),
		expressionConfig: expressionConfig(),
		exclusivityConfig: exclusivityConfig(),
		// >>> Preprocess.
		preprocess: preprocess(),
		preprocPathway: preprocPathway(),
		preprocVariants: preprocVariants(),
		preprocLandscape: preprocLandscape(),
		preprocExpression: preprocExpression(),
		preprocExclusivity: preprocExclusivity(),
		// >>> Tools.
		modal: modal(),
		title: title(),
		table: table(),
		loading: loading(),
		tooltip: tooltip(),
		selectBox: selectBox(),
		// >>> Drawing.
		bar: bar(),
		text: text(),
		path: path(),
		heat: heat(),
		axises: axises(),
		circle: circle(),
		scales: scales(),
		needle: needle(),
		legend: legend(),
		drawing: drawing(),
		scatter: scatter(),
		network: network(),
		triangle: triangle(),
		survival: survival(),
		rectangle: rectangle(),
		rendering: rendering(),
		divisionLine: divisionLine(),
		// >>> Utilities.
		dom: dom(),
		math: math(),
		// >>> Events.
		handler: handler(),
		// strings 객체는 String 의 프로토 타입을 
		// 확장한 객체로 여기서 실행만 시켜놓고 따로 객체를 호출하거나
		// 인스턴스를 생성하지 않는다.
		strings: strings(), 
		objects: objects(),
		iteration: iteration(),
		dependencies: dependencies(),
		// >>> Expression.
		expression: expression(),
		colorGradient: colorGradient(),
		// >>> Exclusivity.
		exclusivity: exclusivity(),
		// >>> Landscape.
		scaleSet: scaleSet(),
		sortTitle: sortTitle(),
		landscape: landscape(),
		landscapeSort: landscapeSort(),
		// >>> Variants.
		variants: variants(),
		variantsNavi: variantsNavi(),
		variantsGraph: variantsGraph(),
		variantsPatient: variantsPatient(),
		// >>> Pathway.
		pathway: pathway(),
	};

	whole.bio = bio;
}(window||{}));
function initialize ()	{
	'use strict';
	// >>> Common.
	var SIZING = { ids: [], chart: {} };
	var SETTING = {
		idx: [],
		dom: null, 
		size: { width: 0, height: 0 },
	};
	var LAYOUT = {
		svg: {
			variants: {},
			landscape: {},
			expression: {},
			exclusivity: {},
		},
	};
	// >>> Preprocess.
	var PREPROCESS = {
		pathway: null,
		variants: {
			needle: { line: [], shape: [] },
			patient: { line: [], shape: [] },
			type: [],
			graph: [],
			axis: {
				needle: {x: [], y: []},
				now: { x: [], y: []},
			},
		},
		landscape: {
			type: {},
			group: { group: [], patient: [] },
			heatmap: [],
			patient: [],
			stack: { gene: {}, sample: {}, patient: {} },
			axis: {
				pq: { x: [], y: [] },
				gene: { x: [], y: [] },
				group: { x: [], y: [] },
				sample: { x: [], y: [] },
				heatmap: { x: [], y: [] },
				patient: { x: [], y: [] },
			},
		},
		expression: {
			func: {
				default: 'average',
				now: null,
				avg: [],
			},
			tpms: [],
			heatmap: [],
			scatter: {},
			subtype: [],
			survival: {},
			bar: [],
			axis: {
				gradient: { x: {}, y: {} },
				heatmap: { x: {}, y: {} },
				scatter: { x: {}, y: {} },
				bar: { x: {}, y: {} },
			},
		},
		exclusivity: {
			heatmap: {},
			network: {},
			type: {},
			survival: {
				merge: {},
				heat: {},
				data: {},
			},
			geneset: [],
			geneset_all: [],
			axis: {
				heatmap: {x: {}, y: {}},
				division: {x: {}, y: []},
			},
			divisionIdx: {},
		},
	};
	// >>> Tools.
	var LOADING = {};
	// >>> Expression.
	var EXPRESSION = {
		init: {
			function: 'Average',
			signature: null,
			color_mapping: null,
		},
		now: {
			function: null,
			signature: null,
			color_mapping: null,
			osdfs: 'os',
		},
		divide: {},
	};
	// >>> Exclusivity.
	var EXCLUSIVITY = { now : { geneset: null } };
	var COLORGRADIENT = { show: [], data: [] };
	// >>> Variants.
	var VARIANTS = { div: {} };
	var VARIANTSNAVI = { start: 0, end: 0 };
	// >>> Landscape.
	var LANDSCAPE = {
		div: {},
		init: {
			axis: { x: [], y: [] },
			width: 0,
			height: 0,
		},
		now: {
			sort: {
				gene: null,
				sample: null,
				pq: null,	
			},
			group: [],
			axis: { x: [], y: [] },
			width: 0,
			height: 0,
		},
		exclusive: { init: null },
	};
	var LANDSCAPESORT = { exclusive: [] };
	var LANDSCAPEHEATMAP = {
		mutationType: ['cnv', 'var'], 
		value: {}, 
		duplicate: [],
	};

	var set = {
		layout: LAYOUT,
		sizing: SIZING,
		setting: SETTING,
		preprocess: PREPROCESS,
		loading: LOADING,
		expression: EXPRESSION,
		exclusivity: EXCLUSIVITY,
		colorGradient: COLORGRADIENT,
		variants: VARIANTS,
		variantsNavi: VARIANTSNAVI,
		landscape: LANDSCAPE,
		landscapeSort: LANDSCAPESORT,
		landscapeHeatmap: LANDSCAPEHEATMAP,
	}

	return function (name)	{
		return bio.objects.clone(
					!set[name] ? {} : set[name]);
	};
};
function pathway ()	{
	'use strict';

	var model = {};
	/*
		Pathway svg file 을 contents 태그에 삽입한다.
	 */
	function addSVG (cancer, callback)	{
		bio.drawing().importSVG(
			'/data/pathway/' + cancer + '.svg', callback);
			// '/datas/' + cancer + '.svg', callback);
	};
	/*
		현재 노드에 속하는 데이터를 배열에서 찾는 함수.
	 */
	function isGene (text, data)	{
		var result = null;

		bio.iteration.loop(data, function (d)	{
			if (d.gene_id === text)	{
				result = { is: true, data: d };
			}
		});

		return !result ? { is: false, data: null } : 
						result;
	};

	function twinkle (rect, marker)	{
		console.log(marker, rect)
		if (marker > -1)	{
			var is = false;

			setInterval(function () {
				is = !is;

				rect.style('stroke', is ? '#ff0000' : '#333')
						.style('stroke-width', is ? 3 : 1);
			}, 500);
		}
	};

	function fillColor (elem, data, opt, marker)	{
		var config = bio.pathwayConfig().node();
		
		if (marker > -1)	twinkle(elem, marker);

		elem.attr('cursor', 'pointer')
				.style('fill', function (d)	{
					return config.style.fill.call(this, data)
				})
				.on('mouseover', function (d, i) { 
					config.on.mouseover.call(this, data, i, opt);
				})
				.on('mouseout', function (d, i)	{
					config.on.mouseout.call(this, data, i, opt);
				});
	};

	function defineIndex (parent)	{
		bio.iteration.loop(parent.childNodes, 
		function (i, child)	{
			if ((/gene_/i).test(child.id))	{
				d3.select(child).data({ 'index': i });
			}
		});
	};
	/*
		Pathway 의 노드에 값에 상응하는 색상을 입히는 함수.
	 */
	function colorGenes (data, patient)	{
		var texts = bio.dependencies.version.d3v4() ? 
								d3.selectAll('text').nodes() : 
								bio.drawing().nodes(d3.selectAll('text'));

		bio.iteration.loop(texts, function (txt)	{
			var gene = isGene(txt.textContent, data);

			if (gene.is || (/gene_/i).test(txt.parentNode.id)) {
				var rect = d3.select(txt.parentNode).select('rect'),
						marker = patient.indexOf(txt.textContent),
						opt = {
							x: parseInt(rect.attr('x')),
							y: parseInt(rect.attr('y')),
							width: parseInt(rect.attr('width')),
							height: parseInt(rect.attr('height')),
						};

				fillColor(rect, gene.data, opt, marker);
				fillColor(d3.select(txt), gene.data, opt);
			}
		});

		defineIndex(texts[0].parentNode.parentNode);

		d3.selectAll('text, rect').attr('class', '');
	};



	function drugEvent (cancerType)	{
		var config = bio.pathwayConfig().drug();

		d3.selectAll('g[id*="drug_"]')
			.datum(function (d)	{
				var transform = d3.select(this).attr('transform'),
						trans = bio.dependencies.version.d3v4() ? 
										bio.rendering().translation(transform) : 
										d3.transform(transform);

				return {
					cancer: cancerType,
					scaleX: trans.scale[0],
					scaleY: trans.scale[1],
					translateX: trans.translate[0],
					translateY: trans.translate[1],
				};
			})
			.on('click', config.on.click)
			.on('mouseover', config.on.mouseover)
			.on('mouseout', config.on.mouseout);
	};

	return function (opts)	{
		addSVG(opts.cancer_type, function (xml)	{
			bio.modal({
				id: 'drug_modal',
				element: document.querySelector(opts.element),
			});

			model = bio.initialize('pathway');
			model.setting = bio.setting('pathway', opts);
			model.data = model.setting.preprocessData;
			model.modalID = 'drug_modal';

			bio.title('#pathway_title', 
								opts.cancer_type.toUpperCase() + ' - Pathway');	

			var contents = document.getElementById(
											'pathway_contents'),
					modal = document.querySelector('.modal-body');
			
			d3.select(xml.documentElement)
				.attr('width', parseFloat(contents.style.width))
				.attr('height', parseFloat(contents.style.height));
			
			contents.appendChild(xml.documentElement);

			modal.style.height = 
			parseFloat(contents.style.height) * 0.8 + 'px';
			
			colorGenes(model.setting.defaultData.pathway,
								model.setting.defaultData.patient);
			drugEvent(opts.cancer_type);
		});

		console.log('>>> Pathway reponse data: ', opts);
		console.log('>>> Pathway setting data: ', model.setting);
		console.log('>>> Pathway model data: ', model);
	};
};
function preprocess ()	{
	'use strict';
	// bio 전역객체는 반드시 함수형태에서만 불러올 수 있다.
	return function (chart)	{
		return {
			pathway: bio.preprocPathway,
			variants: bio.preprocVariants,
			landscape: bio.preprocLandscape,
			expression: bio.preprocExpression,
			exclusivity: bio.preprocExclusivity,
		}[chart];
	};
};
function preprocExclusivity ()	{
	'use strict';

	var model = {};
	/*
		Gene list 를 만드는 함수.
	 */
	function makeGeneList (types)	{
		var result = {};

		bio.iteration.loop(types, function (type)	{
			result[type.gene] = ['.'];
		});

		return result;
	};
	/*
		Type 압축 함수.
	 */
	function toObjectTypes (types, geneList)	{
		var res = {};

		bio.iteration.loop(types, function (type)	{
			var name = bio.boilerPlate.variantInfo[type.type],
					abb = bio.exclusivityConfig().abbreviation(name),
					copy = bio.objects.clone(geneList);

			!res[type.participant_id] ? (copy[type.gene] = [abb],
			 res[type.participant_id] = copy, res) : 
			(res[type.participant_id][type.gene][0] === '.' ? 
 			 res[type.participant_id][type.gene] = [abb] : 
 			 res[type.participant_id][type.gene].push(abb), res);
		});

		return res;
	};
	/*
		Patient 와 Type 을 합치는 함수.
	 */
	function merged (patient, types)	{
		var geneList = makeGeneList(types),
				objTypes = toObjectTypes(types, geneList);

		bio.iteration.loop(patient, function (p)	{
			p.gene = objTypes[p.participant_id] ? 
							 objTypes[p.participant_id] : geneList;
		});

		model.survival.merge = patient;
	};
	/*
		Text 에서 Gene set name 을 찾아주는 함수.
	 */
	function getGeneset (text)	{
		return (/\[(\w+(\s|\]))+/g).exec(text)[0]
					.replace(/\[|\]/g, '').split(' ');
 	};
 	/*
 		'**color': '255 255 255' 를 일반 rgb 로 바꿔주는 함수.
 	 */
 	function toRGB (rgb)	{
 		return 'rgb(' + rgb.split(' ').join(',') + ')';
 	};
 	/*
 		Legend object 에 빈 배열을 할당한다.
 	 */
 	function toLegend (geneset)	{
 		return model.type[geneset.join(' ')] = [];
 	};

 	function forHeatmap (data)	{
		var genesets = data.matchAll(model.regex.geneset),
				heats = data.matchAll(model.regex.heatmap),
				config = bio.exclusivityConfig(),
				heatIdx = 0;

		bio.iteration.loop(genesets, function (geneset)	{
			var set = geneset.replace(/\[|\]/g, '').split(' '),
					setLen = set.length + heatIdx,
					setText = set.join(' '),
					legend = toLegend(set),
					heat = [];

			model.heatmap[setText] = [];
			model.axis.heatmap.x[setText] = [];
			model.axis.heatmap.y[setText] = set;
			model.axis.division.x[setText] = [];
			model.divisionIdx[setText] = { idx: 0 };

			for (var i = 0, l = heats[0].length; i < l; i++)	{
				model.axis.heatmap.x[setText].push('' + i);
				model.axis.division.x[setText].push('' + i);
			}

			for (;heatIdx < setLen; heatIdx++)	{
				bio.iteration.loop(heats[heatIdx].split(''), 
				function (variants, idx)	{

					bio.iteration.loop(config.separate(variants), 
					function (vars)	{
						vars = config.name(vars);

						model.heatmap[setText].push({
							x: idx, 
							y: set[heatIdx >= set.length ? 
										 heatIdx - (setLen - set.length) : heatIdx], 
							value: vars
						});

						legend.indexOf(vars) < 0 ? legend.push(vars) : 
						legend = legend;
					});

					model.divisionIdx[setText].idx = variants !== '.' ? 
					model.divisionIdx[setText].idx > idx ? 
					model.divisionIdx[setText].idx : idx : 
					model.divisionIdx[setText].idx;
				});		

				heat.push(heats[heatIdx]);
			}

			model.geneset.push(set);
			model.geneset_all = 
			model.geneset_all.concat(set);
			model.survival.heat[setText] = heat;
		});

		var temp = model.geneset[4];

		model.geneset[4] = model.geneset[0];
		model.geneset[0] = temp;
	};

	function formatForNetwork (value)	{
		var result = [];

		bio.iteration.loop(value, function (v)	{
			var obj = {};

			v = v.replace(new RegExp(/\t|\s{2,}|\s(?=\D)/, 'ig'), '\t')

			bio.iteration.loop(v.split('\t'), function (vs)	{
				var vss = vs.split(':');

				obj[vss[0]] = vss[0].indexOf('color') < 0 ? 
											vss[1] : toRGB(vss[1]);
			});

			result.push(obj);
		});

		return result;
	};
	/*
		Network 차트 데이터 형식 변환 함수.
	 */
	function dataForNetwork (result)	{
		var id = null;

		bio.iteration.loop(result, function (key, value)	{
			model.network[key] = formatForNetwork(value);

			bio.iteration.loop(model.network[key], 
			function (net)	{
				if (net.type === 'compound')	{
					id = net.id;

					net.bgcolor = net.bgcolor.replace('\"', '');
					net.textcolor = net.textcolor.replace('\"', '');
				}	else if (net.type === 'edge')	{
					net.source = net.source.replace(id, '');
					net.target = net.target.replace(id, '');
					net.linecolor = net.linecolor.replace('\"', '');
				} else if (net.type === 'node')	{
					net.bgcolor = net.bgcolor.replace('\"', '');
				}	
			});
		});
	};

	function forNetwork (nets)	{
		var result = {};

		nets = nets.replace(/\\n{1}/g, '\n');
		nets = nets.replace(/\\t{1}/g, '\t');

		bio.iteration.loop(nets.split('\n'), function (n)	{
			bio.iteration.loop(model.geneset, function (gs)	{
				var joined = gs.join('');

				if (n.indexOf(joined) > -1)	{
					result[joined] ? result[joined].push(n) : 
													 result[joined] = [n];
				}
			});
		});

		dataForNetwork(result);
	};
	/*
		Survival data 를 찾기위한 기준인 survival 문자를 배열에서 찾아 치환한다.
	 */
	function transferType (arr)	{
		if (arr.indexOf('A') > -1 && arr.indexOf('M') > -1)	{
			return 'B';
		} else if (arr.indexOf('D') > -1 && arr.indexOf('M') > -1)	{
			return 'E';
		} else {
			return arr[0];
		}
	};

	function forSurvival (suvs)	{
		var hasPat = {};

		bio.iteration.loop(model.survival.heat, 
		function (key, value)	{
			var idx = model.axis.heatmap.x[key].length,
					ldx = key.split(' '),
					all = !model.survival.data[key] ? 
								 model.survival.data[key] = [] : 
								 model.survival.data[key],
					pat = hasPat[key] = {};

			for (var i = 0; i < idx; i++)	{
				model.survival.merge.some(function (m)	{
					var isType = true;

					for (var l = 0, ll = ldx.length; l < ll; l++)	{
						if (transferType(m.gene[ldx[l]]) !== value[l][i])	{
							isType = false;
						}
					}

					if (isType)	{
						if (pat[m.participant_id] === undefined)	{
							pat[m.participant_id] = '';
							all[i] = m;

							return all[i] !== undefined;
						}
					}
				});
			}
		});
	};

	return function (data)	{
		model = {};
		model = bio.initialize('preprocess').exclusivity;
		model.regex = {
			geneset: new RegExp(/\[\w+(\s\w+)+\w+\]/, 'g'),
			heatmap: new RegExp(/(A|B|D|E|M|\.){10,}/, 'g'),
		};

		merged(data.survival.patient, data.survival.types);
		forHeatmap(data.heatmap);
		forNetwork(data.network);
		forSurvival(data.survival);

		model.mostGeneWidth = 
		bio.drawing().mostWidth(model.geneset_all, '12px');

		console.log('>>> Preprocess exclusivity data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};
function preprocExpression ()	{
	'use strict';

	var model = {};
	/*
		Scatter plot 과 Survival plot 을 그리는 데 필요한
		Month 데이터를 만든다.
	 */
	function getMonths (patients)	{
		model.axis.scatter.y = { os: [], dfs: [] };
		model.patient_subtype = {};

		bio.iteration.loop(patients, function (p)	{
			model.axis.scatter.y.os.push(p.os_days / 30);
			model.axis.scatter.y.dfs.push(p.dfs_days / 30);
			// Patient subtype object list 를 만든다.
			model.patient_subtype[p.participant_id] = p;
		});

		var osmn = bio.math.min(model.axis.scatter.y.os),
				osmx = bio.math.max(model.axis.scatter.y.os),
				dfsmn = bio.math.min(model.axis.scatter.y.dfs),
				dfsmx = bio.math.max(model.axis.scatter.y.dfs);

		model.axis.scatter.y.os = [osmn, osmx];
		model.axis.scatter.y.dfs = [dfsmn, dfsmx];
	};
	/*
		Subtype 에 따른 값을 정리해주는 함수.
	 */
	function tempSubtypes (subtypes)	{
		var obj = {};

		bio.iteration.loop(subtypes, function (s)	{
			!obj[s.subtype] ? 
			 obj[s.subtype] = [s.value] : 
			 obj[s.subtype].push(s.value);
		});

		return obj;
	};
	/*
		Subtype list 를 만드는 함수.		
	 */
	function getSubtype (subtypes)	{
		var temp = tempSubtypes(subtypes);

		bio.iteration.loop(temp, function (key, value)	{
			model.subtype.push({ key: key, value: value });
		});
	};
	/*
		Tpm 에 자연로그를 취해주는 함수.
	 */
	function toLog (tpm)	{
		return Math.log((tpm + 1)) / Math.LN2;
	};
	/*
		Sample 별로 gene 들의 tpm 값의 합을 저장하는 배열을 만든다.
	 */
	function tpmBySample (a) {
		model.axis.heatmap.x[a.participant_id] ? 
		model.axis.heatmap.x[a.participant_id].push({
			key: a.hugo_symbol, value: a.tpm }) : 
		model.axis.heatmap.x[a.participant_id] = [{
			key: a.hugo_symbol, value: a.tpm }];
	};
	/*
		Color Gradient 을 그려주기 위한 tpm 의 최소, 최대값을 구한다.
	 */
	function tpmMinMax (tpms)	{
		model.axis.gradient.x = [
			bio.math.min(tpms), bio.math.median(tpms),
			bio.math.max(tpms)
		];
		model.axis.gradient.y = [''];
	};
	/*
		Function 이 Average 일 때 호출되는 함수.
	 */
	function funcAverage (data)	{
		bio.iteration.loop(data, function (key, value)	{
			var sum = 0,
					avg = 0;

			bio.iteration.loop(value, function (v)	{
				model.axis.heatmap.y[v.key] = '';

				sum += v.value;
			});

			avg = sum / value.length;

			model.bar.push({
				x: key, 
				value: avg, 
				info: model.patient_subtype[key]
			});

			model.func.avg.push(avg);
		});

		model.func.avg.sorted = 
		model.func.avg.sort(function (a, b)	{
			return a > b ? 1 : -1;
		});

		model.axis.bar.y = [
			bio.math.min(model.func.avg),
			bio.math.median(model.func.avg),
			bio.math.max(model.func.avg)];
	};
	/*
		Function 에 따른 최소, 중간, 최대값을 구한다. 
	 */
	function funcMinMedMax (func, data)	{
		return { average: funcAverage(data) }[func];
	};
	/*
		Average function 으로 데이터를 정렬한다.
	 */
	function avgAlign (bars)	{
		var avg = [].concat(model.func.avg),
				result = [];

		bio.iteration.loop(bars, function (b)	{
			result[avg.indexOf(b.value)] = b.x;
		});

		model.axis.heatmap.x = result;
	};
	/*
		Sample 의 순서를 function 대로 재설정하는 함수.
	 */
	function funcAlignment (func, bars)	{
		return { average: avgAlign(bars) }[func];
	};
	/*
		전체 Cohort 리스트에서 값의 합, 최소 & 최대값을 만든다.
	 */
	function loopCohort (alls)	{
		var func = model.func.now || model.func.default;

		bio.iteration.loop(alls, function (a)	{
			a.tpm = toLog(a.tpm + 1);

			tpmBySample(a);

			model.tpms.push(a.tpm);
			model.heatmap.push({
				x: a.participant_id,
				y: a.hugo_symbol,
				value: a.tpm,
			});
		});

		tpmMinMax(model.tpms);
		funcMinMedMax(func, model.axis.heatmap.x);
		funcAlignment(func, model.bar);

		model.axis.heatmap.y = Object.keys(model.axis.heatmap.y);
		model.axis.scatter.x = model.axis.heatmap.x;
		model.axis.bar.x = model.axis.heatmap.x;
	};
	/*
		Patient 데이터를 만들며, 어느 그룹에 속하는지를 결정한다.
	 */
	function toPatient (patient)	{
		var mut = model.axis.bar.y[1],
				pat = model.func.avg[model.axis.bar.x.indexOf(patient)];

		return mut >= pat ? 'Low score group' : 'High score group';
	};
	/*
		Axis 중 가장 긴 문자열을 왼쪽 여백 값으로 한다.
	 */
	function getAxisMargin (yaxis)	{
		var most = 0;

		bio.iteration.loop(yaxis, function (ya)	{
			var textWidth = bio.drawing().textSize.width(ya, '10px');
			
			most = most > textWidth ? most : textWidth;
		});

		return most;
	};

	return function (data)	{
		model = {};
		model = bio.initialize('preprocess').expression;

		model.all_rna_list = [].concat(
			 data.cohort_rna_list.concat(data.sample_rna_list));

		model.genes = data.gene_list.map(function (gl)	{
			return gl.hugo_symbol;
		});

		getMonths(data.patient_list);
		getSubtype(data.subtype_list);
		loopCohort(model.all_rna_list);

		model.patient = {
			name: data.sample_rna_list[0].participant_id,
			data: toPatient(data.sample_rna_list[0].participant_id),
		};

		bio.iteration.loop(model.bar, function (b)	{
			b.y = model.axis.bar.y[1];
		});

		model.axisMargin = getAxisMargin(model.axis.heatmap.y);

		console.log('>>> Preprocess variants data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};
function preprocLandscape ()	{
	'use strict';

	var model = {};
	/*
		Sample, Patient 의 가로 방향 축 데이터를 만드는 함수.
	 */
	function makeXAxis (axis, data)	{
		if (axis.indexOf(data) < 0)	{
			axis.push(data);
		}
	};
	/*
		Heatmap 데이터 포맷을 설정해주는 함수.
	 */
	function heatmapDataFormat (heatmap, data)	{
		heatmap.push({
			x: data.participant_id,
			y: data.gene,
			value: data.type,
		});
	};
	/*
		기준이 되는 값에 해당되는 value 들을 key - value 
		형태의 Object 로 만드는 함수.
	 */
	function nested (obj, std, value)	{
		obj[std] = !obj[std] ? {} : obj[std];
		obj[std][value] = obj[std][value] ? 
		obj[std][value] + 1 : 1;
	};
	/*
		Mutation 과 Patient 의 리스트를 공통으로
		묶어낸 함수.
	 */
	function iterateCommon (arr, callback)	{
		bio.iteration.loop(arr, function (d, i)	{
			// Type 의 이름표기를 통합시킨다.
			d.type = bio.commonConfig().typeFormat(d.type);
			// Type name object 를 만든다.
			model.type[d.type] = null;

			callback(d, i);
		});

		model.isIterateCommonOk = true;
	};
	/*
		Mutation list 를 반복하며,
		type list, mutation list, gene, sample 데이터를 만든다.
	 */
	function iterateMutation (mutation)	{
		iterateCommon(mutation, function (d)	{
			// Stacked bar chart 를 위한 데이터 생성.
			nested(model.stack.gene, d.gene, d.type);
			nested(model.stack.sample, d.participant_id, d.type);
			
			heatmapDataFormat(model.heatmap, d);

			makeXAxis(model.axis.sample.x, d.participant_id);
		});
	};
	/*
		Patient list 를 반복하며,
		Sample, Heatmap 에 들어가는 환자 데이터를 만든다.
	 */
	function iteratePatient (patient)	{
		iterateCommon(patient, function (d)	{
			// Patient 의 stacked bar chart 데이터 생성.
			nested(model.stack.patient, d.participant_id, d.type);
			heatmapDataFormat(model.patient, d);

			makeXAxis(model.axis.patient.x, d.participant_id);
		});
	};
	/*
		Group list 를 반복하며,
		Clinical list 데이터를 만든다.
	 */
	function iterateGroup (group)	{
		bio.iteration.loop(group, function (g)	{
			var temp = [];

			bio.iteration.loop(g.data, function (d)	{
				var heat = [];

				bio.iteration.loop(model.heatmap, function (h)	{
					// Group 에 포함된 sample 들을 모은다.
					// 나중에 Group sort 를 위함이다.
					if (d.participant_id === h.x)	{
						heat.push(h);
					}
				});

				temp.push({
					x: d.participant_id, y: g.name,
					value: d.value, info: heat,
				});
			});

			model.group.group.push(temp);
			// 각각의 Clinical 값을 한 행으로 처리.
			model.axis.group.y.push([g.name]);
			// Patient 의 Clinical info 는 없으므로 'NA' 로 처리.
			model.group.patient.push({
				x: model.axis.patient.x[0],
				y: g.name, value: 'NA',
			});
		});
	};
	/*
		PQ 관련 리스트를 반복하며, PQ 데이터를 만든다.
	 */
	function iteratePQ (pq, what)	{
		return pq.map(function (d)	{
			// P-value 또는 Q-value 에 log 값을 취하고 반환하는 함수.
			var toLog = Math.log(d[what]) / Math.log(12) * -1;

			return { x: 0, y: d.gene, value: toLog };
		});
	};
	/*
		Gene, Sample, Patient 가 각각 x, y 를 기준으로 하는 것이
		다르므로 이를 해당 함수에서 정해준다.
	 */
	function stackFormat (type, d1, d2, value, idx)	{
		return type === 'gene' ? 
					{ x: d1, y: d2, value: value, info: idx } : 
					{ x: d2, y: d1, value: value, info: idx };
	};
	/*
		Type 파라미터에 기준하여 stacked 데이터를 만드는 함수.
	 */
	function byStack (type, stacked)	{
		var result = [],
				axis = type === 'gene' ? 'x' : 'y';

		bio.iteration.loop(stacked, function (key, value)	{
			var before = 0,
					sumed = 0;

			bio.iteration.loop(value, function (vkey, vvalue)	{
				result.push(stackFormat(
					type, before, key, vvalue, vkey));
				// 현재 위치를 구하기 위해 이전 시작지점 + 이전 값을 구한다.
				before += vvalue;
				// axix 의 최대값을 구하기 위한 연산.
				sumed += vvalue;
			});

			model.axis[type][axis].push(sumed);
		});

		return result;
	};
	/*
		[min, max] 배열을 반환하는 함수.
	 */
	function makeLinearAxis ()	{
		model.axis.gene.x = [bio.math.max(model.axis.gene.x), 0];
		model.axis.sample.y = [
			bio.math.max(model.axis.patient.y, 
			bio.math.max(model.axis.sample.y)), 0
		];
		model.axis.pq.x = [
			0, bio.math.max(model.pq.map(function (pq)	{
				return Math.ceil(pq.value);
		}))];
	};	
	/*
		Axis 의 서수 리스트를 반환하는 함수.
	 */
	function makeOrdinalAxis ()	{
		model.axis.pq.y = 
		model.axis.gene.y = 
		model.axis.heatmap.y = model.gene;
		model.axis.heatmap.x = 
		model.axis.group.x = model.axis.sample.x;
	};

	return function (data)	{
		model = bio.initialize('preprocess').landscape;
		// Data 안에 다른 객체가 존재할 경우 그 안을 찾아본다.
		data = data.gene_list ? data : data.data;
		// Only Gene list.
		model.gene = data.gene_list.map(function (d)	{
			return d.gene;
		});
		// Mutation, Sample, Gene, Group, Patient 데이터 생성.
		iterateMutation(data.mutation_list);
		iteratePatient(data.patient_list);
		iterateGroup(data.group_list);

		model.type = Object.keys(model.type);
		// 전달받은 PQ 선정 값이 없을 경우 기본은 P-value 이다.
		model.pq = iteratePQ(data.gene_list, data.pq || 'p');
		model.stack.gene = byStack('gene', model.stack.gene);
		model.stack.sample = byStack('sample', model.stack.sample);
		model.stack.patient = byStack('patient', model.stack.patient);
		// Axis 데이터를 만들어준다.
		makeLinearAxis();
		makeOrdinalAxis();

		console.log('>>> Preprocess landscape data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};
function preprocPathway ()	{
	'use strict';

	var model = {};

	return function (data)	{
		console.log('>>> Preprocess pathway data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};
function preprocVariants ()	{
	'use strict';

	var model = {};
	/*
	 	Stack 데이터를 needle plot 을 그리기 좋은 형태로 만들어 주는 함수.
	 */
	function optimizeToDraw (obj, target)	{
		bio.iteration.loop(obj, function (key, value)	{
			var count = 0,
					temp = { 
						key: key, 
						value: [ { x: parseFloat(key), y: count, value: 0 } 
					]};
			// 0 이 들어가야 하므로 한번 설정하였다.
			model.axis.needle.y.push(count);

			bio.iteration.loop(value, function (vKey, vValue)	{
				temp.value.push({
					x: parseFloat(key),
					y: (count = count + vValue.length, count),
					value: vValue.length,
					info: vValue,
				});
			});

			model.axis.needle.y.push(count);

			target.push(temp);
		});
	};
	/*
		Needle plot 을 그리기 위해선 stack 형식의 데이터가 필요하다.
	 */
	function toStack (datas, target)	{
		var obj = {};

		bio.iteration.loop(datas, function (d)	{
			d.type = bio.commonConfig().typeFormat(d.type);

			var str = d.position + ' ' + d.type + ' ' + d.aachange;

			obj[d.position] ? obj[d.position][str] ? 
			obj[d.position][str].push(d) : 
			obj[d.position][str] = [d] : 
		 (obj[d.position] = {}, obj[d.position][str] = [d]);

		 	if (model.type.indexOf(d.type) < 0)	{
		 		model.type.push(d.type);
		 	}
		});

		optimizeToDraw(obj, target);
	};
	/*
		Graph 의 데이터 설정 함수.
	 */
	function toGraph (graphs)	{
		bio.iteration.loop(graphs, function (graph, i)	{
			model.graph.push({
				x: graph.start, y: 0,
				width: graph.end - graph.start, height: 15,
				color: graph.colour, info: graph,
			});
		});
	};
	/*
		Needle Plot & Graph 를 그릴 때 사용되는 축 데이터를 설정 함수.
	 */
	function setAxis (graph)	{
		model.axis.needle.x = [0, graph[0].length];
		model.axis.needle.y = 
		model.axis.needle.y.length < 1 ? [0, 1] : 
		[bio.math.min(model.axis.needle.y), 
		 bio.math.max(model.axis.needle.y)];
	};
	/*
		Shape 를 그리기 위해 Stacked 데이터를 펼치는 함수.
	 */
	function forShape (lines, shapes)	{
		bio.iteration.loop(lines, function (l)	{
			bio.iteration.loop(l.value, function (v, i)	{
				if (v.info) {
					// v.info 가 없는 경우는 0 인 경우뿐이므로.
					// 따로 0 인 조건 검사 없이 연산을 한다.
					v.value = v.y - l.value[i - 1].y;

					shapes.push(v);
				}
			});
		});
	};

	return function (data)	{
		model = bio.initialize('preprocess').variants;

		toStack(data.variants.public_list, model.needle.line);
		toStack(data.variants.patient_list, model.patient.line);
		toGraph(data.variants.graph);
		setAxis(data.variants.graph);
		forShape(model.needle.line, model.needle.shape);
		forShape(model.patient.line, model.patient.shape);

		console.log('>>> Preprocess variants data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};
// /*
//  * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
//  *
//  * This library is distributed in the hope that it will be useful, but WITHOUT
//  * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
//  * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
//  * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
//  * obligations to provide maintenance, support, updates, enhancements or
//  * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
//  * liable to any party for direct, indirect, special, incidental or
//  * consequential damages, including lost profits, arising out of the use of this
//  * software and its documentation, even if Memorial Sloan-Kettering Cancer
//  * Center has been advised of the possibility of such damage.
//  */

// /*
//  * This file is part of cBioPortal.
//  *
//  * cBioPortal is free software: you can redistribute it and/or modify
//  * it under the terms of the GNU Affero General Public License as
//  * published by the Free Software Foundation, either version 3 of the
//  * License.
//  *
//  * This program is distributed in the hope that it will be useful,
//  * but WITHOUT ANY WARRANTY; without even the implied warranty of
//  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  * GNU Affero General Public License for more details.
//  *
//  * You should have received a copy of the GNU Affero General Public License
//  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
// */

// var SurvivalCurveBroilerPlate = {
// 	elem : {
// 	    svg 				 : "",
// 	    xScale 			 : "",
// 	    yScale 		   : "",
// 	    xAxis 			 : "",
// 	    yAxis 			 : "",
// 	    line 				 : "", 
// 	    curve 			 : "",
// 	    dots 				 : [], //The invisible dots laied on top of the curve for mouse over effect
// 	    censoredDots : "" 
// 	},
// 	settings : {
// 	    // canvas_width: 1005,
// 	    // canvas_height: 620,
// 	    // Modified.
// 		canvas_width 			 : 500  ,
// 		canvas_height 		 : 500  ,
// 	    // chart_width: 600,
// 	    // chart_height: 500,
// 	    // Modified.
// 		chart_width 			 : 500  ,
// 	  chart_height 			 : 500	,
// 	    // chart_left: 100,
// 	    // chart_top: 50,
// 	    // Modified.
// 	  chart_left 				 : 70		,
// 	  chart_top 				 : 25		,
// 	  include_info_table : false, //Statistic Results from the curve
// 		include_legend 		 : true ,
// 		include_pvalue 		 : true ,
// 		// pval_x: 710,
// 		// pval_y: 110
// 		// Modified.
// 		pval_x 						 : 85		,
// 		pval_y 						 : 57
// 	},
// 	divs : {
// 		curveDivId     : "",
// 		headerDivId 	 : "",
// 		infoTableDivId : ""
// 	},
// 	subGroupSettings : {
// 		line_color 			: "red" 	 ,
// 		mouseover_color : "#F5BCA9",
// 		legend 					: "" 			 ,
//     curveId  				: ''//curve unique ID
// 	},
// 	text : {
// 	  xTitle : "",
// 	  yTitle : "",
// 		qTips  : {
// 			estimation    : "", //example: Survival Estimate: 69.89%
// 			censoredEvent : "", //example: Time of last observation: 186.7 (months)
// 			failureEvent  : "" //example: Time of death: 86.2 (months)
// 		},
// 		infoTableTitles : {
// 			total_cases 				: "#total cases",
// 			num_of_events_cases : "" 						,
// 			median 							: ""
// 		},
// 		pValTitle 						: 'Logrank Test P-Value: '
// 	},
// 	style : {
// 	  censored_sign_size : 5   		,
// 	  axis_stroke_width  : 1   		,
// 	    // axisX_title_pos_x: 380,
// 	    // axisX_title_pos_y: 600,
// 	    // axisY_title_pos_x: -270,
// 	    // axisY_title_pos_y: 45,
// 	    // Modified.
// 	  axisX_title_pos_x  : 260 		 ,
// 	  axisX_title_pos_y  : 495 		 ,
// 	  axisY_title_pos_x  : -250		 ,
// 	  axisY_title_pos_y  : 25      ,
// 	  axis_color 				 : "black" ,
// 		pval_font_size 		 : 12 		 ,
// 		pval_font_style 	 : 'normal'
// 	},
// 	vals : {
// 		pVal : 0
// 	}	
// };

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var SurvivalCurveBroilerPlate = {
	elem : {
	    svg 				 : "",
	    xScale 			 : "",
	    yScale 		   : "",
	    xAxis 			 : "",
	    yAxis 			 : "",
	    line 				 : "", 
	    curve 			 : "",
	    dots 				 : [], //The invisible dots laied on top of the curve for mouse over effect
	    censoredDots : "" 
	},
	settings : {
	    // canvas_width: 1005,
	    // canvas_height: 620,
	    // Modified.
		// canvas_width 			 : 500  ,
		// canvas_height 		 : 500  ,
		canvas_width 			 : 400  ,
		canvas_height 		 : 400  ,
	    // chart_width: 600,
	    // chart_height: 500,
	    // Modified.
		// chart_width 			 : 500  ,
	 //  chart_height 			 : 500	,
	 	chart_width 			 : 370  ,
  	chart_height 			 : 370	,
	    // chart_left: 100,
	    // chart_top: 50,
	    // Modified.
	  // chart_left 				 : 70		,
	  chart_left 				 : 50		,
	  chart_top 				 : 25		,
	  include_info_table : false, //Statistic Results from the curve
		include_legend 		 : true ,
		include_pvalue 		 : true ,
		// pval_x: 710,
		// pval_y: 110
		// Modified.
		pval_x 						 : 220		,
		pval_y 						 : 57
	},
	divs : {
		curveDivId     : "",
		headerDivId 	 : "",
		infoTableDivId : ""
	},
	subGroupSettings : {
		line_color 			: "red" 	 ,
		mouseover_color : "#F5BCA9",
		legend 					: "" 			 ,
    curveId  				: ''//curve unique ID
	},
	text : {
	  xTitle : "",
	  yTitle : "",
		qTips  : {
			estimation    : "", //example: Survival Estimate: 69.89%
			censoredEvent : "", //example: Time of last observation: 186.7 (months)
			failureEvent  : "" //example: Time of death: 86.2 (months)
		},
		infoTableTitles : {
			total_cases 				: "#total cases",
			num_of_events_cases : "" 						,
			median 							: ""
		},
		pValTitle 						: 'Logrank Test P-Value: '
	},
	style : {
	  censored_sign_size : 5   		,
	  axis_stroke_width  : 1   		,
	    // axisX_title_pos_x: 380,
	    // axisX_title_pos_y: 600,
	    // axisY_title_pos_x: -270,
	    // axisY_title_pos_y: 45,
	    // Modified.
	  axisX_title_pos_x  : 260 		 ,
	  axisX_title_pos_y  : 30 		 ,
	  axisY_title_pos_x  : 10		 ,
	  axisY_title_pos_y  : 10      ,
	  axis_color 				 : "black" ,
		pval_font_size 		 : 12 		 ,
		pval_font_style 	 : 'normal'
	},
	vals : {
		pVal : 0
	}	
};


/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (cbio === undefined)
{
	var cbio = {};
}

cbio.util = (function() {

    var toPrecision = function(number, precision, threshold) {
        // round to precision significant figures
        // with threshold being the upper bound on the numbers that are
        // rewritten in exponential notation

        if (0.000001 <= number && number < threshold) {
            return number.toExponential(precision);
        }

        var ret = number.toPrecision(precision);
        //if (ret.indexOf(".")!==-1)
        //    ret = ret.replace(/\.?0+$/,'');

        return ret;
    };

    var getObjectLength = function(object) {
        var length = 0;

        for (var i in object) {
            if (Object.prototype.hasOwnProperty.call(object, i)){
                length++;
            }
        }
        return length;
    };

    var checkNullOrUndefined = function(o) {
        return o === null || typeof o === "undefined";
    };

    // convert from array to associative array of element to index
    var arrayToAssociatedArrayIndices = function(arr, offset) {
        if (checkNullOrUndefined(offset)) offset=0;
        var aa = {};
        for (var i=0, n=arr.length; i<n; i++) {
            aa[arr[i]] = i+offset;
        }
        return aa;
    };

    var uniqueElementsOfArray = function(arr) {
        var ret = [];
        var aa = {};
        for (var i=0, n=arr.length; i<n; i++) {
            if (!(arr[i] in aa)) {
                ret.push(arr[i]);
                aa[arr[i]] = 1;
            }
        }
        return ret;
    };

    var alterAxesAttrForPDFConverter = function(xAxisGrp, shiftValueOnX, yAxisGrp, shiftValueOnY, rollback) {

        // To alter attributes of the input D3 SVG object (axis)
        // in order to prevent the text of the axes from moving up
        // when converting the SVG to PDF
        // (TODO: This is a temporary solution, need to debug batik library)
        //
        // @param xAxisGrp: the x axis D3 object
        // @param shiftValueOnX: increased/decreased value of the x axis' text vertical position of the text of x axis
        //                       before/after conversion
        // @param yAxisGrp: the y axis D3 object
        // @param shiftValueOnY: increased/decreased value of the y axis' text vertical position of the text of x axis
        //                       before/after conversion
        // @param rollback: the switch to control moving up/down the axes' text (true -> move up; false -> move down)
        //

        if (rollback)
        {
            shiftValueOnX = -1 * shiftValueOnX;
            shiftValueOnY = -1 * shiftValueOnY;
        }

        var xLabels = xAxisGrp
            .selectAll(".tick")
            .selectAll("text");

        var yLabels = yAxisGrp
            .selectAll(".tick")
            .selectAll("text");

        // TODO:
        // shifting axis tick labels a little bit because of
        // a bug in the PDF converter library (this is a hack!)
        var xy = parseInt(xLabels.attr("y"));
        var yy = parseInt(yLabels.attr("y"));

        xLabels.attr("y", xy + shiftValueOnX);
        yLabels.attr("y", yy + shiftValueOnY);
    };

    /**
     * Determines the longest common starting substring
     * for the given two strings
     *
     * @param str1  first string
     * @param str2  second string
     * @return {String} longest common starting substring
     */
    var lcss = function (str1, str2)
    {
        var i = 0;

        while (i < str1.length && i < str2.length)
        {
            if (str1[i] === str2[i])
            {
                i++;
            }
            else
            {
                break;
            }
        }

        return str1.substring(0, i);
    };

	/**
	 * Converts base 64 encoded string into an array of byte arrays.
	 *
	 * @param b64Data   base 64 encoded string
	 * @param sliceSize size of each byte array (default: 512)
	 * @returns {Array} an array of byte arrays
	 */
	function b64ToByteArrays(b64Data, sliceSize) {
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		return byteArrays;
	}

	/**
	 * Detects browser and its version.
	 * This function is implemented as an alternative to the deprecated jQuery.browser object.
	 *
	 * @return {object} browser information as an object
	 */
	var detectBrowser = function ()
	{
		var browser = {};
		var uagent = navigator.userAgent.toLowerCase();

		browser.firefox = /mozilla/.test(uagent) &&
		                  /firefox/.test(uagent);

		browser.mozilla = browser.firefox; // this is just an alias

		browser.chrome = /webkit/.test(uagent) &&
		                 /chrome/.test(uagent);

		browser.safari = /applewebkit/.test(uagent) &&
		                 /safari/.test(uagent) &&
		                 !/chrome/.test(uagent);

		browser.opera = /opera/.test(uagent);

		browser.msie = /msie/.test(uagent);

		browser.version = "";

		// check for IE 11
		if (!(browser.msie ||
		      browser.firefox ||
		      browser.chrome ||
		      browser.safari ||
		      browser.opera))
		{
			// TODO probably we need to update this for future IE versions
			if (/trident/.test(uagent))
			{
				browser.msie = true;
				browser.version = 11;
			}
		}

		if (browser.version === "")
		{
			for (var x in browser)
			{
				if (browser[x])
				{
					browser.version = uagent.match(new RegExp("(" + x + ")( |/)([0-9]+)"))[3];
					break;
				}
			}
		}

		return browser;
	};

	/**
	 * Retrieves the page origin from the global window object. This function is
	 * introduced to eliminate cross-browser issues (window.location.origin is
	 * undefined for IE)
	 */
	var getOrigin = function()
	{
		var origin = window.location.origin;

		if (!origin)
		{
			origin = window.location.protocol + "//" +
			         window.location.hostname +
			         (window.location.port ? ':' + window.location.port: '');
		}

		return origin;
	};

        var sortByAttribute = function(objs, attrName) {
            function compare(a,b) {
                if (a[attrName] < b[attrName])
                    return -1;
                if (a[attrName] > b[attrName])
                    return 1;
                return 0;
            }
            objs.sort(compare);
            return objs;
        };

	/**
	 * Replaces problematic characters with an underscore for the given string.
	 * Those characters cause problems with the properties of an HTML object,
	 * especially for the id and class properties.
	 *
	 * @param property  string to be modified
	 * @return {string} safe version of the given string
	 */
	var safeProperty = function(property)
	{
		return property.replace(/[^a-zA-Z0-9-]/g,'_');
	};

	/**
	 * Hides the child html element on mouse leave, and shows on
	 * mouse enter. This function is designed to hide a child
	 * element within a parent element.
	 *
	 * @param parentElement target of mouse events
	 * @param childElement  element to show/hide
	 */
	function autoHideOnMouseLeave(parentElement, childElement)
	{
		$(parentElement).mouseenter(function(evt) {
			childElement.fadeIn({complete: function() {
				$(this).css({"visibility":"visible"});
				$(this).css({"display":"inline"});
			}});
		});

		$(parentElement).mouseleave(function(evt) {
			// fade out without setting display to none
			childElement.fadeOut({complete: function() {
				// fade out uses hide() function, but it may change
				// the size of the parent element
				// so this is a workaround to prevent resize
				// due to display: "none"
				$(this).css({"visibility":"hidden"});
				$(this).css({"display":"inline"});
			}});
		});
	}

    function swapElement(array, indexA, indexB) {
        var tmp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = tmp;
    }

	/**
	 * Returns the content window for the given target frame.
	 *
	 * @param id    id of the target frame
	 */
	function getTargetWindow(id)
	{
		var frame = document.getElementById(id);
		var targetWindow = frame;

		if (frame.contentWindow)
		{
			targetWindow = frame.contentWindow;
		}

		return targetWindow;
	}

	/**
	 * Returns the content document for the given target frame.
	 *
	 * @param id    id of the target frame
	 */
	function getTargetDocument(id)
	{
		var frame = document.getElementById(id);
		var targetDocument = frame.contentDocument;

		if (!targetDocument && frame.contentWindow)
		{
			targetDocument = frame.contentWindow.document;
		}

		return targetDocument;
	}

    function getLinkToPatientView(cancerStudyId, patientId) {
        return "case.do?cancer_study_id=" + cancerStudyId + "&case_id=" + patientId;
    }

    function getLinkToSampleView(cancerStudyId, sampleId) {
        return "case.do?cancer_study_id=" + cancerStudyId + "&sample_id=" + sampleId;
    }

    /**
     * Adds qTip to the provided target when first time mouse enter
     *
     * @param target qTip target, could be a class name, id or any jquery acceptable element
     * @param qTipOpts qTip initialization options
     */
    function addTargetedQTip(target, qTipOpts) {
        if(target) {
	        // check if target[0] is SVG
	        if (target[0] && target[0].ownerSVGElement)
	        {
		        target = target[0];
	        }
	        // check if target[0][0] is SVG
	        else if (target[0] && target[0][0] && target[0][0].ownerSVGElement)
	        {
		        target = target[0][0];
	        }

            $(target).off('mouseenter', qTipMouseEnterHandler);
            $(target).one('mouseenter', {qTipOpts: qTipOpts}, qTipMouseEnterHandler);
        } else {
            console.error('qTip target is not defined.');
        }
    }

    function qTipMouseEnterHandler(event) {
        var opts = {
            show: {ready: true},
            hide: {fixed: true, delay: 100},
            style: {classes: 'qtip-light qtip-rounded qtip-shadow', tip: true},
            position: {my: 'top left', at: 'bottom right', viewport: $(window)}
        };

        var qTipOpts = event.data.qTipOpts;
        jQuery.extend(true, opts, qTipOpts);

        $(this).qtip(opts);
    }

    function baseMutationMapperOpts()
    {
        return {
            proxy: {
                // default pdb proxy are now configured for a separate pdb data source
                // this is for backward compatibility
                pdbProxy: {
                    options: {
                        servletName: "get3dPdb.json",
                        listJoiner: " ",
                        subService: false
                    }
                },
                // TODO for now init variant annotation data proxy with full empty data
                // (this will practically disable the genome-nexus connections until it is ready)
                variantAnnotationProxy: {
                    options: {
                        initMode: "full",
                        data: {}
                    }
                }
            }
        };
    }
    
    /**
     * Converts the given string to title case format. Also replaces each
     * underdash with a space.
     *
     * TODO: Need to remove the same function under network-visualization.js
     * @param source    source string to be converted to title case
     */
    function toTitleCase(source)
    {
        var str;

        if (source == null)
        {
            return source;
        }

        // first, trim the string
        str = source.replace(/\s+$/, "");

        // replace each underdash with a space
        str = replaceAll(str, "_", " ");

        // change to lower case
        str = str.toLowerCase();

        // capitalize starting character of each word

        var titleCase = new Array();

        titleCase.push(str.charAt(0).toUpperCase());

        for (var i = 1; i < str.length; i++)
        {
            if (str.charAt(i-1) == ' ')
            {
                titleCase.push(str.charAt(i).toUpperCase());
            }
            else
            {
                titleCase.push(str.charAt(i));
            }
        }

        return titleCase.join("");
    }

    /**
     * Replaces all occurrences of the given string in the source string.
     *
     * TODO: Need to remove the same function under network-visualization.js
     * @param source        string to be modified
     * @param toFind        string to match
     * @param toReplace     string to be replaced with the matched string
     * @return              modified version of the source string
     */
    function replaceAll(source, toFind, toReplace)
    {
        var target = source;
        var index = target.indexOf(toFind);

        while (index != -1)
        {
            target = target.replace(toFind, toReplace);
            index = target.indexOf(toFind);
        }

        return target;
    }
    
    //Get hotspot description. TODO: add type as parameter for different source of hotspot sources.
    function getHotSpotDesc() {
        //Single quote attribute is not supported in mutation view Backbone template.
        //HTML entity is not supported in patient view.
        //Another solution is to use unquoted attribute value which has been
        //supported since HTML2.0
        return "<b>Recurrent Hotspot</b><br/>" +
            "This mutated amino acid was identified as a recurrent hotspot " +
            "(statistically significant) in a population-scale cohort of " +
            "tumor samples of various cancer types using methodology based in " +
            "part on <a href=\"http://www.ncbi.nlm.nih.gov/pubmed/26619011\" target=\"_blank\">" +
            "Chang et al., Nat Biotechnol, 2016</a>.<br/><br/>" +
            "Explore all mutations at " +
            "<a href=\"http://cancerhotspots.org/\" target=\"_blank\">http://cancerhotspots.org/</a>.";
    }
    
    /**
     * This function is used to handle outliers in the data, which will squeeze most of the data to only few bars in the bar chart.
     * It calculates boundary values from the box plot of input array, and that would enable the data to be displayed evenly.
     * @param data - The array of input data.
     * @param inArrayFlag - The option to choose boundary values from the input array.
     */
    function findExtremes(data, inArrayFlag) {

        // Copy the values, rather than operating on references to existing values
        var values = [], smallDataFlag = false;
        _.each(data, function(item){
            if($.isNumeric(item))
                values.push(Number(item));
        });

        // Then sort
        values.sort(function (a, b) {
            return a - b;
        });

        /* Then find a generous IQR. This is generous because if (values.length / 4) 
         * is not an int, then really you should average the two elements on either 
         * side to find q1.
         */
        var q1 = values[Math.floor((values.length / 4))];
        // Likewise for q3. 
        var q3 = values[(Math.ceil((values.length * (3 / 4))) > values.length - 1 ? values.length - 1 : Math.ceil((values.length * (3 / 4))))];
        var iqr = q3 - q1;
        if(values[Math.ceil((values.length * (1 / 2)))] < 0.001)
            smallDataFlag = true;
        // Then find min and max values
        var maxValue, minValue;
        if(q3 < 1){
            maxValue = Number((q3 + iqr * 1.5).toFixed(2));
            minValue = Number((q1 - iqr * 1.5).toFixed(2));
        }else{
            maxValue = Math.ceil(q3 + iqr * 1.5);
            minValue = Math.floor(q1 - iqr * 1.5);
        }
        if(minValue < values[0])minValue = values[0];
        if(maxValue > values[values.length - 1])maxValue = values[values.length - 1];
        //provide the option to choose min and max values from the input array
        if(inArrayFlag){
            var i = 0;
            if(values.indexOf(minValue) === -1){
                while(minValue > values[i] && minValue > values[i+1]){
                    i++;
                }
                minValue = values[i+1];
            }
            i = values.length - 1;
            if(values.indexOf(maxValue) === -1){
                while(maxValue < values[i] && maxValue < values[i-1]){
                    i--;
                }
                maxValue = values[i-1];
            }
        }
        
        return [minValue, maxValue, smallDataFlag];
    }
    
    return {
        toPrecision: toPrecision,
        getObjectLength: getObjectLength,
        checkNullOrUndefined: checkNullOrUndefined,
        uniqueElementsOfArray: uniqueElementsOfArray,
        arrayToAssociatedArrayIndices: arrayToAssociatedArrayIndices,
        alterAxesAttrForPDFConverter: alterAxesAttrForPDFConverter,
        lcss: lcss,
	    b64ToByteArrays: b64ToByteArrays,
        browser: detectBrowser(), // returning the browser object, not the function itself
        getWindowOrigin: getOrigin,
        sortByAttribute: sortByAttribute,
        safeProperty: safeProperty,
        autoHideOnMouseLeave: autoHideOnMouseLeave,
        swapElement: swapElement,
	    getTargetWindow: getTargetWindow,
	    getTargetDocument: getTargetDocument,
        getLinkToPatientView: getLinkToPatientView,
        getLinkToSampleView: getLinkToSampleView,
        addTargetedQTip: addTargetedQTip,
        baseMutationMapperOpts: baseMutationMapperOpts,
        toTitleCase: toTitleCase,
        getHotSpotDesc: getHotSpotDesc,
        replaceAll: replaceAll,
        findExtremes: findExtremes
    };

})();

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        if (typeof fun !== "function") {
            throw new TypeError();
        }

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                fun.call(thisp, this[i], i, this);
            }
        }
    };
}

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

 
var KmEstimator = function() {

    return {
        calc: function(inputGrp) { //calculate the survival rate for each time point
            //each item in the input already has fields: time, num at risk, event/status(0-->censored)
            var _prev_value = 1;  //cache for the previous value
            for (var i in inputGrp) {
                var _case = inputGrp[i];
                // if (_case.status === "1") {
                // Modified.
                if (_case.status == "1") {
                    _case.survival_rate = _prev_value * ((_case.num_at_risk - 1) / _case.num_at_risk) ;
                    _prev_value = _case.survival_rate;
                // } else if (_case.status === "0") {
                // Modified.
                } else if (_case.status == "0") {
                    _case.survival_rate = _prev_value; //survival rate remain the same if the event is "censored"
                } else {
                    //TODO: error handling
                }
            }
        }
    };

}; //Close KmEstimator
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var LogRankTest = function() {

    var datum = {
            time: "",    //num of months
            num_of_failure_1: 0,
            num_of_failure_2: 0,
            num_at_risk_1: 0,
            num_at_risk_2: 0,
            expectation: 0, //(n1j / (n1j + n2j)) * (m1j + m2j)
            variance: 0
        },
        mergedArr = [],
        callBackFunc = "";
    //os: DECEASED-->1, LIVING-->0; dfs: Recurred/Progressed --> 1, Disease Free-->0
    function mergeGrps(inputGrp1, inputGrp2, _callBackFunc) {
        var _ptr_1 = 0; //index indicator/pointer for group1
        var _ptr_2 = 0; //index indicator/pointer for group2

        while(_ptr_1 < inputGrp1.length && _ptr_2 < inputGrp2.length) { //Stop when either pointer reach the end of the array
            if (inputGrp1[_ptr_1].time < inputGrp2[_ptr_2].time) {
                var _datum = jQuery.extend(true, {}, datum);
                _datum.time = inputGrp1[_ptr_1].time;
                // if (inputGrp1[_ptr_1].status === "1") {
                // Modified.
                if (inputGrp1[_ptr_1].status == "1") {
                    _datum.num_of_failure_1 = 1;
                    _datum.num_at_risk_1 = inputGrp1[_ptr_1].num_at_risk;
                    _datum.num_at_risk_2 = inputGrp2[_ptr_2].num_at_risk;
                    _ptr_1 += 1;
                } else {
                    _ptr_1 += 1;
                    continue;
                }
            } else if (inputGrp1[_ptr_1].time > inputGrp2[_ptr_2].time) {
                var _datum = jQuery.extend(true, {}, datum);
                _datum.time = inputGrp2[_ptr_2].time;
                // if (inputGrp2[_ptr_2].status === "1") {
                // Modified.
                if (inputGrp2[_ptr_2].status == "1") {
                    _datum.num_of_failure_2 = 1;
                    _datum.num_at_risk_1 = inputGrp1[_ptr_1].num_at_risk;
                    _datum.num_at_risk_2 = inputGrp2[_ptr_2].num_at_risk;
                    _ptr_2 += 1;
                } else {
                    _ptr_2 += 1;
                    continue;
                }
            } else { //events occur at the same time point
                var _datum = jQuery.extend(true, {}, datum);
                _datum.time = inputGrp1[_ptr_1].time;
                // if (inputGrp1[_ptr_1].status === "1" || inputGrp2[_ptr_2].status === "1") {
                // Modified.
                if (inputGrp1[_ptr_1].status == "1" || inputGrp2[_ptr_2].status == "1") {
                    // if (inputGrp1[_ptr_1].status === "1") {
                    // Modified.
                    if (inputGrp1[_ptr_1].status == "1") {
                        _datum.num_of_failure_1 = 1;
                    }
                    // if (inputGrp2[_ptr_2].status === "1") {
                    // Modified.
                    if (inputGrp2[_ptr_2].status == "1") {
                        _datum.num_of_failure_2 = 1;
                    }
                    _datum.num_at_risk_1 = inputGrp1[_ptr_1].num_at_risk;
                    _datum.num_at_risk_2 = inputGrp2[_ptr_2].num_at_risk;
                    _ptr_1 += 1;
                    _ptr_2 += 1;
                } else {
                    _ptr_1 += 1;
                    _ptr_2 += 1;
                    continue;
                }
            }
            mergedArr.push(_datum);
        }
        calcExpection(_callBackFunc);
    }

    function calcExpection(_callBackFunc) {
        $.each(mergedArr, function(index, _item) {
             _item.expectation = (_item.num_at_risk_1 / (_item.num_at_risk_1 + _item.num_at_risk_2)) * (_item.num_of_failure_1 + _item.num_of_failure_2);
        });
        calcVariance(_callBackFunc);
    }

    function calcVariance(_callBackFunc) {
        $.each(mergedArr, function(index, _item) {
            var _num_of_failures = _item.num_of_failure_1 + _item.num_of_failure_2;
            var _num_at_risk = _item.num_at_risk_1 + _item.num_at_risk_2;
            _item.variance = ( _num_of_failures * (_num_at_risk - _num_of_failures) * _item.num_at_risk_1 * _item.num_at_risk_2) / ((_num_at_risk * _num_at_risk) * (_num_at_risk - 1));
        });
        calcPval(_callBackFunc);
    }

    function calcPval(_callBackFunc) {
        var O1 = 0, E1 = 0, V = 0;
        $.each(mergedArr, function(index, obj) {
            O1 += obj.num_of_failure_1;
            E1 += obj.expectation;
            V += obj.variance;            
        });
        var chi_square_score = (O1 - E1) * (O1 - E1) / V;
        $.post("http://www.cbioportal.org/calcPval.do", { chi_square_score: chi_square_score })
            .done( function(_data) {
                callBackFunc = _callBackFunc;
                callBackFunc(_data);
            });
    }

    return {
        calc: function(inputGrp1, inputGrp2, _callBackFunc) {
            mergedArr.length = 0;
            mergeGrps(inputGrp1, inputGrp2, _callBackFunc);
            //calcExpection(_callBackFunc);
            //calcVariance();
            //calcPval(_callBackFunc);
        }
    };
};
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var SurvivalCurve = function() {

    //Instances
    var elem = "",
        settings = "",
        text = "",
        style = "",
        divs = "",
        vals = "";

    //Each curve will have unique ID which will be used to add/remove curve
    var curvesInfo = {};

    //qtip func
    var qtipFunc = {};

    function initCanvas() {
        $('#' + divs.curveDivId).empty();
        elem.svg = d3.select("#" + divs.curveDivId)
            .append("svg")
            .attr("width", settings.canvas_width)
            .attr("height", settings.canvas_height);
        elem.curve = elem.svg.append("g");
        //elem.dots = elem.svg.append("g"); //the invisible dots
        elem.censoredDots = elem.svg.append("g").attr("id", "crossDots");
    }

    function initAxis(_inputArr) {
        var _dataset = [];
        //tick format changed from .1% to %, requested by Niki, used in
        //Study View
        // Modified
        // var formatAsPercentage = d3.format("%");
        var formatAsPercentage = d3.format(".0%");
        $.each(_inputArr, function(index, obj) {
            var data = obj.data;
            $.each(data.getData(), function(index, d) {
                _dataset.push(d.time);
            });
        });
        // elem.xScale = d3.scale.linear()
        elem.xScale = d3.scaleLinear()
            .domain([0, d3.max(_dataset) + 0.1 * d3.max(_dataset)])
            .range([settings.chart_left, settings.chart_width]);
            // .range([settings.chart_left, settings.chart_left + settings.chart_width]);
        // elem.yScale = d3.scale.linear()
        elem.yScale = d3.scaleLinear()
            .domain([-0.03, 1.05]) //fixed to be 0-1
            .range([settings.chart_height - 40, settings.chart_left]);
            // .range([settings.chart_top + settings.chart_height, settings.chart_top]);
        // elem.xAxis = d3.svg.axis()
        //     .scale(elem.xScale)
        //     .orient("bottom")
        //     .tickSize(6, 0, 0);
        elem.xAxis = d3.axisBottom(elem.xScale).tickSize(6, 0, 0)
        // elem.yAxis = d3.svg.axis()
        //     .scale(elem.yScale)
        //     .tickFormat(formatAsPercentage)
        //     .orient("left")
        //     .tickSize(6, 0, 0);
        elem.yAxis = d3.axisLeft(elem.yScale).tickFormat(formatAsPercentage).tickSize(6, 0, 0);
    }

    function initLines() {
        // elem.line = d3.svg.line()
        elem.line = d3.line()
            // .interpolate("step-after")
            .x(function(d) { 
                return elem.xScale(d.time); 
            })
            .y(function(d) { 
                return elem.yScale(d.survival_rate); 
            });
    }

    //Append a virtual point for time zero if needed (no actual data point at time zero, therefore cause the graph not starting from 0)
    function appendZeroPoint(_num_at_risk) {
        var datum = {
            case_id: "",
            time: "",    //num of months
            status: "", //os: DECEASED-->1, LIVING-->0; dfs: Recurred/Progressed --> 1, Disease Free-->0
            num_at_risk: -1,
            survival_rate: 0
        };
        var _datum = jQuery.extend(true, {}, datum);
        _datum.case_id = "NA";
        _datum.time = 0;
        _datum.status = "NA";
        _datum.num_at_risk = _num_at_risk;
        _datum.survival_rate = 1;
        return _datum;
    }

    function drawLines(data, opts, _curveId) {
        if (data !== null && data.length > 0) {
            if (data[0].time !== 0) {
                data.unshift(appendZeroPoint(data[0].num_at_risk));
            }
            elem.curve = elem.svg.append("path")
                .attr('id', _curveId+"-line")
                .attr("d", elem.line(data))
                .style("fill", "none")
                .style("stroke", opts.line_color);
        }
    }

    function drawInvisiableDots(_index, data, _color) {
        elem.dots[_index].selectAll("path")
            .data(data)
            .enter()
            .append("svg:path")
            // // .attr("d", d3.svg.symbol()
            //     .size(400)
            //     // .type("circle"))
            .attr("d", d3.symbol()
                .size(400)
                .type(function(d) { return d3.symbolCircle; }))
            .attr("transform", function(d){
                return "translate(" + elem.xScale(d.time) + ", " + elem.yScale(d.survival_rate) + ")";
            })
            .attr("fill", _color)
            .style("opacity", 0);
    }

    function addQtips(_index) {
        var mouseOn = function(d) {
            var dot = d3.select(this);
            dot.transition()
                .duration(400)
                .style("opacity", .9);

            if(! $(this).data('qtip' )) {
                //TODO: need to find a better way to grab cancer study ID. 
                //QuerySession is only available after submitting query.
                //cancerStudyId is only available in study view
                //cancer_study_id and cancer_study_id_selected are only available in certain pages.
                //But they all point to same attribute.
                var cancerStudy = window.QuerySession ? window.QuerySession.getCancerStudyIds()[0] : (window.cancerStudyId || window.cancer_study_id || window.cancer_study_id_selected);
                var content = "<font size='2'>";
                content += text.qTips.id + ": " + "<strong><a href='"
                        + qtipFunc(cancerStudy, d.case_id)
                        + "' target='_blank'>" + d.case_id + "</a></strong><br>";
                content += text.qTips.estimation + ": <strong>" + (d.survival_rate * 100).toFixed(2) + "%</strong><br>";
                if (d.status === "0") { // If censored, mark it
                    content += text.qTips.censoredEvent + ": <strong>" + d.time.toFixed(2) + " </strong>months (censored)<br>";
                } else { // status is 1, means event occured
                    content += text.qTips.failureEvent + ": <strong>" + d.time.toFixed(2) + " </strong>months<br>";
                }
                content += "</font>";

                $(this).qtip(
                    {
                        content: {text: content},
                        style: { classes: 'qtip-light qtip-rounded qtip-shadow qtip-lightyellow qtip-wide'},
                        show: {
                            event: "mouseover",
                            ready: true
                        },
                        hide: {fixed:true, delay: 100, event: "mouseout"},
                        position: {my:'left bottom',at:'top right'}
                    }
                );
            }
        };

        var mouseOff = function() {
            var dot = d3.select(this);
            dot.transition()
                .duration(400)
                .style("opacity", 0);
        };

        elem.dots[_index].selectAll("path").on("mouseover", mouseOn);
        elem.dots[_index].selectAll("path").on("mouseout", mouseOff);
    }

    function appendAxis(elemAxisX, elemAxisY) {
        elem.svg.append("g")
            .style("stroke-width", style.axis_stroke_width)
            .style("fill", "none")
            .style("stroke", style.axis_color)
            .attr("class", "survival-curve-x-axis-class")
            .style("shape-rendering", "crispEdges")
            // .attr("transform", "translate(0, " + (settings.chart_top + settings.chart_height) + ")")
            // Modified.
            .attr("transform", "translate(0, " + (settings.chart_height - 40) + ")")
            .call(elemAxisX);
        elem.svg.append("g")
            .style("stroke-width", style.axis_stroke_width)
            .style("fill", "none")
            .style("stroke", style.axis_color)
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(0, " + settings.chart_left + ")")
            // .attr("transform", "translate(0, " + settings.chart_top + ")")
            // Modified.
            // .call(elemAxisX.orient("bottom").ticks(0));
            .call(elemAxisX.ticks(0))
        elem.svg.append("g")
            .style("stroke-width", style.axis_stroke_width)
            .style("fill", "none")
            .style("stroke", style.axis_color)
            .attr("class", "survival-curve-y-axis-class")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(" + settings.chart_left + ", 0)")
            .call(elemAxisY);
        elem.svg.append("g")
            .style("stroke-width", style.axis_stroke_width)
            .style("fill", "none")
            .style("stroke", style.axis_color)
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(" + (settings.chart_width - 1) + ", 0)")
            // .attr("transform", "translate(" + (settings.chart_left + settings.chart_width) + ", 0)")
            // Modified.
            // .call(elemAxisY.orient("left").ticks(0));
            .call(elemAxisY.ticks(0));
        elem.svg.selectAll("text")
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .style("fill", "black");
    }

    function drawCensoredDots(data, opts, curveId) {
        // crossDots specifically for the curve for easier deletion
        // changed two separate lines to a single cross symbol
        var curveCrossdots = elem.censoredDots.append("g").attr("id", curveId+"-crossdots");
        curveCrossdots.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .filter(function(d){
                // return d.status==="0";
                // Modified.
                return d.status=="0"; 
            })
            .attr("transform", function(d) {
                return "translate(" + elem.xScale(d.time) + "," + elem.yScale(d.survival_rate) + ")";
            })
            .attr("d", d3.symbol()
                .type(function (d) { return d3.symbolCross; })
                .size(25)
            )
            .attr("fill", opts.line_color);

    }

    function addLegends(_inputArr) {
        var legends_text = [];
        $.each(_inputArr, function(index, obj) {
            var _tmp = {};
            _tmp.text = obj.settings.legend;
            _tmp.color = obj.settings.line_color;
            legends_text.push(_tmp);
        });

        var legend = elem.svg.selectAll(".legend")
            .data(legends_text)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                // return "translate(" + (settings.chart_left + settings.chart_width + 15) + ", " + (70 + i * 15) + ")";
                // Modified.
                return 'translate(' + settings.chart_left + ', ' + (20 + i * 15) + ')';
            });

        legend.append("path")
            .attr("width", 18)
            .attr("height", 18)
            .attr("d", d3.symbol()
                .size(60)
                // .type(function(d) { return "square"; }))
                .type(function(d) { return d3.symbolSquare; }))
            .attr("fill", function (d) { return d.color; })
            .attr("stroke", "black")
            .attr("stroke-width", .9);

        legend.append("text")
            .attr("x", 15)
            .attr("y", 4)
            .style("text-anchor", "front")
            .text(function(d) { return d.text; });

    }

    function appendAxisTitles(xTitle, yTitle) {
        elem.svg.append("text")
            .attr("class", "label")
            .attr("x", style.axisX_title_pos_x)
            .attr("y", style.axisX_title_pos_y)
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight","bold")
            .text(xTitle);
        elem.svg.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", style.axisY_title_pos_x)
            .attr("y", style.axisY_title_pos_y)
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight","bold")
            .text(yTitle);
    }

    function addPvals(_pval) {
        elem.svg.append("text")
            .attr("class","pval")
            .attr("x", settings.pval_x)
            .attr("y", settings.pval_y)
            .attr("font-size", style.pval_font_size)
            .attr("font-style", style.pval_font_style)
            .style("text-anchor", "front")
            .text(text.pValTitle + cbio.util.toPrecision(Number(_pval), 3, 0.001));
    }

    function updatePvals(pval) {
        elem.svg.select('.pval')
            .text(text.pValTitle + cbio.util.toPrecision(Number(pval), 3, 0.0001));
    }

    function appendInfoTable(_infoTableInputArr) {
        $("#" + divs.infoTableDivId).empty();
        // $("#" + divs.infoTableDivId).append("<tr>" +
        //     "<td style='width: 600px; text-align:left;'></td>" +
        //     "<td style='width: 200px;'>" + text.infoTableTitles.total_cases + "</td>" +
        //     "<td style='width: 200px;'>" + text.infoTableTitles.num_of_events_cases + "</td>" +
        //     "<td style='width: 200px;'>" + text.infoTableTitles.median + "</td>" +
        //     "</tr>");
        // $("#" + divs.infoTableDivId).append("<tr>" +
        //     "<td style='width: 100px; text-align:left;'></td>" +
        //     "<td style='width: 100px;'>" + text.infoTableTitles.total_cases + "</td>" +
        //     "<td style='width: 100px;'>" + text.infoTableTitles.num_of_events_cases + "</td>" +
        //     "<td style='width: 100px;'>" + text.infoTableTitles.median + "</td>" +
        //     "</tr>");
        // $.each(_infoTableInputArr, function(index, obj) {
        //     $("#" + divs.infoTableDivId).append("<tr>" +
        //                                         "<td>" + obj.groupName + "</td>" +
        //                                         "<td><b>" + obj.num_cases + "</b></td>" +
        //                                         "<td><b>" + obj.num_of_events_cases + "</b></td>" +
        //                                         "<td><b>" + obj.median + "</b></td>" +
        //                                         "</tr>");
        // });
        // Modified.
        $.each(_infoTableInputArr, function(index, obj) {
            var color = obj.groupName === 'High score group' || 
                        obj.groupName === 'Altered group' ? '#FF6252' : '#00AC52';
            // Modified.
            
            var width = $('#exclusivity_survival div').width();

            $('#' + divs.infoTableDivId).append(
              '<tr><td style="width: ' + width + 'px; text-align:right;"></td><td style="width:' + width + 'px; text-align:center;"><b style="color : ' + color + ';">' 
              + obj.groupName + '</b></td></tr>' + 
              '<tr><td style="width:' + width + 'px; text-align:right;">' 
              + text.infoTableTitles.total_cases + '</td><td style="width:' + width + 'px; text-align:center;"><b>' 
              + obj.num_cases + '</b></td></tr>' + 
              '<tr><td style="width: ' + width + 'px; text-align:right;">' 
              + text.infoTableTitles.num_of_events_cases + '</td><td style="width: ' + width + 'px; text-align:center;"><b>' 
              + obj.num_of_events_cases + '</b></td></tr>' + 
              '<tr><td style="width: ' + width + 'px; text-align:right;">' 
              + text.infoTableTitles.median + '</td><td style="width: ' + width + 'px; text-align:center;"><b>' 
              + obj.median + '</b></td></tr>' 
            );
            // $("#" + divs.infoTableDivId).append("<tr>" +
            //                                     "<td>" + obj.groupName + "</td>" +
            //                                     "<td><b>" + obj.num_cases + "</b></td>" +
            //                                     "<td><b>" + obj.num_of_events_cases + "</b></td>" +
            //                                     "<td><b>" + obj.median + "</b></td>" +
            //                                     "</tr>");
            //                                     Modified.
        });
    }

    function appendImgConverter(_inputArr) {
        $('#' + divs.headerDivId).append("<button id='" + divs.curveDivId + "_svg_download' style='font-size:12px;'>SVG</button>");
        $('#' + divs.headerDivId).append("<button id='" + divs.curveDivId + "_pdf_download' style='font-size:12px;'>PDF</button>");
        $('#' + divs.headerDivId).append("<button id='" + divs.curveDivId + "_data_download' style='font-size:12px;'>Data</button>");
        $("#" + divs.curveDivId + "_svg_download").click(function() {
            var xmlSerializer = new XMLSerializer();
            var download_str = cbio.download.addSvgHeader(xmlSerializer.serializeToString($("#" + divs.curveDivId + " svg")[0]));
            cbio.download.clientSideDownload([download_str], "survival_study.svg", "application/svg+xml");
        });
        $("#" + divs.curveDivId + "_pdf_download").click(function() {
            var downloadOptions = {
                filename: "survival_study.pdf",
                contentType: "application/pdf",
                servletName: "svgtopdf.do"
            };
           cbio.download.initDownload($("#" + divs.curveDivId + " svg")[0], downloadOptions);
        });
        $("#" + divs.curveDivId + "_data_download").click(function() {
            var final_str = "";
            var file_name = "";
            var div_id = this.id;
            if (div_id.indexOf("os") !== -1) {
                final_str += "Overall Survival Kaplan-Meier Estimate\n";
                file_name = "os_survival_data.txt";
            } else if (div_id.indexOf("dfs") !== -1) {
                final_str += "Disease Free Survival Kaplan-Meier Estimate\n";
                file_name = "dfs_survival_data.txt";
            }
            _.each(_inputArr, function(curve_obj) {
                var _str = "\n" + curve_obj.settings.legend + "\n";
                _str += "Case ID" + "\t" + "Number at Risk" + "\t" + "Status" + "\t" + "Survival Rate" + "\t" + "Time (months)" + "\n" ;
                _.each(curve_obj.data.getData(), function(data_obj) {
                    //translate status
                    var _txt_status = "";
                    if (div_id.indexOf("os") !== -1) {
                        // if (data_obj.status === "0") _txt_status = "censored";
                        // Modified.
                        if (data_obj.status == "0") _txt_status = "censored";
                        // else if (data_obj.status === "1") _txt_status = "deceased";
                        // Modified.
                        else if (data_obj.status === "1") _txt_status = "deceased";
                    } else if (div_id.indexOf("dfs") !== -1) {
                        // if (data_obj.status === "0") _txt_status = "censored";
                        // Modified.
                        if (data_obj.status == "0") _txt_status = "censored";
                        // else if (data_obj.status === "1") _txt_status = "relapsed";
                        // Modified.
                        else if (data_obj.status == "1") _txt_status = "relapsed";
                    }
                    //assemble
                    _str += data_obj.case_id + "\t" +
                            data_obj.num_at_risk + "\t" +
                            _txt_status + "\t" +
                            data_obj.survival_rate + "\t" +
                            data_obj.time + "\n";
                });
                final_str += _str;
            });
            cbio.download.clientSideDownload([final_str], file_name);
        });
    }

    function drawCurve(_inputArr, _obj){
        var data = _obj.data;
        var opts = _obj.settings;
        var _curve = {};
        _curve.id = opts.curveId;
        _curve.color = opts.line_color;
        curvesInfo[_curve.id] = _curve;
        elem.dots[_curve.id] = elem.svg.append("g").attr('id', _curve.id+"-dots"); //the invisible dots
        initLines();
        drawLines(data.getData(), opts, _curve.id);

        //First element is used to draw lines and its case_id is NA, this dot
        //will not be needed for drawing censored dots and invisible dots.
        //Then remove move it in here.
        data.getData().shift();
        drawCensoredDots(data.getData(), opts, _curve.id);
        drawInvisiableDots(_curve.id, data.getData(), opts.mouseover_color);
        addQtips(_curve.id);

        if (settings.include_legend) {
            addLegends(_inputArr);
        }
    }

    function removeCurve(_curveId){
        d3.selectAll('#' + _curveId + '-dots').remove();
        d3.selectAll('#' + _curveId + '-line').remove();
        // remove the crossdots for the curveId
        d3.selectAll('#' + _curveId + "-crossdots").remove();

        delete curvesInfo[_curveId];
        //TODO: Add redraw curve label function
    }

    function updateSettings(newSettings){
        if(newSettings){
            for(var setting in newSettings) {
                settings[setting] = newSettings[setting];
            }
        }
    }

    function updatePval(_pval) {
        if (settings.include_pvalue && !isNaN(_pval)) {
            if(elem.svg.select(".pval").empty()) {
                addPvals(_pval);
            }else{
                updatePvals(_pval);
            }
        }else{
            if(!elem.svg.select(".pval").empty()) {
                elem.svg.select(".pval").remove();
            }
        }
    }

    function addCurve(_obj){
        if(!(_obj.settings.curveId in curvesInfo)){
            drawCurve([_obj], _obj);
        }else{
            console.log("%c Error: Curve ID exists", "color:red");
        }
    }

    return {
        init: function(_inputArr, _opts) {
            //Place parameters
            elem = _opts.elem;
            settings = _opts.settings;
            text = _opts.text;
            style = _opts.style;
            divs = _opts.divs;
            vals = _opts.vals;
            qtipFunc = _opts.qtipFunc;

            //Init and Render
            var _empty_data = false;
            $.each(_inputArr, function(index, obj) {
                if (obj.data.getData().length === 0) {
                    _empty_data = true;
                    return false;
                }
            });

            if (!_empty_data) {
                    initCanvas();
                    initAxis(_inputArr);
                    appendAxis(elem.xAxis, elem.yAxis);
                    appendAxisTitles(text.xTitle, text.yTitle);
                    $.each(_inputArr, function(index, obj) {
                        drawCurve(_inputArr, obj);
                    });
                    appendImgConverter(_inputArr);
                    if (_opts.settings.include_info_table) {
                        var _infoTableInputArr = [];
                        $.each(_inputArr, function(index, obj) {
                            var _tmp = jQuery.extend(true, {}, obj.data.getStats());
                            _tmp.groupName = obj.settings.legend;
                            _infoTableInputArr.push(_tmp);
                        });
                        appendInfoTable(_infoTableInputArr);
                    }
                    if (_opts.settings.include_pvalue) {
                        addPvals(vals.pVal);
                    }
            } else {
                $("#" + divs.infoTableDivId).empty();
                $("#" + divs.infoTableDivId).append("<span style='margin: 20px; color: grey;'>Survival data not available</span>");
            }

        },
        updateView: function(data, opts){
            if(opts){
                updateSettings(opts.settings);
            }

            if(data){
                updatePval(data.pval);
            }
        },
        addCurve: addCurve,
        removeCurve: removeCurve
    };
};

/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var SurvivalCurveProxy  = function() {

        var datum = {
                case_id: "",
                time: "",    //num of months
                status: "", //os: DECEASED-->1, LIVING-->0; dfs: Recurred/Progressed --> 1, Disease Free-->0
                num_at_risk: -1,
                survival_rate: 0
            },
            datumArr = [],
            statDatum = {
                pVal: 0,
                num_cases: 0,
                num_of_events_cases: 0,
                median: 0
            },
            statValues = {},
            kmEstimator = "",
            logRankTest = "",
            totalNum = 0,
            caseList = [];

        //First Configure datums by combining AJAX result with caselist 
        //Then order by time, filtered NA cases and add on num of risk for each time point
        function assembleDatums(_result) {
            // *** //
            var obj = {};

            _result.forEach(function (d)    {
                var id = Object.keys(d)[0];

                obj[id] = d[id];
            });

            _result = obj;

            var _totalNum = 0;
            //Get event and time
            for (var caseId in _result) {
                if (_result.hasOwnProperty(caseId) && _result[caseId] !== "" && caseList.indexOf(caseId) !== -1) {
                    var _datum = jQuery.extend(true, {}, datum);
                    _datum.case_id = _result[caseId].case_id;
                    _datum.time = _result[caseId].months;
                    _datum.status = _result[caseId].status;
                    if (_datum.time !== "NA" && (_datum.status !== "NA" && typeof _datum.status !== "undefined" && _datum.status !== undefined)) {
                        datumArr.push(_datum);
                        _totalNum += 1;
                    }
                }
            }
            // *** //
            //Sort by time
            cbio.util.sortByAttribute(datumArr, "time");
            //Set num at risk
            for (var i in datumArr) {
                datumArr[i].num_at_risk = _totalNum;
                _totalNum += -1;
            }
        }

        function calc() {
            kmEstimator.calc(datumArr);
            var _statDatum = jQuery.extend(true, {}, statDatum);
            if (datumArr.length !== 0) {
                _statDatum.num_cases = datumArr.length;
            } else {
                _statDatum.num_cases = "NA";
            }
            _statDatum.num_of_events_cases = countEvents(datumArr);
            _statDatum.median = calcMedian(datumArr);
            statValues = _statDatum;
            //logRankTest.calc(altered_group, unaltered_group, _callBackFunc);
        }

        function countEvents(inputArr) {
            if (inputArr.length !== 0) {
                var _cnt = 0;
                for (var i in inputArr) {
                    // if (inputArr[i].status === "1") {
                    // Modified.
                    if (inputArr[i].status == "1") {
                        _cnt += 1;
                    }
                }
                return _cnt;
            }
            return "NA";
        }

        function calcMedian(inputArr) {
            var _result = 0;
            if (inputArr.length !== 0) {
                var _mIndex = 0;
                for (var i in inputArr) {
                    if (inputArr[i].survival_rate <= 0.5) {
                        _mIndex = i;
                        _result = parseFloat(inputArr[_mIndex].time);
                        break;
                    } else {
                        continue;
                    }
                }
                // if (_result === 0) {
                // Modified.
                if (_result == 0) {
                    return "NA";
                } else {
                    return _result;
                }
            }
            return "NA";
        }

        return {
            init: function(_result, _caseList, _kmEstimator, _logRankTest) {
                caseList = _caseList;
                kmEstimator = _kmEstimator;
                logRankTest = _logRankTest;
                assembleDatums(_result);
                if (datumArr.length === 0) {
                    //$('#tab-survival').hide();
                    // var tab = $('#tabs a').filter(function(){
                    //     return $(this).text() == "Survival";
                    // }).parent();
                    // tab.hide();
                } else {
                    if (datumArr.length !== 0) {
                        calc();
                    } else {
                        //view.errorMsg("os");
                    }
                }
            },
            getData: function() {
                return datumArr;
            },
            getStats: function() {
                return statValues;
            }
        }
    };
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


/****************************************************************************************************
 * Creating overall survival and disease free curves for the survival tab
 * @author Yichao Sun
 * @date Sep 2013
 *
 * This code performs the following functions:
 * 1. Calculate the survival rates for each time point using kaplan-meier estimator
 * 2. Generate the curves using d3 line charts w/ mouse over for each time point
 * 3. Display basic information of main query: gene set, nubmer of cases
 * 4. Calculate interested values from the curve: p-value(log-rank test), median, 0.95lcl, 0.95ucl
 *
 ****************************************************************************************************/

var SurvivalCurveView = function(_opts) {
    //Instances of calculators
    var dataInst = "", //Not raw data but the ones being calculated by KM and log-tank already!
        opts = _opts,
        survivalCurve = "",
        kmEstimator = "",
        logRankTest = "",
        //confidenceIntervals = "",
        alteredGroup = [], //data instances for each group
        unalteredGroup = [],
        inputArr = [];

    var pValCallBackFunc = function(_pVal) {
        opts.vals.pVal = _pVal;
        survivalCurve = new SurvivalCurve();
        survivalCurve.init(inputArr, opts);
    };
    
    var getResultInit = function(_caseLists, _data) {
        //Init all the calculators
        kmEstimator = new KmEstimator(); 
        logRankTest = new LogRankTest();   
        //confidenceIntervals = new ConfidenceIntervals();   
        
        //Split the data into different(altered/unaltered) groups  
        // window.QuerySession.getPatientSampleIdMap().then(function(patientSampleIdMap) {
		// for (var key in _caseLists) {  
		//     if (_caseLists[key] === "altered") {
		// 	var tmpPatientId = patientSampleIdMap[key];        
		// 	alteredGroup.push(tmpPatientId);
		//     }
		//     else if (_caseLists[key] === "unaltered") {
		// 	var tmpPatientId = patientSampleIdMap[key];  
		// 	unalteredGroup.push(tmpPatientId);    
		//     }
		// }

		for (var key in _caseLists) {  
	    if (_caseLists[key] === "altered") {
				alteredGroup.push(key);
	    }
	    else if (_caseLists[key] === "unaltered") {
				unalteredGroup.push(key);    
	    }
		}
		//Init data instances for different groups
		var alteredDataInst = new SurvivalCurveProxy();
		var unalteredDataInst = new SurvivalCurveProxy();
		alteredDataInst.init(_data, alteredGroup, kmEstimator, logRankTest);
		unalteredDataInst.init(_data, unalteredGroup, kmEstimator, logRankTest);

		//Individual settings 
		var unalteredSettingsInst = jQuery.extend(true, {}, SurvivalCurveBroilerPlate.subGroupSettings);
		// unalteredSettingsInst.line_color = "blue";
		// Modified.
		unalteredSettingsInst.line_color = '#00AC52';
		// unalteredSettingsInst.mouseover_color = "#81BEF7";
		// Modified.
		unalteredSettingsInst.mouseover_color = "#00AC52";
		// unalteredSettingsInst.legend = "Low score group";
		unalteredSettingsInst.legend = SurvivalCurveBroilerPlate.subGroupSettings.legend.low;
		// unalteredSettingsInst.legend = "Cases without Alteration(s) in Query Gene(s)";
		// Modified.
		var alteredSettingsInst = jQuery.extend(true, {}, SurvivalCurveBroilerPlate.subGroupSettings);
		// alteredSettingsInst.line_color = "red";
		// Modified.
		alteredSettingsInst.line_color = '#FF6252';
		// alteredSettingsInst.mouseover_color = "#F5BCA9";
		// Modified.
		alteredSettingsInst.mouseover_color = "#FF6252";
		// alteredSettingsInst.legend = "High score group";
		alteredSettingsInst.legend = SurvivalCurveBroilerPlate.subGroupSettings.legend.high;
		// alteredSettingsInst.legend = "Cases with Alteration(s) in Query Gene(s)";
		// Modified.

		//Assemble the input
		var alteredInputInst = {},
		    unalteredInputInst = {};
		alteredInputInst.data = alteredDataInst;
		alteredInputInst.settings = alteredSettingsInst;
		unalteredInputInst.data = unalteredDataInst;
		unalteredInputInst.settings = unalteredSettingsInst;

		//render the curve
		inputArr = [alteredInputInst, unalteredInputInst];
		logRankTest.calc(inputArr[0].data.getData(), inputArr[1].data.getData(), pValCallBackFunc);
	// });
    };

    return {
        getResultInit: getResultInit,
        pValCallBackFunc: pValCallBackFunc
    };
}; // Close SurvivalCurveView
/*
 * Copyright (c) 2015 Memorial Sloan-Kettering Cancer Center.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS
 * FOR A PARTICULAR PURPOSE. The software and documentation provided hereunder
 * is on an "as is" basis, and Memorial Sloan-Kettering Cancer Center has no
 * obligations to provide maintenance, support, updates, enhancements or
 * modifications. In no event shall Memorial Sloan-Kettering Cancer Center be
 * liable to any party for direct, indirect, special, incidental or
 * consequential damages, including lost profits, arising out of the use of this
 * software and its documentation, even if Memorial Sloan-Kettering Cancer
 * Center has been advised of the possibility of such damage.
 */

/*
 * This file is part of cBioPortal.
 *
 * cBioPortal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var SurvivalTab = (function() {
    return {
        init: function(_caseList, data) {
        // init: function(_caseList) {
        // Modified.

            //Import default settings
            var osOpts = jQuery.extend(true, {}, SurvivalCurveBroilerPlate);
            var dfsOpts = jQuery.extend(true, {}, SurvivalCurveBroilerPlate);  
            //Customize settings
            osOpts.text.xTitle = "Months Survival";
            osOpts.text.yTitle = "Surviving";
            osOpts.text.qTips.estimation = "Survival estimate";
            osOpts.text.qTips.censoredEvent = "Time of last observation";
            osOpts.text.qTips.failureEvent = "Time of death";
            osOpts.text.qTips.id = "Patient ID";
            osOpts.settings.include_info_table = true;
            osOpts.divs.curveDivId = "os_survival_curve";
            // Modified.
            // osOpts.divs.curveDivId = "osChart";
            osOpts.divs.headerDivId = "os_header";
            osOpts.divs.infoTableDivId = "os_stat_table";
            // Modified.
            // osOpts.divs.infoTableDivId = "osTable";
            osOpts.text.infoTableTitles.total_cases = "#total cases";
            osOpts.text.infoTableTitles.num_of_events_cases = "#cases deceased";
            osOpts.text.infoTableTitles.median = "median months survival";
            osOpts.qtipFunc = cbio.util.getLinkToPatientView;
            dfsOpts.text.xTitle = "Months Disease Free";
            dfsOpts.text.yTitle = "Disease Free";
            dfsOpts.text.qTips.estimation = "Disease free estimate";
            dfsOpts.text.qTips.censoredEvent = "Time of last observation";
            dfsOpts.text.qTips.failureEvent = "Time of relapse";
            dfsOpts.text.qTips.id = "Patient ID";
            dfsOpts.settings.include_info_table = true;
            dfsOpts.divs.curveDivId = "dfs_survival_curve";
            // Modified.
            // dfsOpts.divs.curveDivId = "dfsChart";
            dfsOpts.divs.headerDivId = "dfs_header";
            dfsOpts.divs.infoTableDivId = "dfs_stat_table";
            // Modified.
            // dfsOpts.divs.infoTableDivId = "dfsTable";
            dfsOpts.text.infoTableTitles.total_cases = "#total cases";
            dfsOpts.text.infoTableTitles.num_of_events_cases = "#cases relapsed";
            dfsOpts.text.infoTableTitles.median = "median months disease free";
            dfsOpts.qtipFunc = cbio.util.getLinkToPatientView;
            //Init Instances
            var survivalCurveViewOS = new SurvivalCurveView(osOpts);
                survivalCurveViewOS.getResultInit(_caseList,data.os);
            // var params = {
            //     case_set_id: window.QuerySession.getCaseSetId(),
            //     case_ids_key: window.QuerySession.getCaseIdsKey(),
            //     cancer_study_id: window.QuerySession.getCancerStudyIds()[0],
            //     data_type: "os"
            // };
            // $.post("getSurvivalData.json", params, function(data) {
            //     survivalCurveViewOS.getResultInit(_caseList,data);
            // }, "json");
            // Modified.
            
            var survivalCurveViewDFS = new SurvivalCurveView(dfsOpts);
                survivalCurveViewDFS.getResultInit(_caseList,data.dfs);
            // params.data_type = "dfs";
            // $.post("getSurvivalData.json", params, function(data) {
            //     survivalCurveViewDFS.getResultInit(_caseList,data);
            // }, "json");
            // Modified.
        }
    };

}()); //Close SubvivalTabView (Singular)

// (function ()	{
// 	'use strict';
//   /*
//     Exclusivity
//    */
// 	// $.ajax({
//  //    'type': 'POST',
//  //    'url': '/files/datas',
//  //    data: {
//  //    	name: 'exclusivity',
//  //    },
//  //    beforeSend: function () {
//  //      bio.loading().start(document.querySelector('#main'), 900, 600);
//  //    },
//  //    success: function (d) {
//  //      bio.exclusivity({
//  //        element: '#main',
//  //        width: 900,
//  //        height: 600,
//  //        data: {
//  //          heatmap: d[0],
//  //          network: d[2],
//  //          sample: d[3].data.sample_variants,
//  //          survival: {
//  //            patient: d[4].data,
//  //            types: d[5].data,
//  //          },
//  //          type: 'LUAD',
//  //        }
//  //      });

//  //      bio.loading().end();
//  //    },
//  //  });

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
//  // $.ajax({
//  //    'type': 'POST',
//  //    'url': '/files/datas',
//  //    data: {
//  //     name: 'landscape',
//  //    },
//  //    beforeSend: function () {
//  //      bio.loading().start(document.querySelector('#main'), 900, 600);
//  //    },
//  //    success: function (d) {
//  //      bio.landscape({
// 	// 			element: '#main',
// 	// 			width: 1620,
// 	// 			height: 850,
// 	// 			data: {
// 	// 				pq: 'p',
// 	// 				type: 'LUAD',
// 	// 				data: d[0].data,
// 	// 				title:d[0].data.name,
// 	// 			},
// 	// 		});

//  //      bio.loading().end();
//  //    },
//  //  });

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
//         },
//         cancer_type: d[0].data.cancer_type,
//       });

//       bio.loading().end();
//     },
//   });
// })();
function loading ()	{
	'use strict';

	var model = {};

	function makeCircles (classes)	{
		var result = [];

		bio.iteration.loop(classes, function (cls)	{
			var circle = document.createElement('div');	

			circle.className = 'loading-circle-' + cls;

			result.push(circle);
		});

		return result;
	};

	function makeLoading (parent, width, height)	{
		var div = document.createElement('div'),
				inner = document.createElement('div'),
				circles = makeCircles([1, 2, 3, 4]),
				text = document.createElement('span');

		div.className = 'loading';
		div.style.width = width + 'px';
		div.style.height = height + 'px';

		text.className = 'loading-text';
		text.innerHTML = 'Loading';

		for (var i = 0, l = circles.length; i < l; i++)	{
			inner.appendChild(circles[i]);
		}

		div.appendChild(inner);
		div.appendChild(text);

		parent.appendChild(div);

		return div;
	};

	function start (parent, width, height)	{
		if (!width || !height)	{
			throw new Error('Please define the width and height');
		}	

		model.loadingElement = document.querySelector('.loading') ? 
														document.querySelector('.loading') : 
														makeLoading(parent, width, height);

		if (model.loadingElement.style.display === 'none')	{
			model.loadingElement.style.display = 'block';
		}
	};

	function end (num, sec)	{
		$(model.loadingElement).fadeOut('slow')
	};
	
	return function (parent, num, sec)	{
		return { start: start, end: end };
	}
};
function modal ()	{
	'use strict';

	var model = {};
	// TODO.. 
	function okButton ()	{

	};
	// Make close button.
	function closeButton ()	{
		var btn = document.createElement('button');
		
		btn.id = 'modal_close';
		// Bootstrap style button.
		btn.className = 'btn btn-default';
		btn.innerHTML = 'Close';

		btn.setAttribute('type', 'button');
		// This attribute is close the modal.
		btn.setAttribute('data-dismiss', 'modal');

		return btn;
	};

	function makeModal (id)	{
		model.modal = document.createElement('div');
		model.modal.setAttribute('tabindex', '-1');
		model.modal.setAttribute('role', 'dialog');
		model.modal.setAttribute('aria-labelledby', id);
		model.dialog = document.createElement('div');
		model.dialog.setAttribute('role', 'document');
		model.content = document.createElement('div');
		model.header = document.createElement('div');
		model.footer = document.createElement('div');
		model.title = document.createElement('div');
		model.body = document.createElement('div');

		model.modal.id = id;
		model.body.className = 'modal-body';
		model.modal.className = 'modal fade';
		model.title.className = 'modal-title';
		model.dialog.className = 'modal-dialog';
		model.footer.className = 'modal-footer';
		model.header.className = 'modal-header';
		model.content.className = 'modal-content';

		model.body.style.height = '0px';
		model.modal.style.display = 'none';

		model.header.appendChild(model.title);
		model.content.appendChild(model.header);
		model.content.appendChild(model.body);
		model.footer.appendChild(closeButton());
		model.content.appendChild(model.footer);
		model.dialog.appendChild(model.content);
		model.modal.appendChild(model.dialog);
	};

	return function (opts)	{
		makeModal(opts.id || 'modal');
		
		model.element = opts.element;
		model.element.appendChild(model.modal);
	};
};
function selectBox ()	{
	'use strict';

	var model = {};
	/*
		select box frame 구현 함수.
	 */
	function makeSelectBoxFrame (className)	{
		var div = document.createElement('div'),
				width = (model.width - model.margin.left * 2),
				height = (model.height - model.margin.top * 2) < 40 ? 
								 (model.height - model.margin.top * 2) : 40;

		div.className = className + ' drop-menu';
		div.style.width = width + 'px';
		div.style.height = height + 'px';
		div.style.marginLeft = model.margin.left + 'px';
		div.style.marginTop = model.margin.top + 'px';
		div.style.fontSize = model.fontSize;

		return div;
	};
	/*
		처음 select box 에 표시될 문자열을 설정.
	 */
	function defaultText (className, defText)	{
		var div = document.createElement('div'),
				span = document.createElement('span'),
				itag = document.createElement('i');

		div.className = className + ' select';
		div.style.paddingTop = 10 - model.margin.top + 1 + 'px';
		div.style.paddingBottom = 10 - model.margin.top + 1 + 'px';
		div.style.paddingLeft = 10 - model.margin.left + 1 + 'px';
		div.style.paddingRight = 10 - model.margin.left + 1 + 'px';

		span.title = defText;
		span.innerHTML = defText;

		itag.className = 'fa fa-chevron-down';

		return div.appendChild(span), div.appendChild(itag), div;
	};
	/*
		선택한 값이 표시 될 input 태그를 만드는 함수.
	 */
	function inputViewer (viewName)	{
		var input = document.createElement('input');

		return input.type = 'hidden', input.name = viewName, input;
	};
	/*
		Item 들을 list 형식으로 만드는 함수.
	 */
	function addItems (items)	{
		var ul = document.createElement('ul');

		ul.className = 'dropeddown';

		bio.iteration.loop(items, function (item)	{
			var li = document.createElement('li');

			li.id = item;
			li.title = item;
			li.innerHTML = bio.drawing().textOverflow(
				item, model.fontSize, model.width * 0.40);

			ul.appendChild(li);
		});

		return ul;
	};
	/*
		Animation 및 Click 이벤트 처리 함수.
	 */
	function selectEvent (className, callback)	{
		// var tag = document.querySelector('.drop-menu');

		// tag.addEventListener('click', function (e)	{
		// 	e.stopPropagation();
		// 	e.preventDefault();

		// 	var ul = bio.drawing().findDom(this, '.dropeddown');
		// 	this.setAttribute('tabindex', 1);
		// 	this.focus();
		// 	this.className += ' active';
		// 	// Target 의 display 를 처음에 설정해주지 않으면,
		// 	// max-height 값이 적용되어진다. 그러므로 처음에 실행하도록하자.
		// 	ul.style.display = 'block';
		// 	bio.drawing().slideDown(ul);
		// }, true);

		// tag.addEventListener('blur', function (e)	{
		// 	e.stopPropagation();
		// 	e.preventDefault();

		// 	var ul = bio.drawing().findDom(this, '.dropeddown');
			
		// 	this.classList.remove('active');
		// 	bio.drawing().slideUp(ul);
		// }, true);

		// var items = Array.prototype.slice.call(
		// 						document.querySelectorAll('.dropeddown li'));

		// bio.iteration.loop(items, function (item)	{
		// 	item.addEventListener('click', function (e)	{
		// 		// Event bubbling 을 방지하기 위함.
		// 		e.stopPropagation();
		// 		e.preventDefault();

		// 		var sele = document.querySelector('.select'),
		// 				drmn = document.querySelector('.drop-menu'),
		// 				span = bio.drawing().findDom(sele, 'span'),
		// 				input = bio.drawing().findDom(drmn, 'input'),
		// 				ul = bio.drawing().findDom(tag, '.dropeddown');

		// 		span.textContent = this.id;
		// 		span.title = this.id;
		// 		input.value = this.id;

		// 		tag.classList.remove('active');
		// 		bio.drawing().slideUp(ul);

		// 		return !callback ? false : 
		// 						callback(this.id.toLowerCase());
		// 	}, true);
		// });
		className = '.' + className;

		// Click Event 중복 발생 금지 방법.
		$(className).click(function (e) {
      $(this).attr('tabindex', 1).focus();
      $(this).toggleClass('active');
      $(this).find('.dropeddown').slideToggle(300);
    });
    $(className).focusout(function () {
      $(this).removeClass('active');
      $(this).find('.dropeddown').slideUp(300);
    });
    $(className + ' .dropeddown li').click(function (e) {
      $(this).parents('.drop-menu')
      			 .find('span').text($(this).text());
      $(this).parents('.drop-menu')
      			 .find('span').attr('title', $(this).attr('id'));
      $(this).parents('.drop-menu')
      			 .find('input').attr('value', $(this).attr('id'));

      return !callback ? false : 
      				callback($(this).attr('id').toLowerCase());
    });
	};

	return function (opts)	{
		model = {};
		model.element = document.querySelector(opts.id);
		model.className = opts.className || '';
		model.margin = bio.sizing.setMargin(
			opts.margin || [0, 0, 0, 0]);
		model.width = 
		opts.width || parseFloat(model.element.style.width);
		model.height = 
		opts.height || parseFloat(model.element.style.height);
		model.defaultText = opts.defaultText || 'Select';
		model.viewName = opts.viewName || 'viewName';
		model.fontSize = opts.fontSize || '10px';
		model.items = opts.items || [''];
		model.clickItem = opts.clickItem || null;
		model.frame = makeSelectBoxFrame(model.className);
		model.defaultText = defaultText(
			model.className, model.defaultText);
		model.viewer = inputViewer(model.viewName);
		model.addItems = addItems(model.items);

		if (model.element.children.length < 1)	{
			model.frame.appendChild(model.defaultText);
			model.frame.appendChild(model.viewer);
			model.frame.appendChild(model.addItems);

			model.element.appendChild(model.frame);

			selectEvent(model.className, model.clickItem);

			document.querySelector('.drop-menu .select')
							.style.lineHeight = model.fontSize;
		}
	};
};
function table ()	{
	'use strict';

	var model = { cellData: [], cellWidth: [] };

	function makeTable (width, height)	{
		var tb = document.createElement('div');

		tb.className = 'table-frame';
		tb.style.width = width + 'px';
		tb.style.height = height + 'px';

		return tb;
	};

	function caption (text)	{
		var capt = document.createElement('div');

		capt.innerHTML = text || '';
		capt.className = 'table-caption';
		capt.style.display = 'table-caption';

		return capt;
	};

	function rows (id)	{
		var row = document.createElement('div');

		row.id = id || '';
		row.className = 'table-row';
		row.style.display = 'table-row';

		return row;
	};

	function cells (text, width, height)	{
		var cell = document.createElement('div');

		cell.className = 'table-cell ' + text.removeWhiteSpace();
		cell.style.padding = '5px';
		cell.style.width = width + 'px';
		cell.style.height = (height || 35) + 'px';
		cell.style.lineHeight = (height || 25) + 'px';
		cell.style.display = 'table-cell';
		cell.innerHTML = text;

		return cell;
	};

	function getWidth (text)	{
		var div = document.createElement('div'),
				txt = text.indexOf('<') > -1 ? 
					 		text.substring(0, text.indexOf('<')) : text,
				width = 0;

		div.id = 'temp_width';
		div.style.fontSize = '16px';
		div.style.fontWeight = 'bold';
		div.style.overflow = 'hidden';
		div.style.border = '1px solid';
		div.style.whiteSpace = 'nowrap';
		div.style.display = 'table-cell';
		div.style.textOverflow = 'ellipse';

		div.innerHTML = txt;

		document.body.appendChild(div);

		width = div.getBoundingClientRect().width;

		document.body.removeChild(
			document.querySelector('#temp_width'));

		return width + 12;
	};
	/*
		각 컬럼의 최대 크기를 구한다.
	 */
	function getColumnSize (heads, datas, callback)	{
		model.cellWidth.fill(heads.length, 0);

		bio.iteration.loop(heads, function (head, col)	{
			model.cellWidth[col] = getWidth(head);
		});

		bio.iteration.loop(datas, function (data, row)	{
			var temp = [];

			bio.iteration.loop(heads, function (head, col)	{
				var cols = callback(col, row, head, data);

				model.cellWidth[col] = 
				model.cellWidth[col] > getWidth(cols) ? 
				model.cellWidth[col] : getWidth(cols);

				temp.push(cols);
			});

			model.cellData.push(temp);
		});
		// 최상위 div 가 table 이 아니므로 크기를 설정해준다.
		var width = 0;

		bio.iteration.loop(model.cellWidth, function (cell)	{
			width += cell;
		});

		model.frame.style.width = (width + 20) + 'px';
	};

	function makeHeads (frame, list)	{
		var div = document.createElement('div'),
				header = rows();

		div.className = 'table-header';

		bio.iteration.loop(list, function (l, i)	{
			header.appendChild(cells(l, model.cellWidth[i]));
		});

		div.appendChild(header);
		frame.appendChild(div);

		return header;
	}

	function makeContents (frame, cellDatas, opts)	{
		var div = document.createElement('div');

		div.className = 'table-contents';
		div.style.height = opts.height + 'px';

		bio.iteration.loop(cellDatas, function (cell)	{
			var row = rows();

			bio.iteration.loop(cell, function (c, i)	{
				row.appendChild(cells(c, model.cellWidth[i]));
			});
			
			div.appendChild(row);
		});

		if (opts.data.length < 1)	{
			return div;
		} else {
			frame.appendChild(div);			
		}
	};

	return function (opts)	{
		if (document.querySelector('.table-frame'))	{
			opts.element.removeChild(
				document.querySelector('.table-frame'));
		}

		if (!opts.columns)	throw new Error('Not found Columns');

		model.element = opts.element;
		model.width = opts.width || 0;
		model.height = opts.height || 0;

		model.frame = makeTable(model.width, model.height);

		getColumnSize(opts.heads, opts.data, opts.columns);

		model.frame.appendChild(caption(opts.title));
		makeHeads(model.frame, opts.heads);
		makeContents(model.frame, model.cellData, opts);

		model.element.appendChild(model.frame);
	};
};
function title ()	{
	'use strict';

	var model = {};
	/*
		각 차트의 제목을 생성해주는 함수.
	 */
	return function (element, text)	{
		var target = bio.dom().get(element),
				width = parseFloat(target.style.width),
				height = parseFloat(target.style.height);

		// Set title text.
		target.innerHTML = text;
		// >>> Setting style for title.
		target.style.fontSize = bio.drawing().fitText(
														text, width, height, 'bold');
		target.style.lineHeight = target.style.height;
	};
};
function tooltip ()	{
	'use strict';

	var model = {};
	/*
		Tooltip 의 방향을 설정해주는 함수.
	 */
	function setDirection (tbcr, pbcr, bcr)	{
		if (tbcr.left - bcr.width / 2 < pbcr.left)	{
			return 'right';
		} else if (tbcr.top - bcr.height < pbcr.top)	{
			return 'bottom';
		} else if (tbcr.right + bcr.width > pbcr.right)	{
			return 'left';
		} else if (tbcr.bottom + bcr.height > pbcr.bottom)	{
			return 'top';
		} else {
			return 'top';
		}
	};	
	/*
		Tooltip 을 띄워주는 함수.
	 */
	function show (div, target, parent)	{
		if (!div)	{
			throw new Error('Do not find a Tooltip element');
		}

		var bcr = div.getBoundingClientRect(),
				tbcr = target.getBoundingClientRect(),
				pbcr = parent.getBoundingClientRect(),
				dir = setDirection(tbcr, pbcr, bcr);
		/*
			Tooltip 의 위쪽 Position 값 설정.
		 */
		function setTop (dir, pos, height)	{
			if (dir !== 'left' && dir !=='top' && 
					dir !== 'bottom' && dir !== 'right')	{
				throw new Error('Wrong direction');
			}

			return {
				top: pos.top - height - 10 + window.scrollY + 'px',
				left: pos.top - height / 2 + window.scrollY + 'px',
				bottom: pos.bottom + 10 + window.scrollY + 'px',
				right: pos.top - height / 2 + window.scrollY + 'px',
			}[dir];
		};
		/*
			Tooltip 의 왼쪽 Position 값 설정.
		 */
		function setLeft (dir, pos, width)	{
			if (dir !== 'left' && dir !=='top' && 
					dir !== 'bottom' && dir !== 'right')	{
				throw new Error('Wrong direction');
			}

			return {
				top: pos.left - width / 2 + window.scrollX + 'px',
				left: pos.left - width - 10 + 'px',
				bottom: pos.left - width / 2 + window.scrollX + 'px',
				right: pos.right + 10 + 'px',
			}[dir];
		};

		div.className = dir;
		div.style.visibility = 'visible';
		// Set top & Left(Scroll 변화가 있을 경우도 고려.)
		div.style.top = setTop(dir, tbcr, bcr.height);
		div.style.left = setLeft(dir, tbcr, bcr.width);
	};
	/*
		Tooltip 을 가려주는 함수.
	 */
	function hide (div)	{
		if (!div)	{
			throw new Error('Do not find a Tooltip element');
		}

		div.innerHTML = '';
		div.style.top = '0px';
		div.style.left = '0px';
		div.style.visibility = 'hidden';
	};
	/*
		TODO.
			- Scroll 위치 변경 적용.
			- SVG 밖을 안벗어나게끔 적용.
	 */
	return function (opts)	{
		if (bio.objects.getType(opts) === 'String')	{
			if (!document.getElementById('biochart_tooltip'))	{
				throw new Error('Not found "#biochart_tooltip"');
			}
			
			return hide(document.getElementById('biochart_tooltip'));
		}

		var target = opts.element || null,
				contents = opts.contents || '',
				parent = bio.drawing().getParentSVG(target);

		var tooltipDiv = document.getElementById('biochart_tooltip');
				tooltipDiv.innerHTML = contents;

		return show(tooltipDiv, target, parent);
	};
};
function dependencies ()	{
	'use strict';
	// Dependencies 의 기능을 모아둔 Model 객체.
	var model = {
		version: {},	// Dependencies library 의 버전관련 객체.
	};
	/*
		현재 적용 된 D3JS 의 버전이 
		4 버전이면 true,
		3 버전이면 false 를 반환하는 함수.
	 */
	model.version.d3v4 = function ()	{
		// D3JS 가 존재하지 않을 경우 에러를 발생시킨다.
		if (!d3)	{
			throw new Error ('D3JS is not found');
		}
		// d3.version 의 0 번째 Index 가 '3' 일 경우 현재 D3JS
		// 의 버전은 3 버전이다.
		return d3.version.indexOf('3') === 0 ? false : true;
	};
	// Dependencies 객체의 기능을 모아둔 Model 객체를 반환한다.
	return model;
};
function dom ()	{
	'use strict';

	var model = {};
	/*
		'#ID', '.Class' 중 존재하는 엘리먼트를 반환하는 함수.
	 */
	model.get = function (ele)	{
		if (typeof(ele) === 'object')	{
			return ele;
		}

		var classify = ['#', '.'],
				classifyName = ele.removeSymbol(),
				result = null;

		bio.iteration.loop(classify, function (symbol)	{
			var name = symbol + classifyName,
					dom = document.querySelector(name);

			if (dom)	{
				result = dom;
			}
		});

		return result;
	};

	model.remove = function (element, childs)	{
		if (bio.objects.getType(element).indexOf('HTML') < 0)	{
			throw new Error('Not a dom element');
		}

		bio.iteration.loop(childs, function (child)	{
			element.removeChild(child);
		});
	};
	/*
		Element 파라미터 하위 Element 들을 
		모두 제거하는 함수.
	 */
	model.removeAll = function (element)	{
		if (bio.objects.getType(element).indexOf('HTML') < 0)	{
			throw new Error('Not a dom element');
		}

	 	while (element.firstChild)	{
	 		element.removeChild(element.firstChild);
	 	}
	};

	return function ()	{
		return model;
	};
};
function iteration ()	{
	'use strict';

	var model = {};
	/*
		객체, 리스트를 반복하는 함수.
		결과 값은 콜백함수의 파라미터로 전달 된다.
	 */
	model.loop = function (data, callback)	{
		if (typeof(data) !== 'object')	{
			throw new Error ('This is not Object or Array');
		}

		if (bio.objects.getType(data) === 'Array')	{
			for (var i = 0, l = data.length; i < l; i++)	{
				callback.call(this, data[i], i);
			}
		} else {
			for (var key in data)	{
				callback.call(this, key, data[key]);
			}
		}
	};
	// >>> About Array. 
	/*
		주어진 길이 만큼 주어진 값으로 리스트를 채워넣고 반환하는 함수.
	 */
	Array.prototype.fill = function (len, value)	{
		for (var i = 0; i < len; i++)	{
			this.push(value);
		}

		return this;
	};

	return model;
};
function math ()	{
	'use strict';

	var model = {};
	/*
		Number sequence 리스트에서 중간값의 위치를 반환한다.
	 */
	model.medianIndex = function (seqList)	{
		var len = seqList.length;
		// 홀수일 경우 1을 더한 후 2로 나누고 짝수는 그냥 2로 나눈다.
		return len % 2 === 1 ? (len + 1) / 2 : len / 2;
	};
	/*
		Number sequence 리스트에서 중간값을 반환한다.
	 */
	model.median = function (seqList)	{
		var list = bio.objects.clone(seqList);
		// 혹시라도 정렬이 안되어있을 경우를 고려하여 정렬한다.
		return list.sort(function (a, b)	{
						 return a > b ? 1 : -1;
					 })[model.medianIndex(list)];
	};
	/*
		두 수 혹은 숫자 리스트에서 가장 작은 값을 반환한다.
	 */
	model.min = function (v1, v2)	{
		return arguments.length < 2 ? 
					 Math.min.apply(null, v1) : 
					 Math.min.call(null, v1, v2);
	};
	/*
		두 수 혹은 숫자 리스트에서 가장 큰 값을 반환한다.
	 */
	model.max = function (v1, v2)	{
		return arguments.length < 2 ? 
					 Math.max.apply(null, v1) : 
					 Math.max.call(null, v1, v2);
	};
	/*
		Start 부터 End 까지의 범위내의 랜덤 값을 반환하는 함수.
	 */
	model.random = function (start, end)	{
		start = start || 0;
		end = end || 1;

		return Math.floor(Math.random() * end) + start;
	};

	return model;
};
function objects ()	{
	'use strict';

	var model = {};
	/*
		Object 의 Type 을 문자열로 반환하는 함수.
		Ex) 'SSS' -> 'String'.
	 */
	model.getType = function (obj)	{
		var str = Object.prototype
										.toString.call(obj);

		return str.substring(
					 str.indexOf(' ') + 1, 
					 str.indexOf(']'));
	};
	/*
		객체를 복사 (완전복사) 하여 반환하는 함수.
	 */
	model.clone = function (obj)	{
		if (typeof(obj) !== 'object')	{
			return obj;
		} else {
			if (model.getType(obj) === 'Array')	{
				return new Array().concat(obj);
			} else {
				var copy = {};

				bio.iteration.loop(obj, function (key, value)	{
					if (obj.hasOwnProperty(key))	{
						copy[key] = model.clone(obj[key]);
					}
				});

				return copy;
			}
		}
	};
	/*
		객체의 키를 값으로 찾아주는 함수.
	 */
	model.getKey = function (obj, value)	{
		var keys = Object.keys(obj),
				values = Object.values(obj);

		return keys[values.indexOf(value)];
	};

	return model;
}
/*
	String 객체의 prototype 으로 붙일 기능들을
	모아둔 객체.
 */
function strings ()	{
	'use strict';

	String.prototype.matchAll = function (regex)	{
		var matched = [], found;

		while (found = regex.exec(this))	{
			matched.push(found[0]);
		}

		return matched;
	};
	/*
		String 을 대명사 표기법 형태로 바꿔 반환하는 함수.
	 */
	String.prototype.pronoun = function ()	{
		return this[0].toUpperCase() + 
					 this.substring(1).toLowerCase();
	};
	/*
		문자열에 포함된 공백들을 지워주는 함수.
	 */
	String.prototype.removeWhiteSpace = function ()	{
		return this.replace(/\s/ig, '');
	};
	/*
		문자열에 포함된 특수문자들을 지워주는 함수.
	 */
	String.prototype.removeSymbol = function ()	{
		return this.replace(/\W/ig, '');
	}
	/*
		문자열에서 사용자지정위치의 문자를 다른 문자로 대치해주는 함수.
		String 객체의 프로토타입으로 지정하였다.
	 */
	String.prototype.replaceAt = function (idx, rep)	{
		// substring !== substr 
		// substring 은 start 부터 end 까지,
		// substr 은 start 부터 num 개를 자른다.
		return this.substring(0, idx) + rep + 
					 this.substring(idx + 1);
	};
	/*
		파라미터 값을 문자열내에서 모두 바꿔준다.
	 */
	String.prototype.replaceAll = function (target, change)	{
		return this.replace(new RegExp(target, 'ig'), change);
	};
};
function variants ()	{
	'use strict';

	var model = {};
	/*
		X, Y 축을 그리는 함수.
	 */
	function drawAxis (part, direction)	{
		var yData = [].concat(model.data.axis.needle.y);

		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().axis(
										part, direction, svg),
					common = bio.variantsConfig().axis('common'),
					data = model.data.axis.needle[direction.toLowerCase()];

			bio.axises()[config.direction]({
				element: svg,
				top: config.top,
				left: config.left,
				range: config.range,
				margin: config.margin,
				exclude: config.exclude,
				domain: direction === 'Y' ? yData.reverse() : data,
			});
		});
	};
	/*
		Legend 를 그리는 함수.
	 */
	function drawLegend (part, data)	{
		var tags = { 
			needle: 's_legend', patient: 't_legend' 
		}[part];

		data = data.sort(function (a, b)	{
			return bio.boilerPlate.variantInfo[a].order > 
						 bio.boilerPlate.variantInfo[b].order ? 1 : -1;
		});

		bio.layout().get(model.setting.svgs, [tags], 
		function (id, svg)	{
			var config = bio.variantsConfig().legend(part);

			bio.legend({
				data: data,
				element: svg,
				on: config.on,
				attr: config.attr,
				text: config.text,
				style: config.style,
				margin: config.margin,
			});
		});
	};
	/*
		Needle Plot 을 그려주는 함수.
	 */
	function drawNeedle (line, shape, axis, toDrag)	{
		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().needle();

			bio.needle({
				element: svg,
				yaxis: axis.y,
				on: config.on,
				lineData: line,
				shapeData: shape,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				xaxis: toDrag || axis.x,
			});
		});
	};
	/*
		Needle plot 의 Navigator 를 그려주는 함수.
	 */
	function drawNeedleNavi (data, axis)	{
		bio.layout().get(model.setting.svgs, ['navi'], 
		function (id, svg)	{
			var config = bio.variantsConfig().navi();

			bio.variantsNavi({
				data: data,
				element: svg,
				xaxis: axis.x,
				yaxis: axis.y,
				on: config.on,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				call: {
					drag: config.call.drag,
					end: function (data, idx, that)	{
						var dg = that.opts.drag,
								iv = bio.scales().invert(that.scaleX),
								domain = [
									iv(dg.start.now + that.controls.width),
									iv(dg.end.now + that.controls.width)],
								range = [
									that.margin.left, 
									that.width - that.margin.right];

						d3.selectAll('.bottom-axis-g-tag')
							.call(bio.axises().byD3v(
										bio.scales().get(domain, range), 'bottom'));

						bio.layout().removeGroupTag([
							'.variants_needle_svg.needle-line-g-tag', 
							'.variants_needle_svg.needle-shape-g-tag',
							'.variants_needle_svg.needle-graph-g-tag', 
							'.variants_needle_svg.needle-patient-shape-g-tag'
							]);

						drawNeedle(
							model.data.needle.line, model.data.needle.shape, 
							model.data.axis.needle, domain);
						drawNeedleGraph(model.data.graph, 
														model.data.axis.needle, domain);
						drawPatient(model.data.patient.shape, 
												model.data.axis.needle, domain);
					},
				},
			});
		});
	};
	/*
		Needle plot 의 Graph 를 그려주는 함수.
	 */
	function drawNeedleGraph (data, axis, toDrag)	{
		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().graph();

			bio.variantsGraph({
				data: data,
				element: svg,
				on: config.on,
				yaxis: axis.y,
				text: config.text,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				xaxis: toDrag || axis.x,
			});
		});
	};
	/*
		Patient 를 표시해주는 함수.
	 */
	function drawPatient (data, axis, toDrag)	{
		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().patient(),
					needleConfig = bio.variantsConfig().needle();

			bio.variantsPatient({
				data: data,
				element: svg,
				yaxis: axis.y,
				attr: config.attr,
				style: config.style,
				on: needleConfig.on,
				margin: config.margin,
				xaxis: toDrag || axis.x,
			});
		});
	};
	/*
		Variants 를 그려주는 함수.
	 */
	function drawVariants (data)	{
		bio.layout().removeGroupTag();

		drawAxis('needle', 'X');
		drawAxis('needle', 'Y');
		drawLegend('needle', data.type);
		drawLegend('patient', [data.patient.shape[0].info[0].id]);
		drawNeedle(
			data.needle.line, data.needle.shape, data.axis.needle);
		drawNeedleNavi(data, data.axis.needle);
		drawNeedleGraph(data.graph, data.axis.needle);
		drawPatient(data.patient.shape, data.axis.needle);
	};

	return function (opts)	{
		model = bio.initialize('variants');
		model.setting = bio.setting('variants', opts);
		model.data = model.setting.preprocessData;
		// Set landscape title.
		bio.title('#variants_title', 
			model.setting.defaultData.variants.title);

		drawVariants(model.data);

		console.log('>>> Variants reponse data: ', opts);
		console.log('>>> Variants setting data: ', model.setting);
		console.log('>>> Variants model data: ', model);
	};
};
function variantsGraph ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.graphData = opts.data;

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.margin.top, 
			model.height - model.margin.bottom];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
									opts.element, 0, 0, 'needle-graph');

		model.opts = {
			base: bio.objects.clone(opts),
			graph: bio.objects.clone(opts),
		};
		model.opts.base.data = [''];
		model.opts.base.id = model.id + '_graph_base';
		model.opts.base.element = 
		model.group.selectAll('#' + model.id + '_graph_base');

		bio.rectangle(model.opts.base, model);

		model.opts.graph.id = model.id + '_graph_group';
		model.opts.graph.data = null;
		model.opts.graph.element = 
		model.group.selectAll('#' + model.id + '_graph_group')
							 .data(model.graphData).enter()
							 .append('g')
							 .attr('id', model.id + '_graph_group')
							 .attr('transform', 'translate(0, 0)');				
		
		bio.rectangle(model.opts.graph, model);
		bio.text(model.opts.graph, model);
	};
};
function variantsNavi ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		var config = bio.variantsConfig().navi();

		model = bio.initialize('variantsNavi');
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.naviData = opts.data;

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.height - model.margin.bottom,
			model.margin.top,];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.controls = { width: 5, height: model.height * 0.4 };

		model.start = model.scaleX(bio.math.min(model.copyX));
		model.end = model.width - model.margin.left - 
								model.margin.right;

		config.start.init = model.start - model.controls.width;
		config.end.init = model.end - model.controls.width + 
													 model.margin.left;
		config.start.now = config.start.init;
		config.end.now = config.end.init;
		config.navi.init = model.start;
		config.navi.now = model.start;
		config.navi.width = model.end;
		config.navi.nowWidth = model.end - model.start;

		model.group = bio.rendering().addGroup(
									opts.element, 0, 0, 'heatmap');

		var needleConfig = bio.variantsConfig().needle(),
				naviConfig = bio.variantsConfig().navi();

		bio.needle({
			xaxis: model.copyX,
			yaxis: model.copyY,		
			element: opts.element,
			attr: needleConfig.attr,
			style: needleConfig.style,
			margin: [10, 40, 10, 40],
			lineData: model.naviData.needle.line,
			shapeData: model.naviData.needle.shape,
		});

		model.opts = {
			end: bio.objects.clone(opts),
			main: bio.objects.clone(opts),
			start: bio.objects.clone(opts),
			drag: config,
		};
		model.opts.main.data = ['main'];
		model.opts.main.id = model.id + '_navi_main';
		model.opts.main.element = 
		model.group.selectAll('#' + model.id + '_navi_main');
		model.opts.start.data = ['start'];
		model.opts.start.id = model.id + '_navi_start';
		model.opts.start.element = 
		model.group.selectAll('#' + model.id + '_navi_start');
		model.opts.end.data = ['end'];
		model.opts.end.id = model.id + '_navi_end';
		model.opts.end.element = 
		model.group.selectAll('#' + model.id + '_navi_end');

		bio.rectangle(model.opts.main, model);
		bio.rectangle(model.opts.start, model);
		bio.rectangle(model.opts.end, model);
		// Path 가 영 걸리적 거려 삭제 했다.
		d3.selectAll('#' + model.id + ' path').remove();
	};
};
function variantsPatient ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.patientData = opts.data;

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.height - model.margin.bottom, 
										model.margin.top];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.shapeGroup = bio.rendering().addGroup(
			opts.element, 0, 0, 'needle-patient-shape');
		
		model.opts = bio.objects.clone(opts);
		model.opts.data = model.patientData;
		model.opts.element = 
		model.shapeGroup.selectAll(
			'#' + model.id + '_needle_patient_shape');
		
		bio.triangle(model.opts, model);
	};
};