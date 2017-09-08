$(function() {
	'use strict';
	var DRUG_URL = "https://www.drugbank.ca/unearth/q?searcher=drugs&approved=1&vet_approved=1&nutraceutical=1&illicit=1&withdrawn=1&investigational=1&query=";
	var MUTATION_URL = "http://cancer.sanger.ac.uk/cosmic/search?q=p.";
	var GENE_URL = "https://www.ncbi.nlm.nih.gov/gene?term=("; //+ 'EGFR[Sym]) AND 9606[Taxonomy ID]";
	var PUBMED_SUM_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
	var PUBMED_URL = "https://www.ncbi.nlm.nih.gov/pubmed/"; //+ 'EGFR[Sym]) AND 9606[Taxonomy ID]";
	var LEVEL_LINK = "<a target='oncokb' href='http://oncokb.org/#/levels'><i class='fa fa-external-link' aria-hidden='true'></i></a>";
	var NCI_URL = 'http://www.cancer.gov/about-cancer/treatment/drugs/';
	var DAILYMED_URL = 'http://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=';

	$('#classification_all').click(function() {
		// console.log(this.checked);
		if (this.checked) {
			$('input[type=checkbox][name=classification]').prop('checked', false);
		}
	});
	$('input[type=checkbox][name=classification]').click(function() {
		// console.log(this.checked);
		if (this.checked && $('#classification_all').prop('checked')) {
			$('#classification_all').prop('checked', false);
		}
	});
	$('#filterButton').click(function(e) {
		// console.log($('#ex1').val());
		// console.log(getClassificationParameter());
		// console.log($('input[type=checkbox][name=cosmic]').prop('checked'));
		$('#table').bootstrapTable('removeAll');
		$('#table').bootstrapTable('refresh', {});

		var tbData = $('#table').bootstrapTable('getData');

		if (tbData.length > 1) {
			$('#analysisTab a:first').tab('show');
		} else {
			$('#analysisTab a:first').tab('show');
			$('#navi, #legend').css('visibility', 'hidden');
		}
	});

	function getClassificationParameter() {
		if ($('#classification_all').prop('checked')) {
			return $('#classification_all').val();
		}
		var checked = [];
		$('input[type=checkbox][name=classification]:checked').each(function(_i, _o) {
			checked.push(_o.value);
		});
		return checked.join(',');
	}

	function getDrugLink(value) {
		var array = value.split('|');
		var link = '';
		// console.log('value', value, 'array', array);
		if (array.length === 3) {
			var url;
			if (array[1] === 'N') {
				url = NCI_URL;
			} else {
				url = DAILYMED_URL;
			}
			link = '<a target=drug class=\'text-nowrap\' href=\'' + url + array[2] + '\'>' + array[0] + '</a>';
		} else {
			link = array[0];
		}
		// console.log(array, link);
		return link;
	}

	function externalLink(target, link) {
		return ' <a target="' + target + '" href="' + link + '"><i class="fa fa-external-link" aria-hidden="true"></i></a> ';
	}

	var table = $('#table');
	table.bootstrapTable({
		url: '/models/sample/getSampleVariantList',
		classes: 'table',
		method: 'get',
		// cache: false, // False to disable caching of AJAX requests.
		width: '1200px',
		// showColumns: true,
		// showRefresh: true,
		// sortName: 'gene',
		// sortName: 'patientsOfPosition',
		// sortable: true,
		// sortOrder: 'desc',
		pagination: true,
		pageSize: 5,
		queryParams: function(params) {
			params.source = cohort.getCohortSource();
			params.sample_id = $('#sample_id').val();
			params.cancer_type = $('#cancer_type').val();
			params.frequency = $('#frequency').val();
			params.classification = getClassificationParameter();
			params.cosmic = $('input[type=checkbox][name=cosmic]').prop('checked') ?
				'Y' :
				'N';
			params.filter_option = cohort.getFilterOption();
			params.driver = $('input[type=checkbox][name=driver]').prop('checked') ?
				'Y' :
				'N';
			// console.log('params:', params);
			return params;
		},
		rowStyle: function(row, index) { // make first row active
			if (index === 0)
				return { classes: 'info' };
			return {};
		},
		columns: [{
			field: 'state',
			title: '#',
			radio: true,
			align: 'center',
			valign: 'middle',
			clickToSelect: true
		}, {
			field: 'gene',
			title: 'Gene',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				//var params = [row.cancer_type, row.sample_id, row.gene, row.transcript];
				// return '<a target=\'ncbi\' href="http://www.ncbi.nlm.nih.gov/gene?term=(' + value + '[Sym]) AND 9606[Taxonomy ID]">' + value + '</a> ';
				return value + externalLink('ncbi', 'http://www.ncbi.nlm.nih.gov/gene?term=(' + value + '[Sym]) AND 9606[Taxonomy ID]');
			},
			events: 'tsEvents', // needleplot.js
		}, {
			field: 'class',
			title: 'Classification',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				return value.replace('_Mutation', '');
			}
		}, {
			field: 'vaf',
			title: 'VAF',
			halign: 'center',
			align: 'right',
			formatter: function(value, row) {
				if (value === undefined)
					return '';
				return (value * 100).toFixed(2) + '%';
			}
		}, {
			field: 'chr',
			title: 'Chr',
			align: 'center'
		}, {
			field: 'start_pos',
			title: 'Locus',
			halign: 'center',
			align: 'right',
			formatter: function(value, row) {
				var reg = /(^[+-]?\d+)(\d{3})/;
				var n = (value + '');

				while (reg.test(n))
					n = n.replace(reg, '$1' + ',' + '$2');
				return n;
			}
		}, {
			field: 'cds',
			title: 'CDS Change',
			align: 'center',
			class: 'cds_change',
		}, {
			field: 'alt',
			title: 'AA Change',
			align: 'center'
		}, {
			field: 'uniprot_id',
			title: 'Protein',
			align: 'center',
			formatter: function(value, row) {
				//var params = [row.cancer_type, row.sample_id, row.gene, row.transcript];
				// return '<a target=\'pfam\' href="http://pfam.xfam.org/protein/' + value + '">' + value + '</a> ';
				return value + externalLink('pfam', 'http://pfam.xfam.org/protein/' + value);
			},
			// events: 'tsEvents', // needleplot.js
		}, {
			field: 'pdomain',
			title: 'Domain',
			align: 'center',
			formatter: function(value, row) {
				if (value === undefined || value === '')
					return '';
				var domains = value.split(',');
				var domain_html = [];
				domains.forEach(function(domain) {
					var domain_info = domain.split('|');
					var info = ' <a href="#"><i class="fa fa-info-circle" data-toggle="tooltip" data-placement="top" title="' + domain_info[1] + '"></i></a>';
					// var span = '<a target="pdomain" href="http://pfam.xfam.org/family/' + domain_info[0] + '">' + domain_info[0] + ' </a>';
					// return span + info;
					domain_html.push(domain_info[0] + info + externalLink('pdomain', 'http://pfam.xfam.org/family/' + domain_info[0]));

				});
				return domain_html.join(' ');
			}
		}, {
			field: 'patientsOfPosition',
			title: '<span>Frq. in Gene </span><a href="#"><i class="fa fa-info-circle" data-toggle="tooltip" data-placement="top" title="no. of the patients who has a specific mutation among the patients with a specific gene in Frq. in Total"></i></a>',
			sortable: true,
			halign: 'center',
			align: 'right',
			formatter: function(value, row) {
				var pct = 0;
				if (row.patientsOfTranscript !== 0)
					pct = (row.patientsOfPosition / row.patientsOfTranscript) * 100;
				return pct.toFixed(2) + '%' + ' (' + row.patientsOfPosition + '/' + row.patientsOfTranscript + ')';
			}
		}, {
			field: 'patientsOfPosition',
			title: '<span>Frq. in Total </span><a href="#"><i class="fa fa-info-circle" data-toggle="tooltip" data-placement="top" title="no. of the patients who has a specific mutation among the whole patients selected from public data (TCGA)"></i></a>',
			sortable: true,
			halign: 'center',
			align: 'right',
			formatter: function(value, row) {
				var pct = 0;
				// var patientsOfCancer = cohort.getFilteredCount();
				var patientsOfCancer = row.cntOfFilteredPatient;
				if (patientsOfCancer !== 0)
					pct = (value / patientsOfCancer) * 100;
				return pct.toFixed(2) + '%' + ' (' + value + '/' + patientsOfCancer + ')';
			}
		}, {
			field: 'fda_in_gene_drugs',
			title: 'Drugs',
			align: 'center',
			formatter: function(value, row) {
				var html = '';
				// var drugs_for_gene = (row.drugs_for_gene !== null) ? row.drugs_for_gene.split(',').length : 0;
				// var drugs_for_alt = (row.drugs_for_alt !== null) ? row.drugs_for_alt.split(',').length : 0;
				var miningdrugs = getMiningDrugCount(row.miningdrugs);
				var oncokbdrugs = getOncoKBDrugCount(row.oncokbdrugs);
				if (row.fda_in_gene_drugs.length > 0)
					html = html + '<span class="badge badge-agent-pink" data-toggle="tooltip" data-placement="top" title="Drugs for gene">' + row.fda_in_gene_drugs.length + "</span>";
				if (row.fda_in_alt_drugs.length > 0)
					html = html + '<span class="badge badge-agent-red" data-toggle="tooltip" data-placement="top" title="Drugs for gene/alteration">' + row.fda_in_alt_drugs.length + "</span>";
				if (oncokbdrugs > 0)
					html = html + '<span class="badge badge-primary" data-toggle="tooltip" data-placement="top" title="OncoKB drugs">' + oncokbdrugs + "</span>";
				if (miningdrugs > 0)
					html = html + '<span class="badge badge-success" data-toggle="tooltip" data-placement="top" title="Mining drugs">' + miningdrugs + "</span>";
				return html;
			}
		}]
	});

	$('#miningdrugs').on('click', '.miningdrugs', function() {
		$(this).popover();

		// $('.popover').popover('hide');
		console.log($(this));
		// $(this).attr('data-content', 'show');
		$(this).popover('show');
	});

	var isLoading = false;
	$('#oncokbdrugs').on('click', '.oncokbdrugs', function() {
		if (isLoading)
			return; // 이미 다른 것을 로딩 중이면 리턴한다.
		$('.popover').popover('hide');
		$(this).attr('data-content', 'show');

		console.log($(this));

		getOncoKBPubmedData($(this), $(this).data('pmids'));
		// $(this).popover('show');
	});

	$('#drugModal').on('shown.bs.modal', function(event) {
		// var spinner = '<span class="spinner hidden"><img src="/images/loading.gif" alt="Loading"/></span>';

		var $link = $(event.relatedTarget);
		var drug = $link.data('drug');
		var type = $link.data('type');
		var type_html = '<span>' + type + ': </span>';
		var drug_url = getDrugLinkNew(drug.agent, (drug.link) ? drug.link.split(',') : [], drug.multi_link);
		$('#drug_title').html(type_html + drug_url);

		var options = {
			db: 'pubmed',
			retmode: 'json',
			id: drug.pmids
		};

		var refs = {};
		if (drug.ref_pmids) {
			drug.ref_pmids.split(',').forEach(function(ref) {
				var item = ref.split('|');
				var name = item[0];
				var pmid = item[1];

				if (!refs[name]) refs[name] = { pmids: [] };
				if (pmid && pmid.trim() !== '') refs[name].pmids.push(pmid);
			});
		}
		var content = '';
		$.ajax({ url: PUBMED_SUM_URL, data: options }).done(function(data) {
			console.log('success', data);
			Object.keys(refs).forEach(function(key) {
				content += '<div class="panel panel-default"><div class="panel-heading">' + key + '</div>';
				content += '<ul class="list-group">';
				refs[key].pmids.forEach(function(pmid) {
					console.log(data.result[pmid])
					content += '<li class="list-group-item"><p>' + data.result[pmid].title + '</p>' + '<var>' + data.result[pmid].sortfirstauthor + ' et al. ' + data.result[pmid].source + '</var>' + '<span style="float:right;">PMID:<a target="pubmed" href="' + PUBMED_URL + pmid + '">' + pmid + '</a></span>' + '</li>';
				});
				content += '</ul>'
				content += '</div>'
			});
		}).error(function(request, status, error) {
			alert('Error!');
		}).always(function() {
			isLoading = false;
			$('#drug_contents').html(content);
			$('#spinner').addClass('hidden');
		});
	});

	$('#drugModal').on('hidden.bs.modal', function(e) {
		$('#drug_title').html('');
		$('#drug_contents').html('');
		$('#spinner').removeClass('hidden');
	});
	// popover
	// $('#fda_in_gene_drugs').on('click', '.fda_in_gene_drugs', function() {
	// 	var $self = $(this);
	// 	var pmids = $self.data('pmids');
	// 	var ref_pmids = $self.data('ref_pmids');
	//
	// 	var options = {
	// 		db: 'pubmed',
	// 		retmode: 'json',
	// 		id: pmids
	// 	};
	//
	// 	var refs = {};
	// 	if (ref_pmids) {
	// 		ref_pmids.split(',').forEach(function(ref) {
	// 			var item = ref.split('|');
	// 			var name = item[0];
	// 			var pmid = item[1];
	//
	// 			if (!refs[name]) refs[name] = { pmids: [] };
	// 			if (pmid && pmid.trim() !== '') refs[name].pmids.push(pmid);
	// 		});
	// 	}
	// 	console.log(refs);
	// 	var content = '';
	// 	$.ajax({ url: PUBMED_SUM_URL, data: options }).done(function(data) {
	// 		console.log('success', data);
	// 		Object.keys(refs).forEach(function(key) {
	// 			content += '<div><label>' + key + '</label>';
	// 			content += '<ul class="list-unstyled">';
	// 			refs[key].pmids.forEach(function (pmid) {
	// 				console.log(data.result[pmid])
	// 				content += '<li><p>' + data.result[pmid].title + '</p>' + '<var>' + data.result[pmid].sortfirstauthor + ' et al. ' + data.result[pmid].source + '</var>' + '<span style="float:right;">PMID:<a target="pubmed" href="' + PUBMED_URL + pmid + '">' + pmid + '</a></span>' + '</li>';
	// 			});
	// 			content += '</ul>'
	// 		});
	// 		content += '</div>'
	// 	}).error(function(request, status, error) {
	// 		alert('Error!');
	// 	}).always(function() {
	// 		isLoading = false;
	// 		$self.attr('data-content', content);
	// 		$self.popover('show');
	// 		// spinner.addClass('hidden');
	// 	});
	// });

	var $drugstable = $('#drugstable');
	// var $drugs_for_gene = $('#drugs_for_gene');
	// var $drugs_for_alt = $('#drugs_for_alt');

	var $fda_in_gene_drugs = $('#fda_in_gene_drugs');
	var $fda_in_alt_drugs = $('#fda_in_alt_drugs');
	var $miningdrugs = $('#miningdrugs');
	var $oncokbdrugs = $('#oncokbdrugs');

	function drawDrugs(row) {
		console.log('drawDrugs');
		drawFdaApprovedDrugs(row.fda_in_gene_drugs, $fda_in_gene_drugs, 'FDA approved drugs for gene');
		drawFdaApprovedDrugs(row.fda_in_alt_drugs, $fda_in_alt_drugs, 'FDA approved drugs for alteration');
		// drawCurationDrugs(row.drugs_for_alt, $drugs_for_alt);
		drawMiningdrugs(row.miningdrugs);
		drawOncokbdrugs(row.oncokbdrugs);
	}

	// function drawCurationDrugs(value, $obj) {
	// 	$obj.html('')
	// 	if (value === null)
	// 		return $obj.html('');
	// 	var targets = value.split(',');
	// 	var html = [];
	// 	if (targets.length > 0) {
	// 		var data_content = '';
	// 		targets.forEach(function(target) {
	// 			// console.log(target);
	// 			var link = getDrugLink(target);
	// 			html.push(link);
	// 		});
	// 		data_content = data_content + '';
	// 		$obj.html(html.join('<span>, </span>'));
	// 	} else {
	// 		$obj.html(value);
	// 	}
	// }

	function getMiningDrugCount(value) {
		var count = 0;
		if (!Array.isArray(value) || value.length === 0)
			return count;

		var prev_drug_name = '';
		value.forEach(function(mining) {
			var name = mining.drug;
			if (name !== prev_drug_name) count++;

			prev_drug_name = name;
		});
		return count;
	}

	// var template = '<div class="popover" role="tooltip"><div class="arrow"></div><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h3 class="popover-title"></h3><div class="popover-content"></div></div>';
	// var template = '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>';

	function drawMiningdrugs(value) {
		if (!Array.isArray(value) || value.length === 0)
			return $miningdrugs.html('');

		var prev_drug_name = '';
		var items = {};
		value.forEach(function(mining) {
			// console.log(mining);
			var name = mining.drug;
			//TODO geneintext, aachange 등도 해야 함.
			// var regexp = new RegExp(mining.drugintext + '|' + mining.geneintext + '|' + mining.mutationintext, "gi");
			var regexp = new RegExp(mining.drugintext, "gi");
			// sentence = sentence.replace(mining.geneintext, '<em class=queryt>' + mining.geneintext + '</em>');
			var sentence = mining.sentence.replace(new RegExp(mining.drugintext, "g"), '<a target=drug class=text-success href=\'' + DRUG_URL + mining.drug + '\'>' + mining.drugintext + ' </a>');
			sentence = sentence.replace(new RegExp(mining.mutationintext, "g"), '<a target=mutatation class=text-danger href=\'' + MUTATION_URL + mining.mutationintext + '\'>' + mining.mutationintext + ' </a>');
			sentence = sentence.replace(new RegExp(mining.geneintext, "g"), '<a target=gene class=text-warning href=\'' + GENE_URL + mining.gene + '[Sym]) AND 9606[Taxonomy ID]\'>' + mining.geneintext + ' </a>');
			// '<span style="float:right;">PMID:<a target="pubmed" href="' + PUBMED_URL + name + '">' + name + '</a></span>'
			var data_content = '<li><p class=pubmed>' + sentence + '</p><div class=\'text-right\'>PMID: <a target=drug href=\'' + mining.pubmedlink + '\' title=\'' + mining.title + '\'>' + mining.pmid + '</a></div></li>';
			if (name !== prev_drug_name) {
				items[name] = {
					data_content: data_content,
					drugs_url: mining.drugs_url
				};
				prev_drug_name = name;
			} else {
				items[name].data_content = items[name].data_content + data_content;
			}
		});

		var html = [];
		Object.keys(items).forEach(function(name) {
			// console.log(items[name]);
			var drugs_url = items[name].drugs_url.split(',');
			var drug_url = getDrugLinkNew(name, drugs_url, true);
			console.log(drug_url);
			var data_content = '<ul class=\'list-unstyled\'>' + items[name].data_content + '</ul>';
			var data = '<a class="miningdrugs" tabindex="0" role="button" data-placement="bottom" data-trigger="focus" data-toggle="popover" data-html="true" data-viewport="#maincontent" title="Sentence - ' + drug_url + '" data-content="' + data_content + '">' + name + '</a>';
			html.push(data);
		});

		$miningdrugs.html(html.join('<span>, </span>'));
	}

	// function drawMiningdrugs_old(value) {
	// 	if (!Array.isArray(value) || value.length === 0)
	// 		return $miningdrugs.html('');
	//
	// 	var prev_drug_name = '';
	// 	var items = {};
	// 	value.forEach(function(mining) {
	// 		// console.log(mining);
	// 		var name = mining.drug;
	// 		//TODO geneintext, aachange 등도 해야 함.
	// 		// var regexp = new RegExp(mining.drugintext + '|' + mining.geneintext + '|' + mining.mutationintext, "gi");
	// 		var regexp = new RegExp(mining.drugintext, "gi");
	// 		// sentence = sentence.replace(mining.geneintext, '<em class=queryt>' + mining.geneintext + '</em>');
	// 		var sentence = mining.sentence.replace(new RegExp(mining.drugintext, "g"), '<a target=drug class=text-success href=\'' + DRUG_URL + mining.drug + '\'>' + mining.drugintext + ' </a>');
	// 		sentence = sentence.replace(new RegExp(mining.mutationintext, "g"), '<a target=mutatation class=text-danger href=\'' + MUTATION_URL + mining.mutationintext + '\'>' + mining.mutationintext + ' </a>');
	// 		sentence = sentence.replace(new RegExp(mining.geneintext, "g"), '<a target=gene class=text-warning href=\'' + GENE_URL + mining.gene + '[Sym]) AND 9606[Taxonomy ID]\'>' + mining.geneintext + ' </a>');
	// 		var data_content = '<p class=pubmed>' + sentence + '<var> [PMID: <a target=drug href=\'' + mining.pubmedlink + '\' title=\'' + mining.title + '\'>' + mining.pmid + '</a>]</var></p>';
	// 		if (name !== prev_drug_name) {
	// 			items[name] = {
	// 				data_content: data_content
	// 			};
	// 			prev_drug_name = name;
	// 		} else {
	// 			items[name].data_content = items[name].data_content + data_content;
	// 		}
	// 	});
	//
	// 	var html = [];
	// 	Object.keys(items).forEach(function(name) {
	// 		// console.log(items[name]);
	// 		var data = '<a class="miningdrugs" tabindex="0" role="button" data-placement="bottom" data-trigger="focus" data-toggle="popover" data-html="true" data-viewport="#maincontent" title="Sentence - ' + drug_url + '" data-content="' + items[name].data_content + '">' + name + '</a>';
	// 		html.push(data);
	// 	});
	//
	// 	$miningdrugs.html(html.join('<span>, </span>'));
	// }
	var level_title = {
		'1': 'FDA-approved',
		'2A': 'Standard care',
		'2B': 'Standard care',
		'3A': 'Clinical evidence',
		'3B': 'Clinical evidence',
		'4': 'Biological evidence',
		'R1': 'Resistance'
	};

	function getOncoKBDrugCount(value) {
		var count = 0;
		if (!Array.isArray(value) || value.length === 0)
			return count;

		value.forEach(function(oncokb) {
			count += oncokb.drugs.split(',').length;
		});
		return count;
	}

	function getDrugLinkNew(drug, drugs_url, multilink) {
		console.log('getDrugLinkNew', drug, drugs_url, multilink)
		if (!drugs_url) return drug;
		var url = [];
		if (multilink) {

			drug.split('+').forEach(function(item) {
				var link = drugs_url.shift();
				if (link && link != 'NULL') {
					link = link.replace('%NCI%', NCI_URL).replace('%DMED%', DAILYMED_URL);
					url.push('<a target=\'drug\' href=\'' + link + '\' >' + item + '</a>');
				} else {
					url.push(item);
				}
			});
		} else {
			var link = drugs_url.shift();;
			if (link && link != 'NULL') {
				link = link.replace('%NCI%', NCI_URL).replace('%DMED%', DAILYMED_URL);
				url.push('<a target=\'drug\' href=\'' + link + '\' >' + drug + '</a>');
			} else {
				url.push(drug);
			}
		}

		return url.join(' + ');
	};

	function drawFdaApprovedDrugs(drugs, $target, type) {
		if (!Array.isArray(drugs) || drugs.length === 0)
			return $target.html('');

		var html = [];
		drugs.forEach(function(drug) {
			var data = '<a data-toggle="modal" data-target="#drugModal" data-type="' + type + '" data-drug=\'' + JSON.stringify(drug) + '\'>' + drug.agent + '</a>';
			html.push(data);
		});

		$target.html(html.join('<span>, </span>'));
	}


	function getFdaApprovedDrugData1(obj, ref_pmids, pmids) {
		isLoading = true;
		// https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=17496201,20131302
		var data = {
			db: 'pubmed',
			retmode: 'json',
			id: pmids
		};
		var content = '<ul class="list-unstyled">';
		var spinner = obj.children('span');

		spinner.removeClass('hidden');
		$.ajax({ url: PUBMED_SUM_URL, data: data }).done(function(data) {
			console.log('success', data);
			if (data.result) {
				data.result.uids.forEach(function(name) {
					// console.log(data.result[name].title, data.result[name].sortfirstauthor, data.result[name].sortpubdate, data.result[name].source);
					content = content + '<li><p>' + data.result[name].title + '</p>' + '<var>' + data.result[name].sortfirstauthor + ' et al. ' + data.result[name].source + '</var>' + '<span style="float:right;">PMID:<a target="pubmed" href="' + PUBMED_URL + name + '">' + name + '</a></span>' + '</li>'; // , data.result[name].sortfirstauthor, data.result[name].sortpubdate, data.result[name].source);
				});
			}
			obj.attr('data-content', content + '</ul>');
			obj.popover('show');
		}).error(function(request, status, error) {
			alert('Error!');
		}).always(function() {
			isLoading = false;
			spinner.addClass('hidden');
		});
	}

	function getFdaApprovedDrugData2(obj, ref_pmids, pmids) {
		isLoading = true;
		// https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=17496201,20131302
		var content = '<ul class="list-unstyled">';
		var spinner = obj.children('span');

		spinner.removeClass('hidden');
		var refs = ref_pmids.split(',');
		refs.forEach(function(ref) {
			content = content + '<li></p>' + ref.split('|')[0] + '</p></li>';
		});
		obj.attr('data-content', content + '</ul>');
		obj.popover('show');
		isLoading = false;
		spinner.addClass('hidden');
	}

	function drawOncokbdrugs(value) {
		// console.log('oncokbdrugs', value);
		if (!Array.isArray(value) || value.length === 0)
			return $oncokbdrugs.html('');

		var html = [];
		value.forEach(function(oncokb) {
			// console.log('drug', oncokb);
			var drugs_url = oncokb.drugs_url.split(',');
			oncokb.drugs.split(',').forEach(function(drug) {
				var drug_url = getDrugLinkNew(drug, drugs_url, true);
				console.log('drug_url', drug, drug_url);
				var content = oncokb.cancer_type_full + oncokb.pmid_for_drug + oncokb.level;
				var spinner = '<span class="spinner hidden"><img src="/images/loading.gif" alt="Loading"/></span>';
				var title = drug_url + " - Level " + oncokb.level + ": " + level_title[oncokb.level]; // + ' ' + LEVEL_LINK;
				var data = '<a class="oncokbdrugs oncokb_level_' + oncokb.level + '" tabindex="0" role="button" data-placement="bottom" data-trigger="focus" data-toggle="popover" data-html="true" data-viewport="#maincontent" title="' + title + '" data-content="' + content + '" data-pmids="' + oncokb.pmid_for_drug + '">' + drug + '(' + oncokb.level + ')' + spinner + '</a>';
				html.push(data);
			});
		});
		$oncokbdrugs.html(html.join('<span>, </span>'));
	}

	function getOncoKBPubmedData(obj, pmids) {
		isLoading = true;
		// https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=17496201,20131302
		var data = {
			db: 'pubmed',
			retmode: 'json',
			id: pmids
		};
		var content = '<ul class="list-unstyled">';
		var spinner = obj.children('span');

		spinner.removeClass('hidden');
		$.ajax({ url: PUBMED_SUM_URL, data: data }).done(function(data) {
			// console.log('success', data);
			if (data.result) {
				data.result.uids.forEach(function(name) {
					// console.log(data.result[name].title, data.result[name].sortfirstauthor, data.result[name].sortpubdate, data.result[name].source);
					content = content + '<li><p>' + data.result[name].title + '</p>' + '<var>' + data.result[name].sortfirstauthor + ' et al. ' + data.result[name].source + '</var>' + '<span style="float:right;">PMID:<a target="pubmed" href="' + PUBMED_URL + name + '">' + name + '</a></span>' + '</li>'; // , data.result[name].sortfirstauthor, data.result[name].sortpubdate, data.result[name].source);
				});
			}
			obj.attr('data-content', content + '</ul>');
			obj.popover('show');
		}).error(function(request, status, error) {
			alert('Error!');
		}).always(function() {
			isLoading = false;
			spinner.addClass('hidden');
		});
	}

	table.on('load-success.bs.table', function(_event, _data, _args) {

		if (_data === undefined || _data.length === 0) {
			// Remove previous chart...
			$("div[id^=needleplot]").css("display", "none");
			return;
		}

		$("div[id^=needleplot]").css("display", "block");
		var data = _data[0];

		// params.classification = getClassificationParameter();

		// main.js에 있는 부분을 여기 써주는 이유는, 비동기로 데이터를 읽어오기 때문에, main.js 가 실행된 후에 table row 데이터가 들어오기 때문이다.
		$('[data-toggle="tooltip"]').tooltip();
		$('[data-toggle="popover"]').popover();

		table.bootstrapTable('check', 0); //first row check,
		// 첫번째 row를 check 하였기에 이벤트에서 처리함.
		// Init.requireJs(
		//     "analysis_needle",
		//     "/rest/needleplot?cancer_type=" + data.cancer_type + "&sample_id=" + data.sample_id + "&gene=" + data.gene + "&transcript=" + data.transcript + "&classification=" + getClassificationParameter() + "&filter=" + cohort.getFilterOption().join(',')
		// );
		//http://192.168.191.159/rest/needleplot?cancer_type=luad&sample_id=Pat99&gene=EGFR&transcript=ENST00000275493

		$drugstable.removeClass('hidden');
	});

	table.on('page-change.bs.table', function(_table, page, cnt) {
		table.bootstrapTable('check', ((page - 1) * cnt));
		// table.bootstrapTable('check', ((page * cnt) - cnt));
	});

	// table.on('all.bs.table', function(_name, _args) {
	//     console.log('All',_name, _args);
	// });
	// table.on('click-cell.bs.table', function(_event, _field, _value, _row, _args) {
	table.on('check.bs.table', function(_table, _row) {
		// console.log('selected');
		drawDrugs(_row);
		$('.selected').addClass('info').siblings().removeClass('info');
		// Init.requireJs(
		//     "analysis_needle",
		//     "/rest/needleplot?cancer_type=" + _row.cancer_type + "&sample_id=" + _row.sample_id + "&gene=" + _row.gene + "&transcript=" + _row.transcript + "&classification=" + getClassificationParameter() + "&filter=" + cohort.getFilterOption().join(',')
		// );

		// var chart = new Chart();

		// chart.view('/rest/needleplot?', {
		// 	'source': cohort.getCohortSource(),
		// 	'cancer_type': _row.cancer_type,
		// 	'sample_id': _row.sample_id,
		// 	'gene': _row.gene,
		// 	'transcript': _row.transcript,
		// 	'classification': getClassificationParameter(),
		// 	'filter': cohort.getFilterOption()
		// });

		var bcr = document.querySelector('#genemutationplot').getBoundingClientRect();
		var width = bcr.width;

		document.querySelector('#main').innerHTML = '';

		$.ajax({
			type: 'GET',
			url: '/rest/needleplot',
			data: {
				'source': cohort.getCohortSource(),
				'cancer_type': _row.cancer_type,
				'sample_id': _row.sample_id,
				'gene': _row.gene,
				'transcript': _row.transcript,
				'classification': getClassificationParameter(),
				'filter': cohort.getFilterOption()
			},
			success: function(d) {
				variants({
					element: '#main',
					width: Math.ceil(width),
					height: 400,
					data: {
						variants: d.data,
						type: _row.cancer_type.toUpperCase(),
					}
				})
			},
			error: function(e) {
				console.log(arguments);
			},
		});

		showIgv();
	});

	table.on('post-body.bs.table', function(_event, _data, _args) {
		$('[data-toggle="popover"]').popover();
	});

	var showIgv = function() {
		var data = table.bootstrapTable('getData');
		// $('.nav-tabs .active').text() 를 변수로 지정하지 않은 이유는, 변수로 지정할 경우
		// 아래 tab 이벤트 부분에서 이전에 등록될 때 가져온 변수를 계속 사용하기 때문이다.
		if ($('.nav-tabs .active').text() === 'Read Alignment Plot') {
			Igv.view('tab', getIndex(), data);
		} else {
			$('a[data-toggle="tab"]').off().on('shown.bs.tab', function(e) {
				if ($('.nav-tabs .active').text() !== 'Gene Mutation Plot') {
					Igv.view('tab', getIndex(), data);
				} else {
					// var chart = new Chart();
					var d = data[getIndex()];

					// chart.view('/rest/needleplot?', {
					// 	'source': cohort.getCohortSource(),
					// 	'cancer_type': d.cancer_type,
					// 	'sample_id': d.sample_id,
					// 	'gene': d.gene,
					// 	'transcript': d.transcript,
					// 	'classification': getClassificationParameter(),
					// 	'filter': cohort.getFilterOption()
					// });

					var bcr = document.querySelector('#genemutationplot').getBoundingClientRect();
					var width = bcr.width;

					document.querySelector('#main').innerHTML = '';

					$.ajax({
						type: 'GET',
						url: '/rest/needleplot',
						data: {
							'source': cohort.getCohortSource(),
							'cancer_type': d.cancer_type,
							'sample_id': d.sample_id,
							'gene': d.gene,
							'transcript': d.transcript,
							'classification': getClassificationParameter(),
							'filter': cohort.getFilterOption()
						},
						success: function(dd) {
							variants({
								element: '#main',
								width: Math.ceil(width) - 15,
								height: 400,
								data: {
									variants: dd.data,
									type: d.cancer_type.toUpperCase(),
								}
							})
						},
						error: function(e) {
							console.log(arguments);
						},
					});
				}
			});
		}
	};

	var getIndex = function() {
		var result = 0;

		$('input[name="btSelectItem"]:checked').each(function(index, ele) {
			result = $(ele).data().index;
		});

		return result;
	};

	// window.tsEvents = {
	//     'click #gene': function(_event, _value, _row, _index) {
	//         $(this).closest('tr').addClass('info').siblings().removeClass('info');
	//         Init.requireJs(
	//             "analysis_needle",
	//             "/rest/needleplot?cancer_type=" + _row.cancer_type + "&sample_id=" + _row.sample_id + "&gene=" + _row.gene + "&transcript=" + _row.transcript + "&classification=" + getClassificationParameter() + "&filter=" + cohort.getFilterOption().join(',')
	//         );
	//     }
	// };
});
