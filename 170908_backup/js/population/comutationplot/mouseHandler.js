'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('mouseHandler', ['sortHandler', 'format', 'tooltip'], factory);
	} else {
		factory(mouseHandler);
	}
} (function (sortHandler, format, tooltip)	{
	// Scroll move event.
	var moveScroll  		  = function ()					  		    {
		var scroll = $('#outerComutation').scroll(function (d)	{
			$('#outerSample, #outerGroup').scrollLeft($(this).scrollLeft());
		});
	}

	var sortByGene  		  = function (gene, data)				  {
		var samArr = [], others = [];

		data.mutation_list.forEach(function (d)	{
			if (d.gene === gene)	{
				if (samArr.indexOf(d.participant_id) === -1)	{
					samArr.push(d.participant_id);
				}
			} else {
				others.push(d.participant_id);
			}
		});

		var exclusive = sortHandler.exclusive(samArr, data, gene);

		sortHorizontal(exclusive.concat(others), data);
	}
	// Sort by Title that event is sorting desc or asc.
	var sortByTitle 		  = function (type, data, all)	  {
		var permut = sortHandler.permutate(type, data, all);

		all[type + '_name_ani'] = permut;
		all[type + '_now'] 			= permut;

		type === 'participant_id'
					 ? sortHorizontal(permut, all)
					 : sortVertical(permut, all);

		if (type !== 'participant_id')	{
			all.permuted_gene_name = permut;

			sortHorizontal(sortHandler.exclusive(all.participant_id_name, all).concat([]), all);
		}
	}
	// Only horizontal sorting logic by group value.
	var sortByGroup 		  = function (target, data, alt)	{
		if (!groupSortPossible(target, data))	{
			return;
		}

		var targeted = data.group_list.filter(function (d)	{
			return d.name === target ? d : false;
		})[0];
		var sorted 	 		= sortHandler.sortBy(targeted, data, alt);

		data.sample_now = sorted;

		sortHorizontal(sorted, data);
	}

	var groupSortPossible = function (type, data)					{
		var chkPoint = false;
		var tmp			 = '';

		data.group_list.forEach(function (d)	{
			if (d.name === type)	{
				d.data.forEach(function (dd)	{
					if (!tmp)	{
						tmp = dd.value;
					} else {
						if (tmp !== dd.value)	{
							tmp 		 = dd.value;
							chkPoint = true;
						}
					}
				});
			}
		});

		return chkPoint;
	}
	// sort by group and sample.
	var sortHorizontal    = function (data, all)					{
		var s = [0, (all.sample_width || $('#comutation').width())];
		var x = d3.scale.ordinal()
							.domain(data)
							.rangeBands(s);

		d3.selectAll('#barSample, #plotMutation, #plotGroup')
			.attr('x', function (d)	{
				return x(d.participant_id);
			})
			.attr('width', x.rangeBand());
	}
	// sort by gene or pq value.
	var sortVertical = function (data, all)	{
		var s = [10, ($('#gene').height() - 20)];
		var y = d3.scale.ordinal()
							.domain(data)
							.rangeBands(s);

		var yAxis = d3.svg.axis()
	                .scale(y)
	                .orient('right');

    d3.selectAll('#geneYaxis').call(yAxis);
		d3.selectAll('#barPq, #barGene, #plotMutation, #patMutation')
			.attr('y', function (d)	{
				if (this.id === 'plotMutation' ||
						this.id === 'patMutation')	{
			 		return d.idx === 2 ? y(d.gene)
			 				 : y(d.gene) + ((y.rangeBand() / 2)
			 				 - ((y.rangeBand() / 2.5) / 2));
				}

				return y(d.gene);
			});
	}

	return {
		'gene'		   : sortByGene    ,
		'title' 	   : sortByTitle   ,
		'group' 	   : sortByGroup 	 ,
		'scroll' 	 	 : moveScroll    ,
		'vertical' 	 : sortVertical  ,
		'horizontal' : sortHorizontal,
	}
}));