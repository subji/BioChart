$(function() {
	$('#ex1').slider({
		tooltip: 'show',
		tooltip_position: 'bottom',
		formatter: function(value) {
			//- return 'Current value: ' + value;
			return value;
		}
	});
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
		$('#table').bootstrapTable('refresh', {});
	});

	var getClassificationParameter = function() {
		if ($('#classification_all').prop('checked')) {
			return $('#classification_all').val();
		}
		var checked = [];
		$('input[type=checkbox][name=classification]:checked').each(function(_i, _o) {
			checked.push(_o.value);
		});
		return checked.join(',');
	};

	var table = $('#table');

	table.bootstrapTable({
		// url: '/models/patient/getSampleVariantList',
		classes: 'table',
		// method: 'get',
		cache: true, // False to disable caching of AJAX requests.
		// showColumns: true,
		// showRefresh: true,
		// sortName: 'gene',
		// sortName: 'patientsOfPosition',
		// sortable: true,
		// sortOrder: 'desc',
		//ajax: ajaxRequest,
		//sidePagination: 'server', // 이부분이 없으면 ajax 콜이 이루어지지 않는다.
		pagination: true,
		pageSize: 5,
		// queryParams: function(params) {
		// 	params.sample_id = $('#sample_id').val();
		// 	params.cancer_type = $('#cancer_type').val();
		// 	params.frequency = $('#ex1').val();
		// 	params.classification = getClassificationParameter();
		// 	params.cosmic = $('input[type=checkbox][name=cosmic]').prop('checked') ? 'Y' : 'N';
		// 	console.log('params:', params);
		// 	return params;
		// },
		rowStyle: function(row, index) { // make first row active
			if (index === 0) return {
				classes: 'info'
			};
			return {};
		},
		columns: [{
			field: 'gene',
			title: 'Gene',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				//var params = [row.cancer_type, row.sample_id, row.gene, row.transcript];
				return '<a href="#" id="gene">' + value + '</a> ';
			},
			events: 'tsEvents', // needleplot.js
		}, {
			field: 'transcript',
			title: 'Transcript',
			sortable: false,
			visible: false,
			align: 'center',
			formatter: function(value, row) {
				//var params = [row.cancer_type, row.sample_id, row.gene, row.transcript];
				return '<a href="#" id="transcript">' + value + '</a> ';
			},
			// events: 'tsEvents', // needleplot.js
		}, {
			field: 'class',
			title: 'Classification',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				return value.replace('_Mutation', '');
			}
		}, {
			field: 'cds',
			title: 'CDS Change',
			align: 'center',
		}, {
			field: 'alt',
			title: 'AA Change',
			align: 'center',
		}, {
			field: 'pdomain',
			title: 'Protein Domain',
			align: 'center',
			formatter: function(value, row) {
				if (value === undefined || value === '') return '';
				var info = '<a href="#"><i class="fa fa-info-circle" data-toggle="tooltip" data-placement="top" title="' + row.pdomain_desc + '"></i></a>';
				var span = '<span>' + value + ' </span>';
				return span + info;
			}
		}, {
			field: 'pdomain_desc',
			title: 'Domain Description',
			align: 'center',
			visible: false,
		}, {
			field: 'patientsOfPosition',
			title: 'Frq. in Gene',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				var pct = 0;
				if (row.patientsOfTranscript !== 0) pct = (row.patientsOfPosition / row.patientsOfTranscript) * 100;
				return pct.toFixed(2) + '%' + ' (' + row.patientsOfPosition + '/' + row.patientsOfTranscript + ')';
			}
		}, {
			field: 'patientsOfPosition',
			title: 'Frq. in Total',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				var pct = 0;
				var patientsOfCancer = cohort.getFilteredCount();
				if (patientsOfCancer !== 0) pct = (row.patientsOfPosition / patientsOfCancer) * 100;
				return pct.toFixed(2) + '%' + ' (' + row.patientsOfPosition + '/' + patientsOfCancer + ')';
			}
		}, {
			field: 'target',
			title: 'Actionable target?',
			align: 'center',
		}]
	});


	// custom your ajax request here
	function ajaxRequest() {
		$.ajax({
				method: "GET",
				url: "/models/patient/getSampleVariantList",
				data: {
						sample_id : $('#sample_id').val(),
						cancer_type : $('#cancer_type').val(),
						frequency : $('#ex1').val(),
						classification : getClassificationParameter(),
						cosmic : 'N'//$('input[type=checkbox][name=cosmic]').prop('checked') ? 'Y' : 'N',
				}
			})
			.done(function(data) {
				 $('#table').bootstrapTable('load', data);
			})
			.fail(function(data) {
				alert('fail', data);
			});
	}

	ajaxRequest();
	// table.on('load-success.bs.table', function(_event, _data, _args) {
	// 	if (_data === undefined || _data.length === 0) {
	// 		// Remove previous chart...
	// 		$("div[id^=needleplot]").css("display", "none");
	// 		return;
	// 	}
	//
	// 	$('[data-toggle="tooltip"]').tooltip();
	// 	$("div[id^=needleplot]").css("display", "block");
	// 	var data = _data[0];
	//
	// 	// params.classification = getClassificationParameter();
	//
	//
	// 	Init.requireJs(
	// 		"analysis_needle",
	// 		"/rest/needleplot?cancer_type=" + data.cancer_type + "&sample_id=" + data.sample_id + "&gene=" + data.gene + "&transcript=" + data.transcript + "&classification=" + getClassificationParameter()
	// 	);
	// 	//http://192.168.191.159/rest/needleplot?cancer_type=luad&sample_id=Pat99&gene=EGFR&transcript=ENST00000275493
	// });

	//
	table.on('click-row.bs.table', function(_event, _data, _args) {
		$(_args[0]).addClass('info').siblings().removeClass('info');
	});

	window.tsEvents = {
		'click #gene': function(_event, _value, _row, _index) {
			Init.requireJs(
				"analysis_needle",
				"/rest/needleplot?cancer_type=" + _row.cancer_type + "&sample_id=" + _row.sample_id + "&gene=" + _row.gene + "&transcript=" + _row.transcript + "&classification=" + getClassificationParameter()
			);
		}
	};

	// Jquery UI tooltip init.
	//$(document).tooltip();
	$('[data-toggle="tooltip"]').tooltip();
});
