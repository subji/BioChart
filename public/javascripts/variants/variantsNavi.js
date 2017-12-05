function variantsNavi ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		var config = bio.variantsConfig().navi();

		model = bio.initialize('variantsNavi');
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.naviData = opts.data;

		model.copyX = [].concat(opts.xaxis);
		model.copyY = [].concat(opts.yaxis);
		model.rangeX = [model.margin.left, 
			model.width - model.margin.right];
		model.rangeY = [model.height - model.margin.bottom,
			model.margin.top,];
		model.scaleX = bio.scales().get(model.copyX, model.rangeX);
		model.scaleY = bio.scales().get(model.copyY, model.rangeY);

		model.controls = { width: 5, height: model.height * 0.4 };

		model.start = model.scaleX(bio.math.min(model.copyX));
		model.end = model.width - model.margin.left - 
								model.margin.right;

		config.start.init = model.start - model.controls.width;
		config.end.init = model.end - model.controls.width + 
													 model.margin.left;
		config.start.now = config.start.init;
		config.end.now = config.end.init;
		config.navi.init = model.start;
		config.navi.now = model.start;
		config.navi.width = model.end;
		config.navi.nowWidth = model.end - model.start;

		model.group = bio.rendering().addGroup(
									opts.element, 0, 0, 'heatmap');

		var needleConfig = bio.variantsConfig().needle(),
				naviConfig = bio.variantsConfig().navi();

		bio.needle({
			xaxis: model.copyX,
			yaxis: model.copyY,		
			element: opts.element,
			attr: needleConfig.attr,
			style: needleConfig.style,
			margin: [10, 40, 10, 40],
			lineData: model.naviData.needle.line,
			shapeData: model.naviData.needle.shape,
		});

		model.opts = {
			end: bio.objects.clone(opts),
			main: bio.objects.clone(opts),
			start: bio.objects.clone(opts),
			drag: config,
		};
		model.opts.main.data = ['main'];
		model.opts.main.id = model.id + '_navi_main';
		model.opts.main.element = 
		model.group.selectAll('#' + model.id + '_navi_main');
		model.opts.start.data = ['start'];
		model.opts.start.id = model.id + '_navi_start';
		model.opts.start.element = 
		model.group.selectAll('#' + model.id + '_navi_start');
		model.opts.end.data = ['end'];
		model.opts.end.id = model.id + '_navi_end';
		model.opts.end.element = 
		model.group.selectAll('#' + model.id + '_navi_end');

		bio.rectangle(model.opts.main, model);
		bio.rectangle(model.opts.start, model);
		bio.rectangle(model.opts.end, model);
		// Path 가 영 걸리적 거려 삭제 했다.
		d3.selectAll('#' + model.id + ' path').remove();
	};
};