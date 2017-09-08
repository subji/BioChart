var divisionLine = (function (divisionLine)	{
	'use strict';

	var model = {};

	return function (o) {
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.m = size.setMargin(o.margin);
		model.id = model.e.attr('id');
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'division');
		model.axis = (o.xaxis || o.yaxis || ['']);
		model.scale = scale.get(model.axis, 
			(o.xaxis ? [model.m.left, model.w - model.m.right] : 
								 [model.m.top, model.h - model.m.bottom]));
		model.point = util.varType(o.point) === 'Array' ? 
									util.median(o.point) : o.point;
		model.font = o.font || '10px';
		model.padding = o.padding || 5;
		model.textHeight = draw.getTextHeight(model.font).height;
		// Data is..
		// { color: 'color', text: 'text', point: 'model.point' };
		model.data = o.data.map(function (d)	{
			return d.point = model.point, d;
		});
		model.line = (util.d3v4() ? d3.line() : d3.svg.line())
									.x(function (d) { return d.x; })
									.y(function (d) { return d.y; });
		model.showRect = o.showRect === undefined && 
										 o.showRect !== false ? true : o.showRect;
		model.showText = o.showText === undefined && 
										 o.showText !== false ? true : o.showText;
		model.showLine = o.showLine === undefined && 
										 o.showLine !== false ? true : o.showLine;
		model.marker = o.marker === undefined && 
									 o.marker !== false ? false : 
									(o.marker || 'circle');

		if (model.showRect)	{
			render.rect({
				element: model.g.selectAll('#' + model.id + '_div_rect'),
				data: model.data,
				attr: {
					id: function (d) { return model.id + '_div_rect'; },
					x: function (d, i)	{
						return o.attr.x ? 
									 o.attr.x.call(this, d, i, model) : 0;
					},
					y: function (d, i)	{
						return o.attr.y ? 
									 o.attr.y.call(this, d, i, model) : 0;
					},
					width: function (d, i)	{
						return o.attr.width ? 
									 o.attr.width.call(this, d, i, model) : 0;
					},
					height: function (d, i)	{
						return o.attr.height ? 
									 o.attr.height.call(this, d, i, model) : 0;
					},
					rx: function (d, i)	{
						return o.attr.rx ? 
									 o.attr.rx.call(this, d, i, model) : 0;
					},
					ry: function (d, i)	{
						return o.attr.ry ? 
									 o.attr.ry.call(this, d, i, model) : 0;
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(
									 	this, d, i, model) : '#000';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(
									 	this, d, i, model) : '#000';
					},
				},
				// TODO.
				// Rectangle 부분의 마우스 이벤트는 일단 제외시켜놓는다.
			});
		}

		if (model.showText)	{
			render.text({
				element: model.g.selectAll('#' + model.id + '_div_text'),
				data: model.data,
				attr:{
					id: function (d) { 
						return model.isText = true, model.id + '_div_text'; },
					x: function (d, i)	{
						return o.attr.x ? 
									 o.attr.x.call(this, d, i, model) : 0;
					},
					y: function (d, i)	{
						return o.attr.y ? 
									 o.attr.y.call(this, d, i, model) : 0;
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(
									 	this, d, i, model) : '#000';
					},
					'alignment-baseline': function (d, i)	{
						return o.style.alignmentBaseline ? 
									 o.style.alignmentBaseline.call(
									 	this, d, i, model) : 'middle';
					},
					'font-size': function (d, i)	{
						return o.style.fontSize ? 
									 o.style.fontSize.call(
									 	this, d, i, model) : model.font;
					},
					'font-weight': function (d, i) {
						return o.style.fontWeight ? 
									 o.style.fontWeight.call(
									 	this, d, i, model) : 'bold';
					},
				},
				text: function (d, i) { 
					return o.text ? 
								 o.text.call(this, d, i, model) : '' 
				},
			});
		}

		if (model.showLine)	{
			var x = o.lineX ? o.lineX(model) : 0,
					y = o.lineY ? o.lineY(model) : 0;

			render.line({
				element: model.g,
				attr: {
					id: function (d) { 
						return model.isLine = true, model.id + '_div_line'; 
					},
					d: model.line([
						{	x: x, y: y }, 
						{	x: x, y: model.h - model.m.bottom }]),
				},
				style: {
					stroke: function (d, i) {
						return o.style.stroke ? 
									 o.style.stroke.call(
									 	this, d, i, model) : '#000';
					},
					'stroke-dasharray': function (d, i)	{
						return o.style.dashed ? 
									 o.style.dashed.call(
									 	this, d, i, model) : '5, 10';
					},
				}
			});
		}

		if (model.marker && model.marker === 'circle')	{
			render.circle({
				element: model.g.selectAll(
					'#' + model.id + '_div_marker'),
				data: o.figure.data ? 
							o.figure.data(model.data, model) : model.data,
				attr: {
					id: function (d, i) { 
						return o.figure.attr.id ? 
									 o.figure.attr.id.call(
									 	this, d, i, model) : ''; 
					},
					cx: function (d, i) {
						return o.figure.attr.cx ? 
									 o.figure.attr.cx.call(
									 	this, d, i, model) : 0;
					},
					cy: function (d, i)	{
						return o.figure.attr.cy ? 
									 o.figure.attr.cy.call(
									 	this, d, i, model) : 0;
					},
					r: function (d, i)	{
						return o.figure.attr.r ? 
									 o.figure.attr.r.call(
									 	this, d, i, model) : 0;
					}
				},
				style: {
					fill: function (d, i)	{
						return o.figure.style.fill ? 
									 o.figure.style.fill.call(
									 	this, d, i, model) : 0;
					},
					stroke: function (d, i)	{
						return o.figure.style.stroke ? 
									 o.figure.style.stroke.call(
									 	this, d, i, model) : 0;
					},
					cursor: 'pointer',
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(
									 	this, d, i, model) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }

						return o.on.mouseout ? 
									 o.on.mouseout.call(
									 	this, d, i, model) : false;
					}
				},
				call: {
					start: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.start ? 
									 o.drag.start.call(
									 	this, d, i, model) : false;
					},
					drag: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.drag ? 
									 o.drag.drag.call(
									 	this, d, i, model) : false;
					},
					end: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.end ? 
									 o.drag.end.call(
									 	this, d, i, model) : false;
					},
				},
			});
		}	
	};

}(divisionLine||{}));