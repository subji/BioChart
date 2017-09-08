'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('sortHandler', ['format'], factory);
	} else {
		factory(sortHandler);
	}
} (function (format)	{
	var getType 			= function (type)							  					{
		return type === 'participant_id' ? 'participant_id' : 'gene';
	}
	
	var sumDistance 	= function (type, data, patid)						{
		var result = [], sum = 0;
		
		var makeObj = function (type, d)	{
			var obj 			= {};
					obj[type] = d[type];
					obj.sum 	= d.count;

			return obj;
		}

		for (var i = 0, l = data.length; i < l; i++)	{
			var d = data[i];

			if (d[type] !== patid)	{
				if (result.length === 0)	{
					result.push(makeObj(type, d));
				} else  if (result[result.length - 1][type] !== d[type]) {
					result.push(makeObj(type, d));
				}	else {
					result[result.length - 1].sum += d.count;
				}
			}
		}

		return result;
	}
	
	var duplicate   	= function (type, source, target, isArr)	{
		var result = [];

		for (var i = 0, l = source.length; i < l; i++)	{
			var s 	= source[i];
			var idx = target.indexOf(s[type]);

			result[!isArr ? idx : i] = !isArr ? s : target[idx];
		}

		return result;
	}
	
	var permutate 		= function (type, data, all)							{
		var t 		= getType(type);
		var names = all[type + '_name_ani'] || all[type + '_name'];
		var dist  = type === 'pq' ? all.gene_list
						  : sumDistance(t, data, all.patient_id);
		var list 	= type !== 'pq'
							? duplicate(type, dist, names, false) : all.gene_list;
		var plus 	= 0, minus = 0;
		
		var order = function (type, dist, names, what)	{
			var sign = what === 'desc' ? 1 : -1;

			if (type === 'pq')	{
				return dist.sort(function (a, b)	{
					return a.q < b.q ? (1 * sign) : (-1 * sign);
				})
				.map(function (d)	{
					return d.gene;
				});
			}

			return duplicate(type, dist.sort(function (a, b)	{
				return a.sum < b.sum ? (1 * sign) : (-1 * sign);
			}), names, true);
		}

		for (var i = 0, l = list.length; i < l; i++)	{
			if (i !== 0)	{
				var nl = list[i], bl = list[i - 1];

				if (type === 'pq')	{
					(nl.q - bl.q) > 0 ? plus += 1 : minus += 1;
				} else {
					(nl.sum - bl.sum) > 0 ? plus += 1 : minus += 1;
				}
			}
		}

		if (plus === 0)	{
			return order(type, dist, names, 'asc');
		} else if (minus === 0)	{
			return order(type, dist, names, 'desc');
		} else {
			return order(type, dist, names, 'desc');
		}
	}
	
	var sortBy 				= function (data, all, isAlt)							{
		all.group_separated = separate(data, all, isAlt);

		return merge(all.group_separated);
	}
	
	var merge 				= function (separate)											{
		var result = [];

		for (var i = 0, l = separate.length; i < l; i++)	{
			if ($.isArray(separate[i]))	{
				$.merge(result, separate[i]);
			}
		}

		return result;
	}
	
	var separate 			= function (pre, all, isAlt)							{
		var isSpt = all.group_separated
				  		? isAlt ? haveSeparated(pre.name, pre.data, all)
				  		: toIndividual(pre.data) : toIndividual(pre.data);

		return isSpt.constructor === Object
				 ? convertArr(pre.name, isSpt, all) : isSpt;
	}
	
	var convertArr 		= function (name, obj, all)								{
		var res   = [];
		var glist = alignGroupType(name, Object.getOwnPropertyNames(obj));

		glist.forEach(function (d, i)	{
			Object.getOwnPropertyNames(all.default_group_setting[name]).forEach(function (dd, ii, data)	{
				if (d === dd)	{
					var idx = all.default_group_setting[name][dd].order;

					res[i] = exclusive(obj[d], all);
				}
			});
		});

		return res;
	}

	var alignGroupType = function (name, group_obj)	{
		var priority = format().gr(name);
		var na       = [], newgroup;

		group_obj.forEach(function (d, i)	{
			if (d === 'NA')	{
				na.push(d);
				group_obj.splice(i, 1);
			}
		});

		if (priority)	{
			newgroup = group_obj.sort(-1);
		} else {
			newgroup = group_obj.sort(function (a, b)	{
				var ap = format().gr(name, a);
				var bp = format().gr(name, b);

				return ap < bp ? -1 : 1;
			});
		}

		return $.merge(newgroup, na);
	}
	
	var haveSeparated = function (name, target, data)						{
		var tmp = $.extend(true, [], target);
		var spt = data.group_separated;
		var emp = [], arr = [];

		for (var i = 0, l = spt.length; i < l; i++)	{
			var s = spt[i];

			if ($.isArray(s))	{
				var t = emp[i] = [];

				tmp.map(function (d, idx)	{
					if (s.indexOf(d.participant_id) > -1)	{
						emp[i].push(d);
					}
				});

				arr.push(convertArr(name, toIndividual(emp[i]), data));
			}
		}

		return merge(arr);
	}
	
	var toIndividual 	= function (data)													{
		var result = {};

		for (var i = 0, l = data.length; i < l; i++)	{
			var d = data[i];

			result[d.value] ? result[d.value].push(d.participant_id)
										  : result[d.value] = [ d.participant_id ];
		}

		return result;
	}
	
	var emptyArray 		= function (target, all, tGene)						{
		var result = [];
		var len 	 = tGene ? 1 : all.gene_list.length;

		for (var i = 0, l = target.length; i < l; i++)	{
			var arr = [];

			for (var j = 0; j < len; j++)	{
				arr.push(['00', '00', '00']);
			}

			result.push(arr);
		}

		return result;
	}
	
	var exclusive 		= function (target, all, target_gene)						{
		var arr = emptyArray(target, all, target_gene);

		var addZero = function (order)	{
			return (order < 10 ? '0' + order : '' + order);
		}

		// console.log(target, all, target_gene);
		
		for (var i = 0, l = all.mutation_list.length; i < l; i++)	{
			var m 	 = all.mutation_list[i];
			var sidx = target.indexOf(m.participant_id);

			if (sidx > -1)	{
				var t  = target_gene ? m.gene === 
							   target_gene ? m : null : m;

				if (!t)	{
					continue;
				}

				var gidx 	= target_gene ? 0 : all.permuted_gene_name 
																? all.permuted_gene_name.indexOf(t.gene)
								 								: all.gene_name.indexOf(t.gene);
				var order = addZero(t.order);
				// var tidx  = Math.abs(t.idx - 2);
				var tidx  = Math.abs(t.idx);

				arr[sidx][gidx] = tidx;				

				// arr[sidx][gidx][t.idx] = arr[sidx][gidx][tidx] !== '00'
				// 											 ?(arr[sidx][gidx][tidx] > order
				// 										   ? arr[sidx][gidx][tidx] : order) : order;
			}
		}

		return sortExclusive(arr, target);
	}

	var sortExclusive = function (source, target)								{
		var sample = [];

		for (var i = 0, l = source.length; i < l; i++)	{
			var s = source[i], str = '';

			for (var j = 0, ll = s.length; j < ll; j++)	{
				// var g = s[j];

				str += s[j];

				// for (var k = g.length - 1, lll = 0; k >= lll; k--)	{
				// 	str += g[k];
				// }
			}

			sample.push({
				'sample' : target[i],
				'str'		 : str
			});
		}

		sample.sort(function (a, b)	{
			return a.str < b.str ? 1 : -1;
		});

		return duplicate('sample', sample, target, true);
	}

	return {
		'sortBy' 		: sortBy 	 ,
		'permutate' : permutate,
		'exclusive'	: exclusive,
	}
}));