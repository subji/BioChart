var scatter = (function (scatter)	{
	'use strict';

	var model = {};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.m = size.setMargin(o.margin);
		model.d = o.data;
		model.w = model.e.attr('width');
		model.h = model.e.attr('height');
		model.t = o.top || model.m.top || 0;
		model.l = o.left || model.m.left || 0;
		model.f = o.fontSize || '10px';
		model.ss = o.shapeSize || 5;
		model.sx = scale.get(o.xaxis, [
		model.m.left, model.w - model.m.right ]);
		model.sy = scale.get(o.yaxis, [
		model.m.top, model.h - model.m.bottom ]);
		model.g = render.addGroup(
		model.e, model.t, model.l, 'scatter');

		var id = model.e.attr('id');

		if (o.attr.r)	{
			render.circle({
				element: model.g.selectAll('#' + id + '_circle'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_circle'; },
					cx: function (d, i)	{
						return o.attr.x ? o.attr.x.call(this, d, i, model) : 0;
					},
					cy: function (d, i)	{
						return o.attr.y ? o.attr.y.call(this, d, i, model) : 0;
					},
					r: function (d, i)	{
						return o.attr.r ? o.attr.r.call(this, d, i, model) : 0;
					},
				}, 
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000';
					},
					'fill-opacity': function (d, i)	{
						return o.style.fillOpacity ? 
									 o.style.fillOpacity.call(this, d, i, model) : '1';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false;
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
			})
		} else if (o.attr.points)	{
			render.triangle({
				element: model.g.selectAll('#' + id + '_triangle'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_triangle'; },
					points: function (d, i) { 
						return o.attr.points ? 
									 o.attr.points.call(this, d, i, model) : [0, 0];
					},
				},
				style: {
					fill: function (d, i)	{
						return o.style.fill ? 
									 o.style.fill.call(this, d, i, model) : '#000000';
					},
					'fill-opacity': function (d, i)	{
						return o.style.fillOpacity ? 
									 o.style.fillOpacity.call(this, d, i, model) : '1';
					},
					stroke: function (d, i)	{
						return o.style.stroke ? 
									 o.style.stroke.call(this, d, i, model) : false;
					},
					'stroke-width': function (d, i)	{
						return o.style.strokeWidth ? 
									 o.style.strokeWidth.call(this, d, i, model) : '1px';
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, d, i, model) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
			});
		} else {
			render.rect({	
				element: model.g.selectAll('#' + id + '_rect'),
				data: model.d,
				attr: {
					id: function (d) { return id + '_rect'; },
					x: function (d, i) { 
						return o.attr.x ? o.attr.x.call(model, d, i) : 0;
					},
					y: function (d, i) { 
						return o.attr.y ? o.attr.y.call(model, d, i) : 0;
					},
					width: function (d, i) { 
						return o.attr.width ? o.attr.width.call(model, d, i) : 5; 
					},
					height: function (d, i) { 
						return o.attr.height ? o.attr.height.call(model, d, i) : 5; 
					},
				},
				style: {
					fill: function (d) { 
						return o.style.fill ? o.style.fill(d) : '#000000'; 
					},
					'fill-opacity': function (d)	{
						return o.style.fillOpacity ? 
									 o.style.fillOpacity(d) : '1';
					},
					stroke: function (d) { 
						return o.style.stroke ? o.style.stroke(d) : false; 
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, model, d, i) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
			});
		}

		if (o.text)	{
			render.text({
				element: model.g.selectAll('#' + model.e.attr('id') + '_text'),
				data: model.d,
				attr: {
					id: function (d) { 
						return (model.isText = true, model.e.attr('id') + '_text'); 
					},
					x: function (d, i) { 
						return o.attr.x ? o.attr.x.call(model, d, i) : 0; 
					},
					y: function (d, i) { 
						return o.attr.y ? o.attr.y.call(model, d, i) : 0; 
					},
				},
				style: {
					'font-size': function (d) { 
						return o.style.fontSize ? o.style.fontSize(d) : '10px'; 
					},
					'font-family': function (d) { 
						return o.style.fontFamily ? o.style.fontFamily(d) : 'Arial'; 
					},
					'alignment-baseline': function (d)	{
						return o.style.alignmentBaseline ? 
									 o.style.alignmentBaseline : 'middel';
					}
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(this, model, d, i) : false;
					},
					mouseout: function (d, i)	{
						if (!o.on)	{ return false; }
						
						return o.on.mouseout ? 
									 o.on.mouseout.call(this, d, i, model) : false;
					}
				},
				text: function (d, i)	{ 
					return o.text ? o.text.call(model, d, i) : ('legend ' + i);
				},
			});
		}	
	};

}(scatter||{}));