var GENE = "comutationplot/gene/";

define( GENE + "setting_gene", ["utils", "size", (GENE + "view_gene")], function(_utils, _size, _view)	{
	var countByOrder = function(_all_data, _importance)	{
		var all_data = _all_data || [];
		var gene_list = [];

		for(var i = 0, len = all_data.length ; i < len ; i++)	{
			var check = _utils.getObject(all_data[i].gene, gene_list, "name");
			if(!check)	{
				gene_list.push({
					name : all_data[i].gene,
					gene_group : all_data[i].gene_group,
					list : [all_data[i]]
				});
			}
			else {
				check.list.push(all_data[i]);
			}
		}
		return stacked(counting(gene_list), _importance);
	}

	var counting = function(_list)	{
		var list = _list || [];

		for(var i = 0, len = list.length ; i < len ; i++)	{
			list[i].list = countMutation(list[i].list);
		}
		return list;
	}

	var countMutation = function(_mutation)    {
		var mutation = _mutation || [];
		var result = [];

		for(var i = 0, len = mutation.length ; i < len ; i++)   {
			for(var j = 0, lens = mutation[i].type.length ; j < lens ; j++) {
				var check = _utils.getObject(mutation[i].type[j], result, "type");
				if(!check) {
					result.push({
						gene : [mutation[i].gene],
						type : mutation[i].type[j],
						count : 1,
					});
				}
				else {
					if($.inArray(mutation[i].gene, check.gene) < 0)    {
						check.gene.push(mutation[i].gene);
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
			_d = sortByMutation(_d, _importance);
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

	var getMax = function(_data)	{
		var data = _data || [];

		return d3.max(data.map(function(_d) {
			var result = 0;
			for(var i = 0, len = _d.list.length ; i < len ; i++)	{
				result += _d.list[i].count;
			}
			return result;
		}));
	}

	var sortByList = function(_list, _importance)	{
		_list.sort(function(_a, _b)	{
			return (_importance.indexOf(_a.type) < _importance.indexOf(_b.type)) ? 1 : -1
		});
	}

	var sortByMutation = function(_d, _importance)	{
		sortByList(_d.list, _importance);
		return _d;
	}

	return function(_all_data, _genes, _importance)	{
		var count_gene = countByOrder(_all_data, _importance);
		var size = _size.initSize("comutationplot_gene", 20, 20, 20, 70);
		var max = getMax(count_gene);

		_utils.removeSvg("comutationplot_gene");

		_view.view({
			data : count_gene,
			size : size,
			max : max,
			x : _utils.linearScale(0, max, (size.width - size.margin.right), size.margin.left), 
			y : _utils.ordinalScale(_genes, size.margin.top, (size.height - size.margin.top))
		});
	}
});