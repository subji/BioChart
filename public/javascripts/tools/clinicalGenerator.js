function clinicalGenerator ()	{
	'use strict';

	var model = {},
			naColor = '#D6E2E3';

	function colorGenerator (colors)	{
		console.log(d3.rgb(colors).toString(16))
	};

	function setStartColors (clinicalLength)	{
		var start = '#04CDA4';

		colorGenerator(start);
	};
	/*
		Clinical 의 색상을 지정해주는 함수.
		이는 Clinical 의 개수와 상관없이 일정하게 
		색상을 정해준다.
	 */
	function colors (clinicals)	{
		var startColors = setStartColors(
									Object.keys(clinicals).length);

		bio.iteration.loop(clinicals, 
		function (clinical, values)	{
			console.log(clinical, values);
		});
	};

	function orders (clinicals)	{
		bio.iteration.loop(clinicals, 
		function (clinical, values)	{
			if (values.indexOf('NA') > -1)	{
				values.push(
				values.splice(
				values.indexOf('NA'), 1)[0]);
			}

			bio.iteration.loop(values, 
			function (v, i)	{
				if (!model[v])	{
					model[v] = { order: i + 1 };
				}
			});
		});
	};

	function landscapeDataToArr (data)	{
		var clinicals = {};

		bio.iteration.loop(data, function (group)	{
			bio.iteration.loop(group, function (gp)	{
				if (clinicals[gp.y])	{
					if (clinicals[gp.y].indexOf(gp.value) < 0)	{
						clinicals[gp.y].push(gp.value)
					}
				} else {
					clinicals[gp.y] = [gp.value];
				}
			});
		});

		orders(clinicals);
		colors(clinicals);
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