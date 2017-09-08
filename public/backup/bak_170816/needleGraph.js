var needleGraph = (function (needleGraph)	{
	'use strict';

	var model = {};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.m = size.setMargin(o.margin);
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.t = model.h - model.m.bottom;
		model.l = model.m.left || 0;
		model.g = render.addGroup(
		model.e, model.t, model.l, 'needle-graph');
		model.font = o.font || '10px';
		model.sx = scale.get(o.xaxis, 
			[model.m.left, model.w - model.m.right]);
		model.sy = scale.get(o.yaxis, 
			[model.h - model.m.bottom, model.m.top]);
		model.sh = Math.abs(model.sy(1) - model.sy(0)) / 2 > 25 ? 
							 Math.abs(model.sy(1) - model.sy(0)) / 2 : 25;

		render.rect({
			element: model.g.selectAll('#' + model.id + '_base'),
			data: [''],
			attr: {
				id: model.id + '_base',
				x: model.sx(util.minmax(o.xaxis).min) + 5,
				y: model.sh * 0.1,
				width: model.w - model.m.right - model.m.left - 5,
				height: model.sh * 0.8,
				rx: 1,
				ry: 1,
			},
			style: {
				fill: '#DADFE1',
				stroke: '#CCCDCE',
				'stroke-width': '5px',
			},
		});

		var mg = model.g.selectAll('#' + model.id + '_graph')
										.data(o.data).enter()
										.append('g')
										.attr('id', model.id + '_graph')
										.attr('transform', 'translate(0, 0)');
		// 그냥 일반적으로 Append 만을 하고 싶을때는,
		// data property 를 제외하고 Targeted element 만
		// 설정해주면 된다.
		render.rect({
			element: mg,
			// element: model.g.selectAll('#' + model.id + '_rect'),
			// data: o.data,
			attr: {
				id: function (d) { return model.id + '_rect'; },
				x: function (d, i) { 
					return o.attr.x ? 
								 o.attr.x.call(this, d, i, model) : 0;
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0;
				},
				width: function (d, i) { 
					return o.attr.width ? 
								 o.attr.width.call(this, d, i, model) : 0;
				},
				height: function (d, i) { 
					return o.attr.height ? 
								 o.attr.height.call(this, d, i, model) : 0;
				},
				rx: 3,
				ry: 3,
			},
			style: {
				fill: function (d, i)	{
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#000000';
				},
				stroke: function (d, i)	{
					return o.style.stroke ? 
								 o.style.stroke.call(
								 	this, d, i, model) : '#FFFFFF';
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseover ? 
								 o.on.mouseover.call(
								 	this, d, i, model) : false;
				},
				mouseout: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseout ? 
								 o.on.mouseout.call(
								 	this, d, i, model) : false;
				},
			},
		});

		render.text({
			element: mg,
			// element: model.g.selectAll('#' + model.id + '_rect'),
			// data: o.data,
			attr: {
				id: function (d) {
					return model.isText = true, model.id + '_text';
				},
				x: function (d, i)	{
					return o.attr.x ? 	
								 o.attr.x.call(this, d, i, model) : 0;
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y.call(this, d, i, model) : 0;
				},
			},
			style: {
				fill: function (d, i)	{
					return o.style.fill ? 
								 o.style.fill.call(
								 	this, d, i, model) : '#333333'; 
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
			},
			text: function (d, i) {
				return o.text ? 
							 o.text.call(this, d, i, model) : 0;
			},
		})
	};
}(needleGraph||{}));