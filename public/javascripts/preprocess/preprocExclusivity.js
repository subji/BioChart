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

		// merged(data.survival.patient, data.survival.types);
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