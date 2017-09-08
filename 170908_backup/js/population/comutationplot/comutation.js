'use strict';

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('comutation', [
      'legend', 'format'  , 'gene', 'sample'  , 'scale',
      'group' , 'mutation', 'pq'  , 'patient' , 'title',
      'mouseHandler', 'sortHandler', 'jsx!toHTML', 'pdf'
    ], factory);
  } else {
    factory(comutation);
  }
} (function (legend     , format  , gene, sample , scale,
             group      , mutation, pq  , patient, title,
            mouseHandler, sortHandler, toHTML, pdf)  {
  var forERCSB          = function (data, genes)     {
    var result = [];

    for (var i = 0, l = data.length; i < l; i++)  {
      var d      = data[i];
      var isGene = false;

      for (var j = 0, ll = genes.length; j < ll; j++) {
        var g = genes[j];

        if (g.gene === d.gene)  {
          isGene = true;
        }
      }

      if (isGene) {
        result.push(d);
      }
    }

    return result;
  }

  var typeGenerate      = function (type_list)  {
    var typeIdentification = {
      '2' : 'CNV'    ,
      '0' : 'Somatic',
    };

    var result = [];

    function checkObject (list, target) {
      var is = undefined;

      list.forEach(function (d, i) {
        if (d.name === target)  {
          is = i;
        }
      });

      return is;
    }

    type_list.forEach(function (d)  {
      var idx = format().mut(d).idx.toString();
      var idt = format().variants(idx);
      var type = format().mut(d).name;
      var chk = checkObject(result, typeIdentification[idx]);

      if (idx === '2') {
        if (chk == undefined) {
          result.push({ 'name' : idt, 'checked' : true, 'list' : [
            { 'name' : type, 'a_checked' : true, 'parent' : idt }
          ] });
        } else {
          var chk2 = checkObject(result[chk].list, type);

          if (chk2 == undefined)  {
            result[chk].list.push({
              'name' : type, 'a_checked' : true, 'parent' : idt
            });
          }
        }
      } else if (idx === '0')  {
        if (chk == undefined) {
          result.push({ 'name' : idt, 'checked' : true, 'list' : [
            { 'name' : type, 'a_checked' : true, 'parent' : idt }
          ] });
        } else {
          var chk2 = checkObject(result[chk].list, type);

          if (chk2 == undefined)  {
            result[chk].list.push({
              'name' : type, 'a_checked' : true, 'parent' : idt
            });
          }
        }
      }
    });

    return result;
  }

  var reProcessing      = function (data, type)      {
    var result = [];
    // var list   =  $.merge(data.mutation_list, data.patient_list);
    var list = [];

    if (data.mutation_list)  {
      list = $.merge(data.mutation_list, data.patient_list);
    } else {
      list = data;
    }

    list.sort(function (a, b) {
      return (a[type] + a.type + a.order)
           < (b[type] + b.type + b.order) ? 1 : -1;
    });

    setObject(result, list[0], type);

    for (var i = 1, l = list.length; i < l; i++)  {
      var d = list[i], before = list[i - 1];

      if (d[type] === before[type] && d.type === before.type) {
        result[result.length - 1].count += 1;
      } else if (d[type] === before[type] && d.type !== before.type) {
        setObject(result, d, type);

        result[result.length - 1].index =
        result[result.length - 2].index +
        result[result.length - 2].count;
      } else {
        setObject(result, d, type);
      }
    }

    return result;
  }

  var setObject         = function (arr, data, type) {
    var obj          = {};
        obj[type]    = data[type];
        obj['idx']   = data.idx;
        obj['type']  = data.type;
        obj['color'] = data.color;
        obj['order'] = data.order;
        obj['count'] = 1;
        obj['index'] = 0;

    arr.push(obj);
  }

  var alignGene         = function (gene, gene_list) {
    var list = gene_list.map(function (d) {
      return d.gene;
    });

    return findNullGene(gene.sort(function (a, b) {
      return list.indexOf(a.gene) > list.indexOf(b.gene) ? 1 : -1;
    }), gene_list);
  }

  var findNullGene      = function (gene, gene_list) {
    gene_list.map(function (d, i)  {
      var is = false;

      gene.map(function (dd) {
        if (dd.gene === d.gene)  {
          is = true;

          return;
        }
      });

      if (!is)  {
        gene_list.splice(i, 1);
      }
    });

    return gene;
  }

  var getMax            = function (data, type)      {
    var add = 0, result = 0;

    for (var i = 0, l = data.length; i < l; i++)  {
      var before = i !== 0 ? data[i - 1] : data[i];
      var d      = data[i];

      if (before[type] === d[type]) {
        add += d.count;
      } else {
        add   += before.count;
        result = result > add ? result : add;
        add    = 0;
      }
    }

    return (Math.ceil(result / 10) * 10);
  }

  var getItem           = function (list, type)      {
    var result = [];

    for (var i = 0, l = list.length; i < l; i++)  {
      var d = list[i][type];

      if (result.indexOf(d) < 0)  {
        result.push(d);
      }
    }

    return result;
  }

  var mutationFormatter = function (data, type)      {
    for (var i = 0, l = data[type].length; i < l; i++)  {
      var d = data[type][i];
      var t = format().mut(d.type);

      d.color = t.color;
      d.order = t.order;
      d.type  = t.name;
      d.idx   = t.idx;
    }
  }

  // var settingContents = function (data) {
  //   var groupItems = settingGroupItems(data);
  //   var btnDiv     = '<div class="col-md-12">'
  //                  + '<button type="button" class="btn btn-default btn-sm" id="settingOk">'
  //                  + '<span class="glyphicon glyphicon-ok" aria-hidden="true">'
  //                  + ' Save </span></button>'
  //                  + '<button type="button" class="btn btn-primary btn-sm" id="settingCancel">'
  //                  + '<span class="glyphicon glyphicon-remove" aria-hidden="true">'
  //                  + ' Cancel </span></button></div>';

  //   return groupItems + btnDiv;
  // }

  // var settingGroupItems = function (data) {
  //   var prefix   = '<div class="list-group" id="settingList">' +
  //                  '<div class="list-group-item" id="settingListItems">' +
  //                  '<h4 class="list-group-item-heading">' +
  //                  '<span class="label label-default">Group Items</span></h4>' +
  //                  '<hr id="divider">';
  //   var contpre  = '<div class="checkbox"><label><input type="checkbox" ';
  //   var contpost = '</label></div>', postfix  = '</div></div>';
  //   var content  = '';

  //   data.group_list.forEach(function (d, i)  {
  //     content += contpre + 'value="' + d.name + '" id="groupItems"'
  //             + (d.checked ? ' checked' : '') + '>' + d.name + contpost;
  //   });

  //   return prefix + content + postfix;
  // }

  return function (data)                 {
    // if (data.data.isERCSB)  {
      // data.data.mutation_list =
      // forERCSB(data.data.mutation_list, data.data.gene_list);
    // }

    // var test = 0;
    // data.data.mutation_list.map(function (d, i) {
    //   if (d.type === 'Missense_Mutation') {
    //     test += 1;
    //   }
    // })

    // console.log(test);

    mutationFormatter(data.data, 'mutation_list');
    mutationFormatter(data.data, 'patient_list');

    var typelist    = getItem(data.data.mutation_list, 'type');
    var regene      = alignGene(reProcessing($.extend(true, [], data.data), 'gene'),
                               data.data.gene_list);
    var resample    = reProcessing($.extend(true, [], data.data), 'participant_id');

    format().makeGroupData(data.data);

    data.data.group_list.forEach(function (d) {
      d.checked = true;
    });

    data.data.init_width          = $('#comutation').width();
    data.data.init_height         = $('#comutation').height();
    data.data.gene_name           = getItem(regene, 'gene');
    data.data.participant_id_name = sortHandler.exclusive(getItem(
    data.data.mutation_list, 'participant_id'), data.data);
    data.data.gene_max            = getMax(regene  , 'gene');
    data.data.participant_id_max  = getMax(resample, 'participant_id');
    data.data.resample            = resample;
    data.data.regene              = regene;
    data.data.type_list           = typeGenerate(typelist);

    mouseHandler.scroll();

    // var groupConfig = $('#group_config').popover({
    //   'container' : 'body'         ,
    //   'html'      : true           ,
    //   'title'     : 'Group setting',
    //   'content'   : function ()  {
    //     if (data.data.group_list.length === 0)  {
    //       return '<div class="alert alert-danger" role="alert">No Data</div>';
    //     }
    //   }
    // });

    var typeConfig  = $('#type_config').popover({
      'container' : 'body'        ,
      'html'      : true          ,
      'title'     : 'Type setting',
      'content'   : function () {
        if (data.data.type_list.length === 0) {
          return '<div class="alert alert-danger" role="alert">No Data</div>';
        }
      }
    });

    // Group item adjust array
    // groupConfig
    // .on('inserted.bs.popover', function ()  {
    //   // ReactJS 의 jsx 를 활용하기 위해서 inserted 이벤트를 사용하였다.
    //   $('.popover-content').attr('id', 'popoverContent');

    //   if (data.data.group_list.length > 0)  {
    //     toHTML.groupSelector(data.data);
    //   }
    // })
    // .on('hidden.bs.popover', function (e)  {
    //   // avoid to bug that need to click twice for showing popover
    //   $(e.target).data("bs.popover").inState.click = false;
    // })
    // .on('shown.bs.popover', function () {
    //   var popup = $(this);

    //   $('#settingCancel').click(function (e)  {
    //     popup.popover('hide');
    //   });

    //   $('#settingOk').click(function (e)  {
    //     var settingData = $.extend(true, [], data.data.group_list);

    //     d3.selectAll('#groupName svg, #group svg, #groupPatient svg')
    //       .remove();

    //     $('input[type="checkbox"]').map(function (i, d)  {
    //       data.data.group_list.forEach(function (gd, gi)  {
    //         if (gd.name === d.value)  {

    //           gd.checked = d.checked;
    //         }
    //       });
    //     });

    //     for (var i = data.data.group_list.length - 1, l = 0; i >= l; i--)  {
    //       var d = data.data.group_list[i];

    //       if (!d.checked) {
    //         settingData.splice(i, 1);
    //       }
    //     }

    //     group(data.data, settingData);
    //     patient(resample, data.data, settingData);

    //     popup.popover('hide');
    //   });
    // });

    typeConfig
    .on('inserted.bs.popover', function ()  {
      // ReactJS 의 jsx 를 활용하기 위해서 inserted 이벤트를 사용하였다.
      $('.popover-content').attr('id', 'popoverContent');

      if (data.data.type_list)  {
        toHTML.typeSelector(data.data);
      }
    })
    .on('hidden.bs.popover', function (e)  {
      // avoid to bug that need to click twice for showing popover
      $(e.target).data("bs.popover").inState.click = false;
    })
    .on('shown.bs.popover', function () {
      var popup  = $(this);

      $('#type-set-cancel').click(function (e)  {
        popup.popover('hide');
      });

      $('#type-set-ok').click(function (e)  {
        var unchecked     = [];
        var mutation_list = $.extend(true, [], data.data.mutation_list);

        $('input[type="checkbox"]').map(function (i, d)  {
          if (!d.checked) {
            if (unchecked.indexOf(d.name) > -1 || unchecked.length === 0) {
              unchecked.push(d.name);
            }
          }
        });

        mutation_list.map(function (d, i) {
          if (unchecked.indexOf(format().mut(d.type).name) > -1) {
            mutation_list.splice(i, i);
          }
        });

        console.log(mutation_list)

        popup.popover('hide');
      });
    });

    scale(data.data);
    group(data.data);
    mutation(data.data);
    gene(regene                                     , data.data);
    sample(resample                                 , data.data);
    patient(resample                                , data.data);
    pq(data.data.gene_list                          , data.data);
    title('gene'               , regene             , data.data);
    title('participant_id'     , resample           , data.data);
    title('pq'                 , data.data.gene_list, data.data);
    legend({ 'data'  : typelist, 'chart' : 'comutation' });

    mouseHandler.horizontal(
      sortHandler.exclusive(data.data.participant_id_name, data.data).concat([])
    , data.data);
  }
}));