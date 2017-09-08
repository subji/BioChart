"use strict";
define("xyplot/event_xyplot", ["utils", "size"], function(_utils, _size)	{
	var tooltip = Object.create(_utils.tooltip);

	var get_mouseover = function(_d)	{
		var radius = 3;

		d3.select(this)
		.transition().duration(100)
		.attr("r", radius * 2.5);

		tooltip.show(this, "title : " + _d.title 
										 + "</br> x : " + Number(_d.x).toFixed(5) 
										 + "</br> y : " + Number(_d.y).toFixed(5), 
										 	 "rgba(15, 15, 15, 0.6)");
	}

	var get_mouseout = function(_d)	{
		var radius = 3;

		d3.select(this)
		.transition().duration(100)
		.attr("r", radius);

		tooltip.hide();	
	}

	return {
		m_over : get_mouseover,
		m_out : get_mouseout
	}
});