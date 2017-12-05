function sizing ()	{
	'use strict';

	var model = { chart: {}, ids: [] };
	/*
		Tooltip Tag 를 만드는 함수.
	 */
	function makeTooltipNode ()	{
		if (document.getElementById('biochart_tooltip'))	{		
			document.body.removeChild(
			document.getElementById('biochart_tooltip'));
		}
		
		var div = document.createElement('div');

		div.id = 'biochart_tooltip';
		div.className = 'biochart-tooltip';

		document.body.appendChild(div);
	};
	/*
		Chart 별 알맞는 layout 을 구성해주는 함수.
	 */
	function makeLayout (ids)	{
		// 초기 화면 구성 시 Tooltip 도 추가해준다.
		makeTooltipNode();

		bio.iteration.loop.call(this, ids, function (id, size) {
			var div = document.createElement('div');
					div.id = id;
					div.style.width = size.width + 'px';
					div.style.height = size.height + 'px';
			// 각 layout 에 구성된 div 태그들의 id 값들을 리스트에 넣어준다.
			model.ids.push(id);	

			this.appendChild(div);
		});
	};
	/*
		Sizing 객체의 model 객체를 초기화하고 (나중에 ajax 재 요청시,
		svg 가 사라지지 않는 문제를 해결하기 위해) 
		전체 element 의 가로, 세로 크기를 설정한다.
	 */
	function setSize (ele, width, height)	{
		model = bio.initialize('sizing');

		ele.style.width = width + 'px';
		ele.style.height = height + 'px';

		return ele;
	};
	/*
		배열로 전달 받은 margin 값을 객체 형태의 margin
		값으로 변환하여 반환해주는 함수.
	 */
	model.setMargin = function (margin)	{
		if (!margin.length && 
				typeof(margin) === 'string')	{
			return { 
				top: margin, left: margin, 
				bottom: margin, right: margin 
			};
		} else if (bio.objects.getType(margin) === 
							'Object')	{
			return margin;
		} else {
			var len = margin.length;
			// Margin 리스트의 개수에 따라 알맞은 객체를 생성한다.
			return {
				top: margin[0],
				left: len > 1 ? margin[1] : margin[0],
				bottom: len > 2 ? margin[2] : margin[0],
				right: len === 1 ? margin[0] : 
							 len > 3 ? margin[3] : margin[1],
			};
		}
	};
	/*
		Title 과 Contents 부분으로 나눈다.
	 */
	function makeDivide (type, ele, w, h, tr)	{
		var title = document.createElement('div'),
				contents = document.createElement('div');

		title.id = type + '_title';
		contents.id = type + '_contents';

		title.style.width = w + 'px';
		title.style.height = h * tr + 'px';

		contents.style.width = w + 'px';
		contents.style.height = h * (100 - tr) + 'px';

		ele.appendChild(title);
		ele.appendChild(contents);

		return { title: title, contents: contents };
	};
	/*
		landscape 의 그룹 레이아웃을 만들어준다.
	 */
	function landGroupLayout (groups, id, width, height, type)	{
		var h = height * 0.16 / groups.length,
				prefixes = {
					patient: { w: width * 0.01, h: h },
					axis: { w: width * 0.14, h: h },
					group: { w: width * 0.65, h: h },
				};

		bio.iteration.loop(groups, function (group)	{
			var name = group.name.removeWhiteSpace(),
					prefix = prefixes[type] === 'group' ? '' : type;

			id['landscape_' + prefix + '_group_' + name] = 
				{ 
					width: prefixes[type].w.toFixed(1), 
					height: prefixes[type].h.toFixed(1), 
				};
		});

		return id;
	};
	// Chart 별 영역의 크기 설정 및 ID List 생성.
	model.chart.landscape = function (ele, w, h, group)	{
		var id = {
			landscape_temp_sample: { width: w * 0.1, height: h * 0.15 },
			landscape_axis_sample: { width: w * 0.14, height: h * 0.15 },
			landscape_patient_sample: { width: w * 0.01, height: h * 0.15 },
			landscape_sample: { width: w * 0.65, height: h * 0.15 },
			landscape_scale_option: { width: w * 0.1, height: h * 0.15 },
			landscape_temp_group: { width: w * 0.1, height: h * 0.16 },
			landscape_axis_group: { width: w * 0.14, height: h * 0.15 },
			landscape_patient_group: { width: w * 0.01, height: h * 0.16 },
			landscape_group: { width: w * 0.65, height: h * 0.16 },
			landscape_option: { width: w * 0.1, height: h * 0.16 },
			landscape_legend: { width: w * 0.1, height: h * 0.64},
			landscape_gene: { width: w * 0.14, height: h * 0.64 },
			landscape_patient_heatmap: { width: w * 0.01, height: h * 0.64 },
			landscape_heatmap: { width: w * 0.65, height: h * 0.64 },
			landscape_pq: { width: w * 0.1, height: h * 0.64 },
		};

		var divs = makeDivide('landscape', ele, w, h, 0.05);

		var ga = landGroupLayout(group, {}, w, h, 'axis'),
				gc = landGroupLayout(group, {}, w, h, 'group'),
				gp = landGroupLayout(group, {}, w, h, 'patient');

		makeLayout.call(setSize(divs.contents, w, h * 0.95), id);
		makeLayout.call(bio.dom().get('#landscape_group'), gc);
		makeLayout.call(bio.dom().get('#landscape_axis_group'), ga);
		makeLayout.call(bio.dom().get('#landscape_patient_group'), gp);

		return model.ids;
	};
	
	model.chart.variants = function (ele, w, h)	{
		var id = {
			variants_needle: {width: w * 0.825, height: h * 0.825},
			variants_legend: {width: w * 0.175, height: h * 0.5},
			variants_patient_legend: {width: w * 0.175, height: h * 0.425},
			variants_navi: {width: w * 0.825, height: h * 0.1},
		};

		var divs = makeDivide('variants', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};

	model.chart.expression = function (ele, w, h)	{
		var id = {
			expression_survival: {width: w * 0.4, height: h * 0.925},
			expression_bar_plot: {width: w * 0.4, height: h * 0.32},
			expression_function: {width: w * 0.2, height: h * 0.05},
			expression_color_mapping: {width: w * 0.2, height: h * 0.05},
			expression_bar_legend: {width: w * 0.2, height: h * 0.35},
			expression_division: {width: w * 0.4, height: h * 0.04},
			expression_scatter_plot: {width: w * 0.4, height: h * 0.3},
			expression_scatter_empty: {width: w * 0.2, height: h * 0.08},
			expression_scatter_legend: {width: w * 0.2, height: h * 0.2},
			expression_heatmap: {width: w * 0.4, height: h * 0.25},
			expression_signature: {width: w * 0.2, height: h * 0.05},
			expression_color_gradient: {width: w * 0.194, height: h * 0.075},
		};

		var divs = makeDivide('expression', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};
	
	model.chart.exclusivity = function (ele, w, h)	{
		var id =  {
			exclusivity_select_geneset: {width: w * 0.59, height: h * 0.12},
			exclusivity_survival: {width: w * 0.4, height: h * 0.925},
			exclusivity_network: {width: w * 0.25, height: h * 0.65},
			exclusivity_heatmap: {width: w * 0.35, height: h * 0.45},
			exclusivity_legend: {width: w * 0.35, height: h * 0.05},
			exclusivity_sample_legend: {width: w * 0.35, height: h * 0.05},
		};

		var divs = makeDivide('exclusivity', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};

	model.chart.pathway = function (ele, w, h)	{
		var id =  {};
		var divs = makeDivide('pathway', ele, w, h, 0.075);

		makeLayout.call(setSize(divs.contents, w, h * 0.925), id);

		return model.ids;
	};
	/*
		각 chart 별 기본 설정 반환함수.
	 */
	model.chart.default = function (that, opts)	{
		that.id = opts.element.attr('id');
		that.margin = opts.margin ? 
									bio.sizing.setMargin(opts.margin) : null;
		that.width = parseFloat(opts.element.attr('width'));
		that.height = parseFloat(opts.element.attr('height'));
		that.element = bio.objects.getType(opts.element) === 'Object' || 
									 bio.objects.getType(opts.element) === 'Array' ? 
									 opts.element : (/\W/).test(opts.element[0]) ? 
									 d3.select(opts.element) : 
									 d3.select('#' + opts.element);

		return that;
	};

	return model;
};