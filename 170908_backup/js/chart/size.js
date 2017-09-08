"use strict";
define("size", [], function()   {
	var makeDivision = function(_order)    {
		var div = document.createElement("div");

		if(!_order)	{
			return div;
		}

		Object.keys(_order).map(function(_d)  {
			if(_d === "attribute")  { 
				setAttr(div, _order[_d]); 
			}
			else if(_d === "style") { 
				setCss(div, _order[_d]); 
			}
		});
		return div;
	}

	var setAttr = function(_div, _order)    {
		Object.keys(_order).map(function(_d) {
			_div.setAttribute(_d, _order[_d]);
		});
	}

	var setCss = function(_div, _order)   {
		Object.keys(_order).map(function(_d) {
			_div.style[_d] = _order[_d];
		});
	}

	var initSize = function()  {
		if(arguments.length < 1 || arguments.length < 5)    {
			return undefined;
		}

		var target = $("#" + arguments[0]);
		var result = {
			"width" : target.width(),
			"height" : target.height(),
			"rwidth" : target.width() - arguments[3] - arguments[4],
			"rheight" : target.height() - arguments[1] - arguments[2],
			"margin" : {
				"top" : arguments[1],
				"bottom" : arguments[2],
				"left" : arguments[3],
				"right" : arguments[4],
			}
		};

		for(var key in arguments[5])	{
			result[key] = arguments[5][key];
		}
		return result;
	}

	var makeSvg = function(_target, _width, _height, _is_g)	{
		var svg = d3.select(_target).append("svg")
		.attr({"class" : _target.substring(1, _target.length), "width" : _width, "height" : _height});

		return !_is_g ? svg : svg.append("g").attr("transform", "translate(0, 0)");
	}

	var makeAxis = function(_svg, _class, _posx, _posy, _func)	{
		return _svg.append("g")
		.attr({"class" : _class, "transform" : "translate(" + _posx + ", " + _posy + ")"})
		.call(_func);
	}

	var styleStroke = function(_obj, _color, _width, _ani)	{
		_obj = _ani ? _obj.transition().duration(_ani) : _obj;
		_obj.style({"stroke" : _color || "none", "stroke-width" : _width || 0});
	}

	var setAxis = function(_scale, _orient, _ticks)	{
		var axis = d3.svg.axis()
		.scale(_scale).orient(_orient);

		if(arguments[2])	{
			for(var i = 0, len = Object.keys(arguments[2]).length ; i < len ; i++)	{
				var key = Object.keys(arguments[2])[i];
				var value = arguments[2][key];

				axis[key](value);
			}
		}
		return axis;
	}

	return {
		initSize : initSize,
		mkdiv : makeDivision,
		mkSvg : makeSvg,
		mkAxis : makeAxis,
		styleStroke : styleStroke,
		setAxis : setAxis,
	};
});