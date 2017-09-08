var needle = (function (needle)	{
	'use strict';

	var model = {};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.id = model.e.attr('id');
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.lg = render.addGroup(
		model.e, model.m.top, model.m.left, 'needle-line');
		model.cg = render.addGroup(
		model.e, model.m.top, model.m.left, 'needle-circle');
		model.radius = o.radius || 5;
		model.sx = scale.get(o.xaxis, 
			[model.m.left, model.w - model.m.right]);
		model.sy = scale.get(o.yaxis, 
			[model.h - model.m.bottom, model.m.top]);
		model.line = (util.d3v4() ? d3.line() : d3.svg.line())
								 .x(function (d, i) { 
								 		if (model.sx(d.x) < model.m.left)	{
								 			return -100;
								 		} else if (model.sx(d.x) > 
								 							 model.w - model.m.right)	{
								 			return model.w + 100;
								 		}

								 		return model.sx(d.x); }
								 	)
								 .y(function (d, i) { return model.sy(d.y); });

		util.loop(o.lineData, function (d, i)	{
			render.line({
				element: model.lg,
				attr: {
					id: function (d) { return model.id + '_line'; },
					d: model.line(d.value),
				},
				style: {
					stroke: '#A8A8A8',
				}
			});
		});

		render.circle({
			element: model.cg.selectAll('#' + model.id + '_circle'),
			data: o.circleData,
			attr: {
				id: function (d) { return model.id + '_circle'; },
				cx: function (d, i)	{ 
					return o.attr.x ? o.attr.x.call(
									this, d, i, model) : 0; 
				},
				cy: function (d, i)	{ 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0; 
				},
				r: function (d, i)	{ 
					return o.attr.r ? 
								 o.attr.r.call(
								 	this, d, i, model) : model.radius; 
				},
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#000000';
				},
				stroke: function (d, i)	{
					return o.style.stroke ? 
								 o.style.stroke.call(
								 	this, d, i, model) : '#FFFFFF';
				},
				cursor: function (d, i)	{
					return o.style.cursor ? 
								 o.style.cursor.call(
								 	this, d, i, model) : 'none';
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }
					
					return o.on.mouseover ? 
								 o.on.mouseover.call(this, d, i, model) : false;
				},
				mouseout: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseout ? 
								 o.on.mouseout.call(this, d, i, model) : false;
				}
			},
		});
	};
}(needle||{}));