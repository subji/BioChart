'use strict';

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('title', ['mouseHandler', 'tooltip'], factory);
  } else {
    factory(title);
  }
} (function (mouseHandler, tooltip)  {
  var getInfo      = function (name)  {
    return {
      'pq'             : { 'id' : '#sortPq'    , 'text' : '-log10(p-value)'    },
      'gene'           : { 'id' : '#sortGene'  , 'text' : '# Mutations'   },
      'participant_id' : { 'id' : '#sortSample', 'text' : '# Mutations' },
    }[name];
  }

  var getTranslate = function (x, y)  {
    return 'translate(' + x + ', ' + y + ')';
  }

  var mOver        = function (d)     {
    tooltip.show(this, 'sort by ' + d.name, 'rgba(178, 0, 0, 0.6)');
  }

  var mOut         = function (d)     {
    tooltip.hide();
  }

  return function (name, data, all)   {
    var info  = getInfo(name), el     = $(info.id);
    var width = el.width()   , height = el.height(), margin = 10;
    var svg   = d3.select(info.id)
                  .append('svg')
                  .attr({ 'width' : width, 'height' : height })
                  .append('g')
                  .data(data.map(function (d) {
                    d.name = info.text;

                    return d;
                  }))
                  .attr('transform', function (d) {
                    return {
                      'pq'             : getTranslate(margin, margin),
                      'gene'           : getTranslate(margin * 6, margin),
                      'participant_id' : getTranslate(margin * 10, margin * 8) + ' rotate(270)'
                    }[name];
                  })
                  .attr('cursor'   , 'pointer')
                  .attr('id'       , 'sortTitle')
                  .append('text')
                  .text(info.text)
                  .on({ 'mouseover' : mOver, 'mouseout' : mOut })
                  .on('click'      , function (d) {
                    mouseHandler.title(name, data, all);
                  });
  }
}));