function pathwayConfig ()	{
	'use strict';

	var model = {
		drug_color: {
			type1: { class: 'agent-red', color: 'red' },
			type2: { class: 'agent-blue', color: 'blue' },
			type3: { class: 'agent-black', color: 'black' },
		}
	};

	function color (data)	{
		if (data)	{
			var scale = bio.scales().get([0, 50], [1, 0.5]),
					base = d3.hsl(
						data.active === 'Y' ? 'red' : 'blue');
					base.l = scale(data.frequency);

			return base;
		} 

		return '#d0d0d0';
	};

	function getId (element)	{
		var full = d3.select(element).node().parentNode.id;

		return full.substring(full.lastIndexOf('_') + 1, 
													full.length).toUpperCase();
	};

	function node ()	{
		return {
			style: {
				fill: function (data, idx, that)	{
					return this.tagName === 'rect' ? color(data) : 
								 data && data.frequency >= 30 ? 
								'#F2F2F2' : '#333333';
				},
			},
			on: { 
				mouseover: function (data, idx, that)	{
					var elem = this.tagName === 'rect' ? this : 
								d3.select(this.parentNode).select('rect').node(),
							freq = data ? data.frequency : 'NA',
							color = data ? data.active === 'Y' ? 
											'RED' : 'BLUE' : '#E8E8E8',
							isAct = data ? data.active === 'Y' ? 
											'Activated' : 'Inactivated' : 'NA',
							id = getId(this);

					bio.tooltip({
						element: elem,
						contents: '<b>' + id + '</b></br>frequency : ' + 
						freq + '</br><span style="color : ' + color + 
						'"><b>' + isAct + '</b></span>',
					});
				},
				mouseout: function (data, idx, that)	{
					bio.tooltip('hide');
				},
			},
		};
	};

	function drug ()	{
		function geneTag (gene)	{
			return '<div id="modal_gene_name">' + gene + '</div>';
		};

		function onOverAndOut (data)	{
			var isOver = d3.event.type === 'mouseout' ? 0 : 1,
					sv = isOver ? 0.02 : 0,
					tv = isOver ? -5 : 0;

			d3.select(this).transition()
				.attr('transform', function ()	{
					return 'matrix(' + 
					(data.scaleX + sv) + ', 0, 0, ' + 
					(data.scaleY + sv) + ', ' + 
					(data.translateX + tv) + ', ' + 
					(data.translateY + tv) + ')';
				})
				.style('cursor', 'pointer')
				.selectAll('path')
				.style('stroke', isOver ? '#FBFD24' : '#FFFFFF')
				.style('stroke-width', isOver ? 20 : 0);
		};
		/*
			data 값에 따른 URL 요청 주소를 반환한다.
		 */
		function drugURL (data)	{
			return data.nci_id ? 
			'http://www.cancer.gov/about-cancer/treatment/drugs/' + 
			data.nci_id : !data.nci_id && data.dailymed_id ? 
			'http://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?' + 
			'setid=' + data.dailymed_id : null;	
		};
		/*
			type 구분을 위한 drug 모양을 반환한다.
		 */
		function drugShape (type)	{
			var color = model.drug_color[type].color,
					drug = document.querySelector(
						'#legend_icon_' + color).cloneNode(true),
					svg = document.createElement('svg');

			drug.setAttribute('transform', 
				'matrix(0.04, 0, 0, 0.04, 10, 0)');

			svg.setAttribute('width', 40);
			svg.setAttribute('height', 20);
			svg.appendChild(drug);

			return svg.outerHTML;
		};

		return {
			on: {
				click: function (data, idx, that)	{
					var gene = this.id.split('_')[1],
							title = document.querySelector('.modal-title'),
							body = document.querySelector('.modal-body');
					// Example are post, but real is get.
					// $.ajax({
					// 	// type: 'POST',
					// 	// url: '/files',
					// 	type: 'GET',
					// 	url: '/models/drug/getPathwayDrugList?pathway_gene='
					// 				+ gene + '&cancer_type=' + data.cancer,
					// 	// data: { name: 'drug' },
					// 	success: function (d)	{
							title.innerHTML = '<div id="modal_gene_title">' + 
															 	'Available drugs</div>' + 
															 	'<div id="modal_gene_name">' + 
															 	gene.toUpperCase() + '</div>';

							bio.table({
								height: 330,
								element: body,
								heads: ['Type', 'Drug', 'Level of approval', 
												'Treated Cancer', 'Reference'],
								// data: d.data.egfr,
								data: data.drugs,
								columns: function (col, row, head, data, that)	{
									if (col === 0) return drugShape(data.drug_type);
									else if (col === 1) 	{
										var urls = drugURL(data);
										
										return urls ? data.agent + 
										'<a class="drug-link" href=' + urls + 
										' target=\'drug\'>' + 
										'<i class="fa fa-external-link"></i></a>' : 
											data.agent;
									}										
									else if (col === 2) 	return data.drug_class;
									else if (col === 3) 	return data.cancer;
									else if (col === 4) 	return data.source;
								},
							});
					// 	},
					// 	error: function (err)	{
					// 		console.log('Error: ', err);
					// 	}
					// });

					$('#drug_modal').modal({
						keyboard: false,
						backdrop: 'static',
					});
				},
				mouseover: onOverAndOut,
				mouseout: onOverAndOut,
			}
		}
	};

	return function ()	{
		return { node: node, drug: drug };
	};
};