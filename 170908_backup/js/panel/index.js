$(function() {
	// find user locale for date format
	// var locLang = (navigator.language) ? navigator.language : navigator.userLanguage;
	// var userLocale = locLang.substring(0, 2) || 'en';
	// moment.locale(userLocale);
	moment.locale('ko');

	var checkformatter = function(value, row, index) {
		return (value === 1) ? '<i class="fa fa-check"></i>' : '';
	};

	var resultFormatter = function(value, row, index) {
		if (!value) return '';
		var atag = '<a href="/models/sample?sample_id=' + row.sample_id + '" title="Sample status">';
		if (value === 'EX')
			return '<span class="label label-danger link_only_cursor">Error</span>';
		if (value === 'E2')
			return atag + '<span class="label label-primary step-4 link_only_cursor">All Done</span></a>';
		if (value[0] === 'E')
			return atag + '<span class="label label-primary step-3 link_only_cursor">In Analysis</span></a>';
		return value;
	};

	var table = $('#table');
	table.bootstrapTable({
		url: '/models/sample/panel_list',
		classes: 'table table-hover table-striped',
		method: 'get',
		search: true,
		showRefresh: true,
		showColumns: false,
		pagination: true,
		toolbar: "#toolbar",
		toolbarAlign: 'right',
		pageSize: 10,
		cookie: true,
		cookieIdTable: 'saveId',
		cookieExpire: '1mi',
		sortName: 'cnt',
		sortOrder: 'desc',
		columns: [{
			title: '#',
			align: 'center',
			formatter: function(value, row, index) {
				return index + 1;
			}
		}, {
			field: 'sample_id',
			title: 'Sample ID',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				row.analysis_flag = (row.pnl_normal_ok === 1 && row.pnl_tumor_ok === 1) ? 'Y' : 'N';
				return (row.analysis_flag === 'Y') ? '<span class="link" title="View analysis results">' + value + '</span>' : value;
			}
		}, {
			field: 'cancer_type',
			title: 'Type',
			sortable: true,
			align: 'center',
			formatter: function(value, row) {
				return value.toUpperCase();
			}
		}, {
			field: 'fullname',
			title: 'Requester',
			sortable: true,
			align: 'center',
		}, {
			field: 'sequencing_inst',
			title: 'Seq.Inst.',
			sortable: true,
			align: 'center',
		}, {
			field: 'pnl_normal_final',
			title: 'Panel Seq.(N)',
			sortable: false,
			align: 'center',
			formatter: resultFormatter
		}, {
			field: 'pnl_tumor_final',
			title: 'Panel Seq.(T)',
			sortable: false,
			align: 'center',
			formatter: resultFormatter
			// }, {
			//   field: 'wts_normal_final',
			//   title: 'WTS(N)',
			//   sortable: false,
			//   align: 'center',
			//   formatter: resultFormatter
			// }, {
			//   field: 'wts_tumor_final',
			//   title: 'WTS(T)',
			//   sortable: false,
			//   align: 'center',
			//   formatter: resultFormatter
		}, {
			field: 'insert_date',
			title: 'Req. Date',
			sortable: true,
			align: 'center',
			width: '15%',
			formatter: function(value, row, index) {
				var date = new Date(value);
				return moment(date).fromNow();
			}
			// }, {
			//   field: 'clinical',
			//   title: 'Clinical',
			//   align: 'center',
			//   formatter: function(value, row, index) {
			//     return (value === 'Y') ? '<a href="/models/sample?sample_id=' + row.sample_id + '#clinical" title="View clinical data"><i class="fa fa-check"></i></a>' : '';
			//     // return '<a href="#">'+value+'</a>';
			//   }
		}, {
			field: 'comments',
			title: 'Comment',
			align: 'center',
		}]
	});

	$('#registerButton').on('click', function() {
		location.href = '/menu/sample/register_panel';
	});

	table.on('click-cell.bs.table', function(event, field, value, row, $element) {
		// console.log(field, value, row, $element);
		var source = 'GDAC'; // Default Cohort
		if (field === 'sample_id' && row.analysis_flag === 'Y') {
			// console.log($element);
			$.ajax({
					method: "GET",
					url: "/models/cohort",
					data: {
						source: source,
						cancer_type: row.cancer_type
					}
				})
				.done(function(cnt) {
					console.log('data', cnt);
					var params = $.param({
						sample_id: row.sample_id
					});
					cohort.init(source, cnt);
					location.href = '/menu/analysis/first?' + params;
				})
				.fail(function(data) {
					console.log('fail', data);
				});
		} else if (field.endsWith('_final')) {

		}
	});
});
