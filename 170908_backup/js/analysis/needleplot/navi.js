'use strict';

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('navi', [], factory);
  } else {
    factory(navi);
  }
} (function ()  {
  var drawBorder      = function (ele, x, y, w, h, fn)  {
    ele.append('rect')
       .attr('id'    , x <= 0 ? 'bdLeft' : 'bdRight')
       .attr('cursor', 'ew-resize')
       .attr({  'x'     : x        , 'y'      : y })
       .attr({  'width' : w        , 'height' : h })
       .style({ 'fill'  : '#dbdbdb', 'stroke' : '#dbdbdb' })
       .call(d3.behavior.drag().origin(Object).on('drag', fn));
  }

  var Drag            = function (info)                 {
    var rwidth = (info.width - info.margin);

    return {
      'moveTo'  : function (d)  {
        var el = getNaviElements(), e = d3.event;

        d3.select('#box')
          .attr('x'    , function (d)  {
            return Math.max(el('x').l + el('width').l, 
                   Math.min(el('x').r - el('width').b, e.x));
          })
          .on('mouseup', function (d) {
            rwidth = el('x').r;
          });

        d3.select('#bdRight')
          .attr('x', function (d)  {
            return Math.max((el('x').l + el('width').l + el('width').b), 
                   Math.min((info.width - info.margin), (e.x + el('width').b)));
          });

        d3.select('#bdLeft')
          .attr('x', function (d)  {
            return d.x = Math.max(0, 
                         Math.min((el('x').b - info.margin), e.x));
          });

        changeScale(info, el('x').b, el('width').b);
      },
      'toRight' : function (d) {
        var el = getNaviElements(), e = d3.event, now = 0;

        d3.select('#box')
          .attr('width', function (d)  {
            return d.width = Math.max(0, 
                             Math.min((el('x').r - el('x').b),
                             (info.width - info.margin) + e.x));
          });

        d3.select('#bdRight')
          .attr('x', function (d)  {
            if ((rwidth + e.x) - el('x').l >= (info.width - info.margin)) {
              now     = (info.width - info.margin);
              rwidth  = (info.width - info.margin);
            } else {
              now     = (rwidth + e.x) - el('x').l;
            }

            return Math.max(el('x').b, 
                   Math.min((info.width - info.margin), now));
          })
          .on('mouseup', function (d) {
            rwidth = now;
          });

        changeScale(info, el('x').b, el('width').b);
      },
      'toLeft'  : function (d)  {
        var el = getNaviElements(), e = d3.event;

        d3.select('#bdLeft')
          .attr('x'    , function (d) {
            if (el('x').l === 0)  {
              el('x').l = 0;
            }

            return d.x = Math.max(0, 
                         Math.min((el('x').r - el('width').l), e.x));
          })
          .on('mouseup', function (d) {
            rwidth = rwidth;
          });

        d3.select('#box')
          .attr('width', function (d)  {
            return d.width = (el('x').r - el('x').l) - info.margin;
          })
          .attr('x'    , function (d) {
            return Math.max((el('x').l + el('width').l),
                   Math.min(el('x').r, e.x));
          });

        changeScale(info, el('x').b, el('width').b);
      }  
    }
  }

  var getNaviElements = function ()                     {
    return function (type)  {
      return {
        b : +d3.select('#box').attr(type)    ,
        l : +d3.select('#bdLeft').attr(type) ,
        r : +d3.select('#bdRight').attr(type)
      }
    }
  }

  var disappear       = function (pos, info)            {
    return pos <= info.margin ? (-info.width) 
         : pos < (info.width  - info.margin) 
         ? pos : (info.width  * 2);
  }

  var changeScale     = function (info, posx, w)        {
    info.y.range([(info.height - (info.margin * 3)), info.margin]);

    var reverse = d3.scale.linear()
                    .domain([info.margin, (info.width - info.margin)])
                    .range([0           , info.data.data.graph[0].length])
                    .clamp(true);
    var start   = reverse(posx), end = reverse(posx + w);
    var x       = d3.scale.linear()
                    .domain([start     , end])
                    .range([info.margin, (info.width - info.margin)])
                    .clamp(true);

    var graph   = d3.selectAll('#graphGroup')
                    .attr('transform', function (d) {
                        if (d.display)  {
                          return 'translate(' + x(d.start) 
                               + ', ' +  (info.height - info.margin) + ')';
                        }

                        d3.select(this).remove();
                    });

    graph.selectAll('rect')
         .attr('width', function (d)  {
            return x(d.end) - x(d.start);
         });

    graph.selectAll('text')
         .select('tspan')
         .attr('x', function (d)  {
            return x(d.start) !== info.margin 
                 ? 3 : disappear(x(d.start), info);
         });

    d3.select('#xAxis')
      .call(d3.svg.axis().scale(x).tickPadding(10))
      .selectAll('text').style('font-size', '10px');

    d3.selectAll('#markerGroup')
      .attr('transform', function (d)  {
         return 'translate(' + disappear(x(d.position), info) 
              + ', ' + (info.y(d.index) + info.margin) + ')';
      });

    d3.selectAll('#patients')
      .attr('transform', function (d) {
        return 'translate(' + disappear(x(d.position), info) 
             + ', ' + (info.height - (info.margin / 1.25)) + ')';
      });
  }

  return function (data, stack, opt, size)              {
    var width  = size.width, height = $('#navi').height();
    var margin = size.margin;
    var svg    = d3.select('#navi')
                   .append('svg')
                   .attr('id'       , 'navi')
                   .attr({ 'width' : width, 'height' : height })
                   .append('g')
                   .attr('transform', 'translate(0, 0)');
    var y      = opt.y.range([0, height]);

    var drag   = Drag({
      'width' : width, 'height' : size.height, 'margin' : margin ,
      'data'  : data , 'y'      : opt.y      , 'max'    : opt.max,
    });

    var bar    = svg.selectAll('#naviBar')
                    .data(stack)
                    .enter().append('g')
                    .attr('id'       , 'naviBar')
                    .attr('transform', function (d)  {
                       return 'translate(' + opt.x(d.position) + ', ' 
                            + (height - y(d.index + d.count))  + ')';
                    })
                    .append('rect')
                    .attr('width'    , 1)
                    .attr('height'   , function (d) {
                       return y(d.count);
                    });

    var group  = svg.insert('g', 'g')
                    .data([{
                       'x' : 0, 'width'  : (width - margin),
                       'y' : 0, 'height' : height
                    }])
                    .style('fill', '#eaeaea');

    var box    = group.append('rect')
                      .attr('id'    , 'box')
                      .attr('cursor', 'move')
                      .attr('x'     , function (d)  {
                        return (d.x + margin);
                      })
                      .attr('y'     , function (d)  {
                        return d.y;
                      })
                      .attr('width' , function (d)  {
                        return (d.width - margin);
                      })
                      .attr('height', function (d)  {
                        return d.height;
                      })
                      .call(d3.behavior.drag()
                              .origin(Object)
                              .on('drag', drag.moveTo));


    drawBorder(group, (width - margin), 0, margin, height, drag.toRight);
    drawBorder(group, 0               , 0, margin, height, drag.toLeft);
  }
}));