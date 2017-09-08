var COMUTATION = "comutationplot/comutation/";

define(COMUTATION + "view_comutation", ["utils", "size", COMUTATION + "event_comutation"], function(_utils, _size, _event)	{
	var view = function(_data)	{
		var size = _data.size;

		var svg = d3.select("#comutationplot_heatmap")
		.append("svg")
		.attr("class", "comutationplot_heatmap")
		.attr("width", size.width)
		.attr("height", size.height)
		.append("g")
		.attr("transform", "translate(0, 0)");

		var yAxis = d3.svg.axis()
		.scale(_data.y)
		.orient("left");

		var yaxis = svg.append("g")
		.attr("class", "comutationplot_heatmap_yaxis")
		.attr("transform", "translate(0, 0)")
		.call(yAxis);

		yaxis.selectAll("text")
		.style("fill", "#626262");

		yaxis.selectAll("path, line")
		.style("fill", "none").style("stroke", "#BFBFBF").style("stroke-width", "1").style("shape-rendering", "crispEdges");

		var cell_group = svg.selectAll(".comutationplot_cellgroup")
		.data(_data.all_data)
		.enter().append("g")
		.attr("class", "comutationplot_cellgroup")
		.attr("transform", function(_d)	{
			_d.x = _data.x;
			_d.y = _data.y;
			return "translate(" + _data.x(_d.sample) + ", " + _data.y(_d.gene) +")";
		});

		var cell = cell_group.append("rect")
		.attr("class", "comutationplot_cells")
		.attr("x", 0)
		.attr("y", 0)
		.style("stroke", function(_d) { 
			return _d.type[0].color;
		})
		.style("fill", function(_d) { 
			return _utils.mutate(_d.type[0]).color; 
		})
		.style("stroke-width", function(_d) { 
			return 1; 
		})
		.on("mouseover", _event.m_over)
		.on("mouseout", _event.m_out)
		.attr("width", function(_d) { 
			return _data.x.rangeBand(); 
		})
		.attr("height", function(_d) { 
			return _data.y.rangeBand() / 1.2; 
		});

		_event.move_scroll();
	}
	return {
		view : view
	}
});