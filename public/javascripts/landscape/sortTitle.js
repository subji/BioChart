function sortTitle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);

		bio.rendering().dropShadow(opts.element, 1, -0.1, 1);

		model.font = opts.style.fontSize + ' ' + 
								 opts.style.fontWeight;
		model.mostWidth = bio.drawing().mostWidth(
												opts.titles, model.font);
		model.mostHeight = bio.drawing().textSize.height(model.font);
		model.group = bio.rendering().addGroup(
										opts.element, 0, 0, 'sort-title');

		if (model.id.indexOf('sample') > -1)	{
			model.group.attr(
				'transform', 'translate(0, 0) rotate(270)');
		}

		model.opts = {
			text: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.text.id = model.id + '_sorttitle_text';
		model.opts.text.element = 
		model.group.selectAll('#' + model.id + '_text');
		model.opts.shape.id = model.id + '_sorttitle_shape';
		model.opts.shape.element = 
		model.group.selectAll('#' + model.id + '_shape');

		bio.rectangle(model.opts.shape, model);
		bio.text(model.opts.text, model);
	};
};