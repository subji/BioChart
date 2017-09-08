'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('group', ['format', 'tooltip', 'mouseHandler'], factory);
	} else {
		factory(group);
	}
} (function (format, tooltip, mouseHandler)	{
	var setHeight    = function (num)									{
		var hdefault 	= (15 * num);
		var groupline = $('#groupName, #group');

		groupline.height(hdefault);

		return (hdefault);
	}

	var makeSvg 		 = function (id, w, h)					  {
		return d3.select('#' + id)
						 .append('svg')
						 .attr({ 'width' : w, 'height' : h });
	}

	var ordinal 		 = function (domain, range) 		  {
		return d3.scale.ordinal()
						 .domain(domain)
						 .rangeBands(range);
	}

	var linear 			 = function (domain, range)			  {
		return d3.scale.linear()
						 .domain(domain)
						 .range(range);
	}

	var onTransition = function (target, time, style)	{
		d3.select(target)
			.transition().duration(time)
			.style(style);
	}

	var tOver 		   = function (d)									  {
		var str = '<b>' + d	+ '</b></br>click to sort '
						+ '</br>alt + click add to key';

		tooltip.show(this, str, 'rgba(178, 0, 0, 0.6)');

		onTransition(this, 50, {'font-size' : '12px'});
	}

	var tOut 				 = function (d)									  {
		tooltip.hide();

		onTransition(this, 250, {'font-size' : '8px'});
	}

	var mOver 		   = function (d)									  {
		var name  = d3.select(this.parentNode).datum().name;
		var value = !d.value ? 'NA' : d.value;
		var str 	= '<b>Clinical ' + name + '</b></br> sample :'
		 					+ d.participant_id + '</br>value : ' + value;

		tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');

		onTransition(this, 250, {'stroke' : '#333', 'stroke-width' : '1px'});
	}

	var mOut 		     = function (d)									  {
		tooltip.hide();

		onTransition(this, 250, {'stroke' : '#fff', 'stroke-width' : '0px'});
	}

	return function (data, settingData)							  {
		var grouplist = settingData || data.group_list;

		var el     = $('#group'), nel = $('#groupName'), ael = $('#addRemove');
		var width  = el.width(), nwidth = nel.width(), awidth = ael.width();
		var height = setHeight(grouplist.length);
		var margin = 10;

		var svg 	 = makeSvg('group'		, width , height);
		var asvg   = makeSvg('addRemove', awidth, height);
		var nsvg   = makeSvg('groupName', nwidth, height);

		var x 		 = ordinal(data.participant_id_name, [0, width]);
		var y 		 = ordinal(grouplist.map(function (d)	{
										return d.name;
								 }), [0, (height - margin)]);

		svg.selectAll('#plotGroupGroup')
			 .data(grouplist)
			 .enter().append('g')
			 .attr('transform', function (d)	{
			 		return 'translate(0, ' + y(d.name) + ')';
			 })
			 .selectAll('#plotGroup')
			 .data(function (d)	{
			 		return d.data.filter(function (d)	{
			 			if (d.participant_id !== null)	{
			 				return d;
			 			}
			 		});
			 })
			 .enter().append('rect')
			 .attr('id'			, 'plotGroup')
			 .attr('x'			, function (d)	{
		 			return x(d.participant_id);
			 })
			 .attr('y'			, function (d)	{
			 		return ((y.rangeBand() / 2)
			 				 - ((y.rangeBand() / 2.5) / 2));
			 })
			 .attr('width'	, x.rangeBand())
			 .attr('height'	, 5)
			 .style('fill'	, function (d)	{
			 		return d.color;
			 })
			 .on({ 'mouseover' : mOver, 'mouseout' : mOut });

		nsvg.append('g')
				.attr('transform', 'translate(0, ' + margin + ')')
				.selectAll('#txtGroupName')
				.data(grouplist.map(function (d)	{
					return d.name;
				}))
				.enter().append('text')
				.attr('cursor', 'pointer')
				.attr('id'		, 'txtGroupName')
				.attr('x' 		, margin)
				.attr('y' 		, function (d)	{
					return y(d);
				})
				.text(function (d)	{
					return d;
				})
				.on({ 'mouseover' : tOver, 'mouseout' : tOut })
				.on('click', function (d)	{
					d3.event.altKey ? mouseHandler.group(d, data, true)
												  : mouseHandler.group(d, data, false);
				});
	}
}));