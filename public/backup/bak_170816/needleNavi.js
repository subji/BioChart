var needleNavi = (function (needleNavi)	{
	'use strict';

	var model = { start: 0, end: 0 };
	/*
		Navigator 를 조절할 양쪽의 조절 버튼을 만드는
		함수.
	 */
	function makeControlRect (o, r)	{
		util.loop(r, function (d, i)	{
			render.rect({
				element: model.g.selectAll('#' + model.id + '_' + d),
				data: [d],
				attr: {
					id: function (d) { return model.id + '_' + d },
					x: d === 'end' ? model.end + model.m.left - 
													 model.rect.width : 
													 model.start - model.rect.width,
					y: model.h * 0.25,
					width: model.rect.width * 2,
					height: model.rect.height,
					rx: 5,
					rx: 5,
				},
				style: {
					'fill': '#A8A8A8',
					'stroke': '#EAECED',
					'stroke-width': '2px',
					'cursor': 'ew-resize',
				},
				call: {
					start: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.start ? 
									 o.drag.start.call(this, d, i, model) : false;
					},
					drag: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.drag ? 
									 o.drag.drag.call(this, d, i, model) : false;
					},
					end: function (d, i)	{
						if (!o.drag) { return false; }

						return o.drag.end ? 
									 o.drag.end.call(this, d, i, model) : false;
					},
				},
			});
		});
	};

	return function (o)	{
		model = {};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.id = model.e.attr('id');
		model.w = o.width || model.e.attr('width');
		model.h = o.height || model.e.attr('height');
		model.m = size.setMargin(o.margin);
		model.t = model.m.top || 0;
		model.l = model.m.left || 0;
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'needle-navi');
		model.sx = scale.get(o.xaxis, 
			[model.m.left, model.w - model.m.right]);
		model.sy = scale.get(o.yaxis, 
			[model.h - model.m.bottom, model.m.top]);
		// 양끝에 그려지는 버튼의 가로 세로 길이 설정.
		model.rect = { width: 5, height: model.h * 0.4 };
		// 양끝의 버튼의 시작 위치 설정.
		model.start = model.sx(util.minmax(o.xaxis).min);
		model.end = model.w - model.m.right - model.m.left;
		// Drag 이벤트를 위해서 시작위치와 끝위치를 정해준다.
		config.variants.navi.start.init = 
		 model.start - model.rect.width;
		config.variants.navi.end.init = 
		 model.end - model.rect.width + model.m.left;
		config.variants.navi.start.now = 
		 model.start - model.rect.width;
		config.variants.navi.end.now = 
		 model.end - model.rect.width + model.m.left;
		config.variants.navi.navi.init = model.start;
		config.variants.navi.navi.now = model.start;
		config.variants.navi.navi.width = model.end;
		config.variants.navi.navi.nowWidth = 
		 model.end - model.start;

		needle({
			element: model.e,
			lineData: o.data.needle,
			circleData: o.data.fullNeedle,
			attr: config.variants.needle.attr,
			style: o.style,
			margin: [5, 30, 15, 60],
			xaxis: o.xaxis,
			yaxis: o.yaxis,
		});

		render.rect({
			element: model.g.selectAll('#' + model.id + '_navi'),
			data: ['navi'],
			attr: {
				id: function (d)	{ return model.id + '_navi'; },
				x: model.start,
				y: 0,
				width: model.end,
				height: model.h - model.m.bottom,
				rx: 3,
				ry: 3,
			},
			style: {
				fill: 'rgba(255, 225, 50, 0.1)',
				stroke: '#FFDF6D',
				cursor: 'move',
			},
			call: {
				start: function (d, i)	{
					if (!o.drag) { return false; }

					return o.drag.start ? 
								 o.drag.start.call(this, d, i, model) : false;
				},
				drag: function (d, i)	{
					if (!o.drag) { return false; }

					return o.drag.drag ? 
								 o.drag.drag.call(this, d, i, model) : false;
				},
				end: function (d, i)	{
					if (!o.drag) { return false; }

					return o.drag.end ? 
								 o.drag.end.call(this, d, i, model) : false;
				},
			},
		});

		makeControlRect(o, ['start', 'end']);
		// Navigator 가 Needle Plot 에 가려져 있던 것을
		// 앞으로 내와서 안가려지게 하였다.
		model.e.node().removeChild(
		model.e.node().firstChild);
		model.e.node().appendChild(model.g.node());
	};
}(needleNavi||{}));