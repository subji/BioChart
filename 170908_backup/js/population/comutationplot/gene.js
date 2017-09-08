'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('gene', ['format', 'tooltip', 'title', 'mouseHandler'], factory);
	} else {
		factory(gene);
	}
} (function (format, tooltip, title, mouseHandler)	{
  var aOver = function (d)    {
    tooltip.show(this, 'sort by ' + d, 'rgba(178, 0, 0, 0.6)');

    d3.select(this)
      .transition().duration(50)
      .style('font-size', '12px');
  }

  var aOut  = function (d)    {
    tooltip.hide();

    d3.select(this)
      .transition().duration(250)
      .style('font-size', '8px');  
  } 

  var mOver = function (d)    {
    var str = '<b>'  + d.gene + '</b></br>'
            + d.type + ' : '  + d.count;

    tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');

    d3.select(this)
      .transition().duration(50)
      .style({ 'stroke' : '#333', 'stroke-width' : '1px' });
  }

  var mOut  = function (d)    {
    tooltip.hide();

    d3.select(this)
      .transition().duration(250)
      .style({ 'stroke' : '#fff', 'stroke-width' : '0px' });
  }

	return function (data, all)	{
    var el    = $('#gene');
    var width = el.width()   , height = el.height();
    var top   = 20, left = 10, half   = (width / 2);
    var max   = all.gene_max;
    var svg   = d3.select('#gene')
                  .append('svg')
                  .attr({ 'width' : width, 'height' : height })
                  .append('g')
                  .attr('transform', 'translate(0, 0)');

    var x     = d3.scale.linear()
                  .domain([max, 0])
                  .range([left, (half + left)]);
    var y     = d3.scale.ordinal()
                  .domain(all.gene_name)
                  .rangeBands([left, (height - top)]);

    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient('bottom')
                  .tickValues([max, (max / 2), 0]);
    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient('right');

    var xline = svg.append('g')
                   .attr('id'       , 'geneXaxis')
                   .attr('transform', 'translate(0, ' + (height - top) + ')')
                   .call(xAxis);
    var yline = svg.append('g')
                   .attr('id'       , 'geneYaxis')
                   .attr('cursor'   , 'pointer')
                   .attr('transform', 'translate(' + (half + left) + ', 0)')
                   .call(yAxis)
                   .selectAll('text')
                   .on({ 
                      'mouseover' : aOver, 'mouseout' : aOut,
                      'click'     : function (d) {
                        mouseHandler.gene(d, all);
                      } 
                    });

    var bar   = svg.selectAll('#barGene')
                   .data(data)
                   .enter().append('rect')
                   .attr('id'     , 'barGene')
                   .attr('x'      , function (d) {
                     return x(d.index + d.count);
                   })
                   .attr('y'      , function (d) {
                     return y(d.gene);
                   })
                   .attr('width'  , function (d) {
                     return (half + left) - x(d.count);
                   })
                   .attr('height' , y.rangeBand() * 0.98)
                   .style('fill'  , function (d) {
                      return d.color;
                   })
                   .on({ 'mouseover' : mOver, 'mouseout' : mOut });
	}
}));