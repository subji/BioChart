function pathway ()	{
	'use strict';

	var model = {};
	/*
		Pathway svg file 을 contents 태그에 삽입한다.
	 */
	function addSVG (cancer, callback)	{
		bio.drawing().importSVG(
			// '/data/pathway/' + cancer + '.svg', callback);
			'/datas/' + cancer + '.svg', callback);
	};
	/*
		현재 노드에 속하는 데이터를 배열에서 찾는 함수.
	 */
	function isGene (text, data)	{
		var result = null;

		bio.iteration.loop(data, function (d)	{
			if (d.gene_id === text)	{
				result = { is: true, data: d };
			}
		});

		return !result ? { is: false, data: null } : 
						result;
	};

	function twinkle (rect, marker)	{
		if (marker > -1)	{
			var is = false;

			setInterval(function () {
				is = !is;

				rect.style('stroke', is ? '#ff0000' : '#333')
						.style('stroke-width', is ? 3 : 1);
			}, 500);
		}
	};

	function fillColor (elem, data, opt, marker)	{
		var config = bio.pathwayConfig().node();
		
		if (marker > -1)	twinkle(elem, marker);

		elem.attr('cursor', 'pointer')
				.style('fill', function (d)	{
					return config.style.fill.call(this, data)
				})
				.on('mouseover', function (d, i) { 
					config.on.mouseover.call(this, data, i, opt);
				})
				.on('mouseout', function (d, i)	{
					config.on.mouseout.call(this, data, i, opt);
				});
	};

	function defineIndex (parent)	{
		bio.iteration.loop(parent.childNodes, 
		function (i, child)	{
			if ((/gene_/i).test(child.id))	{
				d3.select(child).data({ 'index': i });
			}
		});
	};
	/*
		Pathway 의 노드에 값에 상응하는 색상을 입히는 함수.
	 */
	function colorGenes (data, patient)	{
		var texts = bio.dependencies.version.d3v4() ? 
								d3.selectAll('text').nodes() : 
								bio.drawing().nodes(d3.selectAll('text'));

		bio.iteration.loop(texts, function (txt)	{
			var gene = isGene(txt.textContent, data);

			if (gene.is || (/gene_/i).test(txt.parentNode.id)) {
				var rect = d3.select(txt.parentNode).select('rect'),
						marker = patient.indexOf(txt.textContent),
						opt = {
							x: parseInt(rect.attr('x')),
							y: parseInt(rect.attr('y')),
							width: parseInt(rect.attr('width')),
							height: parseInt(rect.attr('height')),
						};

				fillColor(rect, gene.data, opt, marker);
				fillColor(d3.select(txt), gene.data, opt);
			}
		});

		defineIndex(texts[0].parentNode.parentNode);

		d3.selectAll('text, rect').attr('class', '');
	};



	function drugEvent (cancerType)	{
		var config = bio.pathwayConfig().drug();


		var temp = d3.selectAll('g[id*="drug_"]');
		console.log(temp.nodes()[0])
		// Gene 에 Drug 가 있을 때만 데이터를 넣어주고, 마우스 이벤트를 적용한다.
		// 이외의 Drug 는 display = 'none' 을 한다.
		// 색 지정은... type1, 2, 3 가 있는데, type1 이 하나라도 포함되면 붉은색,
		// type1 이 없고 type2 가 하나라도 존재할 경우 파란색, type1, 2 가 없고 3 만 존재하는 경우 검정색
		// 아무것도 없을 경우에는 display = 'none' 이 된다.
		d3.selectAll('g[id*="drug_"]')
			.datum(function (d)	{
				var transform = d3.select(this).attr('transform'),
						trans = bio.dependencies.version.d3v4() ? 
										bio.rendering().translation(transform) : 
										d3.transform(transform);

				return {
					cancer: cancerType,
					scaleX: trans.scale[0],
					scaleY: trans.scale[1],
					translateX: trans.translate[0],
					translateY: trans.translate[1],
				};
			})
			.on('click', config.on.click)
			.on('mouseover', config.on.mouseover)
			.on('mouseout', config.on.mouseout);
	};

	return function (opts)	{
		// addSVG(opts.cancer_type, function (xml)	{
			bio.modal({
				id: 'drug_modal',
				element: document.querySelector(opts.element),
			});

			model = bio.initialize('pathway');
			model.setting = bio.setting('pathway', opts);
			model.data = model.setting.preprocessData;
			model.modalID = 'drug_modal';

			bio.title('#pathway_title', 
								opts.cancer_type.toUpperCase() + ' - Pathway');	

			var contents = document.getElementById(
											'pathway_contents'),
					modal = document.querySelector('.modal-body');

			var xml = d3.select('svg').node();
			// console.log(xml.documentElement, temp)
			
			// d3.select(xml.documentElement)
			// 	.attr('width', parseFloat(contents.style.width))
			// 	.attr('height', parseFloat(contents.style.height));
			
			// contents.appendChild(xml.documentElement);
			d3.select(xml)
				.attr('width', parseFloat(contents.style.width))
				.attr('height', parseFloat(contents.style.height));
			
			contents.appendChild(xml);

			modal.style.height = 
			parseFloat(contents.style.height) * 0.8 + 'px';
			
			colorGenes(model.setting.defaultData.pathway,
								model.setting.defaultData.patient);
			drugEvent(opts.cancer_type);
		// });

		console.log('>>> Pathway reponse data: ', opts);
		console.log('>>> Pathway setting data: ', model.setting);
		console.log('>>> Pathway model data: ', model);
	};
};