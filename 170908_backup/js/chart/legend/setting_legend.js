"use strict";
define("chart/legend/setting_legend", ["utils", "size", "chart/legend/view_legend"], function(_utils, _size, _view)   {
	var arranged = function(_data, _type, _size_set, _size)	{
		var maximum_text = _utils.getObjectMax(_size_set, "width");
		var space = 30;
		var accumulated = space;
		var result = {};
		var y_index = (_type === "text") ? 1 : 0.1;

		for(var i = 0, len = _size_set.length ; i < len ; i++)	{
			if((accumulated + maximum_text) > _size.rwidth)	{
				accumulated = space;
				y_index += 2;
			}
			if(_data === _size_set[i].name)	{
				result.x = (_type === "text") ? accumulated : accumulated - _size.rect_size;
				result.y = (_size_set[i].height * y_index);
			}
			accumulated += maximum_text + space;
		}
		return result;
	}

	var listTextLength = function(_data)	{
		var size_set = [];

		for(var i = 0, len = _data.type_list.length ; i < len ; i++)	{
			var item = _data.type_list[i].name;

			size_set[i] = _utils.getTextSize(item, "11");
		}
		return size_set;
	}

	var alignByPrecedence = function(_type_list)	{
		var result = [];

		for(var i = 0, len = _type_list.length ; i < len ; i++)	{
			var type = _type_list[i];
			var alteration = _utils.alterationPrecedence(type);

			alteration.name = type;
			result.push(alteration);
			result.sort(alignByAlteration);
		}
		return result;
	}

	var alignByAlteration = function(_a, _b)	{
		return _a.priority.order > _b.priority.order ? -1 : 1;
	}

	return function(_opt)	{
		var size = _size.initSize(_opt.view_id, 10, 0, 0, 0, { "rect_size" : 15 });

		switch(_opt.type)	{
			case "generic mutation" : _opt.data.type_list = alignByPrecedence(_opt.data.type_list); break;
			case "pca mutation" : _opt.data.type_list = _opt.data.type_list; break;
		}

		_view.view({
			data : _opt.data,
			type : _opt.type,
			chart : _opt.chart,
			id : _opt.view_id,
			size : size,
			size_set : listTextLength(_opt.data),
			arranged : arranged
		});
	}
});