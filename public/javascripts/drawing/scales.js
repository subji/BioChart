function scales ()	{
	'use strict';

	var model = {};
	/*
		Ordinal scale 반환.
	 */
	model.ordinal = function (domain, range)	{
		return bio.dependencies.version.d3v4() ? 
					 d3.scaleBand().domain(domain).range(range) : 
					 d3.scale.ordinal().domain(domain).rangeBands(range);
	};
	/*
	 	Linear scale 반환.
	 */
	model.linear = function (domain, range)	{
		return bio.dependencies.version.d3v4() ? 
					 d3.scaleLinear().domain(domain).range(range) : 
					 d3.scale.linear().domain(domain).range(range);
	};
	/*
		Domain 데이터에서 첫번째 값이 정수일 경우
		이는 Linear 데이터로 분류하고 그 외에는 Ordinal 로 분류한다. 
	 */
	function scaleType (domain)	{
		return bio.objects.getType(domain[0]) === 'Number' ? 
					 'linear' : 'ordinal';
	};
	/*
		Ordinal/ Linear 스케일을 반환하는 함수.
	 */
	model.get = function (domain, range)	{
		return model[scaleType(domain)](domain, range);
	};
	/*
		반전된 Scale 을 반환하는 함수.
	 */
	model.invert = function (scale)	{
		var domain = scale.domain(),
				range = scale.range();

		var sc = scaleType(domain) === 'linear' ? 
				bio.dependencies.version.d3v4() ? 
				d3.scaleLinear() : d3.scale.linear() : 
				bio.dependencies.version.d3v4() ? 
				d3.scaleQuantize() : d3.scale.quantize();

		return sc.domain(range).range(domain);
	};
	/*
		Scale bandWidth 값을 반환한다.
	 */
	model.band = function (scale)	{
		return bio.dependencies.version.d3v4() ? 
					scale.bandwidth() : scale.rangeBand();
	};	

	return function ()	{
		return model;
	};
};