'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('scale', ['tooltip', 'mouseHandler', 'sortHandler'], factory);
	} else {
		factory(scale);
	}
} (function (tooltip, mouseHandler, sortHandler)	{
	var selectElements = function (id, evt)	{
		return d3.select('#' + id).on(evt);
	}

	var getInput = function ()	{
		var val = $('#inputScale').val();

		return +val.replace((/\D/), '');
	}

	var changeInput = function (sign, value)	{
		$('#inputScale').val(getInput() + ((value || 10) * sign) + '%');
	}

	var toInit = function (data)	{
		var val = getInput();

		// val === 100 ? changeInput(0) : changeInput(-1, (val - 100));
		changeInput(-1, (val - 100));

		data.permuted_gene_name = null;
		data.sample_width = data.init_width;

		mouseHandler.vertical(data.gene_name						, data.init_height);
		mouseHandler.horizontal(data.participant_id_name, data.init_width);
		mouseHandler.horizontal(
      sortHandler.exclusive(data.participant_id_name, data).concat([])
    , data);
	}

	var reScale = function (data)	{
		var val 	= getInput();
		var outer = $('#outerComutation').width();
		var width = data.init_width + (data.init_width * ((val - 100) / 100));
		var d 		= data.participant_id_now
							? data.participant_id_now
							: data.participant_id_name;
		// Scale 설정 변경.
		width = outer > width ? outer : width;

		data.sample_width = width;
				
		$('#comutation').width(width);

		$('#sample svg, #group svg, #comutation svg').width(width);

		mouseHandler.horizontal(d, data);
	}

	var mClick = function (d)	{
		if ((/init/).test(this.id))	{
			toInit(d);
		} else {
			var val 	= getInput();
			var sign 	= (/down/).test(this.id) ? -1 : 1;
			var outer = $('#outerComutation').width();
			var width = d.init_width + (d.init_width * ((val - 100) / 100));

			width = outer > width ? outer : width;

			// new scale configuration.
			if (outer > width)	{
				return;
			} else if (outer === width) {
				if (sign > 0)	{
					return changeInput(sign), reScale(d); 					
				} else {
					return;
				}	
			}
			// if ((val / 100) * sign + val <= 100)	{
			// 	return;
			// }

			changeInput(sign);

			reScale(d);
		}
	}

	var mOver = function (d)	{
		var str = (/init/).test(this.id) ? '<b>Initialize</b>'
						: (/down/).test(this.id) ? '<b>Scale down</b>'
						: '<b>Scale up</b>';

		tooltip.show(this, str, 'rgba(178, 0, 0, 0.6)');
	}

	var mOut = function (d)	{
		tooltip.hide();
	}

	return function (data)	{
		var evt 		= { 'click' : mClick, 'mouseover' : mOver, 'mouseout' : mOut };
		var upArr 	= selectElements('upArrow'	, evt).data([data]);
		var downArr = selectElements('downArrow', evt).data([data]);
		var initBtn = selectElements('initScale', evt).data([data]);
	}
}));