function bar ()	{
	'use strict';

	var model = {};
	/*
		Range 값을 구해주는 함수.
	 */
	function range (size, m1, m2, start)	{
		return start === 'left' || start === 'top' ? 
					[m1, size - m2]: [size - m2, m1];
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.extremeValue = false;
		model.startTo = opts.startTo || ['top', 'left'];
		model.rangeX = range(model.width, model.margin.left, 
												 model.margin.right, model.startTo[1]);
		model.rangeY = range(model.height, model.margin.top, 
												 model.margin.bottom, model.startTo[0]);
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'bar');

		if (opts.allYaxis)	{
			model.copyAllYaxis = [].concat(opts.allYaxis);

			var objYaxis = {}

			bio.iteration.loop(opts.allYaxis, function (ay)	{
				objYaxis[ay] = true;
			});

			if (Object.keys(objYaxis).length === 
					model.copyY.length)	{
				if (objYaxis[bio.math.min(model.copyY)] && 
						objYaxis[bio.math.max(model.copyY)])	{
					model.extremeValue = true;
				}
			}
		}

		model.opts = bio.objects.clone(opts);
		model.opts.id = model.id + '_bar_rect';
		model.opts.element = 
		model.group.selectAll('.' + model.id + '_bar_rect')

		bio.rectangle(model.opts, model);
	};
};