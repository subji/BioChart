"use strict";
define("pcaplot/pca2d/view_pcaplot2d", ["utils", "size", "pcaplot/pca2d/event_pcaplot2d"], function(_utils, _size, _event)	{
	var interfaceFigure = function(_data, _x, _y, _svg, _type)	{
		switch(_type)	{
			case "circle" 	: return circles(_data  , _x, _y, _svg); break;
			case "rect"  		: return rectangle(_data, _x, _y, _svg); break;
			case "triangle" : return triangle(_data , _x, _y, _svg); 
			break;
		}
	}

	var circles = function(_data, _x, _y, _svg)	{
		return _svg.append("circle")
		.attr("class", "pcaplot_circles")
		.attr({"cx" : _data.x(_x), "cy" : _data.y(_y)})
		.attr("r", _data.radius);
	}

	var rectangle = function(_data, _x, _y, _svg)	{
		return _svg.append("rect")
		.attr("class", "pcaplot_rect")
		.attr({"x" : _data.x(_x) - _data.radius, "y" : _data.y(_y) - _data.radius})
		.attr({"width" : _data.radius * 2, "height" : _data.radius * 2});
	}

	var triangle = function(_data, _x, _y, _svg)	{
		return _svg.append("path")
		.attr("class"    , "pcaplot_triangle")	
		.attr("d" 			 , d3.svg.symbol().type("triangle-up"))
		.attr("transform", "translate(" + _data.x(_x) +  ", " + _data.y(_y) + ")");
	}

	var view = function(_data)	{
		var size  = _data.size;
		var svg   = _size.mkSvg("#pcaplot_view_2d", size.width, size.height, true);
		var xAxis = _size.setAxis(_data.x, "bottom", { "ticks" : 5 });
		var yAxis = _size.setAxis(_data.y, "left"  , { "ticks" : 5 });

		svg.append("g")
		.attr("class" 	 , "pcaplot_2d_pc1label")
		.attr("transform", "translate(" + (size.rwidth / 2) + ", " + (size.height - size.margin.top) + ")")
		.append("text")
		.text("PC1");

		_size.mkAxis(svg, "pcaplot_xaxis", 0 							 , size.rheight, xAxis);
		_size.mkAxis(svg, "pcaplot_yaxis", size.margin.left, 0 					 , yAxis);

		d3.selectAll(".pcaplot_xaxis, .pcaplot_yaxis").selectAll("path, line")
		.style({"fill" : "none", "stroke" : "#BFBFBF", "stroke-width" : "1", "shape-rendering" : "crispEdges", })

		svg.append("g")
		.attr("class" 	 , "pcaplot_2d_pc2label")
		.attr("transform", "translate(" + (size.margin.left / 2) + ", " + (size.rheight / 2) + ")")
		.append("text")
		.text("PC2")
		.attr("transform", "rotate(-90)");

		for(var i = 0, len = _data.data.sample_list.length ; i < len ; i++)	{
			var pca = _data.data.sample_list[i];

			interfaceFigure(_data, pca.PC1, pca.PC2, svg, _data.type(pca.TYPE).figure)
			.data([pca])
			.on({"mouseover" : _event.m_over, "mouseout" : _event.m_out})
			.style("stroke", function(_d) { 
				return _utils.mutate(pca.TYPE).color; 
			})
			.style("fill"  , function(_d) { 
				return _utils.mutate(pca.TYPE).color; 
			});
		}
	}

	return {
		view : view
	}
});