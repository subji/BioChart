'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('pq', ['tooltip', 'title'], factory);
	} else {
		factory(pq);
	}
} (function (tooltip, title)	{
  var getMax   = function (data, type)  {
    return +d3.max(data.map(function (d) {
      return Math.ceil(logToInt(d[type]));
    }));
  }

  var logToInt = function (log)         {
    if (log === 0)  {
      return 0;
    }

    return Math.log(log) / Math.log(12) * -1;
  }

  var mOver    = function (d)           {
    var str = '<b>' + d.gene + '</b></br>' + d.type.toUpperCase()
            + ' : ' + logToInt(d[d.type]).toFixed(4);

    tooltip.show(this , str, 'rgba(15, 15, 15, 0.6)');

    setTransition(this, 50 , {
      'fill'   : d3.rgb('#BFBFBF').darker(2),
      'stroke' : '#333', 'stroke-width' : '1'
    });
  }

  var mOut     = function (d)           {
    tooltip.hide();

    setTransition(this, 250, {
      'fill' : '#BFBFBF', 'stroke-width' : '0'
    });
  }

  var setTransition = function (el, sec, css) {
    d3.select(el)
      .transition().duration(sec)
      .style(css);
  }

	return function (data, all)	{
    var el    = $('#pq')  , type   = 'p';
    var max   = getMax(data, type);
    var width = el.width(), height = el.height()
    var top   = 20        , left   = 10;
    var svg   = d3.select('#pq')
                  .append('svg')
                  .attr({ 'width' : width, 'height' : height })
                  .append('g')
                  .attr('transform', 'translate(0, 0)');

    var x     = d3.scale.linear()
                  .domain([0, max])
                  .range([left, (width - top)]);
    var y     = d3.scale.ordinal()
                  .domain(all.gene_name)
                  .rangeBands([left, (height - top)]);

    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient('bottom')
                  .tickValues([0, (max / 2), max]);

    var line  = svg.append('g')
                   .attr('id', 'pqXaxis')
                   .attr('transform',
                         'translate(0, ' + (height - top) + ')')
                   .call(xAxis);

    var pq    = svg.selectAll('#barPq')
                   .data(data.map(function (d) {
                     d.type = type;

                     return d;
                   }))
                   .enter().append('rect')
                   .attr('id'    , 'barPq')
                   .attr('x'     , left)
                   .attr('y'     , function (d) {
                     return y(d.gene);
                   })
                   .attr('width' , function (d) {
                     return (x(logToInt(d[type])) - left);
                   })
                   .attr('height', y.rangeBand() * 0.98)
                   .style('fill' , '#BFBFBF')
                   .on({ 'mouseover' : mOver, 'mouseout' : mOut });
	}
}));