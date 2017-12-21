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
		Function 이 Average 일 때 호출되는 함수.
	 */
	function funcAverage (data)	{
		bio.iteration.loop(data, function (key, value)	{
			var sum = 0,
					avg = 0;

			bio.iteration.loop(value, function (v)	{
				model.axis.heatmap.y[v.key] = '';

				sum += v.value;
			});

			avg = sum / value.length;

			model.bar.push({
				x: key, 
				value: avg, 
				info: model.patient_subtype[key]
			});

			model.func.avg.push(avg);
		});

		model.func.avg.sorted = 
		model.func.avg.sort(function (a, b)	{
			return a > b ? 1 : -1;
		});

		model.axis.bar.y = [
			bio.math.min(model.func.avg),
			bio.math.median(model.func.avg),
			bio.math.max(model.func.avg)];
	};
	/*
		Function 에 따른 최소, 중간, 최대값을 구한다. 
	 */
	function funcMinMedMax (func, data)	{
		return { average: funcAverage(data) }[func];
	};
	/*
		Average function 으로 데이터를 정렬한다.
	 */
	function avgAlign (bars)	{
		var avg = [].concat(model.func.avg),
				result = [];

		bio.iteration.loop(bars, function (b)	{
			result[avg.indexOf(b.value)] = b.x;
		});

		model.axis.heatmap.x = result;
	};
	/*
		Sample 의 순서를 function 대로 재설정하는 함수.
	 */
	function funcAlignment (func, bars)	{
		return { average: avgAlign(bars) }[func];
	};
	/*
		전체 Cohort 리스트에서 값의 합, 최소 & 최대값을 만든다.
	 */
	function loopCohort (alls)	{
		var func = model.func.now || model.func.default;

		bio.iteration.loop(alls, function (a)	{
			a.tpm = toLog(a.tpm + 1);

			tpmBySample(a);

			model.tpms.push(a.tpm);
			model.heatmap.push({
				x: a.participant_id,
				y: a.hugo_symbol,
				value: a.tpm,
			});
		});

		tpmMinMax(model.tpms);
		funcMinMedMax(func, model.axis.heatmap.x);
		funcAlignment(func, model.bar);

		model.axis.heatmap.y = Object.keys(model.axis.heatmap.y);
		model.axis.scatter.x = model.axis.heatmap.x;
		model.axis.bar.x = model.axis.heatmap.x;
	};
	/*
		Patient 데이터를 만들며, 어느 그룹에 속하는지를 결정한다.
	 */
	function toPatient (patient)	{
		var mut = model.axis.bar.y[1],
				pat = model.func.avg[model.axis.bar.x.indexOf(patient)];

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

		return most;
	};

	return function (data)	{
		model = {};
		model = bio.initialize('preprocess').expression;

		model.all_rna_list = [].concat(
			 data.cohort_rna_list.concat(data.sample_rna_list));

		model.genes = data.gene_list.map(function (gl)	{
			return gl.hugo_symbol;
		});

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

		console.log('>>> Preprocess variants data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};