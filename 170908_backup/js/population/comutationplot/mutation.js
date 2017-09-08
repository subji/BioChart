'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('mutation', ['format', 'tooltip'], factory);
	} else {
		factory(mutation);
	}
} (function (format, tooltip)	{
	var matchMutations = function (d, list)		    {
		var result = '';

		for (var i = 0, l = list.length; i < l; i++)	{
			var item = list[i];

			if (d.participant_id === item.participant_id
			 && d.gene   				 === item.gene
		 	 && item.idx 				 === d.idx)	{
				result += (item.type + '</br>');
			}
		}

		return result;
	}

	var mOver 		     = function (that, d, list)	{
		var types = matchMutations(d, list);
		var str   = '<b>Gene mutations</b></br> x : ' + d.participant_id
						  + '</br>y : '  + d.gene +  '</br>'  + types;

		tooltip.show(that, str, 'rgba(15, 15, 15, 0.6)');

		d3.select(that)
			.transition().duration(50)
			.style({ 'stroke' : '#333', 'stroke-width' : '1px' });
	}

	var mOut 					 = function (d)							{
		tooltip.hide();

		d3.select(this)
			.transition().duration(250)
			.style({ 'stroke' : '#fff', 'stroke-width' : '0px'});
	}

	return function (data)											  {
		var el 		= $('#comutation');
		var width = el.width(), height = el.height();
		var top 	= 20, left = 10;
		var svg 	= d3.select('#comutation')
									.append('svg')
									.attr({ 'width' : width, 'height' : height })
									.append('g')
									.attr('transform', 'translate(0, 0)');

		var x     = d3.scale.ordinal()
									.domain(data.participant_id_name)
									.rangeBands([0	 , width]);
		var y 		= d3.scale.ordinal()
									.domain(data.gene_name)
									.rangeBands([left, (height - top)]);

		var mut		= svg.selectAll('#plotMutation')
									 .data(data.mutation_list)
									 .enter().append('rect')
									 .attr('id'			, function (d)	{
									 		if (d.idx !== 2)	{
									 			this.parentNode.parentNode.appendChild(this);
									 		}

									 		return 'plotMutation';
									 })
									 .attr('x'			, function (d)	{
									 		return x(d.participant_id);
									 })
									 .attr('y'			, function (d)	{
									 		return d.idx === 2 ? y(d.gene)
									 				 : y(d.gene) + ((y.rangeBand() / 2)
									 				 - ((y.rangeBand() / 2.5) / 2));
									 })
									 .attr('width'	, x.rangeBand())
									 .attr('height'	, function (d)	{
									 		return (d.idx === 2 ? y.rangeBand()
									 				 : (y.rangeBand() / 3)) * 0.98;
									 })
									 .style('fill'	, function (d)	{
									 		return d.color;
									 })
									 .on({
									 	 'mouseover' : function (d) {
									 	 		mOver(this, d, data.mutation_list);
									 	 	},
									 	 'mouseout'  : mOut
									 });
	}
}));