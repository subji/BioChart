var PQ = "comutationplot/pq/";

define(PQ + "view_pq", ["utils", "size", PQ + "event_pq"], function(_utils, _size, _event)	{
	var view = function(_data)	{
		var data = _data || {};
		var size = data.size;
		var e = _event || null;

		var svg = d3.select("#comutationplot_pq")
		.append("svg")
		.attr("class", "comutationplot_pq")
		.attr("width", size.width)
		.attr("height", size.height)
		.append("g")
		.attr("transform", "translate(0, 0)");

		var xAxis = d3.svg.axis()
		.scale(data.x)
		.orient("bottom")
		.tickValues([0, data.max / 2, data.max]);

		svg.append("g")
		.attr("class", "comutationplot_pq_xaxis")
		.attr("transform", "translate(0, " + (size.height - size.margin.top) + ")")
		.call(xAxis);

		svg.append("g")
		.data([{ data : data.data, size : size, status : false }])
		.attr("class", "comutationplot_pq_sort_label")
		.attr("transform", "translate(" + (size.rwidth + size.margin.left * 2) + ", " + (size.height - 2) + ")")
		.append("text")
		.text("#q value")
		.on("click", e.sort_by_value);

		$(".comutationplot_pq_sort_label")
		.tooltip({
			container : "body",
			title : "sort by q value",
			placement : "bottom"
		});

		var bar_group = svg.selectAll(".comutationplot_pq_bargroup")
		.data(data.data)
		.enter().append("g")
		.attr("class", "comutationplot_pq_bargroup") 
		.attr("transform", "translate(0, 0)");

		var stacked_bar = bar_group.selectAll("rect")  
		.data(function(_d)  { 
			return _d.list; 
		})
		.enter().append("rect")
		.attr("class", "comutationplot_pq_bars")
		.on("mouseover", e.m_over)
		.on("mouseout", e.m_out)
		.attr("x", function(_d) { 
			return size.margin.left; 
		})
		.attr("y", function(_d) { 
			return data.y(_d.name); 
		})
		.attr("width", function(_d) { 
			return data.x(_utils.calLog(_d.q)) - size.margin.left; 
		})
		.attr("height", data.y.rangeBand() / 1.2);
	}
	return {
		view : view
	}
});