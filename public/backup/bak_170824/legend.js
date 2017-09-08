var legend = (function (legend)	{
	'use strict';

	var model = {};
	/*
		가장 길이가 긴 문자열을 반환한다.
	 */
	function getMostText (texts)	{
		return new Array().concat(texts).sort(function (a, b)	{
			return a.length < b.length ? 1 : -1;
		})[0];
	};

	return function (o)	{
		model = {};
		model.d = !o.priority ? o.data : 
		o.data.sort(function (a, b)	{
			return o.priority(a) > o.priority(b) ? 1 : -1;
		});
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.m = size.setMargin(o.margin);
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.padding = o.padding || 5;
		model.font = o.font || '10px';
		model.sg = render.addGroup(
		model.e, model.t, model.l, 'legend-shape');
		model.tg = render.addGroup(
		model.e, model.t, model.l, 'legend-text');		
		model.mt = getMostText(model.d);
		model.mw = draw.getMostWidthOfText(model.d, model.font);
		model.mh = draw.getTextHeight(model.font).height;
		// x, y 위치 지정을 위한 배열 변수.
		model.x = [];
		model.y = [];
		// 도형의 크기 계산. 단, 원은 반지름이므로 2배를 하였다.
		model.shape = (o.attr && o.attr.r) ? 
		model.mh / 3 : model.mh / 1.5;

		model.ew = model.w - model.shape - model.padding * 2;

		model.font = 
		o.font || draw.getFitTextSize(model.mt, model.ew, model.shape);

		if (o.attr && o.attr.r)	{
			render.circle({
				element: model.sg.selectAll('#' + model.id + '_circle'),
				data: model.d,
				attr: {
					id: function (d) { return model.id + '_circle'; },
					cx: function (d, i)	{
						return o.attr.x ? o.attr.x.call(
							this, d, i, model) : 0;
					},
					cy: function (d, i)	{
						return o.attr.y ? o.attr.y.call(
							this, d, i, model) : 0;
					},
					r: function (d, i)	{
						return o.attr.r ? o.attr.r.call(
							this, d, i, model) : 0;
					},
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
									 	this, d, i, model) : false;
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on) { return false; }

						return o.on.mouseover ? 
									 o.on.mouseover.call(
									 	this, d, i, model) : false;
					},
				},
			})
		} else if (o.attr && o.attr.points)	{
			render.triangle({
				element: model.sg.selectAll('#' + model.id + '_triangle'),
				data: model.d,
				attr: {
					id: function (d) { return model.id + '_triangle'; },
					points: function (d, i) { 
						return o.attr.points ? 
									 o.attr.points.call(
									 	this, d, i, model) : [0, 0];
					},
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
									 	this, d, i, model) : false;
					},
					'stroke-width': function (d, i)	{
						return o.style.strokeWidth ? 
									 o.style.strokeWidth.call(
									 	this, d, i, model) : '1px';
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on) { return false; }
						
						return o.on.mouseover ? 
									 o.on.mouseover.call(
									 	this, d, i, model) : false;
					},
				},
			});
		} else if (o.attr && o.attr.width && o.attr.height) {
			render.rect({	
				element: model.sg.selectAll('#' + model.id + '_rect'),
				data: model.d,
				attr: {
					id: function (d) { return model.id + '_rect'; },
					x: function (d, i) { 
						return o.attr.x ? o.attr.x.call(
							this, d, i, model) : 0;
					},
					y: function (d, i) { 
						return o.attr.y ? o.attr.y.call(
							this, d, i, model) : 0;
					},
					width: function (d, i) { 
						return o.attr.width ? 
									 o.attr.width.call(
									 	this, d, i, model) : 5; 
					},
					height: function (d, i) { 
						return o.attr.height ? 
									 o.attr.height.call(
									 	this, d, i, model) : 5; 
					},
				},
				style: {
					fill: function (d, i) { 
						return o.style.fill ? 
									 o.style.fill.call(
									 	this, d, i, model) : '#000000'; 
					},
					stroke: function (d, i) { 
						return o.style.stroke ? 
									 o.style.stroke.call(
									 	this, d, i, model) : false; 
					},
				},
				on: {
					mouseover: function (d, i)	{
						if (!o.on) { return false; }

						return o.on.mouseover ? 
									 o.on.mouseover.call(
									 	this, d, i, model) : false;
					},
				},
			});
		}

		render.text({
			element: model.tg.selectAll('#' + model.id + '_text'),
			data: model.d,
			attr: {
				id: function (d) { 
					return (model.isText = true, model.id + '_text'); 
				},
				x: function (d, i) { 
					return o.attr.x ? o.attr.x.call(
						this, d, i, model) : 0; 
				},
				y: function (d, i) { 
					return o.attr.y ? o.attr.y.call(
						this, d, i, model) : 0; 
				},
			},
			style: {
				'font-size': function (d, i)	{
					return o.style.fontSize ? 
								 o.style.fontSize.call(
								 	this, d, i, model) : model.font;
				},
				'font-family': function (d, i) { 
					return o.style.fontFamily ? 
								 o.style.fontFamily.call(
								 	this, d, i, model) : 'Arial'; 
				},
				'font-weight': function (d, i) {
					return o.style.fontWeight ? 
								 o.style.fontWeight.call(
								 	this, d, i, model) : '1';
				},
				'alignment-baseline': function (d, i)	{
					return o.style.alignmentBaseline ? 
								 o.style.alignmentBaseline.call(
								 	this, d, i, model) : 'middle';
				},
				fill: function (d, i)	{
					return o.style.fill ?
								 o.style.fill.call(
								 	this, d, i, model) : '#333333';
				},
			},
			on: {
				mouseover: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseover ? 
								 o.on.mouseover.call(
								 	this, d, i, model) : false;
				},
			},
			text: function (d, i)	{ 
				return o.text ? 
							 o.text.call(
							 	this, d, i, model) : ('legend ' + i);
			},
		});
	};
}(legend||{}));