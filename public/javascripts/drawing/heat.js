function heat ()	{
	'use strict';

	var model = {};
	/*
		중복 처리 된 데이터들을 다시 재 가공 시켜주는 함수.
	 */
	function makeNoneDuplicateData (values)	{
		bio.iteration.loop(values, function (key, value)	{
			bio.iteration.loop(model.mutationType, function (m)	{
				if (value[m][0])	{
					model.duplicate.push({
						x: value.x,
						y: value.y,
						value: value[m][0],
						info: value[m].splice(1),
					});
				}
			});
		});

		return model.duplicate;
	};
	/*
		같은 위치에서 중복된 데이터가 여러개일 경우
		가장 우선순위가 높은 것을 제외하고는 객체로 만들어 저장한다.
	 */
	function removeDuplicate (data)	{
		bio.iteration.loop(data, function (d)	{
			var key = d.x + d.y,
					prio = bio.landscapeConfig().byCase(d.value);

			model.value[key] ? 
			bio.boilerPlate.variantInfo[model.value[key][prio][0]] > 
			bio.boilerPlate.variantInfo[d.value] ? 
			model.value[key][prio].unshift(d.value) : 
			model.value[key][prio].push(d.value) : 
		 (model.value[key] = { cnv: [], var: [], x: d.x, y: d.y }, 
		 	model.value[key][prio].push(d.value));
		});

		return makeNoneDuplicateData(model.value);
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		
		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.margin.top, 
			model.height - model.margin.bottom];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'heatmap');

		model.opts = bio.objects.clone(opts);
		model.opts.data = model.duplicate ? 
			removeDuplicate(model.opts.data) : model.opts.data;
		model.opts.id = model.id + '_heatmap_rect';
		model.opts.element = 
		model.group.selectAll('#' + model.id + '_heatmap_rect');

		bio.rectangle(model.opts, model);
	};
};