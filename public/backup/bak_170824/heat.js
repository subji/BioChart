var heatmap = (function (heatmap)	{
	'use strict';

	var model = { mt: ['cnv', 'var'], v: {}, d: [] };
	/*
		같은 위치에 중복된 데이터를 제외시켜주는 함수.
	 */
	function removeDuplication (d)	{
		util.loop(d, function (k, v)	{
			util.loop(model.mt, function (d, i)	{
				if (v[d][0])	{
					model.d.push({
						x: v.x, 
						y: v.y, 
						value: v[d][0], 
						info: v[d].splice(1),
					});
				}
			});
		})
	};
	/*
		같은 위치의 중복된 데이터를 제거하기 위한 데이터를 만들기 
		위한 데이터를 새로 만들어주는 함수.
	 */
	function removeDuplicate (data)	{
		util.loop(data, function (d, i)	{
			var k = d.x + d.y,
					p = config.landscape.case(d.value);
			// 우선순위가 가장 높은 것이 맨위에 오게 만든다.
			// 그려주는 데이터에 서는 지워지지만 실제로는 지워지지 않는다.
			model.v[k]
		  ? config.landscape.priority(model.v[k][p][0])
		  > config.landscape.priority(d.value)
		  ? model.v[k][p].unshift(d.value)
		  : model.v[k][p].push(d.value)
		  : (model.v[k] = {cnv: [], var: [], x: d.x, y: d.y}
		  , model.v[k][p].push(d.value));
		});

		return removeDuplication(model.v);
	};

	return function (o)	{
		// repaint 할 때, 중복되며 표시되므로 이를 방지하기 위해 초기화를 
		// 시켜준다.
		model = { mt: ['cnv', 'var'], v: {}, d: [] };
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.w = model.e.attr('width');
		model.h = model.e.attr('height');
		model.m = size.setMargin(o.margin);
		model.g = render.addGroup(
		model.e, model.m.top, model.m.left, 'heatmap');
		model.sx = scale.get(o.xaxis, 
							[model.m.left, (o.width || model.w) - 
							 model.m.right]);
		model.sy = scale.get(o.yaxis, 
							[model.m.top, (o.height || model.h) - 
							 model.m.bottom]);

		var id = model.e.attr('id');

		render.rect({
			element: model.g.selectAll('#' + id + '_rect'),
			data: o.dup ? 
						(removeDuplicate(o.data), model.d) : o.data,
			attr: {
				id: function (d, i) { return id + '_rect'; },
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
				mouseout: function (d, i)	{
					if (!o.on) { return false; }

					return o.on.mouseout ? 
								 o.on.mouseout.call(
								 	this, d, i, model) : false;
				},
			}
		});

		return model;
	};
}(heatmap||{}));