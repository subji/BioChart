'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('sample', ['format', 'tooltip'], factory);
	} else {
		factory(sample);
	}
} (function (format, tooltip)	{
  var upperFirst = function (str)   {
    return str.substring(0, 1).toUpperCase()
         + str.substring(1, str.length);
  }

  var mOver      = function (d, i)  {
    var str = '<b>'  + d.participant_id + '</b></br>'
            + d.type + ' : '            + d.count;

    tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');

    d3.select(this)
      .transition().duration(50)
      .style({ 'stroke' : '#333', 'stroke-width' : '1px' });
  }

  var mOut       = function (d, i)  {
    tooltip.hide();

    d3.select(this)
      .transition().duration(250)
      .style({ 'stroke' : '#fff', 'stroke-width' : '0px' });
  }

	return function (data, all)	      {
    var patid   = all.patient_id;
    var el      = $('#sample'), ael     = $('#sampleAxis');
    var width   = el.width()  , height  = el.height();
    var awidth  = ael.width() , aheight = ael.height(), margin  = 10;
    var max     = all.participant_id_max;
    var asvg    = d3.select('#sampleAxis')
                    .append('svg')
                    .attr({ 'width' : awidth, 'height' : aheight });
    var svg     = d3.select('#sample')
                    .append('svg')
                    .attr({ 'width' : width, 'height' : height })
                    .append('g')
                    .attr('transform', 'translate(0, 0)');
    var x       = d3.scale.ordinal()
                    .domain(all.participant_id_name)
                    .rangeBands([0, width]);
    var y       = d3.scale.linear()
                    .domain([0, max])
                    .range([(height - margin), margin]);

    var yAxis   = d3.svg.axis()
                    .scale(y)
                    .orient('left')
                    .tickValues([0, (max / 2), max]);

    var yline   = asvg.append('g')
                      .attr('id', 'sampleYaxis')
                      .attr('transform',
                            'translate(' + (margin * 4) + ', 0)')
                      .call(yAxis);

    svg.selectAll('#barSample')
       .data(data.filter(function (d) {
          return d.participant_id !== patid ? d : false;
       }))
       .enter().append('rect')
       .attr('id'     , 'barSample')
       .attr('x'      , function (d)  {
          return x(d.participant_id);
       })
       .attr('y'      , function (d) {
          return y(d.index) - ((height - margin)
               - y(d.count));
       })
       .attr('width'  , x.rangeBand())
       .attr('height' , function (d) {
          return ((height - margin) - y(d.count));
        })
       .style('fill'  , function (d)  {
          return d.color;
       })
       .on({ 'mouseover' : mOver, 'mouseout' : mOut });
	}
}));