function variantsGraph ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.graphData = opts.data;

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.margin.top, 
			model.height - model.margin.bottom];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.group = bio.rendering().addGroup(
									opts.element, 0, 0, 'needle-graph');

		model.opts = {
			base: bio.objects.clone(opts),
			graph: bio.objects.clone(opts),
		};
		model.opts.base.data = [''];
		model.opts.base.id = model.id + '_graph_base';
		model.opts.base.element = 
		model.group.selectAll('#' + model.id + '_graph_base');

		bio.rectangle(model.opts.base, model);

		model.opts.graph.id = model.id + '_graph_group';
		model.opts.graph.data = null;
		model.opts.graph.element = 
		model.group.selectAll('#' + model.id + '_graph_group')
							 .data(model.graphData).enter()
							 .append('g')
							 .attr('id', model.id + '_graph_group')
							 .attr('transform', 'translate(0, 0)');				
		
		bio.rectangle(model.opts.graph, model);
		bio.text(model.opts.graph, model);
	};
};