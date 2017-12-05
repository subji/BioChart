function scatter ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.scatter_data = opts.data;
		
		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.margin.top, 
			model.height - model.margin.bottom];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'scatter');

		model.opts = bio.objects.clone(opts);
		model.opts.data = model.scatter_data;
		model.opts.id = model.id + '_scatter_shape';
		model.opts.element = 
		model.group.selectAll('#' + model.id + '_scatter_shape');

		bio.circle(model.opts, model);
	};
};