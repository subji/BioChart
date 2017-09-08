var size = (function (size)	{
	'use strict';

	var model = { ids: [] }

	size.chart = {};
	/*
		Tooltip Tag 를 만드는 함수.
	 */
	function makeTooltip ()	{
		var div = document.createElement('div');

		div.id = 'biochart_tooltip';
		div.className = 'biochart-tooltip';

		document.body.appendChild(div);
	};
	/*
		Chart frame in div.
	 */
	function makeFrames (ids)	{
		util.loop.call(this, ids, function (k, v)	{
			var e = document.createElement('div');

			e.id = k;
			e.style.width = v.w + 'px';
			e.style.height = v.h + 'px';

			model.ids.push(k);

			this.appendChild(e);
		});

		makeTooltip();
	};
	/*
		각 chart 별 최소, 최대 사이즈를 선정해야 한다.
	 */
	size.rightToSize = function (chart, width, height)	{
		var w = 0, 
				h = 0;

		width = parseFloat(width);
		height = parseFloat(height);

		if (chart === 'variants')	{
			w = width < 900 ? 900 : width > 1100 ? 1100 : width;
			h = height < 300 ? 300 : height > 500 ? 500 : height;
		} else if (chart === 'landscape')	{
			w = width < 1100 ? 1100 : width > 1620 ? 1620 : width;
			h = height < 500 ? 500 : height > 750 ? 750 : height;
		}

		return { width: w, height: h };
	};
	/*
		About parameters then produces margin set.
	 */
	size.setMargin = function (margin)	{
		if (!margin.length)	{
			return { top: margin, left: margin, bottom: margin, right: margin };
		} else if (Object.prototype.toString.call(margin) === '[object Object]')	{
			return margin;
		} else {
			switch(margin.length)	{
				case 1: return { top: margin[0], left: margin[0], bottom: margin[0], right: margin[0] }; break;
				case 2: return { top: margin[0], left: margin[1], bottom: margin[0], right: margin[1] }; break;
				case 3: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[1] }; break;
				case 4: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
				default: return { top: margin[0], left: margin[1], bottom: margin[2], right: margin[3] }; break;
			}
		}
	};
	/*
		Targeted element set width and height.
	 */
	size.setSize = function (e, w, h)	{
		model = { ids: [] };

		e.style.width = w + 'px';
		e.style.height = h + 'px';

		return e;
	};
	/*
		Setting size of exclusivity.
	 */
	size.chart.exclusivity = function (e, w, h)	{
		var ids =  {
			exclusivity_select_geneset: {w: w * 0.25, h: h * 0.1},
			exclusivity_upper_empty: {w: w * 0.34, h: h * 0.2},
			exclusivity_survival: {w: w * 0.4, h: h},
			exclusivity_network: {w: w * 0.25, h: h * 0.55},
			exclusivity_heatmap: {w: w * 0.35, h: h * 0.3},
			exclusivity_legend: {w: w * 0.35, h: h * 0.05},
			exclusivity_sample_legend: {w: w * 0.35, h: h * 0.05},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};
	/*
		Setting size of Landscape.
	 */
	size.chart.landscape = function (e, w, h)	{
		var ids = {
			landscape_title: {w: w, h: h * 0.05},
			landscape_legend: {w: w * 0.1, h: h * 0.95},
			landscape_axis_sample: {w: w * 0.14, h: h * 0.15},
			landscape_patient_sample: {w: w * 0.01, h: h * 0.15},
			landscape_sample: {w: w * 0.65, h: h * 0.15},
			landscape_scale_option: {w: w * 0.1, h: h * 0.15},
			landscape_axis_group: {w: w * 0.14, h: h * 0.2},
			landscape_patient_group: {w: w * 0.01, h: h * 0.2},
			landscape_group: {w: w * 0.65, h: h * 0.2},
			landscape_option: {w: w * 0.1, h: h * 0.2},
			landscape_gene: {w: w * 0.14, h: h * 0.6},
			landscape_patient_heatmap: {w: w * 0.01, h: h * 0.6},
			landscape_heatmap: {w: w * 0.65, h: h * 0.6},
			landscape_pq: {w: w * 0.1, h: h * 0.6},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};
	/*
		Setting size of Variants.
	 */
	size.chart.variants = function (e, w, h)	{
		var ids = {
			variants_title: {w: w, h: h * 0.075},
			variants_needle: {w: w * 0.85, h: h * 0.825},
			variants_legend: {w: w * 0.15, h: h * 0.5},
			variants_patient_legend: {w: w * 0.15, h: h * 0.425},
			variants_navi: {w: w * 0.85, h: h * 0.1},
			// variants_empty: {w: w * 0.15, h: h * 0.1},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};
	/*
		Setting size of Expression.
	 */
	size.chart.expression = function (e, w, h)	{
		var ids = {
			expression_title: {w: w, h: h * 0.05},
			expression_survival: {w: w * 0.4, h: h * 0.95},
			expression_bar_plot: {w: w * 0.4, h: h * 0.4},
			expression_function: {w: w * 0.2, h: h * 0.05},
			expression_color_mapping: {w: w * 0.2, h: h * 0.05},
			expression_bar_legend: {w: w * 0.2, h: h * 0.3},
			expression_scatter_plot: {w: w * 0.4, h: h * 0.3},
			expression_scatter_empty: {w: w * 0.2, h: h * 0.2},
			expression_scatter_legend: {w: w * 0.2, h: h * 0.1},
			expression_heatmap: {w: w * 0.4, h: h * 0.24},
			expression_signature: {w: w * 0.2, h: h * 0.05},
			expression_color_gradient: {w: w * 0.2, h: h * 0.25},
		};

		return makeFrames.call(size.setSize(e, w, h), ids), model.ids;
	};	

	return size;
}(size || {}));