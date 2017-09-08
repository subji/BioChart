var SAMPLE = "comutationplot/sample/";

define(SAMPLE + "setting_sample", ["utils", "size", SAMPLE + "view_sample"], function(_utils, _size, _view)	{
	var count_by_order = function(_all_data, _importance)	{
		var all_data = _all_data || [];
		var sample_list = [];

		for(var i = 0, len = all_data.length ; i < len ; i++)	{
			var check = _utils.getObject(all_data[i].sample, sample_list, "name");
			if(!check)	{
				sample_list.push({
					name : all_data[i].sample,
					sample_group : all_data[i].sample_group,
					list : [all_data[i]]
				});
			}
			else {
				check.list.push(all_data[i]);
			}
		}
		return stacked(counting(sample_list), _importance);
	}

	var counting = function(_list)	{
		var list = _list || [];

		for(var i = 0, len = list.length ; i < len ; i++)	{
			list[i].list = count_mutation(list[i].list);
		}
		return list;
	}

	var count_mutation = function(_mutation)    {
		var mutation = _mutation || [];
		var result = [];

		for(var i = 0, len = mutation.length ; i < len ; i++)   {
			for(var j = 0, lens = mutation[i].type.length ; j < lens ; j++) {
				var check = _utils.getObject(mutation[i].type[j], result, "type");
				if(!check) {
					result.push({
						sample : [mutation[i].sample],
						type : mutation[i].type[j],
						count : 1,
					});
				}
				else {
					if($.inArray(mutation[i].sample, check.sample) < 0)    {
						check.sample.push(mutation[i].sample);
					}
					check.count += 1;
				}
			}
		}   
		return result;
	}

	var stacked = function(_data, _importance)  {
		var data = _data || [];

		data.map(function(_d)   {
			_d = sort_by_mutation(_d, _importance);
			$.each(_d.list, function(_i)    {
				if(_i === 0)    {
					_d.list[_i].start = 0;
				}
				else {
					_d.list[_i].start = _d.list[_i - 1].count + _d.list[_i - 1].start;
				}
			});
		});
		return data;
	}

	var sort_by_list = function(_list, _importance)	{
		_list.sort(function(_a, _b)	{
			return (_importance.indexOf(_a.type) < _importance.indexOf(_b.type)) ? 1 : -1
		});
	}

	var sort_by_mutation = function(_d, _importance)	{
		sort_by_list(_d.list, _importance);
		return _d;
	}

	var get_max = function(_data)	{
		var data = _data || [];

		return d3.max(data.map(function(_d) {
			var result = 0;
			for(var i = 0, len = _d.list.length ; i < len ; i++)	{
				result += _d.list[i].count;
			}
			return result;
		}));
	}

	return function(_all_data, _samples, _importance)	{
		var count_sample = count_by_order(_all_data, _importance);
		var size = _size.initSize("comutationplot_sample", 30, 10, 20, 20);
		var max = get_max(count_sample);

		_utils.removeSvg("comutationplot_sample");

		var x = _utils.ordinalScale(_samples, size.margin.left, (size.width - size.margin.left));
		var y = _utils.linearScale(0, max, (size.height - size.margin.bottom), size.margin.top);

		_view.view({
			data : count_sample,
			size : size,
			max : max,
			x : x, 
			y : y
		});
	}
});