function divisionLine ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		console.log(opts, that)
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.position = { now: {}, init: {} };
		model.isMarker = typeof(opts.isMarker) === 'undefined' ? true : opts.isMarker;
		opts.pathElement = 
		bio.objects.getType(opts.pathElement) !== 'Array' ? 
		[opts.pathElement] : opts.pathElement;
		model.division_data = opts.data;
		model.division_info = opts.info || [
			{ 
				additional: 0, color: '#000000', direction: null, 
				text: 'Low', textWidth: 10,
			},
			{ 
				additional: 0, color: '#FFFFFF', direction: null, 
				text: 'High', textWidth: 10,
			}
		];

		bio.iteration.loop(model.division_info, function (di)	{
			di.textWidth = bio.drawing().textSize.width(
			di.text.replace(' ', 'a'), opts.style.fontSize || '10px');
		});

		model.axis = [].concat(opts.axis);
		model.range = [model.margin.left, model.width - 
										model.margin.right];
		model.scale = bio.scales().get(model.axis, model.range);
		model.invert = bio.scales().invert(model.scale);

		if (that.data.bar)	{
			bio.iteration.loop(that.data.bar, function (bar)	{
				if (bar.value === opts.idxes[0])	{
					model.division_info[0].start = model.scale(bar.x);
				} else if (bar.value === opts.idxes[1])	{	
					model.division_info[0].end = model.scale(bar.x);
					model.division_info[1].start = model.scale(bar.x);
				} else if (bar.value === opts.idxes[2])	{
					model.division_info[1].end = model.scale(bar.x);
				}
			});
		} else if (model.now.geneset)	{
			model.division_info[0].start = model.scale(model.axis[0]);
			model.division_info[0].end = model.scale(opts.idxes);
			model.division_info[1].start = model.scale(opts.idxes);
			model.division_info[1].end = 
			model.scale(model.axis.length - 1);
		}

		model.shapeGroup = bio.rendering().addGroup(
												opts.element, 0, 0, 'division-shape');
		model.textGroup = bio.rendering().addGroup(
												opts.element, 0, 0, 'division-text');
		model.opts = {
			text: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};

		model.opts.text.id = model.id + '_division_text';
		model.opts.text.data = model.division_info;
		model.opts.text.element = 
		model.textGroup.selectAll(
			'#' + model.id + '_division_text');
		model.opts.shape.id = model.id + '_division_shape';
		model.opts.shape.data = model.division_info;
		model.opts.shape.element = 
		model.shapeGroup.selectAll(
			'#' + model.id + '_division_shape');

		bio.text(model.opts.text, model);
		bio.rectangle(model.opts.shape, model);

		bio.iteration.loop(opts.pathElement, function (path, i)	{
			var shape_key = 'shape_' + i,
					path_key = 'path_' + i,
					cp1 = bio.objects.clone(model.division_info[i]),
					cp2 = bio.objects.clone(model.division_info[i]),
					markers = [cp1, cp2];

			cp1.path_x = model.division_info[0].end;
			cp2.path_x = model.division_info[0].end;
			cp1.path_y = i === 0 ? 10 : 0;
			cp2.path_y = i === 0 ? 
			path.attr('height') : path.attr('height') - 18;

			model.opts[path_key] = bio.objects.clone(opts);
			model.opts[path_key].id = 
			model.id + '_division_path_' + i;
			model.opts[path_key].data = markers;
			model.opts[path_key].element = 
			bio.rendering().addGroup(path, 0, 0, 'division-path-' + i);

			model.opts[shape_key] = bio.objects.clone(opts);
			model.opts[shape_key].id = 
			model.id + '_division_shape_' + i;
			model.opts[shape_key].data = [markers[i]];
			model.opts[shape_key].element = 
			bio.rendering().addGroup(path, 0, 0, 'division-shape-' + i)
				 .selectAll('#' + model.id + '_division_shape_' + i);
			if (model.isMarker)	{
				bio.triangle({
					element: model.opts[shape_key].element,
					data: model.opts[shape_key].data,
					attr: model.opts[shape_key].attr,
					style: model.opts[shape_key].style,
					call: model.opts[shape_key].call,
				}, model);
			}

			bio.path({
				element: model.opts[path_key].element,
				data: model.opts[path_key].data,
				attr: model.opts[path_key].attr,
				style: {
					stroke: '#333333',
					strokeWidth: '0.5px',
				},
			}, model);
		});
	};
};