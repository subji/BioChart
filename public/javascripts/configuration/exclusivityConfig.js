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