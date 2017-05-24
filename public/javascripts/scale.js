'use strict';
// 일단, D3 에 있는 scale 함수를 사용하여 그리고
// 후에 scale 알고리즘을 파악하고 공부하여 새로 만드는것으로 하자.
var scale = (function (scale)	{
	var model = {
		data: [],
		len: [],
	};
	/**
	 It is a function that make a domain data that is available for scale of d3's function and
	 calculate data length. 
	 */
	function domainData (type, data)	{
		var result = [];

		if (typeof data[0] === 'number' && typeof data[0] === 'number')	{
			var max = Math.max(data[0], data[1]),
					min = Math.min(data[0], data[1]),
					len = max - min;

			for (var i = min; i < len; i++)	{
				result.push(i);
			}

			return (
				model.data.push(result), model.len.push(len), 
				type === 'ordinal' ? result : [min, max]
			);
		} else {
			return model.data.push(data), model.len.push(data.length), data;
		}
	};
	/**
	 It is a function that generate scale about ordinal. 
	 currently it is only use d3js but later it should changes to native code.
	 */
	scale.ordinal = function (domain, range)	{
		return d3.scaleBand().domain(domainData('ordinal', domain)).range(range);
	}
	/**
	 It is a function that generate scale about linear. 
	 currently it is only use d3js but later it should changes to native code.
	 */
	scale.linear = function (domain, range)	{
		return d3.scaleLinear().domain(domainData('linear', domain)).range(range);
	};

	scale.getDomain = function ()	{
		return model.data.shift();
	};

	scale.getDomainLength = function ()	{
		return model.len.shift();
	};

	scale.getDistance = function (scale, data)	{
		return data.length < 2 ? scale(data[0]) : scale(data[1]) - scale(data[0]);
	};

	scale.date = function ()	{
		console.log('Date');
	};

	return scale;
}(scale||{}));