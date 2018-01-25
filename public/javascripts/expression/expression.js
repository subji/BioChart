function expression ()	{
	'use strict';

	var model = {};
	
	function drawFuncSelectBox ()	{
		var funcNames = ['Average'];

		bio.iteration.loop(model.riskFunctions, 
		function (risk)	{
			funcNames.push(risk.name);
		});

		bio.selectBox({
			fontSize: '12px',
			items: funcNames,
			viewName: 'function',
			margin: [3, 3, 0, 0],
			defaultText: 'Average',
			id: '#expression_function',
			className: 'expression-function',
			clickItem: function (value)	{
				model.now.function = value;
				model.data.bar = model.data.func.bar[value];
				model.data.axis.bar.x = 
				model.data.func.xaxis[value];
				model.data.axis.bar.y = 
				model.data.func.yaxis[value];
				model.data.axis.scatter.x = 
				model.data.func.xaxis[value];
				model.data.axis.heatmap.x = 
				model.data.func.xaxis[value];

				bio.layout().removeGroupTag([
					'.expression_bar_plot_svg.bar-g-tag',
					'.expression_bar_plot_svg.left-axis-g-tag',
					'.expression_bar_plot_svg.division-path-0-g-tag',
					'.expression_bar_plot_svg.division-shape-0-g-tag',
					'.expression_scatter_plot_svg.scatter-g-tag',
					'.expression_scatter_plot_svg.left-axis-g-tag',
					'.expression_scatter_plot_svg.division-path-1-g-tag',
					'.expression_scatter_plot_svg.division-shape-1-g-tag',
					'expression_bar_legend_svg'
				]);

				model.now.subtype_mapping = undefined;
				model.now.subtypeSet = undefined;
				model.divide.divide = undefined;
				model.divide.patient_list = undefined;
				model.divide.scatter = undefined;

				document.querySelector('#expression_bar_legend').style.height = '0px';
				document.querySelector('#expression_bar_legend').style.marginBottom = '0px';
				document.querySelector('#expression_color_mapping').innerHTML = '';

				// drawHeatmap(model.data, model.data.axis.heatmap, model.data.axis.gradient.x);
				drawColorMapSelectBox(model.data.subtype);
				drawFunctionBar(model.data, model.data.axis.bar);
				drawScatter(model.data, model.data.axis.scatter, model.now.osdfs);				
				drawSurvivalPlot(model.data);
				drawDivision(model.data);
				getDivisionData();
			},
		});
	};

	function changeBarColor (data, idx, that)	{
		if (!model.now.subtypeSet)	{ return '#62C2E0'; }

		var state = data.info ? 
								data.info[model.now.subtype_mapping] : 'NA';
		// if (model.now.subtype_mapping.indexOf('pathologic') > -1)	{
		// 	state = state.replace(/[a-z]/ig, '');
		// }
		return state === 'NA' ? '#D6E2E3' : 
						bio.boilerPlate.clinicalInfo[state].color;
	};
	
	function drawColorMapSelectBox (subtypes)	{
		bio.selectBox({
			fontSize: '12px',
			margin: [3, 3, 0, 0],
			viewName: 'color_mapping',
			defaultText: 'Subtype Mapping',
			id: '#expression_color_mapping',
			className: 'expression-color-mapping',
			items: subtypes.map(function (i)	{
				return i.key;
			}),
			clickItem: function (value)	{
				var barLegend = document.querySelector(
											'#expression_bar_legend');
				
				bio.iteration.loop(subtypes, function (item)	{
					if (item.key.toLowerCase() === 
							value.toLowerCase())	{
						model.now.subtype_mapping = item.key;
						model.now.subtypeSet = item.value;
					}
				});

				bio.layout().removeGroupTag([
					'expression_bar_legend_svg']);

				if (barLegend.className.indexOf('active') < 0)	{
					barLegend.className += 'active';
				}

				d3.selectAll('#expression_bar_plot_rect')
					.style('fill', changeBarColor)
					.style('stroke', changeBarColor);

				drawLegend('color_mapping', model.now.subtypeSet);
				// Scatter legend 의 위치가 유동적이게 되므로 이를 고정하기
				// 위해서 아래 코드를 추가함.
				barLegend.style.marginBottom = 
				(parseFloat(model.init.bar_legend_height) - 
				 parseFloat(barLegend.style.height) - 5) + 'px';

				if (model.subtypeFunc)	{
					model.subtypeFunc(model.now.subtype_mapping)
				}
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
					division: (model.divide.divide || data.survival.divide),
					legends: {
						high: {
							text: 'High score group',
							color: '#FF6252',
						},
						low: {
							text: 'Low score group',
							color: '#00AC52',
						}
					}
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

	function divideDivisionData (data)	{
		var low = [], 
				mid = [], 
				high = [];

		if (data.low_arr && data.high_arr)	{
			bio.iteration.loop(model.data.axis.bar.x, 
			function (xaxis) {
				if (data.low_arr.indexOf(xaxis) < 0 && 
						data.high_arr.indexOf(xaxis) < 0)	{
					mid.push(xaxis);
				}
			});

			low = data.low_arr;
			high = data.high_arr;
		} else {
			bio.iteration.loop(data, function (k, v)	{
				if (data[k] === 'altered')	{
					high.push(k);
				} else {
					low.push(k);
				}
			});
		}

		return { low: low, mid: mid, high: high };
	};
	/*
		division bar 를 움직여서 나오는 데이터를
		초기 설정 시 받은 함수에 left, mid, right 값으로 반환
		하는 함수이다.
	 */
	function getDivisionData ()	{
		var data = Object.keys(model.divide).length < 1 ? 
							model.data.survival.divide : model.divide,
				division = divideDivisionData(data);

		model.divisionFunc(
			division.low, division.mid, division.high);
	};

	function drawDivision (data, lowHigh)	{
		/*
			Low, High 별로 환자 배열을 순환.
		 */
		function patientByDrag (arr, isAltered)	{
			bio.iteration.loop(arr, function (a)	{
				if (model.data.patient)	{
					if (a !== model.data.patient.name)	{
						bio.iteration.loop(model.setting.defaultData.patient_list, 
						function (p)	{
							if (p.participant_id === a)	{
								model.divide.patient_list.push(p);
							}
						});

						model.divide.divide[a] = isAltered;
					}
				} else {
					bio.iteration.loop(model.setting.defaultData.patient_list, 
						function (p)	{
							if (p.participant_id === a)	{
								model.divide.patient_list.push(p);
							}
						});

						model.divide.divide[a] = isAltered;
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
			patientByDrag(low, 'unaltered');
			patientByDrag(high, 'altered');
			// Survival chart update.
			drawSurvivalPlot(data);
			if (data.patient)	{
				drawPatient(data);	
			}
			// to blur selected targets.
			toBlur(
				d3.selectAll('#expression_bar_plot_rect'),
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

						getDivisionData();
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
		if (origin.signature_list)	{
			drawSigSelectBox(origin.signature_list);
		}
		drawLegend('color_mapping', model.now.subtypeSet || null);
		drawLegend('scatter', ['Alive', 'Dead']);
		drawColorGradient(data.axis.gradient.x);
		drawHeatmap(data, data.axis.heatmap, data.axis.gradient.x);
		drawFunctionBar(data, data.axis.bar);
		drawSurvivalPlot(data);
		drawScatter(data, data.axis.scatter, model.now.osdfs);

		if (data.patient)	{
			drawPatient(data);
		}

		drawDivision(data);
	};

	return function (opts)	{
		model = {};
		model = bio.initialize('expression');
		// Risk function 을 추가하는부분.
		model.riskFunctions = opts.riskFunctions ? 
		opts.riskFunctions : [];
		opts.data.riskFunctions = model.riskFunctions;
		model.setting = bio.setting('expression', opts);
		model.data = model.setting.preprocessData;
		bio.clinicalGenerator(model.data.subtype, 'expression');
		model.divisionFunc = opts.divisionFunc ? 
		opts.divisionFunc : null;
		model.subtypeFunc = opts.onSubtypeSelection ? 
		opts.onSubtypeSelection : null;
		// About request configurations.
		model.requestData = opts.requestData || {};
		model.requestURL = opts.requestURL || '/rest/expressions';
		// To initialize signature.
		model.init.signature = opts.data.signature_list ? opts.data.signature_list[0].signature : [];
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