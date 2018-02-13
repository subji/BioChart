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
	function iterateMutation (stacks, mutation)	{
		var result = {};

		iterateCommon(mutation, function (d)	{

			// Stacked bar chart 를 위한 데이터 생성.
			bio.iteration.loop(stacks, function (s)	{
				nested(s.obj, d[s.data], d[s.type]);
			});
			
			heatmapDataFormat(model.heatmap, d);
			makeXAxis(model.axis.sample.x, d.participant_id);
		});

		bio.iteration.loop(stacks, function (s)	{
			result[s.keyName] = s.obj;
		});

		return {
			result: result,
			heatmap: model.heatmap
		};
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
	function byStack (arr, type, stacked)	{
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
			arr.push(sumed);
			model.axis[type][axis].push(sumed);
		});

		return {
			data: result,
			axis: arr,
		};
	};
	/*
		[min, max] 배열을 반환하는 함수.
	 */
	function makeLinearAxis (type, arr, isPlotted, pat)	{
		if (type === 'gene')	{
			return [bio.math.max(arr), 0];
		} else if (type === 'pq')	{
			return [
				0, bio.math.max(arr.map(function (pq)	{
					return Math.ceil(pq.value);
				}))
			];
		} else {
			if (isPlotted && isPlotted.patient)	{
				return [bio.math.max(arr), 0];
			} else {
				return [
					bio.math.max(
					bio.math.max(pat), 
					bio.math.max(arr)), 0
				];
			}
		}
	};	
	/*
		gene 의 mutation 이 가장 높은 값을 가진 
		순서대로 정렬한다.
	 */
	function orderedYAxis (geneStack)	{
		var obj = {},
				result = [];

		bio.iteration.loop(geneStack, function (g)	{
			obj[g.y] = !obj[g.y] ? g.value : 
									obj[g.y] + g.value;
		});

		bio.iteration.loop(obj, function (k, v)	{
			result.push({ gene: k, total: obj[k] });
		});

		result.sort(function (a, b)	{
			return a.total < b.total ? 1 : -1;
		});

		return result.map(function (res)	{
			return res.gene;
		});
	};

	function mergedXAxis ()	{
		var groupList = model.group.group[0].map(function (g)	{
			return g.x;
		});

		model.axis.sample.x = 
		model.axis.sample.x.concat(groupList);
	};
	/*
		Axis 의 서수 리스트를 반환하는 함수.
	 */
	function makeOrdinalAxis (geneStack)	{
		mergedXAxis();

		model.axis.pq.y = 
		model.axis.gene.y = 
		// model.axis.heatmap.y = model.gene;
		model.axis.heatmap.y = orderedYAxis(geneStack);
		model.axis.heatmap.x = 
		model.axis.group.x = model.axis.sample.x;
	};
	/*
		Group list 개수와 Mutation list 개수가
		맞지 않을때 에러가 발생한다.
		그러므로 mutation list 를 group list 개수에 맞춰줘야
		한다.
	 */
	function adjustMutationList (mut, group)	{
		var result = [];

		bio.iteration.loop(group, function (g)	{
			bio.iteration.loop(mut, function (m)	{
				if (g.participant_id === m.participant_id)	{
					result.push(m);
				}
			})
		});

		return result;
	};

	return function (data, isPlotted)	{
		model = bio.initialize('preprocess').landscape;
		// Data 안에 다른 객체가 존재할 경우 그 안을 찾아본다.
		data = data.gene_list ? data : data.data;
		// Mutation, Sample, Gene, Group, Patient 데이터 생성.
		if (data.group_list[0].data.length > 
				data.mutation_list.length)	{
			data.mutation_list = adjustMutationList(data.mutation_list, data.group_list[0].data);
		}

		model.iterMut = iterateMutation;
		model.iterPat = iteratePatient;
		model.iterGroup = iterateGroup;
		model.byStack = byStack;

		var mut = model.iterMut([
			{ obj: model.stack.gene, data: 'gene', type: 'type', keyName: 'gene'},
			{ obj: model.stack.sample, data: 'participant_id', type: 'type', keyName: 'sample'},
		], data.mutation_list);
		model.iterPat(data.patient_list);
		model.iterGroup(data.group_list);

		model.type = Object.keys(model.type);
		// 전달받은 PQ 선정 값이 없을 경우 기본은 P-value 이다.
		model.pq = iteratePQ(data.gene_list, data.pq || 'p');
		model.stack.gene = model.byStack(model.axis.gene.x, 'gene', model.stack.gene).data;
		model.stack.sample = model.byStack(model.axis.sample.y, 'sample', model.stack.sample).data;
		model.stack.patient = model.byStack(model.axis.patient.y, 'patient', model.stack.patient).data;
		// Axis 데이터를 만들어준다.
		model.makeLinearAxis = makeLinearAxis;
		model.makeOrdinalAxis = makeOrdinalAxis;
		// gene x, sample y, pq x axis 를 만들어 준다.
		model.axis.gene.x = model.makeLinearAxis('gene', model.axis.gene.x);
		model.axis.pq.x = model.makeLinearAxis('pq', model.pq);
		model.axis.sample.y = model.makeLinearAxis('sample', model.axis.sample.y, isPlotted, model.axis.patient.y);
		// model.makeLinearAxis(isPlotted);
		model.makeOrdinalAxis(model.stack.gene);
		// Only Gene list.
		model.gene = [].concat(model.axis.gene.y);

		// console.log('>>> Preprocess landscape data: ', data);
		// console.log('>>> Preprocess data: ', model);

		return model;
	};
};