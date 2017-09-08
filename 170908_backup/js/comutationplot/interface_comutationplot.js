var COMUTS_INTER = "comutationplot/interface_comutationplot";
var VO = "comutationplot/vo_comutationplot";
var COMUTATION = "comutationplot/comutation/";
var GENE = "comutationplot/gene/";
var SAMPLE = "comutationplot/sample/";
var PQ = "comutationplot/pq/";
var COMUTS_NAVI = "comutationplot/navigation/";
var LEGEND = "chart/legend/setting_legend";

define(COMUTS_INTER, [ "utils", VO, COMUTATION + "setting_comutation", GENE + "setting_gene", PQ + "setting_pq", SAMPLE + "setting_sample", COMUTS_NAVI + "setting_comutationnavigation", LEGEND ], function(_utils, _VO, _setting_comutation, _setting_gene, _setting_pq, _setting_sample, _setting_comutationnavigation, _setting_legend)	{
	var get_list_by_key = function(_key, _list)	{
		var list = _list || [], result = [];
		var key = _key || "name";

		for(var i = 0, len = list.length ; i < len ; i++)   {
			if($.inArray(list[i][key], result) < 0 && list[i][key])   {
				result.push(list[i][key]);
			}
		}
		return result;
	}

	var searchObjArray = function(_value, _key, _jsonarray)    {
		var result;

		for(var i = 0, len = _jsonarray.length ; i < len ; i++)	{
			var value = _jsonarray[i];

			if(value[_key] === _value)	{
				result = value;
			}
		}
		return result;
	}

	var get_all_data = (function()	{
		var memoize = {
			sample_group : {},
			gene_group : {},
			sample : {},
			gene : {},
			type : {},
			value : {}
		};

		function f(_sample_list, _samples, _index, _result)	{
			var sample_list = _sample_list || [], samples = _samples || [], result = _result || [];
			var sampleColumn, aberrations;
			var index = _index || 0;
			var f_sample_group, f_gene_group, f_sample, f_gene, f_type, f_value;

			if(index > samples.length - 1)  {  return;  }

			sampleColumn = searchObjArray(samples[index], "name", sample_list);

			sampleColumn.gene_list.forEach(function(_d, _i)  {
				aberrations = get_all_aberration_list(_d);

				f_sample_group = (sampleColumn.group in memoize.sample_group) ? memoize.sample_group[sampleColumn.group] : sampleColumn.group;
				f_gene_group = ("group" in memoize.gene_group) ? memoize.gene_group["group"] : "group";
				f_sample = (sampleColumn.name in memoize.sample) ? memoize.sample[sampleColumn.name] : sampleColumn.name;
				f_gene = (_d.name in memoize.gene) ? memoize.gene[_d.name] : _d.name;
				f_type = (aberrations.type in memoize.type) ? memoize.type[aberrations.type] : aberrations.type;
				f_value = (aberrations.value in memoize.value) ?memoize.value[aberrations.value] : aberrations.value;

				memoize.sample_group[sampleColumn.group] = f_sample_group;
				memoize.gene_group["group"] = f_gene_group;
				memoize.sample[sampleColumn.name] = f_sample;
				memoize.gene[_d.name] = f_gene;
				memoize.type[aberrations.type] = f_type;
				memoize.value[aberrations.value] = f_value;

				result.push({
					sample_group : f_sample_group,
					gene_group : f_gene_group,
					sample : f_sample,
					gene : f_gene,
					type : f_type,
					value : f_value,
				});
			})
			get_all_data(sample_list, samples, index += 1, result);

			return result;	
		}
		return f;
	}());

	var get_all_aberration_list = function(_gene) {
		var gene = _gene.aberration_list || [];
		var result = { type : [], value : [] };

		gene.forEach(function(_d, _i)   {
			var name = _utils.mutate(_d.type).name;
			
			if($.inArray(name, result.type) < 0)    {
				result.type.push(name);
			}
			result.value.push(_d.value);
		});
		return result;
	}

	var define_groups = function(_group_list)	{
		var group_array = [];

		for(var i = 0, len = _group_list.length ; i < len ; i++)	{
			var name = {
					group_name : _group_list[i],
					group_list : [],
			};
			group_array.push(name);
		}
		return group_array;
	}

	var group_by_sample = function(_data, _group_list)	{
		var group_array = define_groups(_group_list);

		for(var i = 0, len = _data.length ; i < len ; i++)	{
			var group = _utils.getObject(_data[i].sample_group, group_array, "group_name");
			if(group)	{
				group.group_list.push(_data[i]);
			}
		}
		return group_array;
	}

	var sort_by_groupname = function(_groups)	{
		if(_groups.length < 2)	{
			return _groups[0].group_list;
		}
		/* Should be write sorting logic here */

		return _groups[0].group_list;
	}

	var isArrayInObj  = function(_json)  {
		var result = false;

		for(var i = 0, len = Object.keys(_json).length ; i < len ; i++)		{
			var construct = _json[Object.keys(_json)[i]].constructor;

			if(construct === Array)	{
				result = true;
			}
		}
		return result;
	}

	var getArrayInObj = function(_json)   {
		var result = [];

		for(var i = 0, len = Object.keys(_json).length ; i < len ; i++)		{
			var obj = _json[Object.keys(_json)[i]];

			if(obj.constructor == Array)	{
				result.push(obj);
			}
		}
		return result;
	}

	var get_mutation_list = function(_list, _result)  {
		var list = _list || [];
		var typeName = "";
		var result = _result || { type_list : [], value_list : [] };

		list.map(function(_d, _i)   {
			if(isArrayInObj(_d))  {
				get_mutation_list(getArrayInObj(_d)[0], result);
			}
			else {
				typeName = _utils.mutate(_d.type).name;
				if($.inArray(typeName, result.type_list) < 0) { 
					result.type_list.push(typeName); 
				}
			}
		});
		result.type_list.splice(6, 1);
		return result;
	}

	var define_mutations = function(_mutation_list)	{
		var mutation_array = [];

		for(var i = 0, len = _mutation_list.length ; i < len ; i++)	{
			var mutations = {
				"name" : _mutation_list[i],
				"importance" : 0,
			}
			mutation_array.push(mutations);
		}
		return mutation_array;
	}

	var mutation_importance = function(_all, _mutation_list)	{
		var mutations = define_mutations(_mutation_list.type_list);

		for (var i = 0, len = _all.length ; i < len ; i++)	{
			for(var j = 0, leng = _all[i].type.length ; j < leng ; j++)	{
				var mutation = _utils.getObject(_all[i].type[j], mutations, "name");
				if(mutation)	{
					mutation.importance += 1;
				}
			}
		}
		return mutations.sort(function(_a, _b)	{
			return (_a.importance > _b.importance) ? 1 : -1;
		});
	}
	/* Stacked value sequance by importance of sample / gene name */
	var importance_by_name = function(_importance)	{	
		var result = [];

		for(var i = 0, len = _importance.length ; i < len ; i++)	{
			result.push(_importance[i].name);
		}
		return result;
	}

	var importanceValueOfGene = function(_symbol_list)	{
		var importanceGene = {};

		for(var i = 0, len = _symbol_list.length ; i < len ; i++)	{
			importanceGene[_symbol_list[i].name] = i + 1;
		}
		return importanceGene;
	}

	var importanceValueOfType = function(_type_list)	{
		var mappingType = {
			"Nonsense" : 3,
			"Synonymous" : 6,
			"Splice_Site" : 2,
			"Frame_shift_indel" : 1,
			"In_frame_indel" : 4,
			"Missense" : 5
		};
		var typeStr = makeStrArray(mappingType);

		for(var i = 0, len = _type_list.length ; i < len ; i++)	{
			typeStr[mappingType[_type_list[i].type] - 1] = 0;
		}
		return typeStr.join("");
	}

	var makeStrArray = function(_mapping)	{
		var result = [];

		for(var i = 0, len = Object.keys(_mapping).length ; i < len ; i++)	{
			result.push("1");
		}
		return result;
	}

	var makeImportanceGeneStr = function(_gene_list, _mapping)	{
		var geneStr = makeStrArray(_mapping);

		for(var i = 0, len = _gene_list.length ; i < len ; i++)	{
			var gene = _gene_list[i];
			var typeStr = importanceValueOfType(gene.aberration_list);
			var mappingGene = _mapping[gene.name];
			gene.sort_str = typeStr;
			gene.aberration_list.sort(function(_a, _b)	{
				return (_a.sort_text  > _b.sort_text) ? 1 : -1;
			})
			geneStr[mappingGene - 1] = 0;
		}
		return geneStr.join("");
	}	

	var initialSort = function(_data)	{
		var mappingGene = importanceValueOfGene(_data.symbol_list);

		for(var i = 0, len = _data.sample_list.length ; i < len ; i++)	{
			var sample = _data.sample_list[i];
			var geneStr = makeImportanceGeneStr(sample.gene_list, mappingGene);
			sample.sort_text = geneStr;
		}
		_data.sample_list.sort(function(_a, _b)	{
			return (_a.sort_text > _b.sort_text) ? 1 : -1;
		});
		return _data;
	}

	return function(_data)	{
		var presortdata = initialSort(_data.data);
		var sample_list = presortdata.sample_list;
		var symbol_list = presortdata.symbol_list;
		var genes = get_list_by_key("name", symbol_list);
		var samples = get_list_by_key("name", sample_list);
		var mutations = get_mutation_list(sample_list);

		_VO.VO.setInitSample(samples);
		_VO.VO.setInitGene(genes);
		_VO.VO.setSample(samples);
		_VO.VO.setGene(genes);

		var all_data = get_all_data(sample_list, samples);
		var importance = mutation_importance(all_data, mutations);
		var importance_name = importance_by_name(importance);
		var groups = group_by_sample(all_data, _data.data.group_list);
		var after_sort_groups = sort_by_groupname(groups);

		_setting_comutation(after_sort_groups, samples, genes, _data);
		_setting_gene(after_sort_groups, genes, importance_name);
		_setting_pq(_data.data.symbol_list, genes);
		_setting_sample(after_sort_groups, samples, importance_name);
		_setting_comutationnavigation(samples, genes);
		_setting_legend({
			data : mutations,
			view_id : "comutationplot_legend",
			type : "generic mutation",
			chart : "comutation",
		});
	};
});