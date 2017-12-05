function needle ()	{
	'use strict';

	var model = {};
	/*
		Range 값을 구해주는 함수.
	 */
	function range (size, m1, m2, start)	{
		return start === 'left' || start === 'top' ? 
					[m1, size - m2] : [size - m2, m1];
	};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.height - model.margin.bottom, 
										model.margin.top];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.lineGroup = bio.rendering().addGroup(
										opts.element, 0, 0, 'needle-line');
		model.shapeGroup = bio.rendering().addGroup(
										opts.element, 0, 0, 'needle-shape');

		model.opts = {
			line: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.line.element = model.lineGroup;
		model.opts.shape.data = opts.shapeData;
		model.opts.shape.element = 
		model.shapeGroup.selectAll('#' + model.id + '_needle_shape');

		bio.iteration.loop(opts.lineData, function (ld)	{
			model.opts.line.data = ld.value;		

			bio.path(model.opts.line, model);
		});

		bio.circle(model.opts.shape, model);
	};
};