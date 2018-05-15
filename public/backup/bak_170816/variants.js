'use strict';

var variants = (function (variants)	{
	'use strict';

	var model = { div: {} };
	/*
		Title 을 만드는 함수.
	 */
	function title ()	{
		model.div.title = document.querySelector('#variants_title');
		model.div.title.innerHTML = model.origin.variants.title;
		model.div.title.style.fontSize = 
				draw.getFitTextSize(model.origin.variants.title,
				  parseFloat(model.div.title.style.width), 
				  parseFloat(model.div.title.style.height));

		model.div.title.style.lineHeight = 
			parseFloat(model.div.title.style.height) + 'px';
	};
	/*
		x,y 축의 위치를 설정하는 함수.
	 */
	function getAxisPosition (w, e, m)	{
		return [
			w === 'top' ? e.attr('height') - m[0] : m[0], m[1]
		];
	};
	/*
		X,Y 축을 그려주는 함수.
	 */
	function drawAxis ()	{
		var // Y 축의 데이터는 아래에서 위로 향하는 데이터이기 때문에
				// 원본데이터를 복사하여 순서를 뒤집어 주었다.
				yd = new Array().concat(model.data.axis.needle.y);

		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			util.loop(['left', 'top'], function (d, i)	{
				axis.element(v)[d]({
					margin: config.variants.axis[d].margin,
					position: getAxisPosition(d, v, 
										config.variants.axis[d].margin),
					data: d === 'left' ? yd.reverse() : 
															 model.data.axis.needle.x,
					opt: {},
				});
			});
		});
	};
	/*
		Needle Plot 을 그려주는 함수.
	 */
	function drawNeedle (xaxis)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			needle({
				element: v,
				lineData: model.data.needle,
				circleData: model.data.fullNeedle,
				line: config.variants.needle.line,
				attr: config.variants.needle.attr,
				style: config.variants.needle.style,
				margin: config.variants.needle.margin,
				xaxis: (xaxis || model.data.axis.needle.x),
				yaxis: model.data.axis.needle.y,
				on: config.variants.needle.on,
			});
		});
	};
	/*
		Needle Plot 아래 Graph 를 그려주는 함수.
	 */
	function drawNeedleGraph (xaxis)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			needleGraph({
				element: v,
				data: model.data.graph,
				attr: config.variants.needleGraph.attr,
				style: config.variants.needleGraph.style,
				margin: config.variants.needleGraph.margin,
				text: config.variants.needleGraph.text,
				xaxis: (xaxis || model.data.axis.needle.x),
				yaxis: model.data.axis.needle.y,
				on: config.variants.needleGraph.on,
			});
		});
	};
	/*
		Navigator bar 를 그려주는 함수.
	 */
	function drawNeedleNavi () {
		layout.getSVG(model.svg, ['navi'], function (k, v)	{
			needleNavi({
				element: v,
				data: model.data,
				margin: config.variants.navi.margin,
				style: config.variants.navi.style,
				xaxis: model.data.axis.needle.x,
				yaxis: model.data.axis.needle.y,
				drag: {
					drag: config.variants.navi.drag.drag,
					end: function (d, i, m)	{
						var cv = config.variants.navi,
								iv = scale.invert(m.sx),
								dm = [iv(cv.start.now + m.rect.width),
											iv(cv.end.now + m.rect.width)],
								rg = [m.m.left, m.w - m.m.right];

						d3.selectAll('.top-axis-g-tag')
							.call(axis.byVersion(scale.get(dm, rg), 'top'));

						layout.removeG([
							'.variants_needle_chart.needle-line-g-tag', 
							'.variants_needle_chart.needle-circle-g-tag',
							'.variants_needle_chart.needle-graph-g-tag', 
							'.variants_needle_chart.needle-patient-g-tag']);

						drawNeedle(dm);
						drawNeedleGraph(dm);
						drawPatient(dm);
					},
				},
			});
		});
	};
	/*
		Needle 에 Patient 를 추가하는 함수.
	 */
	function needlePatient (d, xaxis)	{
		layout.getSVG(model.svg, ['needle'], function (k, v)	{
			var md = {},
			  	cp = config.variants.patient.needle;

			md.m = size.setMargin(cp.margin);
			md.id = v.attr('id');
			md.w = v.attr('width');
			md.h = v.attr('height');
			md.g = render.addGroup(
				v, md.h - md.m.bottom, md.m.left, 'needle-patient');
			md.s = scale.get((xaxis || model.data.axis.needle.x), 
											 [md.m.left, md.w - md.m.right]);
			md.len = 5;

			render.triangle({
				element: md.g.selectAll('#' + md.id + '_tri'),
				data: d,
				attr: {
					id: function (d, i) { return md.id + '_tri'; },
					points: function (d, i) { 
						return cp.attr.points ? 
									 cp.attr.points.call(
									 	this, d, i, md) : [0, 0];
					},
				},
				style: {
					fill: function (d, i) { 
						return cp.style.fill ? 
									 cp.style.fill.call(
									 	this, d, i, md) : '#000000';
					},
					stroke: function (d, i)	{
						return cp.style.stroke ? 
									 cp.style.stroke.call(
									 	this, d, i, md) : '#FFFFFF';
					},
				},
				on: {
					mouseover: function (d, i)	{
						return cp.on.mouseover ? 
									 cp.on.mouseover.call(
									 	this, d, i, md) : false;
					},
					mouseout: function (d, i)	{
						return cp.on.mouseout ? 
									 cp.on.mouseout.call(
									 	this, d, i, md) : false;
					},
				}
			});
		});
	};
	/*
		Legend 에 patient 를 남기는 함수.
	 */
	function legendPatient (d)	{
		layout.getSVG(model.svg, ['nt_legend'], function (k, v)	{
			legend({
				element: v,
				data: [d[0].id],
				attr: config.variants.patient.legend.attr,
				style: config.variants.patient.legend.style,
				text: config.variants.patient.legend.text,
				margin: config.variants.patient.legend.margin,
			});
		});
	};
	/*
		Patient 를 그려주는 함수.
	 */
	function drawPatient (xaxis)	{
		if (xaxis)	{
			return needlePatient(model.data.patient, xaxis);
		}

		needlePatient(model.data.patient);
		legendPatient(model.data.patient);
	};
	/*
		Legend 를 그려주는 함수.
	 */
	function drawLegend ()	{
		var th = draw.getTextHeight(
						 	config.variants.legend.style.fontSize).height;

		document.querySelector('#variants_legend').style.height = 
					 ((th + 6) * model.data.type.length) + 'px';

		layout.getSVG(model.svg, ['ts_legend'], function (k, v)	{
			legend({
				element: v,
				data: model.data.type,
				priority: config.landscape.priority,
				text: config.variants.legend.text,
				attr: config.variants.legend.attr,
				style: config.variants.legend.style,
				margin: config.variants.legend.margin,
			});
		});
	};
	/*
		Variants 를 그려주는 함수.
	 */
	function drawVariants ()	{
		layout.removeG(); 

		drawAxis();
		drawLegend();
		drawNeedle();
		drawNeedleNavi();
		drawNeedleGraph();
		drawPatient();
	};

	return function (o)	{
		model = { div: {} };
		
		var e = document.querySelector(o.element || null),
				w = parseFloat(o.width || e.style.width || 1400),
				h = parseFloat(o.height || e.style.height || 700);
		// Set the color of whole background.
		e.style.background = '#F7F7F7';
		// Origin data from server.
		model.origin = o.data;
		// preprocess data for landscape and call drawLandScape.
		model.data = preprocessing.variants(o.data);
		// Make Landscape layout and return div ids.
		model.ids = size.chart.variants(e, w, h);
		// Make svg to parent div and object data.
		model.svg = layout.variants(model.ids, model);

		title();
		drawVariants();

		// console.log('Given Variants data: ', o);
		// console.log('Variants model data: ', model);
	};
}(variants||{}));