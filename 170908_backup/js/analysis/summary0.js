'use strict;';

function getDrugLink(value, userclass) {
  var array = value.split('|');
  var link = '';
  // console.log('value', value, 'array', array);
  if (array.length === 3) {
    var url;
    if (array[1] === 'N') {
      url = 'http://www.cancer.gov/about-cancer/treatment/drugs/';
    } else {
      url = 'http://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=';
    }
    link = '<a target=drug class=\'text-nowrap ' + userclass + '\' href=\'' + url + array[2] + '\'>' + array[0] + '</a>';
  } else {
    link = array[0];
  }
  // console.log(array, link);
  return link;
}

function drugPopoverFormatter(value, row, delimiter, title, userclass) {
  if (value === null) return '';
  delimiter = delimiter || ',';
  title = title || '';

  var targets = value.split(delimiter);
  // console.log(targets);
  if (targets.length > 0) {
    var data_content = '';
    targets.forEach(function(target) {
      data_content += getDrugLink(target, userclass) + '<br>';
    });

    var data = getDrugLink(targets[0], userclass) + ' ';
    if (targets.length > 1) {
      data += '<a tabindex="0" role="button" data-trigger="focus" data-container="body" data-placement="bottom" data-toggle="popover" data-html="true" title="' + title + '" data-content="' + data_content + '">' +
        '<span class="badge badge-link">' + targets.length + '</span></a>';
    }
    return data;
  }
}

function externalLink(target, link) {
  return ' <a target="' + target + '" href="' + link + '"><i class="fa fa-external-link" aria-hidden="true"></i></a> ';
}

// 화면 상단에 Variants 개수 표시해주기 위한 글로벌 변수.
var countOfAlterations = 0;

function renderingTable(cancer_type, sample_id, data) {
  var table = $('#implication_table');
  table.bootstrapTable({
    data: data,
    pagination: true,
    pageSize: 5,
    columns: [{
      field: 'gene',
      title: 'Gene',
      sortable: true,
      align: 'center',
      formatter: function(value, row) {
        // var url = 'http://www.ncbi.nlm.nih.gov/gene?term=(' + value + '[Sym]) AND 9606[Taxonomy ID]';
        // var obj = $('<a>').attr('href', url).attr('target', 'ncbi').text(value);
        // return obj[0].outerHTML;
        return value + externalLink('ncbi', 'http://www.ncbi.nlm.nih.gov/gene?term=(' + value + '[Sym]) AND 9606[Taxonomy ID]');
      }
    }, {
      field: 'alt',
      title: 'Genomic Alterations',
      sortable: true,
      align: 'center',
      formatter: function(value, row) {
        if (value === null) return '';
        var delimiter = ',';
        var title = 'Alterations';

        var targets = value.split(delimiter);
        // console.log(targets);

        countOfAlterations += targets.length;

        if (targets.length > 0) {
          var data_content = '';
          targets = targets.map(function(target) {
            return target.replace(/_Mutation/g, "");
          });
          targets.forEach(function(target) {
            data_content = data_content + '<span class=\'text-nowrap\' href=\'#\'>' + target + '</span><br>';
          });
          data_content = data_content + '';

          var data = '<span>' + targets[0].replace(/_Mutation/g, "") + '</span> ';
          var obj = $('<span>').text(targets[0] + ' ');
          if (targets.length > 1) {
            var a = $('<a>').attr('tabindex', 0).attr('role', 'button').attr('data-trigger', 'focus')
              .attr('data-container', 'body').attr('data-placement', 'bottom').attr('data-toggle', 'popover')
              .attr('data-html', 'true').attr('title', title).attr('data-content', data_content);
            a.append($('<span>').addClass('badge badge-link').text(targets.length));
            obj.append(a);
          }
          // return data;
          return obj[0].outerHTML;
        }
      }
    }, {
      field: 'fda_cancer',
      title: 'Approved Drugs in ' + cancer_type.toUpperCase(),
      sortable: true,
      align: 'center',
      formatter: function(value, row) {
        return drugPopoverFormatter(value, row, ',', 'FDA Approved', 'agent-red');
      },
    }, {
      field: 'fda_other_cancer',
      title: 'Approved Drugs in Others',
      sortable: true,
      align: 'center',
      formatter: function(value, row) {
        return drugPopoverFormatter(value, row, ',', 'FDA Approved', 'agent-blue');
      },
    }, {
      field: 'patientsOfPosition',
      title: 'Frequency in ' + cancer_type.toUpperCase(),
      sortable: true,
      align: 'center',
      formatter: function(value, row) {
        var frq = (row.patientsOfPosition / row.totalPatients * 100).toFixed(2);
        return frq + '% (' + row.patientsOfPosition + '/' + row.totalPatients + ')';
      },

    }, {
      field: 'mdAnderson',
      title: 'Cancer Gene?',
      sortable: true,
      align: 'center',
      width: '150px',
      formatter: function(value, row) {
        var driver = $('<div>').addClass('col-xs-6');
        var cosmic = $('<div>').addClass('col-xs-6');
        if (row.mdAnderson > 0) {
          var a = $('<a>').attr('href', '#').attr('data-toggle', 'modal')
            .attr('data-target', '#driveModal').attr('data-gene', row.gene)
            .append($('<span>').addClass('label label-danger').text('Driver'));
          driver.append(a);
        }

        if (row.countOfCOSMIC > 0) {
          cosmic.append($('<span>').addClass('label label-primary').text('COSMIC'));
        }
        return driver[0].outerHTML + cosmic[0].outerHTML;
      },
    }]
  });

  displayAlteration();

  table.on('load-success.bs.table', function(_event) {
    $('[data-toggle="popover"]').popover();
  });
}

function displayAlteration() {
  // console.log(countOfAlterations);
  var alteration_string = (countOfAlterations > 1) ? ' alterations' : ' alteration';
  $('#alterations').text(' ( ' + countOfAlterations + alteration_string + ' )');
}

$(function() {
  // Driver Gene을 클릭했을 경우, 모달을 띄운다.
  $('#driveModal').on('show.bs.modal', function(event) {
    var modal = $(this);
    var gene = $(event.relatedTarget).data('gene');
    $.ajax({
        method: "GET",
        url: "/models/drug/getDriveGeneInfo",
        data: {
          gene_id: gene,
        }
      })
      .done(function(data) {
        modal.find('.modal-title').html('<h3 class="modal-gene">' + gene + ' <small>Cancer Drug Target</small></h3> ');
        modal.find('.modal-body .overview').html(data[0].o_html);
        modal.find('.modal-body .alter').html(data[0].a_html);
        modal.find('.modal-body .therapeutic').html(data[0].t_html);
        // modal.find('.modal-body input').val('recipient');
      })
      .fail(function(data) {
        console.log('fail', data);
      });
  });
});
