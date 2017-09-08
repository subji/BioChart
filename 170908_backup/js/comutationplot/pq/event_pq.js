var PQ = "comutationplot/pq/";
var VO = "comutationplot/vo_comutationplot";


define(PQ + "event_pq", ["utils", "size", VO], function(_utils, _size, _VO)	{
	var tooltip = Object.create(_utils.tooltip);

	var mouseover = function(_d)	{
		tooltip.show(
			this, 
			"gene : " + _d.name + "</br>q : " + Number(_utils.calLog(_d.q)).toFixed(4), 
			"rgba(15, 15, 15, 0.6)"
		);

		d3.select(this)
		.transition().duration(100)
		.style("fill", d3.rgb("#BFBFBF").darker(1));
	}

	var mouseout = function(_d)	{
		tooltip.hide();
		
		d3.select(this)
		.transition().duration(100)
		.style("fill", "#BFBFBF");
	}

	var ascending = function(_a, _b)	{
		return (_utils.getSumList(_a.list, "q") > _utils.getSumList(_b.list, "q")) ? 1 : -1;
	}

	var descending = function(_a, _b)	{
		return (_utils.getSumList(_a.list, "q") < _utils.getSumList(_b.list, "q")) ? 1 : -1;
	}

	var sortingName = function(_sorting_data)	{
		try{
			var result = [];
			for(var i = 0, len = _sorting_data.length ; i < len ; i++)	{
				result.push(_sorting_data[i].name);
			}
			return result;
		}
		finally {
			result = null;
		}
	}

	var redraw = function(_sorting_data, _size)	{
		var vo = _VO.VO;
		var y = _utils.ordinalScale(vo.getGene(), _size.margin.top, (_size.height - _size.margin.top));
		var x = _utils.ordinalScale(vo.getSample(),vo.getMarginLeft(), (vo.getWidth() - vo.getMarginLeft()));

		d3.selectAll(".comutationplot_pq_bars")
		.transition().duration(400)
		.attr("y", function(_d) { 
			return y(_d.name); 
		});

		d3.selectAll(".comutationplot_cellgroup")
		.transition().duration(400)
		.attr("transform", function(_d)	{
			if(!x(_d.sample))	{
				return "translate(" + _d.x(_d.sample) + ", " + y(_d.gene) +")";	
			}
			return "translate(" + x(_d.sample) + ", " + y(_d.gene) +")";	
		});

		d3.selectAll(".comutationplot_gene_yaxis")
		.transition().duration(400)
		.call(d3.svg.axis().scale(y).orient("right"));

		d3.selectAll(".comutationplot_gene_bars")
		.transition().duration(400)
		.attr("y", function(_d) { 
			return y(_d.gene); 
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
		_VO.VO.setGene(sortingName(sort_data));
		redraw(sortingName(sort_data), _d.size);
	}
	return {
		m_over : mouseover,
		m_out : mouseout,
		sort_by_value : sortByValue
	}
});