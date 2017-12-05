function preprocVariants ()	{
	'use strict';

	var model = {};
	/*
	 	Stack 데이터를 needle plot 을 그리기 좋은 형태로 만들어 주는 함수.
	 */
	function optimizeToDraw (obj, target)	{
		bio.iteration.loop(obj, function (key, value)	{
			var count = 0,
					temp = { 
						key: key, 
						value: [ { x: parseFloat(key), y: count, value: 0 } 
					]};
			// 0 이 들어가야 하므로 한번 설정하였다.
			model.axis.needle.y.push(count);

			bio.iteration.loop(value, function (vKey, vValue)	{
				temp.value.push({
					x: parseFloat(key),
					y: (count = count + vValue.length, count),
					value: vValue.length,
					info: vValue,
				});
			});

			model.axis.needle.y.push(count);

			target.push(temp);
		});
	};
	/*
		Needle plot 을 그리기 위해선 stack 형식의 데이터가 필요하다.
	 */
	function toStack (datas, target)	{
		var obj = {};

		bio.iteration.loop(datas, function (d)	{
			d.type = bio.commonConfig().typeFormat(d.type);

			var str = d.position + ' ' + d.type + ' ' + d.aachange;

			obj[d.position] ? obj[d.position][str] ? 
			obj[d.position][str].push(d) : 
			obj[d.position][str] = [d] : 
		 (obj[d.position] = {}, obj[d.position][str] = [d]);

		 	if (model.type.indexOf(d.type) < 0)	{
		 		model.type.push(d.type);
		 	}
		});

		optimizeToDraw(obj, target);
	};
	/*
		Graph 의 데이터 설정 함수.
	 */
	function toGraph (graphs)	{
		bio.iteration.loop(graphs, function (graph, i)	{
			model.graph.push({
				x: graph.start, y: 0,
				width: graph.end - graph.start, height: 15,
				color: graph.colour, info: graph,
			});
		});
	};
	/*
		Needle Plot & Graph 를 그릴 때 사용되는 축 데이터를 설정 함수.
	 */
	function setAxis (graph)	{
		model.axis.needle.x = [0, graph[0].length];
		model.axis.needle.y = 
		model.axis.needle.y.length < 1 ? [0, 1] : 
		[bio.math.min(model.axis.needle.y), 
		 bio.math.max(model.axis.needle.y)];
	};
	/*
		Shape 를 그리기 위해 Stacked 데이터를 펼치는 함수.
	 */
	function forShape (lines, shapes)	{
		bio.iteration.loop(lines, function (l)	{
			bio.iteration.loop(l.value, function (v, i)	{
				if (v.info) {
					// v.info 가 없는 경우는 0 인 경우뿐이므로.
					// 따로 0 인 조건 검사 없이 연산을 한다.
					v.value = v.y - l.value[i - 1].y;

					shapes.push(v);
				}
			});
		});
	};

	return function (data)	{
		model = bio.initialize('preprocess').variants;

		toStack(data.variants.public_list, model.needle.line);
		toStack(data.variants.patient_list, model.patient.line);
		toGraph(data.variants.graph);
		setAxis(data.variants.graph);
		forShape(model.needle.line, model.needle.shape);
		forShape(model.patient.line, model.patient.shape);

		console.log('>>> Preprocess variants data: ', data);
		console.log('>>> Preprocess data: ', model);

		return model;
	};
};