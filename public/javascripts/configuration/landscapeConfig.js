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
							'Sort by alt + <b>' + this.innerHTML + '</b>' : 
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

						if (d3.event.altKey)	{
							return {
								sorted: bio.landscapeSort()
													 .gene(that.data.axis.heatmap.x, temp),
								model: that,
							};	
						}
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
					id: function (data, idx, that)	{
						return 'landscape_gene_' + data.y + 
										'_pq_rect';
					},
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
					id: function (data, idx, that)	{
						return 'landscape_gene_' + data.y + 
										'_bar_rect';
					},
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
					id: function (data, idx, that)	{
						return 'landscape_gene_' + data.y + 
										'_heatmap_rect';
					},
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