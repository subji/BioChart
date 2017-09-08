var COMUTATION = "comutationplot/comutation/";

define(COMUTATION + "event_comutation", ["utils", "size"], function(_utils, _size)	{
	var tooltip = Object.create(_utils.tooltip);

	var mouseover = function(_d)	{
		this.parentNode.parentNode.appendChild(this.parentNode);

		tooltip.show(
			this, 
			"x : " + _d.sample + "</br>y : " + _d.gene + "</br>type : " + _d.type
			, "rgba(15, 15, 15, 0.6)");

		d3.select(this)
		.transition().duration(10)
		.style("stroke", "black")
		.style("stroke-width", 2);
	}

	var mouseout = function(_d)	{
		tooltip.hide();

		d3.select(this)
		.transition().duration(10)
		.style("stroke-width", function(_d) { 
			return 0; 
		});
	}

	var moveScroll = function()	{
		var target_1 = $("#comutationplot_sample");
		var target_2 = $("#comutationplot_heatmap");

		target_2.scroll(function()	{
			target_1.scrollLeft(target_2.scrollLeft());
		});
	}
	return {
		m_over : mouseover,
		m_out : mouseout,
		move_scroll : moveScroll
	}
})