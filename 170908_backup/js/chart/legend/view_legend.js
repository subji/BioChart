"use strict";
define("chart/legend/view_legend", ["utils", "size", "chart/legend/event_legend"], function(_utils, _size, _event)    {
	var setFigureData = function()	{
		this.set = {
			data : arguments[0],
			name : arguments[1],
		}
	}
	setFigureData.prototype.rect = function()	{
		this.set.x = arguments[0];
		this.set.y = arguments[1];
		this.set.width = arguments[2];
		this.set.height = arguments[3];
		return this;
	}
	setFigureData.prototype.circle = function()	{
		this.set.cx = arguments[0];
		this.set.cy = arguments[1];
		this.set.radius = arguments[2];
		return this;
	}
	setFigureData.prototype.style = function()	{
		this.set[arguments[0]] = arguments[1];
		return this;
	}

	var setFigure = function(_data, _g)	{
		for(var i = 0, len = _data.data.type_list.length ; i < len ; i++)	{
			var type = _data.data.type_list[i];
			var name = _utils.mutate(type.name).name;
			var data_set = new setFigureData(_data, name);
			var arranged = _data.arranged(name, "figure", _data.size_set, _data.size);
			var info = null;

			switch(_data.chart)	{
				case "comutation" : 
				if(type.alteration === "CNV")	{
					info = { id : "cnv", data : data_set.rect(0, 0, 4.5, 12).style("fill", _utils.mutate(name).color).set, type : "rect" };
				}
				else if(type.alteration === "mRNA Expression (log2FC)")	{
					info = { id : "exp", data : data_set.rect(0, 0, 4.5, 12).style("stroke", _utils.mutate(name).color).set, type : "rect" };
				}
				else {
					info = { id : "somatic", data : data_set.rect(0, 3, 4.5, 5).style("fill", _utils.mutate(name).color).set, type : "rect" }
				}; break;
				case "pcaplot" : 
				if(type.name === "Primary Solid Tumor")	{
					info = { id : "pcaplot", data : data_set.circle(5, 6.5, 5).style("fill", _utils.mutate(type.name).color).set, type : "circle"};
				}
				else if(type.name === "Solid Tissue Normal")	{
					info = { id : "pcaplot", data : data_set.rect(0, 1, 10, 10).style("fill", _utils.mutate(type.name).color).set, type : "rect"};
				}; break;
				case "needleplot" : 
				info = { id : "needleplot", data : data_set.circle(0, 6, 3).style("fill", _utils.mutate(name).color).set, type : "circle"}; break;
			}
			info.type === "circle" ? figureCircle(_g, info.id, info.data, arranged) : figureRect(_g, info.id, info.data, arranged);
		}
	}

	var figureCircle = function(_element, _id, _data, _arranged)	{
		return _element.append("circle")
		.attr({"class" : "legend_figure_" + _id, "cx" : _arranged.x + _data.cx, "cy" : _arranged.y + _data.cy, "r" : _data.radius})
		.style({"fill" : _data.fill || "none", "stroke" : _data.stroke || "none"});
	}

	var figureRect = function(_element, _id, _data, _arranged)	{
		return _element.append("rect")
		.attr({"class" : "legend_figure_" + _id, "x" : _arranged.x + _data.x, "y" : _arranged.y + _data.y, "width" : _data.width, "height" : _data.height})
		.style({"fill" : _data.fill || "none", "stroke" : _data.stroke || "none"});
	}

	var view = function(_data)  {
		var size = _data.size;
		var svg = _size.mkSvg("#" + _data.id, size.width, size.height);

		var legendGroup = svg.selectAll(".legendGroup")
		.data(_data.data.type_list)
		.enter().append("g")
		.attr("class", "legendGroup")
		.attr("transform", "translate(" + size.margin.left + ", " + size.margin.top + ")");

		var text = legendGroup.append("text")
		.attr("class", "legend_text")
		.attr("x", function(_d) { 
			return _data.arranged(_d.name, "text", _data.size_set, size).x; 
		})
		.attr("y", function(_d) { 
			return _data.arranged(_d.name, "text", _data.size_set, size).y; 
		})
		.on({"mouseover" : _event.mouseover, "mouseout" : _event.mouseout})
		.text(function(_d) { 
			return _d.name; 
		})
		.style("font-size", "11px");
		setFigure(_data, legendGroup);
	}
	
	return {
		view : view
	}
});