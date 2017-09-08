var landscape = (function (landscape)	{
	'use strict';

	var model = {
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
		exclusive: {
			init: null,
		},
	};
	/*
		Group 의 갯수만큼 div 를 만들어주는 함수.
	 */
	function makeGroupLayout (p, g, x)	{
		util.loop(g, function (d, i)	{
			var v = document.createElement('div');

			v.style.width = p.style.width;
			v.style.height = parseFloat(p.style.height) / l + 'px';
			v.style.overflowX = 'hidden';
			v.style.overflowY = 'hidden';
			v.id = p.id + '_' + d.replace(/\s/ig, '');	

			p.appendChild(v);			
		});
	}
	/*
		제목을 써주는 함수.
	 */
	function title ()	{
		model.div.title = document.querySelector('#landscape_title');
		model.div.title.innerHTML = model.origin.title;
		model.div.title.style.fontSize = 
			draw.getFitTextSize(model.origin.title,
							 parseFloat(model.div.title.style.width), 
							 parseFloat(model.div.title.style.height));
		model.div.title.style.lineHeight = 
			parseFloat(model.div.title.style.height) + 'px';
	};
	/*
		Group 하나하나의 div 를 만들어주는 함수.
	 */
	function makeGroupDiv (p, g, o)	{
		var div = document.createElement('div');

		model.ids.push((div.id = p.id + '_' + g, div.id));

		util.loop(o, function (k, v)	{
			div.style[k] = v;
		});

		p.appendChild(div);
	};
	/*
		Group 별 div 를 만들어주는 함수.
	 */
	function groupFrame (g)	{
		// Group axis, patient, chart div 목록과 식별자가 될 key 값.
		var t = {
			'_patient': document.getElementById('landscape_patient_group'),
			'_axis': document.getElementById('landscape_axis_group'),
			'_chart': document.getElementById('landscape_group'),
		};
		// t 만큼 돌면서 각 그룹을 돈다.
		util.loop(t, function (k, v)	{
			util.loop(g.map(function (d) { return d.name; }) , function (d, i)	{
				makeGroupDiv(v, util.removeWhiteSpace(d) + k, {
					width: draw.width(v) + 'px',
					height: draw.height(v) / g.length + 'px',
					// 아래 옵션은 원래는 chart 에만 적용되야 되지만,
					// 조건문 걸기에는 너무 영향이 미약해 그냥 모두에게 적용하였다.
					overflowX: 'hidden',
					overflowY: 'hidden',
				});
			});
		});	
	};	
	/*
		Config object 를 가져오는 공통함수.
	 */
	function getConfig (k, c, d, cb)	{
		// 아래 루프에서 patient_sample 의 경우 2개의 데이터를
		// 불러온다. 이를 막기위해서 처음 한번이 되었을 때, 넘어가게
		// 한다.
		var r = false;

		util.loop(k.split('_'), function (a, i)	{
			if (config.landscape[c][a])	{
				if (!r)	{
					r = true;

					cb(config.landscape[c][a], d[a]);
				}
			}
		});
	};
	/*
		config.landscape.axis 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getAxisConfig (k, cb)	{
		return getConfig(k, 'axis', model.data.axis, cb);
	};
	/*
		config.landscape.bar 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getBarConfig (k, cb)	{
		return getConfig(k, 'bar', model.data, cb);
	};
	/*
		config.landscape.stack 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getStackConfig (k, cb)	{
		return getConfig(k, 'stack', model.data.stack, cb);
	};
	/*
		config.landscape.heatmap 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getHeatConfig (k, cb)	{
		return getConfig(k, 'heatmap', model.data, cb);
	}
	/*
		config.landscape.group 에서 key 에 맞는
		설정을 가져와 반환해주는 함수.
	 */
	function getGroupConfig (k, cb)	{
		return getConfig(k, 'group', model.data.group, cb);
	}
	/*
		Group 데이터를 배열안에서 찾아내어주는 함수.
	 */
	function axisForGroup (i, d)	{
		var r;

		if (i.indexOf('group') < 0)	{
			return d;
		}
		
		i.split('_').forEach(function (c)	{
			util.loop(d, function (dd, ii)	{
				if (c === dd[0].replace(/\s/ig, ''))	{
					r = dd;
				}
			});
		});

		return r;
	};
	/*
		Group 데이터를 각행에 맞는 값을 찾아 반환해주는 함수.
	 */
	function dataForGroup (k, d)	{
		var r;

		util.loop(d, function (dd, ii)	{
			var v = (dd.y || dd[0].y).replace(/\s/ig, '');

			if (k.indexOf(v) > -1)	{
				r = util.varType(dd) === 'Array' ? dd : [dd];
			}
		});

		return r;
	};
	/*
		Group lIST 를 합치는 함수.
	 */
	function mergeGroup (glist)	{
		var result = [];

		util.loop(glist, function (d)	{
			result = result.concat(d);
		});

		return result;
	};
	/*
		Group, Gene 의 Sort 을 위해 각각의 Axis 에 
		붙인 Click 이벤트 함수이다.
	 */
	function axisForSort (d, i, k)	{
		if (k.indexOf('group') > -1)	{
			util.loop(model.data.axis.group.y, function (dd, i)	{
				if (dd[0] === d)	{
					var data = new Array().concat(
							model.data.group.group[i]);

					model.now.group = 
					landscapeSort.byGroup.call(model, data, 
						d3.event.altKey ? true : false);
				}
			});

			var axis = { 
						axis: 'x', 
						data: mergeGroup(model.now.group.axis.data),
					};

			layout.removeG();
			changeAxisScale(axis);
			drawLandScape(model.data, model.now.width);
		} else {
			var data = [];

			util.loop(model.data.heatmap, function (dd, i)	{
				if (dd.y === d)	{
					data.push(dd);
				}
			});

			layout.removeG();
			changeAxisScale(landscapeSort.byGene(
					model.data.axis.heatmap.x, data));
			drawLandScape(model.data, model.now.width);
		}
	};
	/*
		Group, Gene Axis text 의 이벤트를 처리하는 함수.
	 */
	function axisEvent (key, el)	{
		el.style('cursor', 'pointer')
			.on('click', function (d, i)	{
				return axisForSort.call(this, d, i, key);
			})
			.on('mouseover', function (d)	{
				d3.select(this).style('font-size', '12px');
				
				tooltip({
					element: this,
					contents: key.indexOf('group') > -1 ? 
					'<b>' + d + '</b></br>' + 
					'Click to Sort</br>Alt + Click add to key' : 
					'Sort by <b>' + d + '</b>',
				});
			})
			.on('mouseout', function ()	{
				d3.select(this).style('font-size', '10px');

				tooltip('hide');
			});
	};
	/*
		x, y 축을 그려주는 함수.
	 */
	function drawAxis ()	{
		layout.getSVG(model.svg, 
			['axis_sample', 'gene', 'pq', 'axis_group_'], 
			function (k, v)	{
				getAxisConfig(k, function (c, d)	{
				c = util.varType(c) !== 'Array' ? [c] : c;

				util.loop(c, function (dd, i)	{
					// Gene axis 의 가로 세로 margin 값을 조정한다.
					if (k.indexOf('gene') > -1 && 
							dd.direction === 'right')	{
						dd.margin[1] = 
						config.landscape.stack.gene.margin[3] + 10 + 
						draw.getMostWidthOfText(
								 axisForGroup(v.attr('id'), d.y, '10px'));
					} else if (k.indexOf('gene') > -1 && 
										 dd.direction === 'bottom')	{
						dd.margin[3] = 
						config.landscape.stack.gene.margin[3];
					}

					var ag = axis.element(v)[dd.direction]({
						margin: dd.margin,
						data: axisForGroup(v.attr('id'), 
									dd.direction === 'top' || 
									dd.direction === 'bottom' ? d.x : d.y),
						opt: dd.opt,
					});

					if (k.indexOf('group') > -1 || 
						 (k.indexOf('gene') > -1 && 
						 	dd.direction === 'right'))	{
						axisEvent(k, 
							d3.select(ag.node()).selectAll('g text'));
					}
				});
			});
		});
	};
	/*
		Bar 차트가 stacked 와 none stacked 가 있는데,
		두 개 모드 같은 함수를 호출하므로 별도의 함수로 처리하였다.
	 */
	function drawCommonBar (c, d, v, k)	{
		bar({
			data: d,
			opt: c.opt,
			element: v,
			attr: c.attr,
			style: c.style,
			on: c.on,
			margin: c.margin,
			direction: c.direction,
			width: k.indexOf('patient') < 0 && 
						 k.indexOf('sample') > -1 ? 
						 (model.now.width || model.init.width) : null,
			xaxis: c.xaxis.call(model.data.axis),
			yaxis: c.yaxis.call(model.data.axis),
		});
	}
	/*
		일반 Bar 차트를 그리는 함수.
	 */
	function drawBar () {
		layout.getSVG(model.svg, ['pq'], function (k, v)	{
			getBarConfig(k, function (c, d)	{
				drawCommonBar(c, d, v, k);
			});
		});
	};
	/*
		Stack 형태의 Bar 차트를 그리는 함수.
	 */
	function drawStack ()	{
		layout.getSVG(model.svg, 
		['e_sample', 'patient_sample', 'gene'], 
		function (k, v)	{
			getStackConfig(k, function (c, d)	{
				drawCommonBar(c, d, v, k);
			});
		});
	};
	/*
		Patient 와 Normal 데이터의 Heatmap 을 그리는 함.
	 */
	function drawHeat () {
		layout.getSVG(model.svg, ['_heatmap'], 
		function (k, v)	{
			getHeatConfig(k, function (c, d)	{
				heatmap({
					data: d,
					dup: true,
					opt: c.opt,
					element: v,
					attr: c.attr,
					style: c.style,
					on: c.on,
					margin: c.margin,
					xaxis: c.xaxis.call(model.data.axis),
					yaxis: c.yaxis.call(model.data.axis),
					width: k.indexOf('patient') < 0 ? 
					(model.now.width || model.init.width) : null,
				});
			});	
		});
	};
	/*
		Group & Patient Group 을 그려주는 함수.
	 */
	function drawGroup ()	{
		layout.getSVG(model.svg, ['t_group_', 'e_group_'], 
		function (k, v)	{
			getGroupConfig(k, function (c, d)	{
				heatmap({
					element: v,
					opt: c.opt,
					attr: c.attr,
					style: c.style,
					on: c.on,
					margin: c.margin,
					data: dataForGroup(k, d),
					width: k.indexOf('patient') < 0 ? 
					(model.now.width || model.init.width) : null,
					xaxis: c.xaxis.call(model.data.axis),
					yaxis: model.data.axis.group.y
											.filter(function (dd, ii)	{
						if (k.indexOf(dd[0].replace(/\s/ig, '')) > -1)	{
							return dd;
						}
					})[0],
				});
			});
		});
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend ()	{
		layout.getSVG(model.svg, ['legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type,
				margin: config.landscape.legend.margin,
				priority: config.landscape.priority,
				text: config.landscape.legend.text,
				attr: config.landscape.legend.attr,
				style: config.landscape.legend.style,
				margin: [v.attr('height') / 3, 20, 0, 0],
			});
		});
	};
	/*
		초기 가로 길이값을 정해주는 함수. (초기값은 프레임 크기의 2배)
	 */
	function initSize ()	{
		model.init.width = 
		draw.width(d3.select('#landscape_heatmap').node()) * 2;
		model.init.height = 
		draw.height(d3.select('#landscape_heatmap').node());
	};
	/*
		Scale Option 을 그려주는 함수.
	 */
	function drawScale ()	{
		landscapeScaleOption.set({
			element: '#landscape_option',
			default: 100,
			defaultValue: model.init.width,
			interval: 10,
			unit: '%',
			btn: [
				{id: 'upscale', className: 'upscale'},
				{id: 'downscale', className: 'downscale'},
				{id: 'initialize', className: 'initialize'}
			],
			input: {id: 'viewscale', className: 'viewscale'},
			change: function (btn, now)	{
				layout.removeG();
				// Initialize 버튼을 클릭하였을 때, 초기화면으로 되돌려 준다.
				if (btn === 'initialize')	{
					changeAxisScale({ 
						axis: 'x', data: model.init.axis.x });
					changeAxisScale({
						axis: 'y', data: model.init.axis.y });

					return drawLandScape(model.data, 
								(model.now.width = model.init.width, 
								 model.now.width));
				}
				return drawLandScape(model.data, 
						 	(model.now.width = now, model.now.width));
			},
		});
	};

	function changeAxisScale (data)	{
		if (data.axis === 'x')	{
			model.data.axis.group[data.axis] = data.data;
			model.data.axis.sample[data.axis] = data.data;
			model.data.axis.heatmap[data.axis] = data.data;
		} else {
			model.data.axis.pq[data.axis] = data.data;
			model.data.axis.gene[data.axis] = data.data;
			model.data.axis.heatmap[data.axis] = data.data;
		}
	};
	/*
		정렬버튼과 현재 정렬의 상태를 보여주는 UI 를 그려주는 함수.
	 */
	function drawSort ()	{
		var tag = ['axis_sample', 'gene', 'pq'],
				txt = ['#Mutations', '#Mutations', '-log10(p-value)'],
				i = 0;

		layout.getSVG(model.svg, tag, function (k, v)	{
			var md = {};

			md.id = v.attr('id');
			md.w = v.attr('width');
			md.h = v.attr('height');
			md.m = size.setMargin(config.landscape.stack.gene.margin);
			md.g = render.addGroup(v, md.m.top, md.m.left);

			if (md.id.indexOf('sample') > -1)	{
				md.g.attr('transform', 
									'translate(' + md.m.top + ',' + md.m.left 
															 + ') rotate(270)');
			}

			render.text({
				element: md.g.selectAll('#' + md.id + '_sort_text'),
				data: [txt[i++]],
				id: function (d)	{ return md.id + 'sort_text'; },
				attr: {
					x: function (d, i)	{
						if (md.id.indexOf('sample') > -1)	{
							return -md.m.bottom * 2 + md.m.top;
						} else if (md.id.indexOf('gene') > -1)	{
							return md.w - md.m.right * 2 + md.m.left;
						} else if (md.id.indexOf('pq') > -1)	{
							return md.m.left;
						}
					},
					y: function (d, i)	{
						return md.id.indexOf('sample') > -1 ? 
									 md.w - md.m.bottom : 
									 md.h - md.m.top * 2.8;
					},
				},
				style: {
					'alignment-baseline': 'middle',
					'font-weight': 'bold',
					'font-size': '12px',
					'cursor': 'pointer',
					'fill': '#333333',
				},
				on: {
					click: function (d, i)	{
						var prop = '';

						if (md.id.indexOf('sample') > -1)	{
							prop = 'sample';
						} else if (md.id.indexOf('gene') > -1)	{
							prop = 'gene';
						} else if (md.id.indexOf('pq') > -1)	{
							prop = 'pq';
						}

						!model.now.sort[prop] ? 
						 model.now.sort[prop] = 'asc' : 
						 model.now.sort[prop] === 'asc' ? 
						 model.now.sort[prop] = 'desc' : 
						 model.now.sort[prop] = 'asc';

						layout.removeG();
						changeAxisScale(
							landscapeSort[model.now.sort[prop]]
							(prop, model.data));
						drawLandScape(model.data, model.now.width);
					},
					mouseover: function ()	{
						tooltip({
							element: this,
							contents: 'Sort by <b>' + 
												d3.select(this).text() + '</b>',
						});
					},
					mouseout: function ()	{
						tooltip('hide');
					},
				},
				text: function (d, i)	{ return d; },
			});
		});
	};
	/*
		Sample, Group, Heatmap 의 가로 길이를 정의해줄 함수.
	 */
	function setWidth (width)	{
		layout.getSVG(model.svg, 
		['e_group_', 'e_sample', 'e_heatmap'], 
		function (k, v)	{
			v.attr('width', width || model.now.width || 
															 model.init.width);
		});
	};
	/*
		Landscape 를 그리는 함수.
	 */
	function drawLandScape (d, w)	{
		// Set Width.
		setWidth(w);
		// Draw Axis.
		drawAxis();
		// Draw Stack.
		drawStack();
		// Draw Bar.
		drawBar();
		// Draw Heatmap.
		drawHeat();
		// Draw Group.
		drawGroup();
		// Draw Legend.
		drawLegend();
		// Draw Sorting label.
		drawSort();
	};

	return function (opts)	{
		var e = document.querySelector(opts.element || null),
				s = size.rightToSize('landscape', 
						opts.width || e.style.width,
						opts.height || e.style.height);

		e.style.background = '#F7F7F7';
		// Origin data from server.
		model.origin = opts.data;
		// preprocess data for landscape and call drawLandScape.
		model.data = preprocessing.landscape(opts.data.data);
		// Make Landscape layout and return div ids.
		model.ids = size.chart.landscape(e, s.width, s.height);
		// 처음에 가로 길이를 정해준다.
		initSize();
		// Write Title.
		title();
		// Draw Scale.
		drawScale();
		// 그룹 개수에 따라 div 를 만들어 준다 (높이는 일정한 간격).
		groupFrame(model.origin.data.group_list);
		// Make svg to parent div and object data.
		model.svg = layout.landscape(model.ids, model);
		// to exclusive.
		model.exclusive.init = landscapeSort.exclusive(
			model.data.heatmap, model.data.gene);
		// 초기 x, y 축 값을 저장해 놓는다. 이는 나중에 초기화 버튼을
		// 눌렀을때 초기화면으로 돌아가기 위함이다.
		model.init.axis.x = 
		new Array().concat(model.exclusive.init.data);
		model.init.axis.y = 
		new Array().concat(model.data.axis.gene.y);
		// Set init exclusive.
		changeAxisScale(model.exclusive.init);
		// Mutational Landscape 를 그려주는 함수.
		drawLandScape(model.data, model.init.width);
		// Scroll event for moving execution.
		eventHandler.onScroll('#landscape_heatmap', function (e)	{
			var s = document.querySelector('#landscape_sample'),
					g = document.querySelector('#landscape_group').children,
					a = Array.prototype.slice.call(g);

			s.scrollLeft = this.scrollLeft;

			util.loop.call(this, a, function (d, i)	{
				d.scrollLeft = this.scrollLeft;
			});
		});

		console.log('Given Landscape data: ', opts);
		console.log('Landscape Model data: ', model);
	};
}(landscape||{}));