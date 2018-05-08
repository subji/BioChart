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
		Risk function 별 axis 를 만들어 준다.
	 */
	function makeFuncAxis (funcName, barData, funcData)	{
		var axis = [].concat(funcData[funcName]),
				result = [],
				beforeVal = null,
				beforeIdx = 0,
				valueMaps = {};

		bio.iteration.loop(barData, function (b)	{
			var key = b.value + '_' + axis.indexOf(b.value);

			if (Object.keys(valueMaps).length === 0)	{
				valueMaps[key] = {
					x: b.x,
					index: axis.indexOf(b.value),
				};
			} else {
				if (valueMaps[key])	{
					var idx = valueMaps[key].index += 1;

					valueMaps[b.value + '_' + idx] = {
						x: b.x,
						index: idx,
					};
				} else {
					valueMaps[key] = {
						x: b.x,
						index: axis.indexOf(b.value),
					};
				}
			}
		});

		bio.iteration.loop(valueMaps, function (key, obj)	{
			var divide = key.split('_');

			result[divide[1]] = obj.x;
		});

		model.func.xaxis[funcName] = result;
		model.func.yaxis[funcName] = [
			bio.math.min(funcData[funcName]),
			bio.math.median(funcData[funcName]),
			bio.math.max(funcData[funcName])
		];

		bio.iteration.loop(barData, function (b)	{
			b.y = model.func.yaxis[funcName][1];
		});
	};
	/*
		설정된 Risk function 들의 값을 구한다.
	 */
	function setRiskFunctions (funcName, func, data)	{
		var funcData = [];

		bio.iteration.loop(data, function (key, value)	{
			bio.iteration.loop(value, function (v)	{
				model.axis.heatmap.y[v.key] = '';
			});

			funcData.push({
				pid: key,
				values: value.map(function (v)	{
					return { gene: v.key, tpm: v.value };
				})
			});
		});

		var result = func(funcData),
				hasScore = [];

		bio.iteration.loop(result, function (res)	{
			if (res.score !== undefined)	{
				hasScore.push(res.score);
			}
		});

		if (hasScore.length === 0)	{
			throw new Error('There are not have any score value in RiskFunction result');
		}

		bio.iteration.loop(result, function (res)	{
			if (model.func.bar[funcName])	{
				model.func.bar[funcName].push({
					x: res.pid, 
					value: res.score, 
					info: model.patient_subtype[res.pid]
				});
			} else {
				model.func.bar[funcName] = [{
					x: res.pid, 
					value: res.score, 
					info: model.patient_subtype[res.pid]
				}];
			}

			if (model.func.data[funcName])	{
				model.func.data[funcName].push(res.score);
			} else {
				model.func.data[funcName] = [res.score];
			}	
		});

		bio.iteration.loop(model.func.data, 
		function (k, f)	{
			model.func.data[k] = 
			model.func.data[k].sort(function (a, b) {
				return a > b ? 1 : -1;
			});

			makeFuncAxis(k, model.func.bar[k], model.func.data);
		});
	};

	function geneSortByTpmAverage (alls, genes)	{
		var result = {},	
				resultArr = [];

		bio.iteration.loop(alls, function (a)	{
			if (!result[a.hugo_symbol])	{
				result[a.hugo_symbol] = a.tpm;
			} else {
				result[a.hugo_symbol] += a.tpm;
			}
		});
		
		bio.iteration.loop(result, function(gene, tpm)	{
			resultArr.push({
				gene: gene, avgTpm: tpm / model.axis.heatmap.x.length
			});
		});

		return resultArr.sort(function (a, b)	{
			return a.avgTpm < b.avgTpm ? 1 : -1;
		}).map(function(res)	{
			return res.gene;
		});
	};
	/*
		전체 Cohort 리스트에서 값의 합, 최소 & 최대값을 만든다.
	 */
	function loopCohort (alls)	{
		var func = model.func.now || model.func.default;

		bio.iteration.loop(alls, function (a)	{
			a.tpm = toLog(a.tpm);

			tpmBySample(a);

			model.tpms.push(a.tpm);
			model.heatmap.push({
				x: a.participant_id,
				y: a.hugo_symbol,
				value: a.tpm,
			});
		});

		tpmMinMax(model.tpms);

		bio.iteration.loop(model.riskFuncs, 
		function (risk)	{
			setRiskFunctions(risk, model.riskFuncs[risk], 
				model.axis.heatmap.x);
		});

		if (!model.func.now || 
				Object.keys(model.func.now).length < 1)	{
			model.bar = model.func.bar.average;
			model.axis.bar.y = model.func.yaxis.average;
			model.axis.heatmap.x = model.func.xaxis.average;
			model.func.now = model.func.default;
		}

		model.axis.heatmap.y = geneSortByTpmAverage(alls, 
														Object.keys(model.axis.heatmap.y));
		model.axis.scatter.x = model.axis.heatmap.x;
		model.axis.bar.x = model.axis.heatmap.x;
	};
	/*
		Patient 데이터를 만들며, 어느 그룹에 속하는지를 결정한다.
	 */
	function toPatient (patient)	{
		var mut = model.axis.bar.y[1],
				pat = model.func.xaxis[model.func.now || model.func.default]
							[model.axis.bar.x.indexOf(patient)];

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

		most = most === 0 ? 1 : most;

		return most * 2.5;
	};

	function addRiskFunctions (funcs)	{
		bio.iteration.loop(funcs, function (f)	{
			model.riskFuncs[f.name.toLowerCase()] = f.func;
		});
	};

	return function (data)	{
		model = {};
		model = bio.initialize('preprocess').expression;
		model.all_rna_list = [].concat(
			 data.cohort_rna_list.concat(data.sample_rna_list));
		model.genes = data.gene_list.map(function (gl)	{
			return gl.hugo_symbol;
		});
		// Risk function 추가.
		addRiskFunctions(data.riskFunctions);
		getMonths(data.patient_list);
		getSubtype(data.subtype_list);
		loopCohort(model.all_rna_list);

		if (data.sample_rna_list.length > 0)	{
			model.patient = {
				name: data.sample_rna_list[0].participant_id,
				data: toPatient(data.sample_rna_list[0].participant_id),
			};
		} else {
			model.patient = null;
		}

		bio.iteration.loop(model.bar, function (b)	{
			b.y = model.axis.bar.y[1];
		});

		model.axisMargin = getAxisMargin(model.axis.heatmap.y);

		// console.log('>>> Preprocess variants data: ', data);
		// console.log('>>> Preprocess data: ', model);

		return model;
	};
};