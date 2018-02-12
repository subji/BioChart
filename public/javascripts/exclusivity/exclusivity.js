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

		bio.survival({
			element: '#exclusivity_survival',
			margin: [20, 20, 20, 20],
			data: data.survival.data[model.now.geneset],
			division: divideForSurvival(model.now.geneset, data),
			legends: {
		    high: {
		      text: 'Unaltered group',
		      color: '#FF6252',
		    },
		    low: {
		      text: 'Altered group',
		      color: '#00AC52',
		    }
		  },
		  styles: {
		    size: {
		      chartWidth: width * 0.9,
		      chartHeight: height * 0.59,
		    },
		    position: {
		      chartTop: 15,
		      chartLeft: 50,
		      axisXtitlePosX: width / 2,
		      axisXtitlePosY: height / 1.725,
		      axisYtitlePosX: -(width / 2),
		      axisYtitlePosY: 10,
		      pvalX: width / 1.95,
		      pvalY: 40,
		    },
		  },
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