function colorGradient ()	{
	'use strict';

	var model = {};
	/*
		offset 과 color 를 설정하고 배열에 추가하는 함수.
	 */
	function setOffset (offset, color)	{
		model.offsets.show.push({ offset: offset, color: color });
		model.offsets.data.push({ offset: offset, color: color });
	};
	/*
		Gradient 색상과 비율을 설정하는 함수.
	 */
	function setColorRate (offset, colors)	{
		var copyOffset = [].concat(offset).splice(1, offset.length - 2);

		setOffset('0%', colors[0]);

		bio.iteration.loop(copyOffset, function (cp, idx)	{
			var value = Math.round((bio.math.max(offset) - bio.math.min(offset)) / cp === 0 ? 1 : (cp * 10));

			model.offsets.show.push({
				offset: value - model.adjustValue + '%',
				color: colors[idx + 1]  
			});

			model.offsets.data.push({
				offset: value + '%',
				color: colors[idx + 1]
			});
		});

		setOffset('100%', colors[offset.length - 1]);
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.offsets = bio.initialize('colorGradient');

		model.adjustValue = opts.adjustValue || 0;
		model.id = opts.id || 'linear_gradient';
		model.colors = opts.colors || ['#000000', '#FFFFFF'];
		model.offset = opts.offset || [0, 100];
		model.defs = model.element.append('defs');
		model.lineGradient = model.defs.append('linearGradient').attr('id', model.id);

		setColorRate(model.offset, model.colors);

		model.lineGradient.selectAll('stop')
		 .data(model.offsets.show).enter()
		 .append('stop')
		 .attr('offset', function (data, idx)	{ 
			return data.offset; 
		 })
		 .attr('stop-color', function (data, idx)	{
			return data.color;
		 });

		 return model;
	};
};