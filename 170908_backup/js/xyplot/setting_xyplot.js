"use strict";
define("xyplot/setting_xyplot", ["utils", "size", "xyplot/view_xyplot"], function(_utils, _size, _view)	{
	var getMinMax = function(_type, _axis, _data)	{
		return d3[_type](_data.map(function(_d)	{
			return _d[_axis];
		})) + (_type === "max" ? 1 : -1);
	}

	return function(_data)	{
		var size = _size.initSize("xyplot_view", 20, 20, 20, 20);
		var xmax = getMinMax("max", "x", _data.data.plot_list);
		var xmin = getMinMax("min", "x", _data.data.plot_list);
		var ymax = getMinMax("max", "y", _data.data.plot_list);
		var ymin = getMinMax("min", "y", _data.data.plot_list);
		var x = _utils.linearScale(xmin, xmax, (size.margin.left + size.margin.right), size.rwidth).clamp(true);
		var y = _utils.linearScale(ymin, ymax, size.rheight, size.margin.top).clamp(true);

		_utils.removeSvg("xyplot_view");

		_view.view({
			data : _data,
			size : size,
			max : { x : xmax, y : ymax },
			min : { x : xmin, y : ymin },
			radius : 3,
			x : x,
			y : y
		});
	}
});