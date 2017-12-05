function legend ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		model = bio.objects.clone(that || {});
		model = bio.sizing.chart.default(model, opts);
		model.legendData = opts.data;

		model.padding = opts.padding || 5;
		model.fontSize = opts.style.font || '10px';
		model.fontWidth = bio.drawing().mostWidth(
												model.legendData, model.fontSize);
		model.fontHeight = bio.drawing()
				 .textSize.height(model.fontSize);
		model.shapeWidth = model.width - 
	 (model.margin.left + model.margin.right + 
	 	model.fontWidth.value);

		model.shapeGroup = bio.rendering().addGroup(
												opts.element, model.margin.top, 
												model.margin.left, 'legend-shape');
		model.textGroup = bio.rendering().addGroup(
												opts.element, model.margin.top, 
												model.margin.left, 'legend-text');

		model.opts = {
			text: bio.objects.clone(opts),
			shape: bio.objects.clone(opts),
		};
		model.opts.text.id = model.id + '_legend_text';
		model.opts.text.element = 
		model.textGroup.selectAll('#' + model.id + '_legend_text');
		model.opts.shape.id = model.id + '_legend_shape';
		model.opts.shape.element = 
		model.shapeGroup.selectAll('#' + model.id + '_legend_shape');

		if (opts.attr && opts.attr.width)	{
			bio.rectangle(model.opts.shape, model);
		} else if (opts.attr && opts.attr.r)	{
			bio.circle(model.opts.shape, model);
		} else if (opts.attr && opts.attr.points)	{
			bio.triangle(model.opts.shape, model);
		}

		bio.text(model.opts.text, model);

		var div = opts.element.node().parentNode,
				bcr = model.textGroup.node().getBoundingClientRect();
		// Legend div 를 type 수에 맞는 세로 길이로 재 설정한다.
		div.style.height = bcr.height + 
		model.margin.top + model.padding + 'px';
		// 왼쪽에 바짝 붙은 div 를 조금 떨어뜨리기 위한 코드.
		div.style.width = model.width - 5 + 'px';
	};
};