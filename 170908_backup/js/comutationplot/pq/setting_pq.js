var PQ = "comutationplot/pq/";

define(PQ + "setting_pq", ["utils", "size", PQ + "view_pq"], function(_utils, _size, _view)	{
	var get_pq = function(_symbol_list)	{
		var symbol_list = _symbol_list || [];
		var result = [];

		for(var i = 0, len = symbol_list.length ; i < len ; i++)	{
			result.push({
				name : symbol_list[i].name,
				list : [symbol_list[i]]
			});
		}
		return result;
	}

	var get_max = function(_data)	{
		var data = _data || [];

		return d3.max(data.map(function(_d)	{
			var result = 0;
			for(var i = 0, len = _d.list.length ; i < len ; i++)	{
				(_utils.calLog(_d.list[i].q) > result) ?
					result = _utils.calLog(_d.list[i].q) : result = result;
			}
			return result;
		}));
	}

	return function(_symbol_list, _genes)	{
		var pq_data = get_pq(_symbol_list);
		var max = get_max(pq_data);
		var size = _size.initSize("comutationplot_pq", 20, 20, 20, 70);

		_utils.removeSvg("comutationplot_pq");

		_view.view({
			data : pq_data,
			size : size,
			max : max,
			x : _utils.linearScale(0, max, size.margin.left, (size.width - size.margin.right)), 
			y : _utils.ordinalScale(_genes, size.margin.top, (size.height - size.margin.top))
		})
	}
});