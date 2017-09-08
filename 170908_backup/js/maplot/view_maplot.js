"use strict";
define("maplot/view_maplot", ["utils", "size", "maplot/event_maplot"], function(_utils, _size, _event) {
	var side_menu = function(_e)   {
		$("#maplot_result").append($("#maplot_result_view"));
		$('.spinner .btn:first-of-type').on("click", _e.arrow);
		$('.spinner .btn:last-of-type').on("click", _e.arrow);
		$("#redraw_button").on("click", _e.redraw);
		$("#download_button").on("click", _e.download);
		$("#reset_button").on("click", _e.reset);
		$("#undo_button").on("click", _e.undo);
	}

	var view = function(_data)  {
		var size = _data.size;
		var svg  = _size.mkSvg("#maplot_view", size.width, size.height, false);

		var svg_g = svg.append("g")
		.attr("transform", "translate(0, 0)");

		var maplot_path_g = svg.append("g")
   	.attr("id", "maplot_select_line");

   	var xAxis = _size.setAxis(_data.x, "bottom", { "ticks" : 4 });
   	var yAxis = _size.setAxis(_data.y, "left", { "ticks" : 5 });

		_size.mkAxis(svg, "maplot_xaxis", 0 																		, size.rheight, xAxis);
		_size.mkAxis(svg, "maplot_yaxis", (size.margin.left + size.margin.right), 0  					, yAxis);

		d3.selectAll(".maplot_xaxis, .maplot_yaxis").selectAll("path, line")
		.style({"fill" : "none", "stroke" : "#BFBFBF", "stroke-width" : "1", "shape-rendering" : "crispEdges"});

		var circles = svg.selectAll("circle")
		.data(_data.data.data.plot_list)
		.enter().append("circle")
		.attr("class", "maplot_circles")
		.style("fill", function(_d) { 
			return _data.color(_d, _data.cut_off); 
		});

		_data.all_circles = circles;

		var e = _event(_data) || null;

		side_menu(e);
		svg.call(e.drag);

		circles
		.on({"mouseover" : e.m_over, "mouseout" : e.m_out})
		.transition().delay(function(_d, _i) { 
			return _i * (1 / 5); 
		})
		.attr("r" , 2)
		.attr("cx", function(_d) { 
			return _data.x(_d.x); 
		})
		.attr("cy", function(_d) { 
			return _data.y(_d.y); 
		});
	}

	return {
		view : view
	}
});