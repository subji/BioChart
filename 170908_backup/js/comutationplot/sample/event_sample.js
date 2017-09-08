var SAMPLE = "comutationplot/sample/";
var VO = "comutationplot/vo_comutationplot";

define(SAMPLE + "event_sample", ["utils", "size", VO], function(_utils, _size, _VO)	{
	var tooltip = Object.create(_utils.tooltip);

	var mouseover = function(_d)	{
		tooltip.show(
			this,
			"sample : " + _d.sample + "</br>" + _d.type + " : " + _d.count,
			"rgba(15, 15, 15, 0.6)"
		);
	}

	var mouseout = function(_d)	{
		tooltip.hide();
	}

	var ascending = function(_a, _b)	{
		return (_utils.getSumList(_a.list, "count") > _utils.getSumList(_b.list, "count")) ? 1 : -1;
	}

	var descending = function(_a, _b)	{
		return (_utils.getSumList(_a.list, "count") < _utils.getSumList(_b.list, "count")) ? 1 : -1;
	}

	var sortingName = function(_sorting_data)	{
		var result = [];

		for(var i = 0, len = _sorting_data.length ; i < len ; i++)	{
			result.push(_sorting_data[i].name);
		}
		return result;
	}

	var redraw = function(_sorting_data, _size)	{
		var x = _utils.ordinalScale(_VO.VO.getSample(), _VO.VO.getMarginLeft(), (_VO.VO.getWidth() - _VO.VO.getMarginLeft()));
		var y = _utils.ordinalScale(_VO.VO.getGene(), _VO.VO.getMarginTop(), (_VO.VO.getHeight() - _VO.VO.getMarginTop()));

		d3.selectAll(".comutationplot_sample_bars")
		.transition().duration(400)
		.attr("x", function(_d) {
			return x(_d.sample);
		})
		.attr("width", function(_d) {
			return x.rangeBand();
		});

		d3.selectAll(".comutationplot_cellgroup")
		.transition().duration(400)
		.attr("transform", function(_d)	{
			if(!y(_d.gene))	{
				return "translate(" + x(_d.sample) + ", " + _d.y(_d.gene) +")";
			}
			return "translate(" + x(_d.sample) + ", " + y(_d.gene) +")";
		});

		d3.selectAll(".comutationplot_cells")
		.transition().duration(400)
		.attr("x", 0)
		.attr("width", function(_d) {
			return x.rangeBand();
		});
	}

	var sortByValue = function(_d)	{
		var sort_data;

		if(_d.status)	{
			sort_data =_d.data.sort(ascending);
			_d.status = false;
		}
		else{
			sort_data =_d.data.sort(descending);
			_d.status = true;
		}
		_VO.VO.setSample(sortingName(sort_data));
		redraw(sortingName(sort_data), _d.size);
	}

	return {
		m_over : mouseover,
		m_out : mouseout,
		sort_by_value : sortByValue
	}
});