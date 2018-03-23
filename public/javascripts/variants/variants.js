function variants ()	{
	'use strict';

	var model = {};
	/*
		X, Y 축을 그리는 함수.
	 */
	function drawAxis (part, direction)	{
		var yData = [].concat(model.data.axis.needle.y);

		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().axis(
										part, direction, svg),
					common = bio.variantsConfig().axis('common'),
					data = model.data.axis.needle[direction.toLowerCase()];

			bio.axises()[config.direction]({
				element: svg,
				top: config.top,
				left: config.left,
				range: config.range,
				margin: config.margin,
				exclude: config.exclude,
				domain: direction === 'Y' ? yData.reverse() : data,
			});
		});
	};
	/*
		Legend 를 그리는 함수.
	 */
	function drawLegend (part, data)	{
		var tags = { 
			needle: 's_legend', patient: 't_legend' 
		}[part];

		data = data.sort(function (a, b)	{
			return bio.boilerPlate.variantInfo[a].order > 
						 bio.boilerPlate.variantInfo[b].order ? 1 : -1;
		});

		bio.layout().get(model.setting.svgs, [tags], 
		function (id, svg)	{
			var config = bio.variantsConfig().legend(part);

			bio.legend({
				data: data,
				element: svg,
				on: config.on,
				attr: config.attr,
				text: config.text,
				style: config.style,
				margin: config.margin,
			});
		});
	};
	/*
		Needle Plot 을 그려주는 함수.
	 */
	function drawNeedle (line, shape, axis, toDrag)	{
		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().needle();

			bio.needle({
				element: svg,
				yaxis: axis.y,
				on: config.on,
				lineData: line,
				shapeData: shape,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				xaxis: toDrag || axis.x,
			});
		});
	};
	/*
		Needle plot 의 Navigator 를 그려주는 함수.
	 */
	function drawNeedleNavi (data, axis)	{
		bio.layout().get(model.setting.svgs, ['navi'], 
		function (id, svg)	{
			var config = bio.variantsConfig().navi();

			bio.variantsNavi({
				data: data,
				element: svg,
				xaxis: axis.x,
				yaxis: axis.y,
				on: config.on,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				call: {
					drag: config.call.drag,
					end: function (data, idx, that)	{
						var dg = that.opts.drag,
								iv = bio.scales().invert(that.scaleX),
								domain = [
									iv(dg.start.now + that.controls.width),
									iv(dg.end.now + that.controls.width)],
								range = [
									that.margin.left, 
									that.width - that.margin.right];

						d3.selectAll('.bottom-axis-g-tag')
							.call(bio.axises().byD3v(
										bio.scales().get(domain, range), 'bottom'));

						bio.layout().removeGroupTag([
							'.variants_needle_svg.needle-line-g-tag', 
							'.variants_needle_svg.needle-shape-g-tag',
							'.variants_needle_svg.needle-graph-g-tag', 
							'.variants_needle_svg.needle-patient-shape-g-tag'
							]);

						drawNeedle(
							model.data.needle.line, model.data.needle.shape, 
							model.data.axis.needle, domain);
						drawNeedleGraph(model.data.graph, 
														model.data.axis.needle, domain);
						drawPatient(model.data.patient.shape, 
												model.data.axis.needle, domain);
					},
				},
			});
		});
	};
	/*
		Needle plot 의 Graph 를 그려주는 함수.
	 */
	function drawNeedleGraph (data, axis, toDrag)	{
		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().graph();

			bio.variantsGraph({
				data: data,
				element: svg,
				on: config.on,
				yaxis: axis.y,
				text: config.text,
				attr: config.attr,
				style: config.style,
				margin: config.margin,
				xaxis: toDrag || axis.x,
			});
		});
	};
	/*
		Patient 를 표시해주는 함수.
	 */
	function drawPatient (data, axis, toDrag)	{
		bio.layout().get(model.setting.svgs, ['needle'], 
		function (id, svg)	{
			var config = bio.variantsConfig().patient(),
					needleConfig = bio.variantsConfig().needle();

			bio.variantsPatient({
				data: data,
				element: svg,
				yaxis: axis.y,
				attr: config.attr,
				style: config.style,
				on: needleConfig.on,
				margin: config.margin,
				xaxis: toDrag || axis.x,
			});
		});
	};
	/*
		Variants 를 그려주는 함수.
	 */
	function drawVariants (data)	{
		bio.layout().removeGroupTag();

		drawAxis('needle', 'X');
		drawAxis('needle', 'Y');
		drawLegend('needle', data.type);
		drawLegend('patient', [data.patient.shape[0].info[0].id]);
		drawNeedle(
			data.needle.line, data.needle.shape, data.axis.needle);
		drawNeedleNavi(data, data.axis.needle);
		drawNeedleGraph(data.graph, data.axis.needle);
		drawPatient(data.patient.shape, data.axis.needle);
	};

	return function (opts)	{
		model = bio.initialize('variants');
		model.setting = bio.setting('variants', opts);
		model.data = model.setting.preprocessData;
		// Set landscape title.
		bio.title('#variants_title', 
			model.setting.defaultData.variants.title);

		drawVariants(model.data);

		// console.log('>>> Variants reponse data: ', opts);
		// console.log('>>> Variants setting data: ', model.setting);
		// console.log('>>> Variants model data: ', model);
	};
};