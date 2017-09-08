'use strict';

(function (factory)	{
	if (typeof define === 'function' && define.amd)	{
		define('expressionPlot', ['sizing', 'options'], factory);
	} else {
		factory(expressionPlot);
	}
} (function (sizing, options)	{
	var getMedian = function (list)	{
		var len = list.length;

		return len % 2 === 0 ? len / 2 : (len + 1) / 2;
	}

	var toLog = function (tpm)	{
		return Math.log(tpm + 1) / Math.LN2;
	}

	var getOnlyNameList = function (key, list)	{
		var temp = {};

		for (var i = 0, l = list.length; i < l; i++)	{
			var d = list[i];

			if (key === 'participant_id')	{
				d.tpm = toLog(d.tpm);

				!temp[d[key]] ? temp[d[key]]  = d.tpm
											: temp[d[key]] += d.tpm;
			} else {
				!temp[d[key]] ? temp[d[key]] = true
											: temp[d[key]] = false;
			}
		}

		return temp;
	}

	var objectToArray = function (obj)	{
		var arr = [];

		for (var key in obj)	{
			arr.push(key);
		}

		return arr;
	}

	var getSubtypeValue = function (list)	{
		var result = {},
				len    = list.length;

		for (var i = 0; i < len; i++)	{
			var d = list[i];

			if (!result[d.subtype])	{
				result[d.subtype] = [ d.value ];
			} else {
				if (result[d.subtype].indexOf(d.value) < 0)	{
					result[d.subtype].push(d.value);
				}
			}
		}

		return result;
	}

	var getTpmAverage = function (data)	{
		var result = [],
				len    = data.names_array.hugosymbol.length,
				obj    = data.names_object.participant;

		for (var key in obj)	{
			result.push({
				'participant_id' : key					  			,
				'average' 			 : obj[key] / len 		  ,
				'info'					 : data.patient_obj[key],
			});
		}

		return result.sort(function (a, b)	{
			return a.average - b.average;
		});
	}

	var setPatientList = function (list)	{
		var len = list.length,
				obj = {};

		for (var i = 0; i < len; i++)	{
			var d = list[i];

			obj[d.participant_id] = d;
		}

		return obj;
	}

	var getMaxOrMin = function (list, type, key)	{
		return d3[type](list, function (d)	{
			return d[key];
		});
	}

	var getTpmMedian = function (data)	{
		var list   = data.cohort_rna_list,
				result = {},
				median = data.median_index.tpm,
				len 	 = list.length;

		for (var i = 0; i < len; i++)	{
			var d = list[i],
					v = Math.floor(d.tpm);

			!result[v] ? result[v] = [ d.tpm ] : result[v].push(d.tpm);
		}

		return findMedianPosition(result, median);
	}

	var findMedianPosition = function (obj, median)	{
		var sum    = 0,
				sub    = 0,
				result = null;

		for (var key in obj)	{
			var now = obj[key].length;

			sum += now;

			if ((sum >= median) && ((sum - now) <= median))	{
				result = key;
				sub 	 = median - (sum - now);
			}
		}	

		return toLog(obj[result].sort(function (a, b)	{
			return a - b;
		})[sub] + 1);
	}

	var getSurvivalData = function (data)	{
		var list     = data.patient_list,
				len      = list.length,
				months   = { 'os' : [], 'dfs' : [] },
				allData  = { 'os' : [], 'dfs' : [] },
				condData = { 'os' : [], 'dfs' : [] };

		for (var i = 0; i < len; i++)	{
			var d   = list[i],
					om  = d.os_days / 30,
					dm  = d.dfs_days / 30,
					obj = {},
					dbj = {};

			months.os.push(om);
			months.dfs.push(dm);

 			obj[d.participant_id] = {
				'case_id' : d.participant_id,
				'months'	: om,
				'status'	: d.os_status,
			};

			dbj[d.participant_id] = {
				'case_id' : d.participant_id,
				'months' 	: dm,
				'status' 	: d.dfs_status,
			};

			!(om == null || d.os_status == null) ? condData.os.push(obj)
																					 : allData.os.push(obj);
			!(dm == null || d.dfs_status == null) ? condData.dfs.push(dbj)
																					  : allData.dfs.push(dbj);																					 	
		}

		return {
			'month_list' : months  ,
			'condData'	 : condData,
			'allData'		 : allData ,
		};
	}

	return function (data)	{
		var d  						 = data.data;

		sizing.setContainer('maincontent');

		d.cohort_rna_list  = $.merge(d.cohort_rna_list, d.sample_rna_list);
		d.subtype_value 	 = getSubtypeValue(d.subtype_list);
		d.names_object		 = {
			'signature' 	: getOnlyNameList('signature' 		, d.signature_list) ,
			'participant'	: getOnlyNameList('participant_id', d.cohort_rna_list),
			'hugosymbol'  : getOnlyNameList('hugo_symbol' 	, d.cohort_rna_list),
		}
		d.names_array    	 = {
			'signature' 	: objectToArray(d.names_object.signature)  ,
			'participant' : objectToArray(d.names_object.participant),
			'hugosymbol'  : objectToArray(d.names_object.hugosymbol) ,
		};
		d.color 					 = {
			'tpm' : { 'min' : '#FF0000', 'mid' : '#000000', 'max' : '#00FF00' }
		};
		d.options 				 = {
			'scoring_function' : [ 'Average' ],
			'color_mapping'		 : '',
			'gene_set'				 : '',
		};
		d.patient_obj 		 = setPatientList(d.patient_list);
		d.tpm_average_list = getTpmAverage(d);
		d.median_index  	 = {
			'tpm' : getMedian(d.cohort_rna_list),
			'avg'	: getMedian(d.tpm_average_list),
		};
		d.values 					 = {
			'tpm' : {
				'min'	: toLog(getMaxOrMin(d.cohort_rna_list, 'min', 'tpm') + 1),
				'max' : toLog(getMaxOrMin(d.cohort_rna_list, 'max', 'tpm') + 1),
				'mid' : getTpmMedian(d)																				 ,
			},
			'avg'	: {
				'min'	: getMaxOrMin(d.tpm_average_list, 'min', 'average'),
				'max' : getMaxOrMin(d.tpm_average_list, 'max', 'average'),
				'mid' : d.tpm_average_list[d.median_index.avg].average 	 ,
			}
		};

		d.risk_group 			 = {
			'low'  : d.tpm_average_list.slice(0, d.median_index.avg + 1),
			'high' : d.tpm_average_list.slice(d.median_index.avg + 1,
							 d.tpm_average_list.length),
		};

		d.survival_data    = getSurvivalData(d);
		console.log(d.survival_data);

		options.scoreFunction();
		options.colorMapping();
		options.geneSet();
	}
}));