'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('needle', [ 'tooltip', 'format', 'navi', 'legend'], factory);
	} else {
		factory(needle);
	}
} (function (tooltip, format, navi, legend)	{
	var hasProtein 			 				= function (data)										{
		return data.data.graph.length === 0 ?
					 setViewAreaStyle({
					 	'font-size'   : '25px'  ,
					 	'text-align'  : 'center',
					 	'padding-top' : '100px'
					 }, 'hidden', 'No protein domain information.')
				 : setViewAreaStyle({ 'padding-top' : '0px' }, 'visible', '');
	}

	var setViewAreaStyle 				= function (obj, visible, txt)			{
		$('#navi, #legend').css('visibility', visible);
		$('#needleplot').text(txt).css(obj);

		return visible === 'hidden' ? false : true;
	}

	var radius 					 				= function (cnt)										{
		return (Math.sqrt(cnt) * 3) / 1.25;
	}

	var reProcessing 		 				= function (data)  									{
  	var result = [];

    data.sort(function (a, b) {
    	return (a.position + a.aachange + a.type + a.id) >
    				 (b.position + b.aachange + b.type + b.id) ? 1 : -1;
    });

 	 	setObject(result, data[0]);

  	for (var i = 1, l = data.length; i < l; i++)  {
   		var d = data[i], before = data[i - 1];

   		if (d.id === before.id)	{
   			continue;
   		}

  		if (d.position === before.position &&
  				d.type 	   === before.type 	   &&
  				d.aachange === before.aachange) {
    			result[result.length - 1].count += 1;
  		} else if (d.position === before.position &&
			      		 d.type 	  === before.type 		&&
			      		 d.aachange !== before.aachange) {
    		setObject(result, d);
    		addCountProp(result);
  		} else if (d.position === before.position &&
	      	   		 d.type 	  !== before.type) {
    		setObject(result, d);
    		addCountProp(result);
  		} else {
    		setObject(result, d);
  		}
  	}

  	console.log('Needle: ', result);

    return result;
  }

  var addCountProp 		 				= function (arr)										{
  	arr[arr.length - 1].before = arr[arr.length - 2].count;
  	arr[arr.length - 1].index  = arr[arr.length - 2].index
  														 + arr[arr.length - 2].count;
  }

  var setObject 			 				= function (arr, data) 				  		{
  	var type = format().mut(data.type);

    arr.push({
			'id' 				: data.id 		 ,
			'position' 	: data.position,
			'aachange' 	: data.aachange,
			'type' 			: type.name 	 ,
			'color'			: type.color   ,
			'count' 		: 1						 ,
			'index'			: 0						 ,
			'before'		: 0						 ,
		});
  }

  var patientReprocessing 		= function (patientList)					  {
  	var result = [];

  	patientList.forEach(function (d)	{
  		var isValue = isValueObjArr(result, 'position', d.position);

  		if (isValue.isValue)	{
  			isValue.value.pat_list.push(d);
  		} else {
  			result.push({ 'position' : d.position, 'pat_list' : [ d ] });
  		}
  	});

  	return result;
  }

  var isValueObjArr 					= function (arr, key, value)				{
  	var isValue  = false,
  			getValue = null;

  	arr.forEach(function (d)	{
  		if (d[key] === value)	{
  			isValue  = true;
  			getValue = d;
  		}
  	});

  	return { 'isValue' : isValue, 'value' : getValue };
  }
	// TODO - fix light weight code. more efficient code than below.
	var getMax 						  		= function (data)									  {
		var sets 	 = {},
		 		result = 0;

		data.map(function (d)	{
			sets[d.position] = !sets[d.position] ? d.count
											 :  sets[d.position] + d.count;
		});

		for (var key in sets)	{
			result = result > sets[key] ? result : sets[key];
		}

		return result;
	}

	var circleToFront 		  		= function ()											  {
		d3.selectAll('#markerPath').forEach(function (d, i)	{
			d.sort(function (a, b)	{
				var f 	= d3.select(a).datum();
				var l 	= d3.select(b).datum();

				return (l.count + l.index) > (f.count + f.index) ? 1 : -1;
			});

			return d.forEach(function (e)	{
				var g = e.parentNode;

				frontTo(g, g.parentNode);
			})
		});
	}

	var setNodeIndex 						= function (that)									  {
		var childs = that.parentNode.childNodes,
				len 	 = childs.length;

		for (var i = 0; i < len; i++)	{
			var d = childs[i];

			if (d3.select(that).attr('transform') ===
					d3.select(d).attr('transform'))	{
				return i;
			}
		}
	}

	var frontTo 								= function (parent, child)					{
		if (child.nextSibling)	{
			parent.appendChild(child);
		}
	}

	var behindTo 								= function (parent, child)					{
		parent.insertBefore(child,
		parent.childNodes[ ($(child).data().index - 1) ]);
	}

	var mOver 						  		= function (d)											{
		var str = '';

		switch (this.id)	{
			case 'graph'   :
			str = '<b>' + d.identifier + '</b></br> desc : '
					+ d.description + '</br> section : ' + d.start
					+ ' - ' + d.end; break;
			case 'marker'  :
			str = '<b>' + d.type + '</b></br>' + d.aachange + '  : '
					+ d.count + '</br> Position : ' + d.position; break;
			case 'patient' :
			str = makeMouseOverPatientStr(d); break;
		}

		frontTo(this.parentNode.parentNode, this.parentNode);

		tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');

		d3.select(this)
			.transition().duration(200)
			.style('stroke' 		 , function (d)	{
				return d3.rgb(d.colour || d.color).darker(2);
			})
			.style('stroke-width', 2);
	}

	var makeMouseOverPatientStr = function (data)									  {
		var list 		 = data.pat_list,
				str  		 = '' 					,
				type 		 = '' 					,
				aachange = '';

		function makeStr()	{
			list.forEach(function (d)	{
				type 		 += d.type + ' ';
				aachange += d.aachange + ' ';
			});
		}

		makeStr();

		str = '<b>' + list[0].id + '</b></br> position : '
				+ data.position + '</br> type : ' + type
				+ '</br> aachange : ' + aachange + '';

		return str;
	}

	var mOut 										= function (d)											{
		behindTo(this.parentNode.parentNode, this.parentNode);
		tooltip.hide();

		d3.select(this)
			.transition().duration(200)
			.style({ 'stroke' : 'none', 'stroke-width' : '0px' });
	}

	var drawChart 							= function (data)										{
    d3.selectAll('svg').remove();

		var view 		 = $('#needleplot');
		var width    = view.width();
		var height   = view.height(), margin = 30;
		var stack 	 = data.data.public_list.length > 0
								 ? reProcessing($.extend(true, [], data.data.public_list))
								 : [];
		// Patient 와 Public 을 같이 표시 할 경우 아래 코드를 사용.
		// var list  = $.merge(data.data.public_list, data.data.patient_list)
		// var stack = reProcessing($.extend(true, [], list));
		var max 		 = data.data.public_list.length > 0 ? getMax(stack) : 0;
		var svg  		 = d3.select('#needleplot')
		 			       		 .append('svg')
			 			       	 .attr('id'			  , 'needleplotSvg')
			 			       	 .attr('xmlns', 'http://www.w3.org/2000/svg')
			 			       	 .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
						       	 .attr({ 'width' : width, 'height' : height })
						       	 .append('g')
						       	 .attr('transform', 'translate(0, 0)');

		var x 			 = d3.scale.linear()
			       				 .domain([0, data.data.graph[0].length])
			       		 		 .range([margin, (width - margin)]);

		var y				 = d3.scale.linear()
			       				 .domain([0, max])
			       				 .range([(height - (margin * 3)), margin]);

		var xaxis 	 = d3.svg.axis()
					       		 .scale(x)
					       		 .orient('bottom')
					       	   .tickPadding(10)
					       	   .tickFormat(d3.format('d'));
		var yaxis 	 = d3.svg.axis()
					           .scale(y)
					           .orient('left')
					           .tickFormat(d3.format('d'));

		svg.append('g')
		 	 .attr({
				 'id' 				: 'xAxis' 																	 ,
			 	 'transform' 	: 'translate(0, ' + (height - (margin)) + ')'
			  })
			 .call(xaxis);

		svg.append('g')
			 .attr({
				 'id' 				: 'yAxis' 																	 ,
				 'transform' 	: 'translate(' + margin + ', ' + margin + ')'
			  })
			 .call(yaxis);

		svg.append('g')
			 .attr('transform', 'translate(0, '
			 		+ (height - (margin / 1.25)) + ')')
			 .append('rect')
			 .attr({ 'x' : margin, 'y' : -margin })
			 .attr({
			 	'width' : (width - (margin * 2)), 'height' : (margin / 1.5)
			 })
			 .style('fill'		, '#DADFE1');

		svg.append('g')
			 .attr('transform', 'translate(' + margin + ', ' + margin + ')')
			 .append('text')
			 .text(data.data.title)
			 .style({ 'font-size' : '15px', 'font-weight' : 'bold' });

		var axises 	= d3.selectAll('#xAxis, #yAxis')
				axises.selectAll('text').style('font-size', '10px');
				axises.selectAll('path, line').style({
	      	'fill' 	: 'none'	 , 'stroke-width' 	: '1px' 			,
	      	'stroke': '#BFBFBF', 'shape-rendering': 'crispEdges'
	      });

	  var graph = svg.selectAll('#graphGroup')
	  							 .data(data.data.graph.filter(function (d)	{
	  							 		if (d.display)	{
	  							 			return d;
	  							 		}
	  							 }))
	  							 .enter().append('g')
	  							 .attr('id'			  , 'graphGroup')
	  							 .attr('transform', function (d)	{
	  							 		return 'translate(' 	+ x(d.start)
	  							 				 + ', ' + (height - margin) + ')';
	  							 });

	  graph.append('rect')
	  		 .style('fill' , function (d)	{
	  		 		return d.colour;
	  		 })
	  		 .attr('id'		 , 'graph')
	  		 .attr({ 'x' 	: 0, 'y' 	: -margin })
	  		 .attr({ 'rx' : 3, 'ry' : 3 })
	  		 .attr('width' , function (d)	{
  		 			return x(d.end) - x(d.start);
	  		 })
	  		 .attr('height', margin)
	  		 .on({ 'mouseover' : mOver, 'mouseout' : mOut });

	  graph.append('text')
	  		 .attr({  'x' 	 : 3		 , 'y' 				 : -(margin / 3) })
	  		 .style({ 'fill' : '#fff', 'font-size' : '10px'	})
	  		 .text(function (d)	{
  		 			return d.identifier;
	  		 })
	  		 // Text-overflow wrapper logic
	  		 .each(function ()	{
	  		 		var width = +d3.select(this.parentNode.firstChild)
	  		 									.attr('width') - 10;
	  		 		var text  = d3.select(this);
	  		 		var	words = text.text().split('').reverse();
	  		 		var word  = null, line = [];
	  		 		var y 		= text.attr('y');
	  		 		var tspan = text.text(null)
	  		 										.append('tspan')
	  		 										.attr({ 'x' : 5, 'y' : y });

	  		 		while (word = words.pop())	{
	  		 			line.push(word);
	  		 			tspan.text(line.join(''));

	  		 			if (tspan.node().getComputedTextLength() > width)	{
	  		 				line.pop();
	  		 				tspan.text(line.join(''));
	  		 			}
	  		 		}
	  		 });

	  var marker = svg.selectAll('#markerGroup')
	  								.data(stack)
	  								.enter().append('g')
	  								.attr('id'			 , 'markerGroup')
	  								.attr('transform', function (d)	{
	  									d.idx = setNodeIndex(this);

	  									return 'translate(' 			+ x(d.position)
	  											 + ', ' + (y(d.index) + margin) + ')';
	  								});

	  marker.append('path')
	  			.attr('id', 'markerPath')
	  			.attr('d'	, function (d)	{
  					return 'M0,' + -radius(d.before) + 'L0,'
  							 + (y(d.count) - ((height - (margin * 3)))
  							 + (radius(d.count)));
	  			})
	  			.style({
	  				'fill' 	: 'none'	 , 'stroke-width' 	 : '1px',
	  				'stroke': '#BFBFBF', 'shape-rendering' : 'crispEdges'
	  			});

	  marker.append('circle')
	  			.style('fill'	 			 , function (d)	{
	  				return d.color;
	  			})
	  			.style('stroke'			 , function (d)	{
	  				return d3.rgb(d.color).darker(2);
	  			})
	  			.style('stroke-width', 0)
	  			.attr('id'	 	 			 , 'marker')
	  			.attr('cx'		 			 , 0)
	  			.attr('cy'		 			 , function (d)	{
	  				return y(d.count) - ((height - (margin * 3)));
	  			})
	  			.attr('r'			 			 , function (d)	{
	  				return radius(d.count);
	  			})
	  			.on({ 'mouseover' : mOver, 'mouseout' : mOut });

	  circleToFront();

		if (data.data.patient_list.length)	{
			var patients = patientReprocessing(data.data.patient_list);

			svg.selectAll('#patients')
				 .data(patients)
				 .enter().append('g')
				 .attr('id'				, 'patients')
				 .attr('transform', function (d)	{
				 		return 'translate(' + x(d.position)   + ', '
				 			 	 + (height 			- (margin / 1.25)) + ')';
				 })
				 .append('path')
				 .attr('id'				, 'patient')
				 .attr('d'				, function (d)	{
				 		var symbol = d.pat_list.length > 1
				 							 ? 'cross' : 'triangle-up';

				 		return d3.svg.symbol().type(symbol)();
				 })
				 .style('fill'		, function (d)	{
				 		return format().mut(d.pat_list[0].type).color;
				 })
				 .on({ 'mouseover' : mOver, 'mouseout' : mOut });
		}

		navi(data, stack,
			{ 'max' 	: max  , 'x' 			: x 	  , 'y' 		 : y 		  },
			{ 'width' : width, 'height' : height, 'margin' : margin });

		legend({
			'data'  : $.merge(data.data.public_list,
											 	data.data.patient_list).map(function (d)	{
											 		return format().mut(d.type).name;
											 	}),
			'chart' : 'needle',
			'by': 'needleplot'
		});
	}

	function readFile (file) {
		var xhr = new XMLHttpRequest(), result;
		
		xhr.open('GET', file, false);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4)	{
				if (xhr.status === 200 || xhr.status === 0)	{
					result = xhr.responseText;
				}
			}
		};

		xhr.send(null);

		return result;
	}

	function parser ()	{
		

		return {
			sif: function (txt)	{

			},
			cus: function (txt)	{

			},
			format: function (txt)	{

			}
		}
	}

	return function (data)																					{

		// var files = [
		// '/data/oncoprint.txt', '/data/merged-network.sif', 
		// '/data/result-groups.cus' ],
		// result = [];

		// files.forEach(function (f)	{
		// 	result.push(readFile(f));
		// });

		// console.log(result);

		// result[0].split('\n').forEach(function (d)	{
		// 	console.log(d);
		// })

		// sizing.setContainer('genemutationplot');
		if (hasProtein(data)) {
			drawChart(data);

			// var canvas = document.getElementById('test-canvas');
			// var ctx    = canvas.getContext('2d');

			// var svgHtml = document.getElementById('needleplotSvg').outerHTML;

			// var domUrl  = window.URL || window.webkitURL || window;

			// var img = new Image();
			// var svg = new Blob([svgHtml], { 'type': 'image/svg+xml' });
			// var url = domUrl.createObjectURL(svg);

			// img.src = url;
			// img.onload = function ()	{
			// 	ctx.drawImage(img, 0, 0);
			// 	domUrl.revokeObjectURL(url);
			// 	// pdf($('#needleplot'));
			// }
		}
	}
}));