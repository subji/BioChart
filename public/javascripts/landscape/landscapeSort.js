function landscapeSort ()	{
	'use strict';

	var model = {};
	/*
		Stacked 데이터를 정렬하기위해선 해당 값에 대한
		Stacked 데이터를 합해주어야 한다.
	 */
	function byStack (data, what)	{
		var obj = {};

		bio.iteration.loop(data, function (d, i)	{
			obj[d[what]] = obj[d[what]] ? 
			obj[d[what]] += d.value : obj[d[what]] = d.value;
		});

		return obj;
	};
	/*
		Object 데이터를 sort 함수 사용을 위해
		배열로 변경시켜주는 함수.
	 */
	function toObject (data)	{
		var arr = [];

		bio.iteration.loop(data, function (key, value)	{
			arr.push({ key: key, value: value });
		});

		return arr;
	}
	/*
		중복, 정렬에 따른 값과, 그에 따른 정렬함수 실행을 하는 함수.
	 */
	function ascdesc (sort, data)	{
		var w = sort === 'asc' ? 1 : -1;

		return data.sort(function (a, b)	{
			return a.value > b.value ? 1 * w : -1 * w;
		});
	};
	/*
		Mutation 을 기준으로 오름차순,내림차순 정렬을 하는 함수.
	 */
	function byMutation (align, data)	{
		var dt = ascdesc(align, toObject(byStack(data, 'y')));

		return { 
			axis: 'y', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		Sample 을 기준으로 오름차순,내림차순 정렬을 하는 함수.
	 */
	function bySample (align, data)	{
		var dt = ascdesc(align, toObject(byStack(data, 'x')));
		
		return { 
			axis: 'x', data: dt.map(function (d) { return d.key; })
		};
	};
	/*
		PQ value 를 기준으로 오름차순,내림차순 정렬을 하는 함수.
	 */
	function byPQ (align, data)	{
		var dt = ascdesc(align, data);

		return { 
			axis: 'y', data: dt.map(function (d)	{ return d.y; })
		};
	};
	/*
		정렬 기준에 맞는 정렬 함수를 호출하는 함수.
	 */
	function toAlignment (type, align, data)	{
		switch (type)	{
			case 'gene': return byMutation(align, data); break;
			case 'sample': return bySample(align, data); break;
			case 'pq': return byPQ(align, data); break;
			default: throw new Error('Not matching function'); break;
		}
	};
	/*
		정렬 기준이 되는 데이터를 찾아 반환하는 함수.
	 */
	function getData (type, data)	{
		switch (type)	{
			case 'gene': return data.stack.gene; break;
			case 'sample': return data.stack.sample; break;
			case 'pq': return data.pq; break;
			case 'init': return data.init; break;
			default: throw new Error('No matching any data'); break;
		}
	};
	/*
		gene, sample, pq 오름차순 정렬 함수.
	 */
	function byAsc (type, data)	{
		return toAlignment(type, 'asc', getData(type, data));
	};
	/*
		gene, sample, pq 오름차순 내림 함수.
	 */
	function byDesc (type, data)	{
		return toAlignment(type, 'desc', getData(type, data));
	};
	/*
		개별 gene 에 대한 정렬 함수.
	 */
	function byGene (genes, data)	{
		var toExclusive = bio.landscapeSort()
												 .exclusive(data, data[0].y);

		bio.iteration.loop(genes, function (gene)	{
			if (toExclusive.data.indexOf(gene) < 0)	{
				toExclusive.data.push(gene);
			}
		});

		return toExclusive;
	};
	/*
		Obj 의 키값을 순서대로 정렬하고 각각의 데이터를 배열화 하는 함수.
	 */
	function resultGrouping (obj)	{
		var result = [];

		bio.iteration.loop(Object.keys(obj).sort(function (a, b)	{
			return bio.boilerPlate.clinicalInfo[a].order > 
						 bio.boilerPlate.clinicalInfo[b].order ? 1 : -1;
		}), function (d, i)	{
			result.push(obj[d]);
		});

		return result;		
	};
	/*
		Group 을 exclusive 하게 만들어주는 함수.
	 */
	function exclusiveGroup (groups)	{
		var heat = [];

		bio.iteration.loop.call(this, groups, function (group)	{
			var temp = [];

			bio.iteration.loop(group, function (g)	{
				temp = temp.concat(g.info);
			});

			heat.push(
				bio.landscapeSort().exclusive(temp, this.data.gene));
		});

		return heat;
	};
	/*
		그룹 별로 정렬된 데이터를 만들어 반환하는 함수.
	 */
	function groupSort (data)	{
		var obj = makeObjectByGroup(data),
				group = resultGrouping(obj),
				heatmap = exclusiveGroup.call(this, group),
				result = {};

		console.log(obj)

		bio.iteration.loop(heatmap, function (h)	{
			result.axis = h.axis;
			result.data ? result.data.push(h.data) : 
										result.data = [h.data];
		});

		return { group: group, axis: result };
	};
	/*
		이전에 선택된 그룹과 새로 전달된 그룹을 비교해
		맞는 그룹 데이터를 뽑아주는 함수.
	 */
	function matching (data, nowGroup)	{
		var result = [];

		bio.iteration.loop(data, function (d)	{
			bio.iteration.loop(nowGroup, function (ng)	{
				if (d.x === ng.x)	{
					result.push(d);
				}
			});
		});

		return result;
	};
	/*
		그룹명을 클릭하였을 때, 재정렬한다.
	 */
	function byGroup (data, alt)	{
		if (alt)	{
			if (this.now.group.length < 1)	{
				throw new Error ('There are empty group data');
			}

			var temp = [],
					result = {
						group: [], axis: { axis: 'x', data: [] }
					};

			bio.iteration.loop.call(this, this.now.group.group, 
			function (ng)	{
				temp.push(groupSort.call(this, matching(data, ng)));
			});

			bio.iteration.loop(temp, function (t)	{
				result.group = result.group.concat(t.group);
				result.axis.data = 
				result.axis.data.concat(t.axis.data);
			});

			return result;
		} 

		return groupSort.call(this, data);
	};
	/*
		Type 을 문자열의 형태로 바꿔주는 함수.
	 */
	function typeToString (result, genes, data, type)	{
		bio.iteration.loop(result, function (r)	{
			bio.iteration.loop(data, function(d)	{
				if (d.x === r.key)	{
					var geneIdx = genes.indexOf(d.y) * 2,
							mutIdx = geneIdx + 1,
							mutVal = bio.landscapeConfig()
													.byCase(d.value);
					r.value = r.value.replaceAt(geneIdx, '1');
					r.value = r.value.replaceAt(mutIdx, mutVal === 'cnv' ? 
																		 (type === '1' ? '1' : '0') : '0');
				}
			});
		});

		return result;
	};
	/*
		앞서 만들어진 Exclusive 용 데이터를 여기 함수에서
		Sort 을 한다.
	 */
	function sortByExclusive (result)	{
		var res = result.sort(function (a, b)	{
			return a.value < b.value ? 1 : -1;
		}).map(function (r)	{
			return r.key;
		});

		return { axis: 'x', data: res };
	};
	/*
		Exclusive 하게 보여지는데 필요한 데이터를 만드는 함수.
	 */
	function exclusive (data, genes, type)	{
		var temp = {},
				result = [],
				idx = 0;

		bio.iteration.loop(data, function (d)	{
			if (!temp[d.x])	{
				temp[d.x] = true;

				result.push({
					key: d.x,
					// Type & Gene 두개의 문자가 합쳐진 문자열로 Gene 개수만큼
					// 문자열을 만든다.
					value: [].fill(genes.length, '00').join('')
				});
			} else {
				temp[d.x] = temp[d.x];
			}
		});

		typeToString(result, genes, data, type);
		
		return model.exclusive = result, sortByExclusive(result);
	};
	/*
		그룹 명 별로 키값을 만들어 각각의 데이터를 분류하는 함수.
	 */
	function makeObjectByGroup (data)	{
		var obj = {};

		bio.iteration.loop(data, function (d)	{
			!obj[d.value] ? obj[d.value] = [d] : 
											obj[d.value].push(d);
		});

		return obj;
	};

	return function ()	{
		model = bio.initialize('landscapeSort');

		return {
			asc: byAsc,
			desc: byDesc,
			gene: byGene,
			group: byGroup,
			exclusive: exclusive,
		};
	};
};