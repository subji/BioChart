var bar = (function (bar)	{
	'use strict';
	
	var model = {};
	/*
		bar 의 방향에 따라 range 값을 반환해주는 함수.
	 */
	function range (d) {
		var x = [model.m.left, model.w - model.m.right], 
				y = [model.m.top, model.h - model.m.bottom];

		return {
			x: d === 'top' || d === 'bottom' || d === 'right' ? 
			x : x.reverse(), 
			y: d === 'left' || d === 'right' || d === 'bottom' ? 
			y : y.reverse()
		};
	};
	/*
		x, y 스케일 함수를 반환하는 함수.
	 */
	function setScale (d, a, w)	{
		return scale.get(a, range(d)[w]);
	};
	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.w = o.width || model.e.attr('width') || 0;
		model.h = o.height || model.e.attr('height') || 0;
		model.m = size.setMargin(o.margin);
		model.data = o.data;
		model.direction = o.direction || 'top';
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'bar');
		model.dx = new Array().concat(o.xaxis);
		model.dy = new Array().concat(o.yaxis);
		model.sx = setScale(model.direction, model.dx, 'x');
		model.sy = setScale(model.direction, model.dy, 'y');
		/*
		 	Bar, Stacked Bar, ... 를 그려주는 렌더링 함수를 호출하는 부분.
		 */
		render.rect({
			element: model.g.selectAll('#' + model.id + '_rect'),
			data: model.data,
			attr: {
				id: function (d) { return model.id + '_rect'; },
				x: function (d, i) { 
					return o.attr.x ? 
								 o.attr.x(d, i, model) : o.attr.x(d); 
				},
				y: function (d, i) { 
					return o.attr.y ? 
								 o.attr.y(d, i, model) : o.attr.y(d); 
				},
				width: function (d, i) { 
					return o.attr.width ? 
								 o.attr.width(d, i, model) : 10; 
				},
				height: function (d, i) { 
					return o.attr.height ? 
								 o.attr.height(d, i, model) : 10; 
				},
			},
			style: {
				fill: function (d, i) { 
					return o.style.fill ? 
								 o.style.fill(d, i, model) : '#000000'; 
				},
				stroke: function (d, i) { 
					return o.style.stroke ? 
								 o.style.stroke(d, i, model) : '#FFFFFF'; 
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
				},
			},
		});

		return model;
	};
}(bar || {}));