var COMUTS_NAVI = "comutationplot/navigation/";
var VO = "comutationplot/vo_comutationplot";

define(COMUTS_NAVI + "event_comutationnavigation", ["utils", "size", VO], function(_utils, _size, _VO)	{
	return 	function(_data) {
		var data = _data || {};

		var scroll_status = function()	{
			var scroll = $("#comutationplot_heatmap");

			if(get_input_value() === 100)	{ 
				scroll.css("overflow", "hidden"); 
			}
			else { 
				scroll.css("overflow-x", "scroll"); 
			}
		}

		var get_click = function()	{
			var target = $(this)[0];
			var type = target.id.substring(target.id.lastIndexOf("_") + 1, target.id.length);
			var sign = (type === "up") ? 1 : -1;

			if(((get_input_value() / 100) * sign) + get_input_value() <= 100)	{
				return;
			}
			change_input_value(sign);
			scroll_status();
			scale_sample();
			scale_comutation();
		}

		var get_input_value = function()    {
			var input = $("#comutationplot_scale_input");

			return Number(input.val().substring(0, input.val().length - 1));
		}

		var change_input_value = function(_sign, _value)   {
			var input = $("#comutationplot_scale_input");
			var value = _value || 10;

			input.val(Number(get_input_value() + (value * _sign)) + "%");
		}

		var calculate_value = function()	{
			return (get_input_value() - 100) / 100;
		}

		var scale_sample = function()	{
			var sample = d3.select(".comutationplot_sample");
			var rects = d3.selectAll(".comutationplot_sample_bars");
			var old = $("#comutationplot_sample").width();
			var now = old + (old * calculate_value());
			var x = _utils.ordinalScale(_VO.VO.getSample(), data.size.margin.left, now - data.size.margin.left);

			if(old > now)	{ 
				return;
			}

			redraw_sample(now, x);
		}

		var redraw_sample = function(_value, _x)	{
			var sample = d3.select(".comutationplot_sample");
			var rects = d3.selectAll(".comutationplot_sample_bars");

			sample
			.transition().duration(400).attr("width", _value);

			rects
			.transition().duration(400)
			.attr("x", function(_d) { 
				return _x(_d.sample); 
			})
			.attr("width", function(_d ) {
				return _x.rangeBand(); 
			});
		}

		var redraw_comutation = function(_value, _x, _y)	{
			var comutation = d3.select(".comutationplot_heatmap");
			var groups = d3.selectAll(".comutationplot_cellgroup");
			var rects = d3.selectAll(".comutationplot_cells");
			var origin = $("#comutationplot_heatmap");

			comutation
			.transition().duration(400).attr("width", _value);

			groups
			.transition().duration(400)
			.attr("transform", function(_d)	{
				return "translate(" + _x(_d.sample) + ", " + _y(_d.gene) + ")";
			});

			rects
			.transition().duration(400).attr("x", 0)
			.attr("width", function(_d) { 
				return _x.rangeBand(); 
			});
		}

		var scale_comutation = function()	{
			var comutation = d3.select(".comutationplot_heatmap");
			var groups = d3.selectAll(".comutationplot_cellgroup");
			var rects = d3.selectAll(".comutationplot_cells");
			var origin = $("#comutationplot_heatmap");
			var old = origin.width();
			var now = old + (old * calculate_value());
			var x = _utils.ordinalScale(_VO.VO.getSample(), data.size.margin.left, now - data.size.margin.left);
			var y = _utils.ordinalScale(_VO.VO.getGene(), data.size.margin.top, (origin.height() - data.size.margin.top));

			if(old > now)	{ 
				return; 
			}
			
			_VO.VO.setWidth(now);
			redraw_comutation(now, x, y);
		}

		var timeout = function(_func, _sec)	{
			setTimeout(_func, _sec);
		}	

		var get_init = function(_d)	{
			var sample = d3.select(".comutationplot_sample");
			var sample_rects = d3.selectAll(".comutationplot_sample_bars");
			var comutation = d3.select(".comutationplot_heatmap");
			var comutation_groups = d3.selectAll(".comutationplot_cellgroup");
			var comutation_rects = d3.selectAll(".comutationplot_cells");
			var vo = _VO.VO;
			var y = _utils.ordinalScale(vo.getInitGene(), vo.getInitMarginTop(), (vo.getInitHeight() - vo.getInitMarginTop()));
			var x = _utils.ordinalScale(vo.getInitSample(),vo.getInitMarginLeft(), (vo.getInitWidth() - vo.getInitMarginLeft()));

			vo.setGene(vo.getInitGene());
			vo.setSample(vo.getInitSample());

			redraw_sample(vo.getInitWidth(), x);
			redraw_comutation(vo.getInitWidth(), x, y);
			
			if(get_input_value() === 100)	{
				change_input_value(-1, 0);
			}

			change_input_value(-1, (get_input_value() - 100));
			scroll_status();

			timeout(function() { 
				d3.selectAll(".comutationplot_sample_bars")
				.transition().duration(400)
				.attr("x", function(_d) { 
					return x(_d.sample); 
				}); 
			}, 300);
			
			timeout(function() { 
				d3.selectAll(".comutationplot_pq_bars")
				.transition().duration(400)
				.attr("y", function(_d) { 
					return y(_d.name); 
				}); 
			}, 400);

			timeout(function() { 
				d3.selectAll(".comutationplot_gene_yaxis")
				.transition().duration(400)
				.call(d3.svg.axis().scale(y).orient("right")); 
			}, 400);

			timeout(function() { 
				d3.selectAll(".comutationplot_gene_bars")
				.transition().duration(400)
				.attr("y", function(_d) { 
					return y(_d.gene); 
				}); 
			}, 400);

			timeout(function() { 
				d3.selectAll(".comutationplot_cellgroup")
				.transition().duration(400)
				.attr("transform", function(_d)	{
					if(!x(_d.sample))	{
						return "translate(" + _d.x(_d.sample) + ", " + _d.y(_d.gene) +")";	
					}
					return "translate(" + x(_d.sample) + ", " + y(_d.gene) +")";	
				}); 
			}, 500);
		}
		return {
			click : get_click,
			init : get_init
		}
	}
});