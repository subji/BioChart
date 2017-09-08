var landscapeSort = (function (landscapeSort)	{
	'use strict';

	var model = {
		exclusive: [],
	};
	/*
		정렬하는 기준이 해당되는 데이터를 찾아오는
		함수.
	 */
	function findData (type, data)	{
		switch (type)	{
			case 'gene': return data.stack.gene; break;
			case 'sample': return data.stack.sample; break;
			case 'pq': return data.pq; break;
			case 'init': return data.init; break;
			default: 
			throw new Error('No matching any data'); break;
		}
	};
	/*
		Stacked 데이터를 정렬하기위해선 해당 값에 대한
		Stacked 데이터를 합해주어야 한다.
	 */
	function byValue (data, what)	{
		var obj = {};

		util.loop(data, function (d, i)	{
			obj[d[what]] = obj[d[what]] ? 
			obj[d[what]] += d.value : obj[d[what]] = d.value;
		});

		return obj;
	};
	/*
		Object 데이터를 sort 함수 사용을 위해
		배열로 변경시켜주는 함수.
	 */
	function toObjectArray (data)	{
		var arr = [];

		util.loop(data, function (k, v)	{
			arr.push({ key: k, value: v });
		});

		return arr;
	}
	/*
		중복되는 부분, 정렬 방향에 따른 값과,
		그에 따른 정렬함수 실행을 하는 함수.
	 */
	function ascdesc (sort, data)	{
		var w = sort === 'asc' ? 1 : -1;

		return data.sort(function (a, b)	{
			return a.value > b.value ? 1 * w : -1 * w;
		});
	};
	/*
		Mutation 을 기준으로 오름차순,내림차순 정렬을
		하는 함수.
	 */
	function alignByMutation (sort, data)	{
		var dt = ascdesc(sort, toObjectArray(byValue(data, 'y')));

		return { 
			axis: 'y', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		Sample 을 기준으로 오름차순,내림차순 정렬을
		하는 함수.
	 */
	function alignBySample (sort, data)	{
		var dt = ascdesc(sort, toObjectArray(byValue(data, 'x')));
		
		return { 
			axis: 'x', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		PQ value 를 기준으로 오름차순,내림차순 정렬을
		하는 함수.
	 */
	function alignByPQvalue (sort, data)	{
		var dt = ascdesc(sort, data);

		return { 
			axis: 'y', data: dt.map(function (d)	{ return d.y; })
		};
	};
	/*
		정렬한 기준에 맞는 함수를 호출해주는 함수.
	 */
	function callMatchingFunction (type, sort, data)	{
		switch (type)	{
			case 'gene': return alignByMutation(sort, data); break;
			case 'sample': return alignBySample(sort, data); break;
			case 'pq': return alignByPQvalue(sort, data); break;
			default: throw new Error('Not matching any function'); break;
		};
	};
	/*
		type string 을 만들어주는 함수. 
		exclusive 를 위해서 이다.
	 */
	function typeStrForExclusive (r, g, t)	{
		var gIdx = g.indexOf(t.y) * 2,
				mIdx = config.landscape.case(t.value) === 'cnv' ? 0 : 1;

		r.value = r.value.replaceAt(gIdx, '00'.replaceAt(mIdx, '1'));
	};
	/*
		Gene 만큼의 배열을 모두 '00' 으로 초기화 하는 함수.
	 */
	function fillZero (len)	{
		var str = '';

		for (var i = 0; i < len; i++)	{
			str += '00';
		}

		return str;
	};
	/*
		추려진 sample 들을 문자열에 따라 정렬한다.
	 */
	function sortByExclusive (sa)	{
		var r = sa.sort(function (a, b)	{
			return a.value < b.value ? 1 : -1;
		}).map(function (d, i)	{
			return d.key;
		});

		return { axis: 'x', data: r };
	};
	/*
		Landscape 에서 중앙의 heatmap 이 exclusive 
		하게 보여지기 위한 데이터를 만드는 함수.
	 */
	landscapeSort.exclusive = function (main, gene)	{
		var t = {},
				r = [],
				i = 0;

		util.loop(main, function (d)	{
			if (!t[d.x])	{
				t[d.x] = true;
				r.push({ key: d.x, value: fillZero(gene.length) });
				i += 1;
			} else {
				t[d.x] = t[d.x];
			}
			
			typeStrForExclusive(r[i - 1], gene, d);
		});

		return model.exclusive = r, sortByExclusive(r);
	};
	/*
		Gene, Sample, PQ 의 순서가 오름차순 정렬로
		되게끔 만드는 함수.
	 */
	landscapeSort.asc = function (type, data)	{
		return callMatchingFunction(type, 'asc', findData(type, data));
	};
	/*
		Gene, Sample, PQ 의 순서가 내림차순 정렬로
		되게끔 만드는 함수.
	 */
	landscapeSort.desc = function (type, data)	{
		return callMatchingFunction(type, 'desc', findData(type, data));
	};
	/*
		개별 Gene 에 대한 Sort 를 한다.
	 */
	landscapeSort.byGene = function (std, data)	{
		var exc = landscapeSort.exclusive(data, data[0].y);

		util.loop(std, function (d)	{
			if (exc.data.indexOf(d) < 0)	{
				exc.data.push(d);
			}
		});

		return exc;
	};
	/*
		Group 명 별로 키값을 만들어 데이터를 분류하는 함수.
	 */
	function byGroupMakeObj (data)	{
		var obj = {};

		util.loop(data, function (d, i)	{
			!obj[d.value] ? obj[d.value] = [d] : 
											obj[d.value].push(d);
		});

		return obj;		
	};
	/*
		Obj 의 키값을 순서대로 정렬하고 각각의 데이터를 배열화 하는 함수.
	 */
	function byGroupResult (obj)	{
		var result = [];

		util.loop(Object.keys(obj).sort(function (a, b)	{
			return config.landscape.orderedName.indexOf(a) > 
						 config.landscape.orderedName.indexOf(b) ? 
						 1 : -1;
		}), function (d, i)	{
			result.push(obj[d]);
		});

		return result;		
	};

	function byGroupExclusive (group)	{
		var that = this,
				heat = [];

		util.loop(group, function (d, i)	{
			var tempHeat = [];

			util.loop(d, function (dd, ii)	{
				tempHeat = tempHeat.concat(dd.info);
			});

			 heat.push(
			 	landscapeSort.exclusive(tempHeat, that.data.gene));
		});

		return heat;
	};
	/*
		Group 별로 정렬하는 데이터를 만들어주는 함수.
	 */
	function byGroupProc (data)	{
		var obj = byGroupMakeObj(data),
				gr = byGroupResult(obj),
				ht = byGroupExclusive.call(this, gr),
				result = {};

		util.loop(ht, function (d, i)	{
			result.axis = d.axis;
			result.data ? result.data.push(d.data) : 
										result.data = [d.data];
		});

		return { group: gr, axis: result };				
	};
	/*
		이전에 선택된 그룹과 새로 전달된 그룹데이터에서
		맞는 데이터를 뽑는다.
	 */
	function byGroupMatching (data, group)	{
		var result = [];

		util.loop(data, function (d, i)	{
			util.loop(group, function (g, j)	{
				if (d.x === g.x)	{
					result.push(d);
				}
			});
		});

		return result;
	};
	/*
		Group 의 속성 priority 순서로 정렬하는 함수.
	 */
	landscapeSort.byGroup = function (data, isAlt)	{
		if (isAlt)	{
			if (this.now.group.length < 1)	{
				throw new Error ('There are empty now group data');
			}	

			var that = this,
					temp = [],
					result = { group: [], axis: { 
						axis: 'x', data: [],
					} };

			util.loop(this.now.group.group, function (d, i)	{
				temp.push(
					byGroupProc.call(that, byGroupMatching(data, d)));
			});

			util.loop(temp, function (d, i)	{
				result.group = result.group.concat(d.group);
				result.axis.data = 
				result.axis.data.concat(d.axis.data);
			});

			return result;
		}

		return byGroupProc.call(this, data);
	};

	return landscapeSort;

}(landscapeSort||{}));