function clinicalGenerator ()	{
	'use strict';

	var model = {},
			naColor = '#D6E2E3';

	function getRandomColor ()	{
		var letters = '0123456789ABCDEF',
				color = '#';

		for (var i = 0; i < 6; i++)	{
			color += letters[Math.floor(Math.random() * 16)];
		}

		return color;
	}
	/*
		Clinical 의 색상을 지정해주는 함수.
		이는 Clinical 의 개수와 상관없이 일정하게 
		색상을 정해준다.
	 */
	function colors (clinicals)	{
		bio.iteration.loop(clinicals, 
		function (clinical, values)	{
			bio.iteration.loop(values, function (val)	{
				if (val !== 'NA')	{
					model[val].color = '#333333';
				} else {
					model[val].color = naColor;
				}
			});
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

	function setClinicals (obj, key, val)	{
		if (obj[key])	{
			if (obj[key].indexOf(val) < 0)	{
				obj[key].push(val)
			}
		} else {
			obj[key] = [val];
		}
	};

	function landscapeDataToArr (data)	{
		var clinicals = {};

		bio.iteration.loop(data, function (group)	{
			bio.iteration.loop(group, function (gp)	{
				setClinicals(clinicals, gp.y, gp.value);
			});
		});

		orders(clinicals);
		colors(clinicals);
	};

	function expressionDataToArr (data)	{
		var clinicals = {};

		bio.iteration.loop(data, function (d)	{
			bio.iteration.loop(d.value, function (val)	{
				setClinicals(clinicals, d.key, val);
			});
		});
		
		orders(clinicals);
		colors(clinicals);
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
		model = {};

		toArrClinicalData(clinicalData, chart);
		
		bio.boilerPlate.clinicalInfo = model;
	};
};