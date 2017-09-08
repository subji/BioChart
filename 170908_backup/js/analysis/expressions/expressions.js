'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('expressions', [
			'jsx!toHTML', 'tooltip', 'legend', 'format', 'loading'
		], factory);
	} else {
		factory(factory);
	}
} (function (toHTML, tooltip, legend, format, loading)	{
	var overall 								= function (data)							{
		SurvivalCurveBroilerPlate.settings = {
		  canvas_width 			 : 500  ,
			canvas_height 		 : 500  ,
		  chart_width 			 : 500  ,
		  chart_height 			 : 500	,
		  chart_left 				 : 70		,
		  chart_top 				 : 25		,
		  include_info_table : false, //Statistic Results from the curve
			include_legend 		 : true ,
			include_pvalue 		 : true ,
			pval_x 						 : 85		,
			pval_y 						 : 57
		};

		SurvivalCurveBroilerPlate.style = {
		  censored_sign_size : 5   		,
		  axis_stroke_width  : 1   		,
		  axisX_title_pos_x  : 260 		 ,
		  axisX_title_pos_y  : 495 		 ,
		  axisY_title_pos_x  : -250		 ,
		  axisY_title_pos_y  : 25      ,
		  axis_color 				 : "black" ,
			pval_font_size 		 : 12 		 ,
			pval_font_style 	 : 'normal'
		}

		SurvivalCurveBroilerPlate.subGroupSettings.legend = {
			high: 'High score group',
			low: 'Low score group',
		};

		console.log(getSurvivalCaseList(data), data.survival.pure)

    SurvivalTab.init(getSurvivalCaseList(data), data.survival.pure);
	}

	var getSurvivalCaseList 		= function (data)							{
		var obj = {};

		data.low_risk_group.forEach(function (d)	{
			obj[d.participant_id] = 'unaltered';
		});

		data.high_risk_group.forEach(function (d)	{
			obj[d.participant_id] = 'altered';
		});

    return obj;
	}

	var rnaChart 								= function (data)							{
		removeSvg('#rnaseq svg');

		var r     = data.data.rnaseq;
		var svg 	= d3.select('#rnaseq')
									.append('svg')
									.attr({ 'width' : r.width, 'height' : r.height });
		var obj   = { 
			'svg' 	 : svg 		 , 'width'  : r.width , 
			'height' : r.height, 'margin' : r.margin
		};

		waterfall(data.data, obj);

		riskBar(data.data, obj);

		verticalLine(data.data, obj);

		dropShadow(data, obj)

		if (checkDoScatter(data.data))	{
			scatter(data.data, obj);
		}
	}

	var waterfall 							= function (data, r)					{
		var yaxisdata = data.cohort_average_list.map(function (d)	{
	 									return d.average;
	 								});
		var svg 			= r.svg
										 .append('g')
										 .attr('id'				, 'waterfall')
										 .attr('transform', 'translate(0, 0)');
		var y 				= d3.scale.linear()
			 								.domain([data.cohort_avg_min, data.cohort_avg_max])
			 								.range([((r.height / 2) - 10), 20]);
		var yaxis 		= d3.svg.axis()
							       	.scale(y)
							       	.orient('left')
							       	.tickFormat(d3.format('0.01f'))
							       	.tickValues([ 
							       		data.cohort_avg_min, 
							       		data.cohort_avg_mid, 
							       		data.cohort_avg_max 
							       	]);

		svg.append('g')
		 	 .attr({
				 'id' 				: 'waterfallYAxis',
			 	 'transform' 	: 'translate(' + (r.margin * 2) + ', 5)'
			  })
			 .call(yaxis);

		svg.append('text')
    	 .attr('transform'	 , 'rotate(-90)')
    	 .attr('x'					 , -(r.height / 4))
    	 .attr('y'					 , 5)
    	 .attr('dy'					 , '1em')
    	 .style('text-anchor', 'middle')
    	 .style('font-size'	 , '15px')
    	 .style('font-weight', 'bold')
    	 .style('text-shadow', '1px 1px 1px #333')
    	 .text('Risk Scores');

	 	var axis 				= d3.selectAll('#waterfallYAxis')
			  axis.selectAll('text').style('font-size', '10px');
			  axis.selectAll('path, line').style({
      	  'fill' 	: 'none'	 , 'stroke-width' 	 : '1px',
	  			'stroke': '#BFBFBF', 'shape-rendering' : 'crispEdges'		
        });

    var bar = svg.selectAll('#riskScoreBar')
    						 .data(data.sorted_cohort_avg_list)
    						 .enter().append('rect')
    						 .attr('id'		 , 'riskScoreBar')
    						 .attr('x'		 , function (d)	{
    						 		return data.name_xscale(d.participant_id);
    						 })
    						 .attr('y'		 , function (d)	{
    						 		return y(Math.max(data.cohort_avg_mid, d.average)) + 5;
    						 })
    						 .attr('width' , data.name_xscale.rangeBand())
    						 .attr('height', function (d, i)	{
    						 		return Math.abs(y(d.average) - y(data.cohort_avg_mid));
    						 })
    						 .style('fill' , function (d, i)	{
    						 		return '#5BC0DE';
    						 })
    						 .on({ 'mouseover' : wOver, 'mouseout' : mOut });
    if (data.sample_rna_list.length > 0)	{
    	var patavg    = data.sorted_cohort_avg_list.filter(function (d)	{
	    	if (d.participant_id === data.req_info.patient_id)	{
	    		return d.average;
	    	}
	    })[0].average;
    	var symbol  = data.cohort_avg_mid > patavg ? 'down' : 'up';
	    var symheit = data.cohort_avg_mid > patavg 
	    						? y(data.cohort_avg_mid) : y(data.cohort_avg_mid) + 10;
	    var patient = svg.append('path')
	    								 .attr('id'				, 'riskScoreSymbol')
	    								 .attr('cursor'		, 'pointer')
	    								 .attr('d'				, d3.svg.symbol()
						 																.type('triangle-' + symbol)
						 																.size(r.margin))
											 .attr('transform', function (d)	{
											 		return 'translate(' 
											 		+ (data.name_xscale(data.req_info.patient_id)
											 		+ (data.name_xscale.rangeBand() / 2)) 
											 		+ ', ' + symheit + ')';
											 })
	    								 .style('filter'	, 'url(#dropShadow)')
	    								 .on('mouseover'	, function ()	{
	    								 		explainOver.call(this, 'Current patient');
	    								 })
	    								 .on('mouseout'		, mOut);
    }
	}

	var wOver 									= function (d)								{
		var str = 'ID 	   : <b>' + d.participant_id + '</b></br>'
						+ 'Average : <b>' + d.average  			 + '</b>';

		tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');
	}
			
	var riskBar 								= function (data, r)					{
		var svg 		= r.svg
									 .append('g')
									 .attr('id'  		  , 'riskBar')
									 .attr('transform', 'translate(' 
									 		+ (r.margin * 2) + ', ' 
									 	  + (r.height / 2) + ')');

		var lowBar  = svg.append('rect')
										 .attr('id'		 , 'lowScoreBar')
										 .attr({ 'x' : data.idx_xscale(0), 'y' : 5 })
										 .attr('width' , 
										 		data.idx_xscale(data.cohort_avg_median))
										 .attr('height', 10)
										 .style({ 'fill' : '#00AC52', 'stroke' : '#DDD' });
		var highBar = svg.append('rect')
										 .attr('id'    , 'highScoreBar')
										 .attr('x'     , data.idx_xscale(data.cohort_avg_median))
										 .attr('y'     , 5 )
										 .attr('width' , 
										 		data.idx_xscale((data.sample_name.length - 1))
										 	- data.idx_xscale(data.cohort_avg_median))
										 .attr('height', 10)
										 .style({ 'fill' : '#FF6252', 'stroke' : '#DDD' });

		svg.append('text')
			 .attr('id'					 , 'lowText')
    	 .attr('x'					 , 0)
    	 .attr('y'					 , (r.margin / 2))
    	 .attr('dy'					 , '1em')
    	 .style('fill'			 , '#00AC52')
    	 .text('Low score group');

    svg.append('text')
    	 .attr('id'					 , 'highText')
    	 .attr('x'					 , (r.width - (r.margin * 6.5)))
    	 .attr('y'					 , (r.margin / 2))
    	 .attr('dy'					 , '1em')
    	 .style('fill'			 , '#FF6252')
    	 .text('High score group');

    d3.selectAll('#lowText, #highText')
    	.style({
    		'font-size' 	: '15px'						,
    		'font-weight' : 'bold'						,
    		'text-shadow' : '1px 1px 1px #333'
    	});
	}

	var verticalLine 						= function (data, r)					{
		var svg 			= r.svg
										 .append('g')
										 .attr('id'  		  , 'verticalLine')
										 .attr('transform', 'translate(' 
										 		+ (r.margin * 2) + ', 0)');

		data.vertical_line = {
			'now_high_pos' : data.idx_xscale(data.cohort_avg_median),
			'now_low_pos'	 : data.idx_xscale(data.cohort_avg_median),
			'median_pos'	 : [
				{ 'x' : data.idx_xscale(data.cohort_avg_median), 'y' : r.margin },
				{ 'x' : data.idx_xscale(data.cohort_avg_median), 
					'y' : (r.height - (r.margin / 2)) }					 ,
			],
			'low_line'  : d3.svg.line()
								 		  .x(function (d)	{
											 	return Math.max(data.idx_xscale(0), 
											 	 		   Math.min(d.high || data.idx_xscale(
											 	 		   data.sample_name.length - 1), d.x));
										 	})
										 	.y(function (d)	{
										 		return d.y;
										 	})
										 	.interpolate('linear'),
			'high_line' : d3.svg.line()
								 		  .x(function (d)	{
								 		  	return Math.max(d.low || 
								 		  				 data.idx_xscale(data.cohort_avg_median), 
								 		  				 Math.min(data.idx_xscale(
											 				 data.sample_name.length - 1), d.x));
										 	})
										 	.y(function (d)	{
										 		return d.y;
										 	})
										 	.interpolate('linear'),
		};

		var makeVline = function (type, color, onDrag, dragEnd)	{
			var symbol = type === 'high' ? 'down' : 'up';
			var yloc 	 = type === 'high' ? (r.margin - 10) 
								 : (r.height - 7);
			var sign 	 = type === 'high' ? 1 : -1;

			svg.append('path')
				 .attr('id'		 		, (type + 'VerticalSymbol'))
		 		 .attr('cursor'		, 'pointer')
				 .attr('d'				, d3.svg.symbol().type('triangle-' + symbol)
				 											.size(r.margin * 2))
				 .attr('transform', 'translate(' 
				 			+ (data.idx_xscale(data.cohort_avg_median) 
				 			+ ((data.name_xscale.rangeBand() / 2) * sign))
				 			+ ', ' + yloc + ') rotate(-90)')
				 .style('fill'  	, color)
				 .on('mouseover'	, function ()	{
				 		var way = type === 'high' ? 'Right' : 'Left';

				    explainOver.call(this, way + ' to adjust');
				 })
				 .on('mouseout'	 	, mOut);

			svg.append('path')
		  	 .attr('id'		 , (type + 'VerticalPath'))
		 		 .attr('cursor', 'pointer')
				 .attr('d'		 , data.vertical_line[type + '_line'](
				 								 data.vertical_line.median_pos))
				 .style({
				 		'stroke-width' 		 : '2px', 'stroke' : '#333',
				 		'stroke-dasharray' : '5px'
				 })

			d3.selectAll('#' + type + 'VerticalSymbol, ' 
				         + '#' + type + 'VerticalPath')
			 	.call(d3.behavior.drag()
							  .origin(Object)
							  .on('drag'		, function ()	{
							 		onDrag.call(this, data);
							  })
							  .on('dragend', function ()	{
							 		dragEnd.call(this, data);
							  }));
		};

		makeVline('low'	, '#00AC52', onLowDrag , dragEnd);
		makeVline('high', '#FF6252', onHighDrag, dragEnd);
	}

	var checkDoScatter 					= function (data)							{
		var result = false;

		data.patient_list.forEach(function (d)	{
			var keys = Object.keys(d);

			if (keys.indexOf('os_days') > -1 && keys.indexOf('os_status')  > -1
			&& keys.indexOf('dfs_days') > -1 && keys.indexOf('dfs_status') > -1)	{
				result = true;
			}
		});

		return result;
	}

	var scatter 								= function (data, r, target)	{
		$('a[data-toggle="tab"]')
		.off('shown.bs.tab')
		.on('shown.bs.tab', function (e)	{
			scatter(data, r, $(e.target).text());
		});

		legend({
			'data' 	 : [ 'Alive'  , 'Dead' ]	 ,
			'color'	 : [ '#5D5DD8', '#D86561' ],
			'target' : 'scatterLegendArea'		 ,
		});

		removeSvg('#scatter');

		var t 			 = (target || 'OS').toLowerCase();
		var month 	 = data.survival.month_list[t].sort();
		var sctdata  = data.survival.all[t];
		var svg 		 = r.svg
							 	 	 	.append('g')
							 	 		.attr('id'			 , 'scatter')
							 	 		.attr('transform', 'translate(0, 360)');
		var y 			 = d3.scale.linear()
										 .domain([d3.min(month), d3.max(month)])
										 .range([250, 0]);
		var yaxis 	 = d3.svg.axis()
										 .scale(y)
										 .orient('left');
    // RNA Seq 부분을 캔버스로 바꾸려면 일단 SVG 를 밀고 DIV 로 다시 재구성해야 한다.
    // SVG 태그 안에서 CANVAS 는 동작하지 않는가 보다.
		// var canv     = d3.select('#rnaseq')
		// 								 .append('canvas')
		// 								 .attr('id', 'canvas_scatter')
		// 								 .attr({ 'width' : r.width - 54, 'height' : 250 });
		// var ctx      = canv.node().getContext('2d');
		// var bb 			 = document.querySelector('#canvas_scatter')
		// 											 .getBoundingClientRect();
		// var pos      = [];

		// canv.draw    = function ()	{
		// 	ctx.clearRect(0, 0, r.width, r.height);
		// 	ctx.beginPath();

		// 	sctdata.map(function (d)	{
		// 		var id = Object.keys(d)[0];
		// 		var xx  = data.name_xscale(id)  ? data.name_xscale(id) : false;
		// 		var yy  = d[id].months !== null ? y(d[id].months) : false;
				
  //       if (xx && yy)	{
  //       	pos.push([xx, yy, {
  //       		'case_id' : d[id].case_id,
  //       		'months'	: d[id].months ,
  //       		'status'  : d[id].status === null ? 'NA'   : d[id].status 
  //       																			? 'Dead' : 'Alive'
		// 			}]);
  //       }

		// 		ctx.arc(xx + 27, yy, 5, 0, 0);
		// 		ctx.fillStyle = d[id].status === null ? '#333333' : !+d[id].status 
		// 						    													? '#5D5DD8' : '#D86561';
 	// 			ctx.globalAlpha = 0.6;
		// 	});

		// 	ctx.closePath();
		// }

		// canv.draw();
		// =======================================================================
		// $('#heatmap canvas').mousemove(function (e)	{
		// 	var mx = (e.clientX - bb.left);
		// 	var tt = $('.tooltip_chart');
		// 	var mm = $('#maincontent');
		// 	var top, left;

		// 	pos.filter(function (d)	{
		// 		var xx = d[0], yy = d[1], dd = d[2];

		// 		if ((mx - data.name_xscale.rangeBand() < xx) && 
		// 				(mx + data.name_xscale.rangeBand() > xx) &&
		// 			 ((e.offsetY - y.rangeBand()) < yy && yy <= e.offsetY))	{

		// 			top  = bb.top  + (e.clientY - bb.top);
		// 			left = bb.left + xx;

		// 			if ((e.clientX + data.name_xscale.rangeBand() 
		// 				 + tt.width()) > mm.width())	{
		// 				left = left - tt.width();
		// 			}

		// 			if ((top + tt.height()) > mm.height())	{
		// 				top  = top - tt.height() - y.rangeBand();
		// 			}

		// 			$('.tooltip_chart').css({
		//  				'position' 				 : 'absolute'						  ,
		//  				'background-color' : 'rgba(15, 15, 15, 0.6)',
		//  				'left' 						 : left  			 	  				,
		//  				'top' 						 : top					  				,
		//  			})
		//  			.html(
		//  				'ID 	: <b>' + dd.participant_id + '</b></br>'
		// 			+ 'Gene : <b>' + dd.hugo_symbol    + '</b></br>'
		// 			+ 'Tpm  : <b>' + toLogTpm(dd.tpm)  + '</b>'
		//  			)
		//  			.show();
		// 		}
		// 	});
		// })
		// .mouseout(function (e)	{
		// 	$('.tooltip_chart').hide();
		// });
		// =================================================================


		svg.append('g')
		 	 .attr({
				 'id' 				: 'scatterYAxis',
			 	 'transform' 	: 'translate(' + ((r.margin * 2) - 1) + ', 0)'
			  })
			 .call(yaxis);

		svg.append('text')
    	 .attr('transform'	 , 'rotate(-90)')
    	 .attr('x'					 , -(r.height / 5))
    	 .attr('y'					 , 5)
    	 .attr('dy'					 , '1em')
    	 .style('text-anchor', 'middle')
    	 .style('font-size'	 , '15px')
    	 .style('font-weight', 'bold')
    	 .style('text-shadow', '1px 1px 1px #333')
    	 .text('Following up (months)');

		var axis 				= d3.selectAll('#scatterYAxis')
			  axis.selectAll('text').style('font-size', '10px');
			  axis.selectAll('path, line').style({
      	  'fill' 	: 'none'	 , 'stroke-width' 	 : '1px',
	  			'stroke': '#BFBFBF', 'shape-rendering' : 'crispEdges'		
        });

    var point 			= svg.selectAll('#survivalPoint')
    										 .data(sctdata)
    										 .enter().append('circle')
    										 .attr('id'					 , 'survivalPoint')
    										 .attr('cx'					 , function (d)	{
    										 		var id = Object.keys(d)[0];
    										 		
    										 		return !data.name_xscale(id) 
    										 				 ? -10000 : data.name_xscale(id);
    										 })
    										 .attr('cy'					 , function (d)	{
    										 		var id = Object.keys(d)[0];

    										 		if (d[id].months !== null)	{
    										 			return y(d[id].months);
    										 		}
    										 })
    										 .attr('r'					 , 5)
    										 .style('fill'			 , function (d)	{
    											 var id = Object.keys(d)[0];

    											 if (id === d.patient_id)	{
    											 		twinklePatient(this);
    											 }

    											 return d[id].status === null 	 ? '#333333' : 
    													  !+d[id].status ? '#5D5DD8' : '#D86561';
    										 })
    										 .style('fill-opacity', '0.6')
    										 .on({ 'mouseover' : sOver, 'mouseout' : mOut });
	}

	var sOver 									= function (d)								{
		var key    = Object.keys(d)[0];
		var status = d[key].status === null ? 'NA' : 
								 d[key].status ? 'Dead' : 'Alive';
		var str    = 'ID 	   : <b>' + d[key].case_id + '</b></br>'
						   + 'Months : <b>' + d[key].months  + '</b></br>'
						   + 'Status : <b>' + status 				 + '</b>';

		tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');
	}

	var heatmap 								= function (data)							{
		removeSvg('#heatmap canvas');

		var h 		= data.heatmap;
	 	var y 		= d3.scale.ordinal()
	 								.domain(data.gene_name)
	 								.rangeBands([0, h.height]);
	 	var color = d3.scale.linear()
	 								.domain([
	 									data.cohort_tpm_min, 
	 									data.cohort_tpm_mid, 
	 									data.cohort_tpm_max
	 								])
	 								.range([
	 									data.tpm_color_set.min, 
	 									data.tpm_color_set.mid,
	 									data.tpm_color_set.max
	 								]);
		var yaxis = d3.svg.axis()
					       	.scale(y)
					       	.orient('left')
					       	.tickSize(0, 0, 0);
		var canv  = d3.select('#heatmap')
									.append('canvas')
									.attr({ 'width' : h.width, 'height' : h.height });
		var ctx   = canv.node().getContext('2d');
		var bb    = document.querySelector('#heatmap canvas')
												.getBoundingClientRect();
		var pos   = [];

		canv.draw = function ()	{
			ctx.clearRect(0, 0, h.width, h.height);
			ctx.beginPath();

			data.gene_name.map(function (d)	{
				ctx.fillText(d, 0, ((y(d) + y.rangeBand()) - (y.rangeBand() / 3)));
			});

			data.cohort_rna_list.map(function (d)	{
				pos.push([data.name_xscale(d.participant_id), y(d.hugo_symbol),
				{
					'hugo_symbol'  	 : d.hugo_symbol   ,
					'participant_id' : d.participant_id,
					'tpm'						 : d.tpm 					 ,
				}]);
				
				ctx.fillRect(data.name_xscale(d.participant_id), y(d.hugo_symbol), 
										 data.name_xscale.rangeBand() 		 , y.rangeBand());
				ctx.fillStyle = color(toLogTpm(d.tpm + 1));
			});

			ctx.closePath();
		}

		canv.draw();

		$('#heatmap canvas').mousemove(function (e)	{
			var mx = (e.clientX - bb.left);
			var tt = $('.tooltip_chart');
			var mm = $('#maincontent');
			var top, left;

			pos.filter(function (d)	{
				var xx = d[0], yy = d[1], dd = d[2];

				if ((mx - data.name_xscale.rangeBand() < xx) && 
						(mx + data.name_xscale.rangeBand() > xx) &&
					 ((e.offsetY - y.rangeBand()) < yy && yy <= e.offsetY))	{

					top  = bb.top  + (e.clientY - bb.top);
					left = bb.left + xx;

					if ((e.clientX + data.name_xscale.rangeBand() 
						 + tt.width()) > mm.width())	{
						left = left - tt.width();
					}

					if ((top + tt.height()) > mm.height())	{
						top  = top - tt.height() - y.rangeBand();
					}

					$('.tooltip_chart').css({
		 				'position' 				 : 'absolute'						  ,
		 				'background-color' : 'rgba(15, 15, 15, 0.6)',
		 				'left' 						 : left  			 	  				,
		 				'top' 						 : top					  				,
		 			})
		 			.html(
		 				'ID 	: <b>' + dd.participant_id + '</b></br>'
					+ 'Gene : <b>' + dd.hugo_symbol    + '</b></br>'
					+ 'Tpm  : <b>' + toLogTpm(dd.tpm)  + '</b>'
		 			)
		 			.show();
				}
			});
		})
		.mouseout(function (e)	{
			$('.tooltip_chart').hide();
		});
	}

	var gradientBar 						= function (data)							{
		removeSvg('#gradientBar svg');

		var cg 				= data.color_gradient;
		var svg 		  = d3.select('#gradientBar')
											.append('svg')
											.attr({ 'width' : cg.width, 'height' : cg.height });
		var nPer 			= 100 / data.cohort_tpm_max ;
		var medPer 		= Math.round(data.cohort_tpm_mid * nPer);

		console.log(data.cohort_tpm_min, 
					       		data.cohort_tpm_mid, 
					       		data.cohort_tpm_max)
		var colorSets = [
			{ 'offset' : '0%'  				, 'stop_color' : data.tpm_color_set.min },
			{ 'offset' : medPer + '%' , 'stop_color' : data.tpm_color_set.mid },
			{ 'offset' : '100%'				, 'stop_color' : data.tpm_color_set.max }
		];

		var x 				= d3.scale.linear()
											.domain([data.cohort_tpm_min, data.cohort_tpm_max])
											.range([cg.margin, (cg.width - cg.margin)]);

		var xaxis = d3.svg.axis()
					       	.scale(x)
					       	.orient('bottom')
					       	.tickFormat(d3.format('0.01f'))
					       	.tickValues([
					       		data.cohort_tpm_min, 
					       		data.cohort_tpm_mid, 
					       		data.cohort_tpm_max
					       	]);

		var scale = svg.append('defs')
									 .append('linearGradient')
									 .attr('id', 'colorScale')
									 .attr({
										 'x1' : '0%'  , 'y1' : '0%',
										 'x2' : '100%', 'y2' : '0%',
								   });

		scale.selectAll('stop')
				 .data(colorSets)
				 .enter().append('stop')
				 .attr('offset'		 , function (d)	{
				 	 return d.offset;
				 })
				 .attr('stop-color', function (d)	{
				 	 return d.stop_color;
				 });

		svg.append('g')
	 	 	 .attr({
				 'id' 				: 'gradientXAxis',
				 'transform' : 'translate(0, 25)'
			 })
			 .call(xaxis);

		 var axis = d3.selectAll('#gradientXAxis')
				 axis.selectAll('text').style('font-size', '10px');
				 axis.selectAll('path, line').style({
	      	 'fill' : 'none', 'stroke' : 'none'		
	       });

		svg.append('g')
		   .attr('transform', 'translate(0, 0)')
			 .append('rect')
			 .attr({ 
			   'x'  : 0 , 'width'  : cg.width				 ,
			   'y'  : 5 , 'height' : (cg.height - 30),
			   'rx' : 3 , 'ry' 		 : 3						   ,
			 })
			 .style({
			   'fill' 				: 'url("#colorScale")',
			   'stroke' 			: '#DDDDDD'           ,
			   'stroke-width' : '1px'								,
			 });
	}

	var showPatient 						= function (data)							{
		var height 						 = 20;
		var makeHeatmapPatient = function (id, sym, y)				{
			removeSvg(id + ' svg');

			d3.select(id)
				.append('svg')
				.attr('width' 	 , (data.heatmap.width + height))
				.attr('height'	 , height)
				.append('g')
				.attr('transform', 'translate(0, 0)')
				.append('path')
				.attr('cursor'	 , 'pointer')
				.attr('d'				 , d3.svg.symbol()
									 					 .type('triangle-' + sym)
									 					 .size(data.heatmap.margin))
				.attr('transform', function (d)	{
					return 'translate(' 
								+ (data.name_xscale(data.req_info.patient_id) 
								+ (data.name_xscale.rangeBand() / 2)) 
								+ ', ' + y + ')';
				})
				.style('filter'  , 'url(#dropShadow)')
				.on('mouseover'  , function ()	{
			 		explainOver.call(this, 'Current patient');
			 	})
			 	.on('mouseout'   , mOut);			
		}

		makeHeatmapPatient('#heatmapTopPatient'	 	, 'down', (height / 1.5));
		makeHeatmapPatient('#heatmapBottomPatient', 'up' 	, (height * 0.3));
	}

	var twinklePatient 					= function (target, data)			{
		var twinkle = false;

		setInterval(function ()	{
			twinkle = !twinkle;

			d3.select(target)
				.style({
					'stroke' 			 : twinkle ? '#FFFF00' : '#000',
					'stroke-width' : twinkle ? '2px'  	 : '0px' ,
				});
		}, 500);	
	}

	var removeSvg 							= function (id)								{
		if (d3.select(id))	{
			d3.select(id).remove();
		}
	}

	var dropShadow 							= function (data, r)					{
		var defs 	  = r.svg.append('defs');
		var filter  = defs.append('filter')
										 	.attr('id'		, 'dropShadow')
										 	.attr('height', '130%');

		filter.append('feGaussianBlur')
					.attr('in'					, 'SourceAlpha')
					.attr('stdDeviation', 5)
					.attr('result'			, 'blur');

		filter.append('feOffset')
					.attr('in'		, 'blur')
					.attr('dx'		, 5)
					.attr('dy'		, 5)
					.attr('result', 'offsetBlur');

		var feMerge = filter.append('feMerge');

		feMerge.append('feMergeNode')
					 .attr('in', 'offsetBlur');

		feMerge.append('feMergeNode')
					 .attr('in', 'SourceGraphic');

		return defs;
	}

	var getMedian 							= function (list)							{
		return list.length % 2 === 0 
				 ? list.length / 2 : (list.length + 1) / 2;
	}

	var toLogTpm 								= function (tpm)							{
		return Math.log((tpm + 1)) / Math.LN2;
	}

	var getMinOrMax 						= function (type, data, key)	{
		return d3[type](data, function (d)	{
			return key === 'average' ? d[key] : toLogTpm(d[key] + 1);
		});
	}

	var setColorMappingData 		= function (data)							{
		var result = {};

		data.forEach(function (d)	{
			if (!result.hasOwnProperty(d.subtype))	{
				result[d.subtype] = [ d.value ];
			} else {
				if (result[d.subtype].indexOf(d.value) < 0)	{
					result[d.subtype].push(d.value);
				}
			}
		});

		return result;
	}

	var setSignatureGenesetData = function (data)							{
		var temp = {},
				result = [];

		data.map(function (d)	{
			// if (result.indexOf(d.hugo_symbol) < 0)	{
			// 	result.push(d.hugo_symbol);
			// }
			if (!temp[d.hugo_symbol])	{
				temp[d.hugo_symbol] = true;
				result.push(d.hugo_symbol);
			}
		});

		return result;
	}

	var getSampleName 					= function (data)							{
		var result = [], obj = {};

		for (var i = 0, l = data.length; i < l; i++)	{
 			var d = data[i];

			if (!obj[d.participant_id])	{
				obj[d.participant_id] = true;
				
				result.push(d.participant_id);
			}
		}

		return result;
	}
	// Tumor 값만 가지고 계산을 하는데, 현재 DB 에서 01, 02 값중 사용중인 02값을 제외한 01값까지 같이 내려와서 같은 데이터가 중복되어 있다.
	// 현재는 위의 내용을 무시하고 participant 값 전체의 length 를 이용하여 평균을 계산한다.
	// 01 값만 가지고 계산한다.
	var getTpmData 							= function (data)							{
		var result = {};
		
		for (var i = 0, l = data.data.cohort_rna_list.length; i < l; i++)	{
			var d 		= data.data.cohort_rna_list[i];
					d.tpm = toLogTpm(d.tpm);

			if (!result[d.participant_id])	{
				result[d.participant_id] = {
					tpm: d.tpm,
					len: 1
				};
			} else {
				result[d.participant_id].tpm += d.tpm;
				result[d.participant_id].len += 1;
			}
		}

		return result;
	}

	var getSignatureGeneset 		= function (data)							{
		return data.map(function (d)	{
			return d.signature;
		});
	}

	var getPatientInfo 					= function (data, id)					{
		var pat = data.data.patient_list;

		for (var i = 0, l = pat.length; i < l; i++)	{
			var p = pat[i];

			if (p.participant_id === id)	{
				return p;
			}
		}
	}

	var getAverageData 					= function (data)							{
		var result = [];
		var divnum = data.data.gene_name.length;

		for (var d in data.data.cohort_tpm_list)	{
			var td = data.data.cohort_tpm_list[d];

			result.push({
				'participant_id' : d 																	  ,
				'average'		 : td.tpm / td.len,
				'info'			 : getPatientInfo(data, d)							,
			});
		}

		return result;
	}

	var getTpmMedian 						= function (data)							{
		// 성능 향상을 위해 QuickSort / HeapSort / Default 중에서 QuickSort 를 사용.
		function swap (arr, a, b)	{
			var tmp = arr[b];

			arr[b] = arr[a];
			arr[a] = tmp;

			return arr;
		}

		function partition (arr, start, end, pidx)	{
			var pivot = toLogTpm(arr[pidx].tpm);

			swap(arr, pidx, end - 1);

			var result = start;

			for (var i = start; i < end - 1; i++)	{
				var tpm = toLogTpm(arr[i].tpm);

				if ((tpm * 1) <= (pivot * 1))	{
					swap(arr, result, i);

					result = result + 1;
				}
			}

			swap(arr, end - 1, result);

			return result;
		}

		function quickSort (arr, start, end)	{
			if (end - 1 > start)	{
				var pivot = start + Math.floor(Math.random() * (end - start));
						pivot = partition(arr, start, end, pivot);

						quickSort(arr, start, pivot);
						quickSort(arr, pivot + 1, end);
			}

			return arr;
		}

		data.data.sorted_cohort_rna_list = 
		quickSort(data.data.cohort_rna_list, 0, data.data.cohort_rna_list.length);

		var testidx = 0;
		var testnum = 0;

		for (var i = 0, l = data.data.sorted_cohort_rna_list.length; i < l; i++)	{
			if (data.data.sorted_cohort_rna_list[i].participant_id.indexOf('50-5946') > -1)	{
				testidx += 1;
				testnum += data.data.sorted_cohort_rna_list[i].tpm;
			}
		}

		return getMedian(data.data.sorted_cohort_rna_list);
	}

	var getAvgMedian 						= function (data)							{
		data.data.sorted_cohort_avg_list = 
		data.data.cohort_average_list.sort(function (a, b)	{
			return a.average > b.average ? 1 : -1;
		});

		return getMedian(data.data.sorted_cohort_avg_list);
	}

	var generateSurvivalData    = function (data)							{
		console.log(data);
		var monthlist = { 'os'  : [], 'dfs' : [] };
		var pure      = { 'os'  : [], 'dfs' : [] };
		var all 			= { 'os'  : [], 'dfs' : [] };

		function setPatientData (id, mon, stat, arr)	{
			var obj = new Object();
					obj[id] = {
						'case_id' : id 	,
						'months'  : mon ,
						'status'  : stat,
					};

			arr.push(obj);
		}

		data.patient_list.forEach(function (d)	{
			var osmonth  = (d.os_days  / 30);
			var dfsmonth = (d.dfs_days / 30);

			monthlist.os.push(osmonth);
			monthlist.dfs.push(dfsmonth);

			if (!(osmonth == null || d.os_status == null))	{
				setPatientData(d.participant_id, osmonth , d.os_status , pure.os);
			}

			if (!(dfsmonth == null || d.dfs_status == null))	{
				setPatientData(d.participant_id, dfsmonth, d.dfs_status, pure.dfs);
			}

			setPatientData(d.participant_id, osmonth  ,d.os_status , all.os);
			setPatientData(d.participant_id, dfsmonth ,d.dfs_status, all.dfs);
		});

		return {
			'month_list' : monthlist,
			'pure'  		 : pure			,
			'all' 			 : all			,
		}
	}

	var getSubtype 							= function (info, value)			{
		for (var d in info)	{
			if (new RegExp(value, 'ig').exec(d))	{
				return d;
			}
		}
	}

	var selectListHandler 			= function (data)							{
		$('.scoreFunction-item a').click(function (d)	{
			$('#optInputScore').attr('placeholder', $(this).text().trim());
		});

		$('.colorMapping-item a').click(function (d)	{
			var t 		= $(this);
			var value = t.text().trim();
			var td    = data.data.color_mapping_data[value];

			$('#optInputColor').attr('placeholder', value);

			data.data.color_mapping_data[value] = 
			data.data.color_mapping_data[value].sort();

			var temp  = data.data.color_mapping_data[value]
								 [data.data.color_mapping_data[value].length - 1];
			data.data.color_mapping_data[value]
			[data.data.color_mapping_data[value].length - 1] = data.data.color_mapping_data[value][0];

			data.data.color_mapping_data[value][0] = temp;

			legend({
				'data' 	 : data.data.color_mapping_data[value],
				'target' : 'waterfallLegendArea'							,
			});

			console.log(d, d.info, value)

			d3.selectAll('#riskScoreBar')
				.style('fill', function (d)	{
					if (d.info !== undefined)	{
						return format().exp(td, d.info[getSubtype(d.info, value)]);
					}
				})
		});

		$('.signatureGeneset-item a').click(function (d)	{
			var value = $(this).text().trim();
			var signa = $('#optInputSignature');
			
			if (value === signa.attr('placeholder'))	{
				return;
			}

			loading('').start();

			signa.attr('placeholder', value);

			$.ajax({
				'url' 			 : '/rest/expressions?',
				'type' 			 : 'GET',
				'data' 			 : {
					'signature' 	: value					 ,
					'filter' 			: data.data.req_info.filter		 ,
					'source' 			: data.data.req_info.source		 ,
					'sample_id' 	: data.data.req_info.patient_id ,
					'cancer_type' : data.data.req_info.cancer_type,
				},
				'success' 	 : function (res)				{
					res.data.req_info = {
						'cancer_type' : data.data.req_info.cancer_type,
						'patient_id'  : data.data.req_info.patient_id ,
						'filter'			: data.data.req_info.filter     ,
						'source'			: data.data.req_info.source 		,
					}
					// res.data.req_info.cancer_type = data.data.req_info.cancer_type;
					// res.data.req_info.patient_id  = data.data.req_info.patient_id;
					// res.data.req_info.filter      = data.data.req_info.filter;
					// res.data.req_info.source 		  = data.data.req_info.source;

					$('#optInputColor').attr('placeholder', 'Color mapping');
					$('#waterfallLegendArea').css('height', '0px');

					removeSvg('#legendSvg');

					preProcessing(res, init, value);

					loading('').stop();
				},
				'error' 		 : function (xhr, err)	{}
			});
		});			
	}

	var explainOver 						= function (text)							{
		tooltip.show(this, text, 'rgba(178, 0, 0, 0.6)');
	}

	var mOut 										= function ()									{
		tooltip.hide();
	}

	var onLowDrag 							= function (data)							{
		var dx  	 = +d3.event.dx;
		var symbol = d3.select('#lowVerticalSymbol');
		var path   = d3.select('#lowVerticalPath');
		var bar  	 = d3.select('#lowScoreBar');
		var min 	 = data.idx_xscale(0),
				max  	 = data.idx_xscale(data.sample_name.length - 1);
		var v 		 = data.vertical_line;

		v.moved_low_pos = v.moved_low_pos ? v.moved_low_pos 			+ dx
										: data.idx_xscale(data.cohort_avg_median) + dx;

		v.now_low_pos   = v.moved_low_pos 			 < min 
										? min  : v.moved_low_pos > v.now_high_pos 
										? v.now_high_pos : v.moved_low_pos;

		data.vertical_line.low_pos = [
			{ 'high' : v.now_high_pos		 , 
			  'x' 	 : v.now_low_pos		 , 
			  'y' 	 : data.rnaseq.margin },
			{ 'high' : v.now_high_pos		 , 
				'x' 	 : v.now_low_pos	   , 
				'y' 	 : (data.rnaseq.height - 
								 (data.rnaseq.margin / 2)) },
		];

		symbol
		.attr('transform', function ()	{
			return 'translate(' 
				+ (Math.max(min, Math.min(v.now_high_pos, v.now_low_pos))
				- (data.name_xscale.rangeBand() / 2)) 
				+ ', ' + (data.rnaseq.height - 5) + ') rotate(-90)';
		});

		path
		.attr('d', data.vertical_line.low_line(data.vertical_line.low_pos));

		bar
		.attr('width', v.now_low_pos);
	}

	var onHighDrag 							= function (data)							{
		var dx  	 = +d3.event.dx;
		var symbol = d3.select('#highVerticalSymbol');
		var path   = d3.select('#highVerticalPath');
		var bar  	 = d3.select('#highScoreBar');
		var min 	 = data.idx_xscale(0),
				max  	 = data.idx_xscale(data.sample_name.length - 1);
		var v 		 = data.vertical_line;
		var low    = v.now_low_pos || data.idx_xscale(data.cohort_avg_median);

		v.moved_high_pos = v.moved_high_pos ? v.moved_high_pos 		 + dx
										 : data.idx_xscale(data.cohort_avg_median) + dx;

		v.now_high_pos   = v.moved_high_pos < v.now_low_pos 
										 ? v.now_low_pos : v.moved_high_pos > max 
										 ? max : v.moved_high_pos;

		data.vertical_line.high_pos = [
			{ 'low' : v.now_low_pos			, 
			  'x' 	: v.now_high_pos		, 
			  'y' 	: data.rnaseq.margin },
			{ 'low' : v.now_low_pos			, 
				'x' 	: v.now_high_pos		, 
				'y' 	: (data.rnaseq.height - 
								(data.rnaseq.margin / 2)) },
		];

		symbol
		.attr('transform', function ()	{
			return 'translate(' 
				+ (Math.max(v.now_low_pos, Math.min(max, v.now_high_pos))
				+ (data.name_xscale.rangeBand() / 2)) 
				+ ', ' + (data.rnaseq.margin - 10) + ') rotate(-90)';
		});

		path
		.attr('d', data.vertical_line.high_line(data.vertical_line.high_pos));

		bar
		.attr('x'		 , v.now_high_pos)
		.attr('width', max - v.now_high_pos);
	}

	var dragEnd 								= function (data)							{
		var x 		 	= d3.scale.linear()
									 	.domain([ 0, 680 ])
									 	.range ([ 0, (data.sample_name.length - 1) ]);
		var lowidx  = Math.floor(x(data.vertical_line.now_low_pos)  + 1);
		var highidx = Math.floor(x(data.vertical_line.now_high_pos) + 1);

		console.log(lowidx, highidx)
		
		data.low_risk_group  = data.sorted_cohort_avg_list.slice(0, lowidx);
		data.high_risk_group = data.sorted_cohort_avg_list.slice(highidx, 
													 (data.sorted_cohort_avg_list.length));

		overall(data);
	}

	var preProcessing   				= function (data, cb, val)		{
		if (data)	{
			var expHTML = new toHTML.Expressions();

			data.data.tpm_color_set 			= {
				'min' 	 		 : '#FF0000',
				'mid' 			 : '#000000',
				'max' 	 		 : '#00FF00'
			};

			data.data.cohort_rna_list  		= 
			$.merge(data.data.cohort_rna_list, data.data.sample_rna_list);

			data.data.scoring_function    = [ 'Average' ];

			data.data.signature_gene_set  = 
			getSignatureGeneset(data.data.signature_list);

			data.data.gene_name 				 	= 
			setSignatureGenesetData(data.data.cohort_rna_list);
			
			data.data.sample_name 			 	= 
			getSampleName(data.data.cohort_rna_list);

			data.data.color_mapping_data 	= 
			setColorMappingData(data.data.subtype_list);

			data.data.cohort_tpm_list     = getTpmData(data);

			data.data.cohort_average_list = getAverageData(data);
			// // 1300ms
			data.data.cohort_tpm_median   = getTpmMedian(data);

			data.data.cohort_avg_median   = getAvgMedian(data);

			data.data.cohort_tpm_min 			= 
			getMinOrMax('min', data.data.cohort_rna_list, 'tpm');

			data.data.cohort_tpm_mid 			= 
			toLogTpm(
				data.data.sorted_cohort_rna_list[
				data.data.cohort_tpm_median].tpm + 1
			);
			data.data.cohort_tpm_max 			= 
			getMinOrMax('max', data.data.cohort_rna_list, 'tpm');

			data.data.cohort_avg_min 			= 
			getMinOrMax('min', data.data.cohort_average_list, 'average');

			data.data.cohort_avg_mid 			= 
			data.data.sorted_cohort_avg_list[data.data.cohort_avg_median]
					.average;

			data.data.cohort_avg_max 			= 
			getMinOrMax('max', data.data.cohort_average_list, 'average');

			data.data.low_risk_group 			= 
			data.data.sorted_cohort_avg_list.slice(0, 
			data.data.cohort_avg_median + 1);

			data.data.high_risk_group			= 
			data.data.sorted_cohort_avg_list.slice(
			data.data.cohort_avg_median + 1, 
			data.data.sorted_cohort_avg_list.length);

			data.data.survival						= 
			generateSurvivalData(data.data);

			data.data.rnaseq 							= {
				'width'  : 750, 'height' : 640, 'margin' : 30,
			};

			data.data.color_gradient			= {
				'width'  : 245, 'height' : 50 , 'margin' : 15,
			};

			data.data.heatmap 						= {
				'width'  : 750															,
				'height' : (data.data.gene_name.length * 20),
				'margin' : 30														    ,
			};

			data.data.name_xscale = d3.scale.ordinal()
																.domain(getSampleName(
																	data.data.sorted_cohort_avg_list
																))
																.rangeBands([ 60, 740 ]);

			data.data.idx_xscale  = d3.scale.linear()
																.domain([ 
																	0, (data.data.sample_name.length - 1) 
																])
																.range ([ 0, 680 ]);

			expHTML.makeOption({
				'data' 	 : data.data.color_mapping_data,
				'id' 		 : 'colorMapping'						 	 ,					
				'target' : 'colorMappingInputGroup'		 ,
			});
			expHTML.makeOption({
				'data' 	 : data.data.scoring_function,
				'id' 		 : 'scoreFunction'				   ,					
				'target' : 'scoreFunctionInputGroup' ,
			});
			expHTML.makeOption({
				'data'	 : data.data.signature_gene_set,
				'id' 		 : 'signatureGeneset'				   ,					
				'target' : 'signatureGenesetInputGroup',
			});
		}

		cb(data, val);
	}

	var init 										= function (data, siggeneset)	{
		$('#optInputScore')
		 .attr('placeholder', data.data.scoring_function[0]);
		$('#optInputSignature')
		 .attr('placeholder', siggeneset ? siggeneset 
		 	: data.data.signature_gene_set[0]);

		selectListHandler(data);

		rnaChart(data);

		gradientBar(data.data);

		heatmap(data.data);
		
		overall(data.data);

		if (data.data.sample_rna_list.length > 0)	{
			showPatient(data.data);
		}
	}

	return function (data)																		{
		console.log(data);
		console.log(d3.max(data.data.cohort_rna_list, function (d)	{
			return toLogTpm(toLogTpm(d.tpm) + 1);
		}))
		preProcessing(data, init);

		// var resizeId;

		// $(window).resize(function (e)	{
		// 	var settingObj = {};

		// 	clearTimeout(resizeId);

		// 	resizeId = setTimeout(function ()	{
		// 		if (window.innerWidth <= 1670)	{
		// 			settingObj.cnt_width   			= 1100;
		// 			settingObj.chart_width 			= 550;
		// 			settingObj.name_scale_width = 540;
		// 			settingObj.idx_scale_width  = 480;
		// 			settingObj.tb_width    			= 400;
		// 			settingObj.scbp_width  			= 350;
		// 			settingObj.opt_width   			= 175;
		// 			settingObj.func_width  			= 150;
		// 		} else {
		// 			settingObj.cnt_width   			= 1520;
		// 			settingObj.chart_width 			= 750;
		// 			settingObj.name_scale_width = 740;
		// 			settingObj.idx_scale_width  = 680;
		// 			settingObj.tb_width    			= '100%';
		// 			settingObj.scbp_width  			= 500;
		// 			settingObj.opt_width   			= 245;
		// 			settingObj.func_width  			= 220;
		// 		}

		// 		var scbp = SurvivalCurveBroilerPlate;
	 //    	var tb 	 = $('#osTable');
	 //    	var cnt  = $('.chart_container');
	 //    	var func = $('#scoreFunctionUl li');

	 //    	func.width(settingObj.func_width);
	 //    	cnt.width(settingObj.cnt_width);
	 //    	tb.width(settingObj.tb_width);

	 //    	scbp.settings.canvas_width = settingObj.scbp_width;
	 //    	scbp.settings.chart_width  = settingObj.scbp_width;

	 //    	data.data.rnaseq.width     		 = settingObj.chart_width;
	 //    	data.data.heatmap.width    		 = settingObj.chart_width;
	 //    	data.data.color_gradient.width = settingObj.opt_width;

	 //    	data.data.name_xscale = d3.scale.ordinal()
		// 															.domain(getSampleName(
		// 																data.data.sorted_cohort_avg_list
		// 															))
		// 															.rangeBands([ 60, 
		// 																settingObj.name_scale_width
		// 															]);

		// 		data.data.idx_xscale  = d3.scale.linear()
		// 															.domain([ 0, 
		// 																(data.data.sample_name.length - 1) 
		// 															])
		// 															.range ([ 0, 
		// 																settingObj.idx_scale_width
		// 															]);

		// 		init(data);
		// 	}, 50);
		// });
	}
}));