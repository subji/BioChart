"use strict";
define("maplot/setting_maplot", ["utils", "size", "maplot/view_maplot"], function(_utils, _size, _view)	{
	var getMinMax = function(_type, _data, _axis_way)	{
		return d3[_type](_data.data.plot_list.map(function(_d)	{
			return _d[_axis_way];
		}));
	}

	var setDotsColor = function(_d, _cut_off)	{
		return _d.color = (_d.value < _cut_off) ? "red" : "#333333";
	}

	return function(_data)	{
		var size  = _size.initSize("maplot_view", 20, 20, 20, 20);
		var x_buf = 1;
		var y_buf = 1;

		_utils.removeSvg("maplot_view");
		$("#maplot_result_view").show();

		var x = _utils.linearScale(getMinMax("min", _data, "x") - x_buf, getMinMax("max", _data, "x") + x_buf,
			(size.margin.left + size.margin.right), size.rwidth);
		var y = _utils.linearScale(getMinMax("max", _data, "y") + y_buf, getMinMax("min", _data, "y") - y_buf,
			size.margin.top, size.rheight);
		
		_view.view({
			data  	: _data 								 ,
			cut_off : _data.data.cutoff_value,
			size  	: size 									 ,
			x  			: x 										 ,
			y  			: y 										 ,
			color   : setDotsColor
		})
	}
})