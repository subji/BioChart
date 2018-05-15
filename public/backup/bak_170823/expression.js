var expression = (function (expression)	{
	'use strict';

	var model = {
		init: {
			func: 'Average',
			sig: null,
			col: null,
		},
		now: {
			func: null,
			sig: null,
			col: null,
			osdfs: 'os',
		},
		divide: {

		},
	};
	/*
		Survival 을 그리기 위해 Function 값의 
		Median 을 기준으로 altered / unaltered 데이터를 
		나눠주는 함수이다.
	 */
	function dividedData (data, med)	{
		model.data.survival.divide = {};

		util.loop(data, function (d, i)	{
			d.value <= med ? 
			model.data.survival.divide[d.x] = 'unaltered' : 
			model.data.survival.divide[d.x] = 'altered';
		});
	};
	/*
		Survival Tab 의 변화에 따라서 Scatter 를 호출하며,
		단, 이미 선택된 탭에 대해선 변화를 주지 않는다.
	 */
	function callScatterBySurvival (type)	{
		if (model.now.osdfs !== type) {
			layout.removeG(['scatter-g-tag']);
			drawScatter(model.now.osdfs = type, model.now.osdfs);			

			if (model.divide.lowArr || model.divide.highArr)	{
				noneSelectedToBlur(d3.selectAll(
					'#expression_scatter_plot_chart_circle'), 
					model.divide.lowArr, model.divide.highArr);
			}	
		}
	};
	/*
		Survival Tab 이 변경됬을 때 호출되는 함수.
	 */
	function expSurvivalTabChange ()	{
		var inp = document.getElementById('expression_survival')
											.querySelectorAll('input');
		// OS Tab.
		inp[0].onclick = function (e) 	{
			callScatterBySurvival('os');
		};
		// DFS Tab.
		inp[1].onclick = function (e)	{
			callScatterBySurvival('dfs');
		};
	};
	/*
		Survival 을 그려주는 함수.
	 */
	function drawSurvival ()	{
		var e = document.querySelector('#expression_survival'),
				w = parseFloat(e.style.width),
				h = parseFloat(e.style.height) / 1.4;

		SurvivalCurveBroilerPlate.settings = {
			canvas_width 			 : w,
			canvas_height 		 : h,
		 	chart_width 			 : w - 30,
	  	chart_height 			 : h - 30,
		  chart_left 				 : 50,
		  chart_top 				 : 15,
		  include_info_table : false,
			include_legend 		 : true,
			include_pvalue 		 : true,
			pval_x 						 : w - 190,
			pval_y 						 : 42,
		};

		SurvivalCurveBroilerPlate.style = {
		  censored_sign_size : 5,
		  axis_stroke_width  : 1,
		  axisX_title_pos_x  : w / 2,
		  axisX_title_pos_y  : h - 25,
		  axisY_title_pos_x  : -(w / 2) + 25,
		  axisY_title_pos_y  : 10,
		  axis_color 				 : "black",
			pval_font_size 		 : 12,
			pval_font_style 	 : 'normal',
		};

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: 'Low score group',
			high: 'High score group',
		};

		var div = dividedData(
				model.data.bar, model.data.axis.bar.y[1]),
				suv = survival({
			element: '#expression_survival',
			margin: [20, 20, 20, 20],
			data: (model.divide.patient_list || 
						 model.origin.patient_list),
			divisionData: (model.divide.divide || 
										 model.data.survival.divide),
		});

		model.data.survival.data = suv.survivalData;
		model.data.scatter = 
		Object.keys(model.data.scatter).length < 1 ? 
		model.data.survival.data.all : model.data.scatter;

		expSurvivalTabChange();
	};
	/*
		Bar 를 그리는 함수.
	 */
	function drawBar ()	{
		layout.getSVG(model.svg, ['bar_plot'], function (k, v)	{
			var y = model.data.axis.bar.y;

			config.expression.bar.margin.splice(
			1, 1, model.data.axisLeft);

			bar({
				element: v,
				data: model.data.bar,
				direction: 'bottom',
				margin: config.expression.bar.margin,
				attr: config.expression.bar.attr,
				style: config.expression.bar.style,
				xaxis: model.data.axis.bar.x,
				yaxis: [y[2], y[0]],
				on: config.expression.bar.on,
			});

			axis.element(v)
					.left({
						margin: [
							10, 0, 50, v.attr('width') - model.data.axisLeft
						],
						data: [y[2], y[0]],
						opt: {
							tickValues: y,
						},
					})
					.style('stroke-width', '0.3');
		});
	};
	/*
		Function Select Box 와 현재 function 을 바꿔주는
		함수.
	 */
	function drawFunctionOption ()	{
		selectBox({
			element: '#expression_function',
			className: 'expression-function',
			margin: [3, 3, 0, 0],
			initText: 'Average',
			viewName: 'function',
			items: ['Average'],
			click: function (v)	{
				model.now.func = v;
				// console.log('Function is: ', model.now.func);
			},
		});
	};
	/*
		Bar 의 색을 변경해주는함수.
	 */
	function changeBarColor (d)	{
		if (!model.now.colorSet)	{
			return '#62C2E0';
		}

		var state = d.info ? d.info[model.now.col] : 'NA';

		return state === 'NA' ? '#A4AAA7' : 
					config.expression.colorSet[
					model.now.colorSet.indexOf(state)];
	};
	/*
		Color Mapping 을 그려주는 함수.
	 */
	function drawColorMapping ()	{
		selectBox({
			element: '#expression_color_mapping',
			margin: [3, 3, 0, 0],
			className: 'expression-color-mapping',
			initText: 'Color Mapping',
			viewName: 'color_mapping',
			items: model.data.subtype.map(function (d)	{
				return d.key; 
			}),
			click: function (v)	{
				model.now.col = v;
				model.data.subtype.some(function (d)	{
					return model.now.colorSet = d.value, 
								 model.now.col === d.key;
				});

				layout.removeG(['expression_bar_legend_chart']);

				d3.selectAll('#expression_bar_plot_chart_rect')
					.style('fill', changeBarColor)
					.style('stroke', changeBarColor)
				drawColorMappingLegend();
			},
		});
	};
	/*
		Color Mapping 된 범례를 그려주는 함수.
	 */
	function drawColorMappingLegend ()	{
		if (model.now.colorSet)	{
			layout.getSVG(model.svg, ['bar_legend'], 
			function (k, v)	{
				legend({
					element: v,
					data: model.now.colorSet,
					text: config.expression.legend.bar.text,
					attr: config.expression.legend.bar.attr,
					style: config.expression.legend.bar.style,
					margin: config.expression.legend.bar.margin,
				})
			});
		}
	};
	/*
		Drag 에서 선택되지 않은 부분은 Blur 처리를 한다.
	 */
	function noneSelectedToBlur (sel, low, high)	{
		sel.style('fill-opacity', function (d)	{
				 return low.indexOf(d.x) < 0 && 
			 				  high.indexOf(d.x) < 0 ? 0.08 : 
			 				  sel.attr('id').indexOf('circle') > -1 ? 
			 				  0.6 : 1;
			 })
			 .style('stroke-opacity', function (d)	{
				 return low.indexOf(d.x) < 0 && 
							  high.indexOf(d.x) < 0 ? 0.08 : 1;
			 });
	};
	/*
		Divided line 을 그려주는 함수.
	 */
	function drawDivisionBar ()	{
		config.expression.division.margin.splice(
			1, 1, model.data.axisLeft);
		config.expression.division.marginScatter.splice(
			1, 1, model.data.axisLeft);
		/*
			Low, High 별 Loop 를 도는 함수.
		 */
		function loopDragEnd (list)	{
			util.loop(list, function (d)	{
				if (d !== model.data.patient.name)	{
					// Survival (Months & Status) 데이터.
					util.loop(model.origin.patient_list, function (p)	{
						if (p.participant_id === d)	{
							model.divide.patient_list.push(p);
						}
					});
					// Survival (Unaltered & Altered) 데이터.
					model.divide.divide[d] = 
					model.data.survival.divide[d];
				}
			});
		};
		/*
			Drag 가 끝나고 남겨진 데이터를 고쳐서 Survival 및
			Scatter 로 전달하는 함수.
		 */
		function dragEnd (low, high)	{
			model.divide.divide = {};
			model.divide.patient_list = [];
			model.divide.scatter = { os: [], dfs: [] };

			loopDragEnd(low);
			loopDragEnd(high);
			
			drawSurvival();
			drawPatient();
			// TODO.
			// OS, DFS 탭 변경시에도 Blur 가 적용되어야 한다.
			noneSelectedToBlur(
				d3.selectAll('#expression_bar_plot_chart_rect'), 
				low, high);
			noneSelectedToBlur(
				d3.selectAll('#expression_scatter_plot_chart_circle'), 
				low, high);
		};

		var obj = {
			padding: 3,
			font: '12px',
			xaxis: model.data.axis.bar.x,
			margin: config.expression.division.margin,
			point: model.data.axis.bar.x[
						 util.medIndex(model.data.axis.bar.x)],
			data: [
				{ text: 'Low score group', color: '#00AC52' }, 
				{ text: 'High score group', color: '#FF6252' }
			],
			text: config.expression.division.text,
			attr: config.expression.division.attr,
			style: config.expression.division.style,
			figure: config.expression.division.figure,
			lineX: config.expression.division.line.x,
			lineY: config.expression.division.line.y,
			marker: 'circle',
			on: config.expression.division.on,
			drag: {
				drag: config.expression.division.drag.drag,
				end: function (d, i, m)	{
					var a = new Array().concat(m.axis),
							iv = scale.invert(m.scale);
					// 멈춘 위치의 Low, High 각각의 Sample 이름.
					model.divide.lowSam = iv(
								config.expression.division.lowPos + m.m.left),
					model.divide.highSam = iv(
								config.expression.division.highPos + m.m.left);
					// 멈춘 위치의 이름을 가지고 배열을 low, high 로 나눈다.
					model.divide.highArr = a.splice(
						m.axis.indexOf(model.divide.highSam), a.length - 1)
					model.divide.lowArr = a.splice(
						0, m.axis.indexOf(model.divide.lowSam));

					dragEnd(model.divide.lowArr, model.divide.highArr);
				},
			},
		};

		layout.getSVG(model.svg, ['bar_plot'], 
		function (k, v)	{
			obj.element = v;

			divisionLine(obj);
		});

		layout.getSVG(model.svg, ['scatter_plot'], 
		function (k, v)	{
			obj.element  = v;
			obj.yAdjust = 0;
			obj.showRect = false;
			obj.showText = false;
			obj.margin = config.expression.division.marginScatter;

			divisionLine(obj);
		});
	};
	/*
		Scatter 를 그리는 데 필요한 데이터를 재 가공한다.
	 */
	function makeExpScatterData (list)	{
		var r = [];

		util.loop(list, function (d)	{
			util.loop(d, function (k, v)	{
				if (model.data.axis.scatter.x.indexOf(k) > -1)	{
					r.push({x: k, y: v.months, value: v.status});
				}
			});
		});

		return r;
	}
	/*
		Scatter plot 을 그려주는 함수.
	 */
	function drawScatter (osdfs)	{
		layout.getSVG(model.svg, ['scatter_plot'], 
		function (k, v)	{
			var y = new Array().concat(
				model.data.axis.scatter.y[osdfs]).reverse(),
					mm = util.minmax(y);
			// Left Margin 을 Heatmap 최장길이 텍스트에 맞추는 
			// 작업이다.
			config.expression.scatter.margin.splice(
			1, 1, model.data.axisLeft);

			scatter({
				element: v,
				data: makeExpScatterData(model.data.scatter[osdfs]),
				margin: config.expression.scatter.margin,
				attr: config.expression.scatter.attr,
				style: config.expression.scatter.style,
				xaxis: model.data.axis.scatter.x,
				yaxis: y,
				on: config.expression.scatter.on,
			});

			axis.element(v)
					.left({
						margin: [
							10, 0, 35, v.attr('width') - model.data.axisLeft
						],
						data: y,
						opt: {},
					})
					.style('stroke-width', '0.3');
		});
	};
	/*
		Scatter Legend 를 그려주는 함수.
	 */
	function drawScatterLegend ()	{
		layout.getSVG(model.svg, 'scatter_legend', 
		function (k, v)	{
			legend({
				element: v,
				data: ['Alive', 'Dead'],
				text: config.expression.legend.scatter.text,
				attr: config.expression.legend.scatter.attr,
				style: config.expression.legend.scatter.style,
				margin: config.expression.legend.scatter.margin,
			});
		});
	};
	/*
		Heatmap 을 그려주는 함수.
	 */
	function drawHeatmap ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			var th = draw.getTextHeight('12px').height,
					ts = scale.get(model.data.axis.gradient.x,
							 ['#FF0000', '#000000', '#00FF00']);
			// 한 줄당 10 정도의 px 을 주기위함이다.
			v.attr('height', model.data.axis.heatmap.y.length * th);
			// 왼쪽 여백을 Heatmap 의 최장길이의 Text 에 맞춘다.
			config.expression.heatmap.margin.splice(
			1, 1, model.data.axisLeft);

			heatmap({
				element: v,
				data: model.data.heatmap,
				xaxis: model.data.axis.heatmap.x,
				yaxis: model.data.axis.heatmap.y,
				margin: config.expression.heatmap.margin,
				attr: config.expression.heatmap.attr,
				style: {
					fill: function (d, i)	{
						return ts(d.value);
					},
				},
				on: config.expression.heatmap.on,
			});

			axis.element(v)
					.left({
						margin: [2, 0, 0, v.attr('width')
										 - model.data.axisLeft],
						data: model.data.axis.heatmap.y,
						opt: {
							remove: 'path, line',
						},
					});

			eventHandler.verticalScroll(v.node().parentNode);
		});
	};
	/*
		Signature 리스트를 Select box 로 만들어주는 함수.
	 */
	function drawSignatureList ()	{
		selectBox({
			element: '#expression_signature',
			className: 'expression-signature',
			margin: [3, 3, 0, 0],
			initText: model.init.sig,
			viewName: 'signature',
			items: model.origin.signature_list.map(function (d) {
				return d.signature;
			}),
			click: function (v)	{
				if (!model.now.sig || 
						 model.now.sig === v)	{
					return;
				}

				model.now.sig = v;
				model.req.signature = model.now.sig;

				$.ajax({
					type: 'GET',
					url: model.url,
					data: model.req,
					success: function (d)	{
						layout.removeG();

						drawAll(d.data);
					},
				});
			},
		});
	};
	/*
		Color Gradient 를 그려주는 함수.
		현재 (2017. 07. 07) 기준으로 CGIS 와
		값에 차이가 있지만 CGIS 는 Log 가 2번 취해진 값이다.
		그러므로 새로 만드는 현재 버전이 맞는 값이다.
	 */
	function drawColorGradient ()	{
		layout.getSVG(model.svg, ['gradient'], 
		function (k, v)	{
			// Set Color Gradiation.
			model.data.colorGradient = colorGradient({
				element: v,
				offset: model.data.axis.gradient.x,
				adjustValue: 6,
				colors: ['#FF0000', '#000000', '#00FF00'],
			});
			// Draw Linear Color Gradient Bar.
			render.rect({
				element: render.addGroup(v, 5, 3, 'gradient'),
				attr: {
					id: k + '_rect',
					x: 0,
					y: 0,
					rx: 3,
					rx: 3,
					width: v.attr('width') - 6,
					height: v.attr('height') * 0.1,
				},
				style: {
					fill: 'url(#' + model.data.colorGradient.id + ')',
				},
			});
			// Draw Linear Color Gradient Axis.
			axis.element(v)
					.bottom({
						margin: [0, 3, v.attr('height') * 0.9, 10],
						data: [
						model.data.axis.gradient.x[0],
						model.data.axis.gradient.x[2]],
						opt: {
							tickValues: model.data.axis.gradient.x,
							remove: 'path, line',
						},
					})
					.selectAll('text')
					.style('fill', '#999999');
		});
	};
	/*
		Patient 를 표시해줄 함수.
	 */
	function drawPatient ()	{
		layout.getSVG(model.svg, ['bar_plot', 'scatter_plot'], 
		function (k, v)	{
			var obj = {},
					y = model.data.axis.bar.y;  

			obj.g = render.addGroup(v, 0, 0, k.indexOf('bar') > -1 ? 
							'bar-patient' : 'scatter-patient');
			obj.id = v.attr('id');
			obj.m = size.setMargin(config.expression.patient.margin);
			obj.w = v.attr('width');
			obj.h = v.attr('height');
			obj.sx = scale.get(model.data.axis.heatmap.x, [
				obj.m.left, obj.w - obj.m.right ]);
			obj.sy = scale.get([y[2], y[0]], [
				obj.m.top, obj.h - obj.m.bottom ]);

			render.triangle({
				element: obj.g.selectAll('#' + obj.id + '_tri'),
				data: model.data.bar.filter(function (d)	{
					if (d.x === model.data.patient.name)	{
						return d;
					}
				}),
				attr: {
					id: function (d) { return obj.id + '_tri'; },
					points: function (d, i)	{
						return config.expression.patient.attr.points
												 .call(this, d, i, obj);
					},	
				},
				style: config.expression.patient.style,
				on: config.expression.patient.on,
			});
		});

		drawSampleSurvival();
	};
	/*
		Survival Plot 의 테이블 이름에도 심볼을 넣어주는함수.
	 */
	function drawSampleSurvivalTable (ostb, dfstb)	{
		for (var i = 0, l = ostb.length; i < l; i++)	{
			var o = ostb[i],
					d = dfstb[i];

			if (model.data.patient.data === o.innerHTML)	{
				o.innerHTML += ' **';
				d.innerHTML += ' **';
			}
		}
	};
	/*
		Survival plot 의 legend 에도 심볼을 넣어준다.
	 */
	function drawSampleSurvivalLegend (l)	{
		var es = config.expression.sample;

		render.text({
			element: l,
			attr: {
				x: function (d) { return es.attr.x(d, model); },
				y: function (d) { return es.attr.y(d, model); },
			},
			style: {
				fill: function (d) {
					return es.style.fill(d, model); },
				'font-size': function (d) {
					return es.style.fontSize(d, model); }, 
			},
			text: function (d) { return es.text(d, model); },
		});
	};
	/*
		Survival 의 Legend 와 Table 에
		** 를 추가한다. 
	 */
	function drawSampleSurvival ()	{
		var suv = {},
				chkDone = setInterval(function () {

			suv.ostb = document
								.querySelectorAll('#dfs_stat_table td b');
			suv.dfstb = document
									.querySelectorAll('#os_stat_table td b');
			suv.legends = d3.selectAll('.legend');

			if (suv.ostb.length > 0 && 
					suv.dfstb.length > 0 && 
					suv.legends.node())	{

				drawSampleSurvivalTable(suv.ostb, suv.dfstb);
				drawSampleSurvivalLegend(suv.legends);
				clearInterval(chkDone);				
			}
		}, 10);
	};
	/*
		처음 또는 새로운 데이터를 받아와 초기 시작을 할때
		실행 되는 함수이다.
	 */
	function drawAll (data)	{
		// Data 처리도 이 함수에서 실행된다.
		model.data = preprocessing.expression(data);
		var most = draw.getMostWidthOfText(
		model.data.axis.heatmap.y, '12px');
		model.data.axisLeft = Math.ceil(most / 10) * 10;
		// When the site had loaded complete, draw the chart below.
		drawFunctionOption();
		drawColorMapping();
		drawColorMappingLegend();
		drawSurvival();
		drawBar();
		drawDivisionBar();
		drawScatter(model.now.osdfs);
		drawScatterLegend();
		drawHeatmap();
		drawSignatureList();
		drawColorGradient();
		drawPatient();
	};

	return function (o)	{
		model.e = document.querySelector(o.element || null);
		model.w = parseFloat(o.width || e.style.width || 1400);
		model.h = parseFloat(o.height || e.style.height || 700);
		model.e.style.background = '#F7F7F7';

		model.origin = o.data;
		model.element = o.element;
		model.req = o.req;
		model.url = o.url || '/rest/expressions';
		model.ids = size.chart.expression(model.e, model.w, model.h);
		model.svg = layout.expression(model.ids, model);
		// Set Initialize signature gene set.
		model.init.sig = model.origin.signature_list[0].signature;
		model.now.sig = model.init.sig;	

		drawAll(o.data);

		// console.log('Given Expression data: ', o);
		// console.log('Expression Model data: ', model);
	};
}(expression||{}));