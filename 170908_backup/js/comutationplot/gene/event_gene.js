var GENE = "comutationplot/gene/";
var VO = "comutationplot/vo_comutationplot";

define(GENE + "event_gene", ["utils", "size", VO], function(_utils, _size, _VO)	{
	var tooltip = Object.create(_utils.tooltip);

	var axisMouseover = function(_d)	{
		d3.select(this)
		.transition().duration(100)
		.style("font-size", 14);
	}

	var axisMouseout = function(_d)	{
		d3.select(this).
		transition().duration(100)
		.style("font-size", 12);
	}

	var barMouseover = function(_d)	{
		tooltip.show(
			this, 
			"gene : " + _d.gene + "</br>count : " + _d.count, 
			"rgba(15, 15, 15, 0.6)");

		d3.select(this).
		transition().duration(100)
		.style("stroke", "black");
	}

	var barMouseout = function(_d)	{
		tooltip.hide();
		
		d3.select(this)
		.transition().duration(100)
		.style("stroke", "#BFBFBF");
	}

	var ascending = function(_a, _b)	{
		return (_utils.getSumList(_a.list, "count") > _utils.getSumList(_b.list, "count")) ? 1 : -1;
	}

	var descending = function(_a, _b)	{
		return (_utils.getSumList(_a.list, "count") < _utils.getSumList(_b.list, "count")) ? 1 : -1;
	}

	var sortingByName = function(_sorting_data)	{
		var result = [];

		for(var i = 0, len = _sorting_data.length ; i < len ; i++)	{
			result.push(_sorting_data[i].name);
		}
		return result;
	}

	var redraw = function(_sorting_data, _size)	{
		var vo = _VO.VO;
		console.log(vo.getWidth())
		var y = _utils.ordinalScale(vo.getGene(), _size.margin.top, (_size.height - _size.margin.top));
		var x = _utils.ordinalScale(vo.getSample(),vo.getMarginLeft(), (vo.getWidth() - vo.getMarginLeft()));

		d3.selectAll(".comutationplot_gene_yaxis")
		.transition().duration(400)
		.call(d3.svg.axis().scale(y).orient("right"));

		d3.selectAll(".comutationplot_gene_bars")
		.transition().duration(400)
		.attr("y", function(_d) { 
			return y(_d.gene); 
		});

		d3.selectAll(".comutationplot_cellgroup")
		.transition().duration(400)
		.attr("transform", function(_d)	{
			if(!x(_d.sample))	{
				return "translate(" + _d.x(_d.sample) + ", " + y(_d.gene) +")";	
			}
			return "translate(" + x(_d.sample) + ", " + y(_d.gene) +")";	
		});

		d3.selectAll(".comutationplot_pq_bars")
		.transition().duration(400)
		.attr("y", function(_d) { 
			return y(_d.name); 
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
		_VO.VO.setGene(sortingByName(sort_data));
		redraw(sortingByName(sort_data), _d.size);
	}
	return {
		axis_m_over : axisMouseover,
		axis_m_out : axisMouseout,
		bar_m_over : barMouseover,
		bar_m_out : barMouseout,
		sort_by_value : sortByValue
	}
});