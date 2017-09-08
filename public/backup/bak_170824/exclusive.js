var exclusive = (function ()	{
	'use strict';

	var model = {
		now: {
			geneset: null,
		},
	};
	/*
		Survival 에 사용될 데이터를 나누는 함수.
	 */
	function divideSurvivalData ()	{
		var result = {};

		util.loop(model.data.survival.data[model.now.geneset], 
		function (d, i)	{
			if (d)	{
				if (i <= model.data.divisionIdx[
						model.now.geneset].idx)	{
					result[d.participant_id] = 'altered';
				} else {
					result[d.participant_id] = 'unaltered';
				}
			}
		});

		return result;
	};
	/*
		Survival 차트를 그리는 함수.
	 */
	function drawSurvival ()	{
		var e = document.querySelector('#exclusivity_survival'),
				w = parseFloat(e.style.width),
				h = parseFloat(e.style.height) / 1.5;

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
			pval_x 						 : w - 200,
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
			pval_font_size 		 : 14,
			pval_font_style 	 : 'normal',
		};

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			low: 'Unaltered group',
			high: 'Altered group',
		};

		survival({
			element: '#exclusivity_survival',
			margin: [20, 20, 20, 20],
			data: model.data.survival.data[model.now.geneset],
			divisionData: divideSurvivalData(),
		});
	};
	/*
		Network 차트를 그리는 함수.
	 */
	function drawNetwork ()	{
		console.log(model.now.geneset,
			model.data.network)
		network({
			data: model.data.network[model.now.geneset],
			element: '#exclusivity_network',
		});
	};
	/*
		Heatmap Axis 를 그리는 함수.
	 */
	function drawAxis ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			axis.element(v)
					.left({
						margin: [35, 0, 35, v.attr('width') - 80],
						data: model.now.geneset.split(' '),
						opt: {
							remove: 'line, path',
						},
					})
					.attr('id', 'exclusivity_heatmap_axis');
		});
	}
	/*
		Heatmap 차트를 그리는 함수.
	 */
	function drawHeatmap ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			heatmap({
				element: v,
				data: model.data.heatmap[model.now.geneset],
				opt: config.exclusivity.heatmap.opt,
				attr: config.exclusivity.heatmap.attr,
				style: config.exclusivity.heatmap.style,
				margin: config.exclusivity.heatmap.margin,
				xaxis: model.data.axis.heatmap.x[model.now.geneset],
				yaxis: model.data.axis.heatmap.y[model.now.geneset],
			});
		});
	};
	/*
		DivisionBar 차트를 그리는 함수.
	 */
	function drawDivisionBar ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			divisionLine({
				element: v,
				data: [
					{ text: 'Altered group', color: '#FF6252' },
					{ text: 'Unaltered group', color: '#00AC52' }
				],
				xaxis: model.data.axis.heatmap.x[model.now.geneset],
				margin: config.exclusivity.division.margin,
				padding: 6,
				text: config.exclusivity.division.text,
				attr: config.exclusivity.division.attr,
				style: config.exclusivity.division.style,
				font: '14px',
				lineX: config.exclusivity.division.line.x,
				lineY: config.exclusivity.division.line.y,
				point: model.data.divisionIdx[model.now.geneset].idx + 1,
			});
		});
	};
	/*
		Legend 차트를 그리는 함수.
	 */
	function drawLegend()	{
		layout.getSVG(model.svg, ['ty_legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type[model.now.geneset],
				priority: config.exclusivity.priority,
				text: config.exclusivity.legend.text,
				font: '14px',
				attr: config.exclusivity.legend.attr,
				style: config.exclusivity.legend.style,
				margin: config.exclusivity.legend.margin,
			});
		});
	};
	/*
		Exclusivity 차트를 그리는 함수.
	 */
	function drawExclusivity ()	{
		getDataOfPatient(model.origin.sample);
		drawSurvival();
		// drawNetwork();
		drawAxis();
		drawHeatmap();
		drawDivisionBar();
		drawLegend();
		drawSample();
	};
	/*
		Sample 이 현재 Geneset 에서 Altered 인지
		Unaltered 인지 결정해주는 함수.
	 */
	function isAltered (s, h)	{
		var sample = 'SMCLUAD1690060028',
		// var sample = document.getElementById('sample_id').value,
				genesetArr = model.now.geneset.split(' '),
				result = '.';

		if (s.length < 1)	{
			return ['**', sample + ' Belongs to', 'Unaltered group'];
		}

		util.loop(s, function (d)	{
			var gStr = h[genesetArr.indexOf(d.gene)];

			if (gStr.indexOf(d.value) > -1)	{
				result = result !== '.' ? 
				result : gStr[gStr.indexOf(d.value)];
			}
		});

		return result === '.' ? 
		['**', sample + ' Belongs to', 'Unaltered group'] : 
		['**', sample + ' Belongs to', 'Altered group'];
	};

	/*
		Sample 관련 데이터(색상, Variant type, 등) 를 만드는 함수.
	*/
	function getDataOfPatient (list)	{
		model.data.sample = { data: [], isAltered: false };

		util.loop(list, function (d)	{
			if (model.now.geneset.indexOf(d.gene) > -1)	{
				model.data.sample.data.push({
					gene: d.gene,
					value: config.exclusivity.symbol(
								 config.exclusivity.case(
								 config.landscape.case(d.class), d.class)),
				});
			} 
		});

		model.data.sample.isAltered = 
			isAltered(model.data.sample.data, 
								model.data.survival.heat[model.now.geneset]);
	};
	/*
		Sample Legend 를 추가한다.
	 */
	function drawSampleLegend ()	{
		layout.getSVG(model.svg, ['sample_legend'], 
		function (k, v)	{
			legend({
				element: v,
				data: model.data.sample.isAltered,
				font: '14px',
				attr: config.exclusivity.sample.legend.attr,
				style: config.exclusivity.sample.legend.style,
				text: config.exclusivity.sample.legend.text,
				margin: config.exclusivity.sample.legend.margin,
			});
		});
	};
	/*
		Division 위에 ** 를 추가한다.
	 */
	function drawSampleDivision ()	{
		layout.getSVG(model.svg, ['heatmap'], function (k, v)	{
			var cd = config.exclusivity.sample.division,
					obj = {};

			obj.e = v;
			obj.m = size.setMargin(cd.margin);
			obj.g = render.addGroup(
							v, obj.m.top, obj.m.left, 'division-star');

			render.text({
				element: obj.g.selectAll('#' + v.attr('id') + '_sample'),
				data: [{ value: '**', type: model.data.sample.isAltered }],
				attr: {
					id: function (d) { return v.attr('id') + '_sample'; },
					x: function (d, i)	{ 
						return cd.attr.x.call(this, d, i, obj); },
					y: function (d, i) { 
						return cd.attr.y.call(this, d, i, obj); },
				},
				style: {
					fill: function (d, i) { 
						return cd.style.fill.call(this, d, i, obj); },
					'font-size': '25px',
					'alignment-baseline': 'middle',
				},
				text: function (d, i) { 
					return cd.text.call(this, d, i, obj); },
			});
		});
	};	
	/*
		Survival Plot 의 테이블 이름에도 심볼을 넣어주는함수.
	 */
	function drawSampleSurvivalTable (ostb, dfstb)	{
		for (var i = 0, l = ostb.length; i < l; i++)	{
			var o = ostb[i],
					d = dfstb[i];

			if (model.data.sample.isAltered.indexOf(o.innerHTML) > -1)	{
				o.innerHTML += ' **';
				d.innerHTML += ' **';
			}
		}
	};
	/*
		Survival plot 의 legend 에도 심볼을 넣어준다.
	 */
	function drawSampleSurvivalLegend (l)	{
		var es = config.exclusivity.sample.survival;

		render.text({
			element: l,
			attr: {
				x: function (d, i, m) { return es.attr.x.call(this, d, i, model); },
				y: function (d, i, m) { return es.attr.y.call(this, d, i, model); },
			},
			style: {
				fill: function (d, i, m) {
					return es.style.fill.call(this, d, i, model); },
				'font-size': function (d, i, m) {
					return es.style.fontSize.call(this, d, i, model); }, 
			},
			text: function (d, i) { 
				return es.text.call(this, d, i, model); },
		});
	};
	/*
		Survival 의 Legend 와 Table 에
		** 를 추가한다. 
	 */
	function drawSampleSurvival ()	{
		var suv = {},
				chkDone = setInterval(function () {

			suv.ostb = document.querySelectorAll('#dfs_stat_table td b');
			suv.dfstb = document.querySelectorAll('#os_stat_table td b');
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
		Sample 관련 Legend 와 Astarik 를 추가할 함수.
	 */
	function drawSample ()	{
		drawSampleLegend();
		drawSampleDivision();
		drawSampleSurvival();
	};

	return function (o)	{
		console.log('Given Exclusivity data: ', o);
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);

		e.style.background = '#F7F7F7';

		model.origin = o.data;
		model.data = preprocessing.exclusivity(o.data);
		model.ids = size.chart.exclusivity(e, w, h);
		model.svg = layout.exclusivity(model.ids, model);
		model.now.geneset = model.data.geneset[0].join(' ');
		// make select box of geneset.
		selectBox({
			element: '#exclusivity_select_geneset',
			initText: model.now.geneset,
			className: 'exclusivity-geneset',
			viewName: 'geneset',
			items: model.data.geneset.map(function (d)	{
				return d.join(' ');
			}),
			click: function (v)	{
				model.now.geneset = v.toUpperCase();

				layout.removeG();
				drawExclusivity();
			},
		});

		drawExclusivity();

		console.log('Exclusivity Model data: ', model);
	};
}());