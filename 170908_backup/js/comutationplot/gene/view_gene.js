var GENE = "comutationplot/gene/";

define(GENE + "view_gene", ["utils", "size", GENE + "event_gene"], function(_utils, _size, _event)	{
	var view = function(_data)	{
		var size = _data.size;

		var svg = d3.select("#comutationplot_gene")
		.append("svg")
		.attr("class", "comutationplot_gene")
		.attr("width", size.width)
		.attr("height", size.height)
		.append("g")
		.attr("transform", "translate(0, 0)");

		var xAxis = d3.svg.axis()
		.scale(_data.x)
		.orient("bottom")
		.tickValues([0, _data.max / 2, _data.max]);

		var yAxis = d3.svg.axis()
		.scale(_data.y)
		.orient("right");

		var xaxis = svg.append("g")
		.attr("class", "comutationplot_gene_xaxis")
		.attr("transform", "translate(0, " + (size.height - size.margin.top) + ")")
		.call(xAxis);

		var yaxis = svg.append("g")
		.attr("class", "comutationplot_gene_yaxis")
		.attr("transform", "translate(" + (size.width - size.margin.right) + ", 0)")
		.call(yAxis);

		xaxis.selectAll("text")
		.style("fill", "#626262");

		yaxis.selectAll("path, line")
		.style("fill", "none").style("stroke", "none");

		yaxis.selectAll("text")
		.style("fill", "#626262")
		.on("mouseover", _event.axis_m_over)
		.on("mouseout", _event.axis_m_out);

		svg.append("g")
		.data([{ 
			data : _data.data, 
			size : size, 
			status : false 
		}])
		.attr("class", "comutationplot_gene_sort_label")
		.attr("transform", "translate(" + (size.rwidth + size.margin.left * 1.5) + ", " + (size.height - 2) + ")")
		.append("text")
		.text("#mutations")
		.on("click", _event.sort_by_value);

		$(".comutationplot_gene_sort_label")
		.tooltip({
			container : "body",
			title : "sort by mutation value",
			placement : "bottom"
		});

		var bar_group = svg.selectAll(".comutationplot_gene_bargroup")
		.data(_data.data)
		.enter().append("g")
		.attr("class", "comutationplot_gene_bargroup") 
		.attr("transform", "translate(0, 0)");

		var stacked_bar = bar_group.selectAll("rect")  
		.data(function(_d)  { 
			return _d.list; 
		})
		.enter().append("rect")
		.attr("class", "comutationplot_gene_bars")
		.style("fill", function(_d) { 
			return _utils.mutate(_d.type).color;
		})
		.on("mouseover", _event.bar_m_over)
		.on("mouseout",_event.bar_m_out)
		.attr("x", function(_d) { 
			_d.x = _data.x; 
			return _d.x(_d.start + _d.count); 
		})
		.attr("y", function(_d) { 
			_d.y = _data.y; 
			return _d.y(_d.gene); 
		})
		.attr("width", function(_d) { 
			return ((size.width - size.margin.right) - _d.x(_d.count)); 
		})
		.attr("height", function(_d) { 
			return _d.y.rangeBand() / 1.2; 
		});
	}
	return {
		view : view
	}
});