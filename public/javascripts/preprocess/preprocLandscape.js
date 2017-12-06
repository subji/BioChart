function preprocLandscape ()	{
	'use strict';

	var model = {};
	/*
		Sample, Patient 의 가로 방향 축 데이터를 만드는 함수.
	 */
	function makeXAxis (axis, data)	{
		if (axis.indexOf(data) < 0)	{
			axis.push(data);
		}
	};
	/*
		Heatmap 데이터 포맷을 설정해주는 함수.
	 */
	function heatmapDataFormat (heatmap, data)	{
		heatmap.push({
			x: data.participant_id,
			y: data.gene,
			value: data.type,
		});
	};
	/*
		기준이 되는 값에 해당되는 value 들을 key - value 
		형태의 Object 로 만드는 함수.
	 */
	function nested (obj, std, value)	{
		obj[std] = !obj[std] ? {} : obj[std];
		obj[std][value] = obj[std][value] ? 
		obj[std][value] + 1 : 1;
	};
	/*
		Mutation 과 Patient 의 리스트를 공통으로
		묶어낸 함수.
	 */
	function iterateCommon (arr, callback)	{
		bio.iteration.loop(arr, function (d, i)	{
			// Type 의 이름표기를 통합시킨다.
			d.type = bio.commonConfig().typeFormat(d.type);
			// Type name object 를 만든다.
			model.type[d.type] = null;

			callback(d, i);
		});

		model.isIterateCommonOk = true;
	};
	/*
		Mutation list 를 반복하며,
		type list, mutation list, gene, sample 데이터를 만든다.
	 */
	function iterateMutation (mutation)	{
		iterateCommon(mutation, function (d)	{
			// Stacked bar chart 를 위한 데이터 생성.
			nested(model.stack.gene, d.gene, d.type);
			nested(model.stack.sample, d.participant_id, d.type);
			
			heatmapDataFormat(model.heatmap, d);

			makeXAxis(model.axis.sample.x, d.participant_id);
		});
	};
	/*
		Patient list 를 반복하며,
		Sample, Heatmap 에 들어가는 환자 데이터를 만든다.
	 */
	function iteratePatient (patient)	{
		iterateCommon(patient, function (d)	{
			// Patient 의 stacked bar chart 데이터 생성.
			nested(model.stack.patient, d.participant_id, d.type);
			heatmapDataFormat(model.patient, d);

			makeXAxis(model.axis.patient.x, d.participant_id);
		});
	};
	/*
		Group list 를 반복하며,
		Clinical list 데이터를 만든다.
	 */
	function iterateGroup (group)	{
		bio.iteration.loop(group, function (g)	{
			var temp = [];

			bio.iteration.loop(g.data, function (d)	{
				var heat = [];

				bio.iteration.loop(model.heatmap, function (h)	{
					// Group 에 포함된 sample 들을 모은다.
					// 나중에 Group sort 를 위함이다.
					if (d.participant_id === h.x)	{
						heat.push(h);
					}
				});

				temp.push({
					x: d.participant_id, y: g.name,
					value: d.value, info: heat,
				});
			});

			model.group.group.push(temp);
			// 각각의 Clinical 값을 한 행으로 처리.
			model.axis.group.y.push([g.name]);
			// Patient 의 Clinical info 는 없으므로 'NA' 로 처리.
			model.group.patient.push({
				x: model.axis.patient.x[0],
				y: g.name, value: 'NA',
			});
		});
	};
	/*
		PQ 관련 리스트를 반복하며, PQ 데이터를 만든다.
	 */
	function iteratePQ (pq, what)	{
		return pq.map(function (d)	{
			// P-value 또는 Q-value 에 log 값을 취하고 반환하는 함수.
			var toLog = Math.log(d[what]) / Math.log(12) * -1;

			return { x: 0, y: d.gene, value: toLog };
		});
	};
	/*
		Gene, Sample, Patient 가 각각 x, y 를 기준으로 하는 것이
		다르므로 이를 해당 함수에서 정해준다.
	 */
	function stackFormat (type, d1, d2, value, idx)	{
		return type === 'gene' ? 
					{ x: d1, y: d2, value: value, info: idx } : 
					{ x: d2, y: d1, value: value, info: idx };
	};
	/*
		Type 파라미터에 기준하여 stacked 데이터를 만드는 함수.
	 */
	function byStack (type, stacked)	{
		var result = [],
				axis = type === 'gene' ? 'x' : 'y';

		bio.iteration.loop(stacked, function (key, value)	{
			var before = 0,
					sumed = 0;

			bio.iteration.loop(value, function (vkey, vvalue)	{
				result.push(stackFormat(
					type, before, key, vvalue, vkey));
				// 현재 위치를 구하기 위해 이전 시작지점 + 이전 값을 구한다.
				before += vvalue;
				// axix 의 최대값을 구하기 위한 연산.
				sumed += vvalue;
			});

			model.axis[type][axis].push(sumed);
		});

		return result;
	};
	/*
		[min, max] 배열을 반환하는 함수.
	 */
	function makeLinearAxis ()	{
		model.axis.gene.x = [bio.math.max(model.axis.gene.x), 0];
		model.axis.sample.y = [bio.math.max(model.axis.sample.y), 0];
		model.axis.pq.x = [
			0, bio.math.max(model.pq.map(function (pq)	{
				return Math.ceil(pq.value);
		}))];
	};	
	/*
		Axis 의 서수 리스트를 반환하는 함수.
	 */
	function makeOrdinalAxis ()	{
		model.axis.pq.y = 
		model.axis.gene.y = 
		model.axis.heatmap.y = model.gene;
		model.axis.heatmap.x = 
		model.axis.group.x = model.axis.sample.x;
	};

	return function (data)	{
		model = bio.initialize('preprocess').landscape;
		// Data 안에 다른 객체가 존재할 경우 그 안을 찾아본다.
		data = data.gene_list ? data : data.data;
		// Only Gene list.
		model.gene = data.gene_list.map(function (d)	{
			return d.gene;
		});
		// Mutation, Sample, Gene, Group, Patient 데이터 생성.
		iterateMutation(data.mutation_list);
		iteratePatient(data.patient_list);
		iterateGroup(data.group_list);

		model.type = Object.keys(model.type);
		// 전달받은 PQ 선정 값이 없을 경우 기본은 P-value 이다.
		model.pq = iteratePQ(data.gene_list, data.pq || 'p');
		model.stack.gene = byStack('gene', model.stack.gene);
		model.stack.sample = byStack('sample', model.stack.sample);
		model.stack.patient = byStack('patient', model.stack.patient);
		// Axis 데이터를 만들어준다.
		console.log(model.axis.sample, model.axis.patient)
		makeLinearAxis();
		makeOrdinalAxis();

		console.log('>>> Preprocess landscape data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};