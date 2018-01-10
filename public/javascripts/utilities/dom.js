function dom ()	{
	'use strict';

	var model = {};
	/*
		'#ID', '.Class' 중 존재하는 엘리먼트를 반환하는 함수.
	 */
	model.get = function (ele)	{
		if (typeof(ele) === 'object')	{
			return ele;
		}

		var classify = ['#', '.'],
				classifyName = ele.removeSymbol(),
				result = null;

		bio.iteration.loop(classify, function (symbol)	{
			var name = symbol + classifyName,
					dom = document.querySelector(name);

			if (dom)	{
				result = dom;
			}
		});

		return result;
	};

	model.remove = function (element, childs)	{
		if (bio.objects.getType(element).indexOf('HTML') < 0)	{
			throw new Error('Not a dom element');
		}

		bio.iteration.loop(childs, function (child)	{
			element.removeChild(child);
		});
	};
	/*
		Element 파라미터 하위 Element 들을 
		모두 제거하는 함수.
	 */
	model.removeAll = function (element)	{
		if (bio.objects.getType(element).indexOf('HTML') < 0)	{
			throw new Error('Not a dom element');
		}

	 	while (element.firstChild)	{
	 		element.removeChild(element.firstChild);
	 	}
	};

	model.siblings = function (child)	{
		var siblingList = [];

		for (var n = child.length - 1; n >= 0; n--)	{
			siblingList.push(child[n]);
		}

		return siblingList;
	};

	return function ()	{
		return model;
	};
};