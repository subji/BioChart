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