function clinicalGenerator ()	{
	'use strict';

	var model = {};
	/*
		Clinical 의 색상을 지정해주는 함수.
		이는 Clinical 의 개수와 상관없이 일정하게 
		색상을 정해준다.
	 */
	function colors ()	{
		
	};

	function orders ()	{

	};

	function landscapeDataToArr (data)	{
		var clinicals = {};

		bio.iteration.loop(data, function (gp)	{
			// clinicals[gp]
			console.log(gp);
		});
		// return null;
	};

	function expressionDataToArr (data)	{
		return null;
	};

	function toArrClinicalData (clinicalData, chart)	{
		var result = [];

		if (chart === 'landscape')	{
			landscapeDataToArr(clinicalData);
		} else if (chart === 'expression')	{
			expressionDataToArr(clinicalData);
		}


	};

	return function (clinicalData, chart)	{
		console.log(clinicalData, chart)
		toArrClinicalData(clinicalData, chart);

		return null;
	};
};