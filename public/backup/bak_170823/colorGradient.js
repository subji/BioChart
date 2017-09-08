var colorGradient = (function (colorGradient)	{
	'use strict';

	var model = {};
	/*
		Offset 과 색상을 설정하고 배열에 넣어주는 함수.
	 */
	function setOffset (off, col)	{
		model.offsets.show.push({offset: off, color: col});
		model.offsets.data.push({offset: off, color: col});
	};
	/*
		Gradiend 색상과 비율을 설정해주는 함수.
	 */
	function makeColorRate (o, c)	{
		var mm = util.minmax(o),
				cpo = new Array().concat(o)
												 .splice(1, o.length - 2);

		setOffset('0%', c[0]);
		util.loop(cpo, function (d, i)	{
			var v = Math.round((mm.max - mm.min) / d * 10);

			model.offsets.show.push({ 
				offset: v - model.adj + '%', 
				color: c[i + 1] 
			});
			model.offsets.data.push({ 
				offset: v + '%', 
				color: c[i + 1] 
			});
		});

		setOffset('100%', c[o.length - 1]);
	};

	return function (o)	{
		model = {offsets: {show:[], data: []}};
		model.e = o.element = util.varType(o.element) === 'Object' || 
													util.varType(o.element) === 'Array' ? 
							o.element : (/\W/).test(o.element[0]) ? 
							d3.select(o.element) : d3.select('#' + o.element);
		model.adj = o.adjustValue || 0;
		model.id = o.id || 'linear_gradient';
		model.colors = o.colors || ['#000000', '#FFFFFF'];
		model.offset = o.offset || [0, 100];
		model.defs = model.e.append('defs');
		model.lineGradient = 
		model.defs.append('linearGradient').attr('id', model.id);

		makeColorRate(model.offset, model.colors)
		// Linear Gradient setting.
		model.lineGradient
			.selectAll('stop')
		  .data(model.offsets.show)
		  .enter().append('stop')
		  .attr('offset', function (d) { return d.offset; })
		  .attr('stop-color', function (d) { return d.color; });

		return model;
	};

}(colorGradient||{}));