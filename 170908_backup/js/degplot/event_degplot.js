"use strict";
define("degplot/event_degplot", ["utils", "size"], function(_utils, _size)	{
	var tooltip = Object.create(_utils.tooltip);
	
	var rowspan = function(_rows)	{
		var cell = "", cells = [];

		for (var i = 0, len = _rows[0].cells.length ; i < len ; i++)	{
			for (var j = 0, leng = _rows.length ; j < leng ; j++)	{
				if(isNaN(Number(_rows[j].cells[i].innerHTML)))	{
					if(cell.innerHTML === _rows[j].cells[i].innerHTML)	{
						cell.rowSpan += 1;
						cells.push(_rows[j].cells[i]);
					}
					cell = (cell === "" || cell.innerHTML !== _rows[j].cells[i].innerHTML) ?
					_rows[j].cells[i] : cell;
				}
			}
		}
		deleteCells(cells);
	}

	var deleteCells = function(_cell_list)	{
		for(var i = 0, len = _cell_list.length ; i < len ; i++)	{
			_cell_list[i].remove();
		}
	}

	var changeBackgroundColor = function(_target, _min, _value, _bgcolor, _rgb)	{
		var targets = document.querySelectorAll("td");
		var rgb  		= _rgb || _utils.mutate(_target).color;

		for(var i = 0, len = targets.length ; i < len ; i++)	{
			if(targets[i].style.backgroundColor && d3.select(targets[i]).datum().id === _target)	{
				d3.select(targets[i]).transition().duration(500)
				.style("background-color", _bgcolor(rgb, d3.select(targets[i]).datum().data, _min, _value));
			}
		}
	}

	var changeGradient = function(_color, _si)	{
		d3.select("#gradient_end_" + _si)
		.transition().duration(500)
		.attr("stop-color", _color);
	}

	var changeBrightness = function(_target, _min, _max, _value)	{
		var x2 = (Math.round((100 * _value) / (_max - _min)) === 0) ?
		1 : Math.round((100 * _value) / (_max - _min));

		d3.select("#" + _target + "_gradient")
		.attr("x2", x2 + "%");
	}

	var relocateBar = function(_target, _d)	{
		var x    = d3.scale.linear()
		.domain([_d.margin / 2, _d.width - _d.margin])
		.range([_d.min, Math.round(_d.max)]);
		var re_x = d3.scale.linear()
		.domain([_d.min, Math.round(_d.max)])
		.range([_d.margin / 2, _d.width - _d.margin]);

		var start 		= Math.floor(x(Number(_target.attr("x"))));
		var end 			= Math.floor(x(Number(_target.attr("x")))) + 1;
		var sub_start = Math.abs(start - x(Number(_target.attr("x"))));
		var sub_end 	= Math.abs(end - x(Number(_target.attr("x"))));
		var x_final 	= (sub_start > sub_end) ? end : start;

		return { 
			value : x_final, 
			scale : re_x 
		};
	}

	var getGradientEnd = function(_id)	{
		return d3.select("#gradient_end_" + _id)
		.attr("stop-color");
	}

	var dragEnd = function(_d)	{
		var target = d3.select(this);
		var reloc  = relocateBar(target, _d);

		target.attr("x", reloc.scale(reloc.value));

		changeBrightness(_d.id, _d.min, Math.round(_d.max), reloc.value);
		changeBackgroundColor(_d.id, _d.min, reloc.value, _d.bgcolor, getGradientEnd(_d.id));

		tooltip.hide();
	}

	var dragLever = function(_d)	{
		var target = d3.select(this);
		var reloc = relocateBar(target, _d);

		tooltip.hide();

		target
		.attr("x", function()	{
			tooltip.show(this, reloc.value, "rgba(15, 15, 15, 0.6)");
			return Math.max((_d.margin / 2), 
				Math.min(_d.width - _d.margin, Number(target.attr("x")) + d3.event.dx));
		});
	}

	var drag_figure = d3.behavior.drag()
	.origin(Object)
	.on("drag", dragLever)
	.on("dragend", dragEnd);

	var cellMouseover = function(_d)	{
		tooltip.show(this, "name : " + _d.id + "</br> value : " + Number(_d.data).toFixed(5), "rgba(15, 15, 15, 0.6)");
	}

	var cellMouseout = function(_d)	{
		tooltip.hide();	
	}

	var selectColor = function(_value, _color, _title)	{
		var title = $(this).attr("class");
		var si = title.substring(title.indexOf("-") + 1, title.lastIndexOf("_"));
		var color = $(this).val();
		var lever = d3.selectAll(".degplot_lever_rect");

		changeGradient(color, si);

		lever[0].forEach(function(_data, _i)	{
			var rect = d3.select(_data).datum();

			changeBrightness(si, rect.min, rect.max, rect.max);

			lever
			.transition().duration(250)
			.attr("x", rect.width - rect.margin);

			if(rect.id === si)	{
				changeBackgroundColor(rect.id, rect.min, rect.max, rect.bgcolor, color);
			}		
		});
	}

	return {
		cell_over : cellMouseover,
		cell_out : cellMouseout,
		rowspan : rowspan,
		drag : drag_figure,
		select_color : selectColor
	}
});	