'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('patient', ['format', 'tooltip'], factory);
	} else {
		factory(patient);
	}
} (function (format, tooltip)	{
	var compressType   = function (data)	  				  {
		var exist = [], redata = [];

		for (var i = 0, l = data.length; i < l; i++)	{
			var d 	= data[i];
			var str = d.participant_id + d.gene;

			if (exist.indexOf(str) < 0)	{
				redata.push(d);
				exist.push(str);
			} else {
				var n  = exist.indexOf(str);
				var t  = format().mut(redata[n].type);

				t.idx  !== d.idx  ? redata.push(d) 		   :
				t.order < d.order ? redata.splice(n, 1, d) :
				redata.splice(n, 1, redata[n]);
			}
		}

		return redata;
	}

	var matchMutations = function (d, list)					  {
		var result = '';

		for (var i = 0, l = list.length; i < l; i++)	{
			var item = list[i];

			if (d.participant_id === item.participant_id
			 && d.gene 					 === item.gene
			 && d.idx  					 === item.idx)	{
				result += (item.type + '</br>');
			}
		}
		
		return result;
	}

	var getMax 				 = function (data)    				  {
	  var add    = 0;
	  var result = 0;

	  for (var i = 0, l = data.length; i < l; i++)  {
	    var before = i !== 0 ? data[i - 1] : data[i];
	    var d      = data[i];

	    if (before.participant_id === d.participant_id) {
	      add += d.count;
	    } else {
	      add += before.count;
	      result = result > add ? result : add;
	      add = 0;
	    }
	  }

	  return (Math.ceil(result / 10) * 10);
  }

  var makePatGroup   = function (group, patient)	  {
  	var result = [];

  	for (var i = 0, l = group.length; i < l; i++)	{
  		var name = group[i].name;

  		result.push({
  			'name' 	 				 : name 		,
  			'participant_id' : patient  ,
  			'value'  				 : 'NA' 		,
  			'color'  				 : '#d5dddd',
  		});
  	}

  	return result;
  }

  var setHeight 		 = function (num)							  {
		var hdefault 	= (15 * num);
		var groupline = $('#groupPatient');

		groupline.height(hdefault);

		return (hdefault);
	}

	var makeSvg  			 = function (t, w, h)					  {
		return d3.select('#' + t + 'Patient')
						 .append('svg')
						 .attr({ 'width' : w, 'height' : h })
						 .append('g')
						 .attr('transform', 'translate(0, 0)');
	}

	var ordinal 		   = function (domain, range)     {
		return d3.scale.ordinal()
						 .domain(domain)
						 .rangeBands(range);
	}

	var linear 				 = function (domain, range)	    {
		return d3.scale.linear()
						 .domain(domain)
						 .range(range);
	}

	var onTransition   = function (target, time, evt)	{
		d3.select(target)
			.transition().duration(time)
			.style({
				'stroke' 			 : evt === 'over' ? '#333' : '#fff',
				'stroke-width' : evt === 'over' ? '1px'  : '0px'
			});
	}

	var sOver 				 = function (d)									{
		var str = '<b>'  + d.participant_id + '</b></br>'
            + d.type + ' : ' 						+ d.count;

    tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');

    onTransition(this, 50 , 'over');
	} 

	var gOver 				 = function (d)									{
		var str = '<b>' + d.name 	 + '</b></br>sample : '
						+ d.participant_id + '</br>value : ' + d.value;

		tooltip.show(this, str, 'rgba(15, 15, 15, 0.6)');

		onTransition(this, 50 , 'over');
	}

	var mOver 				 = function (that, d, list)			{
		var types = matchMutations(d, list);
		var str  = '<b>Gene mutations</b></br> x : ' + d.participant_id
						 + '</br>y : '  + d.gene +  '</br>'  + types;

		tooltip.show(that, str, 'rgba(15, 15, 15, 0.6)');

		onTransition(that, 50 , 'over');
	}

	var mOut  				 = function (d)									{
		tooltip.hide();

		onTransition(this, 250, 'out');
	}

	return function (data, all, settingData)					{
		if (all.patient_list.length === 0)	{
			return;
		}

		var groups 	= settingData || all.group_list;
		var patid   = all.patient_id;

		var els  	  = $('#samplePatient');
		var elg  	  = $('#groupPatient');
		var elm  	  = $('#mutationPatient');
		var swidth  = els.width(), sheight = els.height();
		var gwidth  = elg.width();
		var gheight = setHeight(groups.length);
		var mwidth  = elm.width(), mheight = elm.height();
		var left 	  = 20, top = 10;

		var max     = getMax(data);

		var svgs 	  = makeSvg('sample'	, els.width(), els.height());
		var svgg 	  = makeSvg('group'	 	, elg.width(), elg.height());
		var svgm 	  = makeSvg('mutation', elm.width(), elm.height());

		var sx 		  = ordinal(all.patient_list.map(function (d)	{
														return d.participant_id;
													}), [(swidth - 10), (swidth - 5)]);
		var sy      = linear([0, max], [(sheight - top), top]);
		var mx		  = ordinal(all.patient_list.map(function (d)	{
														return d.participant_id;
													}), [(mwidth - 10), (mwidth - 5)]);
		var my 		  = ordinal(all.gene_name, [top, (mheight - left)]);
		var gx		  = ordinal(all.patient_list.map(function (d)	{
														return d.participant_id;
													}), [(gwidth - 10), (gwidth - 5)]);
		var gy  	  = ordinal(groups.map(function (d)	{
														return d.name;
												 	}), [0, (gheight - top)]);
		// Sample side Patient.
		svgs.selectAll('#patSample')
				.data(data.filter(function (d)	{
					return d.participant_id === patid ? d : false;
				}))
				.enter().append('rect')
				.attr('id'		, 'patSample')
				.attr('x' 		, function (d)	{
					return sx(d.participant_id);
				})
				.attr('y'			, function (d)	{
					return sy(d.index) - ((sheight - top)
               - sy(d.count));
				})
				.attr('width'	, sx.rangeBand())
				.attr('height', function (d)	{
					return ((sheight - top) - sy(d.count));
				})
				.style('fill'	, function (d)	{
					return d.color;
				})
				.on({ 'mouseover' : sOver, 'mouseout' : mOut });

		svgg.selectAll('#patGroup')
				.data(makePatGroup(groups, all.patient_id))
				.enter().append('rect')
				.attr('x'			, function (d)	{
					return gx(d.participant_id);
				})
				.attr('y'			, function (d)	{
					return gy(d.name) + ((gy.rangeBand() / 2)
			 				 - ((gy.rangeBand() / 2.5) / 2));
				})
				.attr('width'	, gx.rangeBand())
				.attr('height', (gy.rangeBand() / 3))
				.style('fill'	, function (d)	{
					return d.color;
				})
				.on({ 'mouseover' : gOver, 'mouseout' : mOut });

		svgm.selectAll('#patMutation')
				.data(compressType(all.patient_list))
				.enter().append('rect')
				.attr('id'		, function (d)	{
			 		d.all = all.patient_list;

			 		if (d.idx !== 3)	{
			 			this.parentNode.parentNode.appendChild(this);
			 		}

			 		return 'patMutation';
			 	})
				.attr('x'			, function (d)	{
					return mx(d.participant_id);
				})
				.attr('y'			, function (d)	{
					return d.idx === 3 ? my(d.gene)
							 : my(d.gene) + ((my.rangeBand() / 2)
							 - ((my.rangeBand() / 2.5) / 2));
				})
				.attr('width'	, mx.rangeBand())
				.attr('height', function (d)	{
			 		return (d.idx === 3 ? my.rangeBand()
			 				 : (my.rangeBand() / 3)) * 0.98
			 	})
				.style('fill'	, function (d)	{
					return d.color;
				})
				.on({ 
					'mouseover' : function (d)	{
						mOver(this, d, all.patient_list);
					}, 
					'mouseout' : mOut 
				});
	}
}));