$(function() {
  'use strict';

  var mutatedGeneList = [];
  var pathwayList = [];

  function addTab(gene) {
    var tableId = gene + 'table';
    // create the tab
    $('<li><a href="#tab' + gene + '" data-toggle="tab">' + gene + '</a></li>')
      .appendTo('#patient_tab');
    // create the tab content
    $('<div class="tab-pane" id="tab' + gene + '"><table id="' + tableId + '"></table></div>')
      .appendTo('#patient_tabcontent');
    return $('#' + tableId);
  }

  function popoverFormatter(value, row, delimiter, title) {
    if (value === null) return '';
    delimiter = delimiter || ',';
    title = title || '';

    var targets = value.split(delimiter);
    // console.log(targets);
    if (targets.length > 0) {
      var data_content = '';
      targets.forEach(function(target) {
        target = target.replace(/'/g, "\'");
        data_content = data_content + '<span class=\'text-nowrap\' href=\'#\'>' + target + '</span><br>';
      });
      data_content = data_content + '';

      var data = '<span>' + targets[0] + '</span> ';
      if (targets.length > 1) {
        data += '<a tabindex="0" role="button" data-trigger="focus" data-container="body" data-placement="bottom" data-toggle="popover" data-html="true" title="' + title + '" data-content="' + data_content + '">' +
          '<span class="badge badge-link">' + targets.length + '</span></a>';
      }
      return data;
    }
  }

  function agentFormatter(value, row) {
    var type_class;
    switch (row.drug_type) {
      case 'type1':
        type_class = 'agent-red';
        break;
      case 'type2':
        type_class = 'agent-blue';
        break;
      case 'type3':
        type_class = 'agent-black';
        break;
    }
    // console.log(row.nci_id, row.dailymed_id);
    var url = null;
    if (row.nci_id !== null)
      url = 'http://www.cancer.gov/about-cancer/treatment/drugs/' + row.nci_id;
    else if (row.dailymed_id !== null)
      url = 'http://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + row.dailymed_id;

    if (url !== null)
      return '<a target=drug class="underline ' + type_class + '" href="' + url + '">' + value + '</a>';
    else
      return '<span class="' + type_class + '">' + value + '</span> ';
  }

  function createTable(table, data) {
    table.bootstrapTable({
      data: data,
      classes: 'table table-striped table-hover',
      pagination: true,
      pageSize: 5,
      columns: [{
        field: 'gene',
        title: 'Altered Gene',
        width: '100px',
        align: 'left',
        sortable: true,
        formatter: function(value, row) {
          return '<a class="agent-black" target=\'ncbi\' href="http://www.ncbi.nlm.nih.gov/gene?term=(' + value + '[Sym]) AND 9606[Taxonomy ID]">' + value + '</a>';
        },
      }, {
        field: 'targeted_agent',
        title: 'Drug',
        width: '150px',
        align: 'left',
        sortable: true,
        formatter: agentFormatter,
      }, {
        field: 'drug_class',
        title: 'Levels of approval',
        width: '150px',
        align: 'left',
        sortable: true,
      }, {
        field: 'treated_cancer',
        title: 'Treated Cancer',
        width: '200px',
        align: 'left',
        sortable: true,
      }, {
        field: 'cancer_subtype',
        title: 'Cancer Subtype',
        width: '300px',
        align: 'left',
        sortable: true,
      }, {
        field: 'ref',
        title: 'Reference',
        width: '350px',
        align: 'left',
        sortable: true,
        formatter: function(value, row) {
          return popoverFormatter(value, row, '^', 'Reference');
        },
      }, {
        field: 'pathway_name',
        title: 'Pathway',
        width: '200px',
        align: 'left',
        sortable: true,
      }, ]
    });
    $('[data-toggle="popover"]').popover();

    table.on('post-body.bs.table', function(_event, _data, _args) {
      $('[data-toggle="popover"]').popover();
    });
  }

  function isInAlteredGeneList(array, name) {
    // console.log(array,name);
    for (var i = 0; i < array.length; i++) {
      if (array[i].gene === name) {
        return true;
      }
    }
    return false;
  }

  function getDrugListByCancer() {
    $('#pathwayLoadIndicator').show();

    $.ajax({
        method: "GET",
        url: "/models/drug/getDrugListByCancer",
        data: {
          source: cohort.getCohortSource(),
          cancer_type: $('#cancer_type').val(),
          sample_id: $('#sample_id').val(),
        }
      })
      .done(function(data) {
        //if no data found, show message.
        if (!data || data.length === 0)
          return $('#pathwayAlert').show();

        var prevPathway = '';
        var pathway;
        data.forEach(function(data) {
          if (data.pathway_name !== prevPathway) {
            pathway = {
              pathway: data.pathway_name,
              data: []
            };
            pathwayList.push(pathway);
          }
          pathway.data.push(data);
          prevPathway = data.pathway_name;
        });
        // console.log('geneList', geneList);
        pathwayList.forEach(function(pathway) {
          // console.log('pathway',pathway);
          pathway.geneList = [];
          var prevGene = '';
          var gene;
          pathway.data.forEach(function(data) {
            if (data.gene !== prevGene) {
              gene = {
                gene: data.gene,
                data: []
              };
              pathway.geneList.push(gene);
            }
            gene.data.push(data);
            prevGene = data.gene;
          });
          // var table = addTab(gene.gene);
          // createTable(table, gene.data);
        });

        // Render Pathway list
        pathwayList.forEach(function(pathway) {
          var str = '<tr><td>' + pathway.pathway + '</td><td>';
          pathway.geneList.forEach(function(gene) {
            var classList = 'genename';
            if (isInAlteredGeneList(mutatedGeneList, gene.gene)) {
              classList += ' alteredgenename';
            }
            // console.log(geneList.gene,gene.gene);
            str += '<div class="gene"><span class="' + classList + '">' + gene.gene + '</span><span> </span><span class="badge">' + gene.data.length + '</span></div>';
          });
          str += '</td></tr>';
          // console.log('pathway', str);
          $('#pathwayTable > tbody:last-child').append(str);
        });

        // init
        if (pathwayList.length > 0) {
          $('.genename:first').addClass('underline');
          $('#cancer_table').bootstrapTable('destroy');
          createTable($('#cancer_table'), pathwayList[0].geneList[0].data);
          // $('[data-toggle="popover"]').popover();
        }

        // Register genename click event
        $('.genename').click(function() {
          // $(this).addClass('underline').siblings().removeClass('underline');
          $('.genename').removeClass('underline');
          $(this).addClass('underline');
          var genename = $(this).text();

          /*
          pathwayList.forEach(function(pathway) {
              pathway.geneList.forEach(function(gene) {
                  // console.log(gene.gene, genename);
                  if (gene.gene === genename) {
                      $('#cancer_table').bootstrapTable('destroy');
                      createTable($('#cancer_table'), gene.data);
                      // $('[data-toggle="popover"]').popover();
                      return;
                  }
              });
          });
          */
          //위 코드를 for-break 문으로 좀 더 빨리 실행하도록 수정함.
          outerloop:
            for (var i = 0; i < pathwayList.length; i++) {
              var geneList = pathwayList[i].geneList;
              for (var j = 0; j < geneList.length; j++) {
                if (geneList[j].gene === genename) {
                  $('#cancer_table').bootstrapTable('destroy');
                  createTable($('#cancer_table'), geneList[j].data);
                  break outerloop;
                }
              }
            }
        });
        // $('#patient_tab a:first').tab('show');
        // $('[data-toggle="popover"]').popover();
      })
      .fail(function(data) {
        console.log('fail', data);
      })
      .always(function() {
        $('#pathwayLoadIndicator').hide();
      });
  }

  //Start program
  $('#geneLoadIndicator').show();
  $.ajax({
      method: "GET",
      url: "/models/drug/getDrugListByPatient",
      data: {
        cancer_type: $('#cancer_type').val(),
        sample_id: $('#sample_id').val(),
      }
    })
    .done(function(data) {
      //if no data found, show message.
      if (!data || data.drugs.length === 0)
        return $('#geneAlert').show();

      // console.log(data);
      var genenames = data.geneset.split(',');
      genenames.forEach(function(genename) {
        mutatedGeneList[genename] = [];
      });

      data.drugs.forEach(function(drug) {
        mutatedGeneList[drug.gene].push(drug);
      });

      // console.log('geneList', geneList);
      genenames.forEach(function(gene) {
        // console.log('gene',gene);
        var table = addTab(gene);
        createTable(table, mutatedGeneList[gene]);
      });
      $('#patient_tab a:first').tab('show');

    })
    .fail(function(data) {
      alert('fail: ' + data);
    })
    .always(function() {
      getDrugListByCancer();
      $('#geneLoadIndicator').hide();
    });
});
