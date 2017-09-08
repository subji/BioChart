"use strict";
define("chart/legend/event_legend", ["utils"], function(_utils)	{
	var mouseover = function(_d)	{
		d3.select(this)
		.style("font-size", "12px");
	}

	var mouseout = function(_d)	{
		d3.select(this)
		.style("font-size", "11px");
	}
	
	return {
		mouseover : mouseover,
		mouseout : mouseout
	}
})