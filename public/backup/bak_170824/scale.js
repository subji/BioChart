// 일단, D3 에 있는 scale 함수를 사용하여 그리고
// 후에 scale 알고리즘을 파악하고 공부하여 새로 만드는것으로 하자.
var scale = (function (scale)	{
	'use strict';
	
	var model = {
		data: [],
		len: [],
	};
	/**
	 It is a function that make a domain data that is 
	 available for scale of d3's function and
	 calculate data length. 
	 */
	function domainData (type, data)	{
		var result = [];

		if (typeof data[0] === 'number' && 
				typeof data[1] === 'number' && data.length < 3)	{
			var max = Math.max(data[0], data[1]),
					min = Math.min(data[0], data[1]),
					len = (max + min) - min;

			for (var i = min; i <= len; i++)	{
				result.push(i);
			}

			return (
				model.data.push(result), model.len.push(len), 
				type === 'ordinal' ? result : [data[0], data[1]]
			);
		} else {
			return model.data.push(data), 
						 model.len.push(data.length), data;
		}
	};
	/**
	 It is a function that generate scale about ordinal. 
	 currently it is only use d3js but later 
	 it should changes to native code.
	 */
	scale.ordinal = function (domain, range)	{
		var dd = domainData('ordinal', domain);

		return !d3.scaleBand ? 
						d3.scale.ordinal().domain(dd).rangeBands(range) : 
						d3.scaleBand().domain(dd).range(range);
	}
	/**
	 It is a function that generate scale about linear. 
	 currently it is only use d3js but later 
	 it should changes to native code.
	 */
	scale.linear = function (domain, range)	{
		var dd = domainData('linear', domain);

		return !d3.scaleLinear ? 
						d3.scale.linear().domain(dd).range(range) : 
						d3.scaleLinear().domain(dd).range(range);
	};

	scale.getType = function (data)	{
		return typeof(data[0]) === 'number' ? 'linear' : 'ordinal';
	};

	scale.compatibleBand = function (scale)	{
		return !scale.bandwidth ? 
						scale.rangeBand() : scale.bandwidth();
	};

	scale.getDomain = function ()	{
		return model.data.shift();
	};

	scale.getDomainLength = function ()	{
		return model.len.shift();
	};

	scale.getDistance = function (type)	{
		return type === 'ordinal' ? scale.compatibleBand() : 
					 scale(1) - scale(0);
	};
	/*
		도메인 값의 첫번째 값이 문자열일 경우 ordinal,
		숫자일 경우 linear를 반환한다.
	 */
	function analScale (d)	{
		return util.varType(d[0]) === 'String' ? 
					'ordinal' : 'linear';
	};
	/*
		domain 에 따라 ordinal, linear 를 구분한 후
		맞는 스케일을 반환한다.
	 */
	scale.get = function (d, r)	{
		return scale[analScale(d)](d, r);
	};
	/*
		기존 Scale 에서 거꾸로된 Scale 을 반환하는 함수.
	 */
	scale.invert = function (scale)	{
		var domain = scale.domain(),
				range = scale.range();

		var s = analScale(domain) === 'linear' ? 
				util.d3v4() ? d3.scaleLinear() : d3.scale.linear() : 
				util.d3v4() ? d3.scaleQuantize() : d3.scale.quantize();
														 
		return s.domain(range).range(domain);
	};

	return scale;
}(scale||{}));