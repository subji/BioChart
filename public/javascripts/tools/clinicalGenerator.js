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
		// console.log(clinicals);
		bio.iteration.loop(clinicals, 
		function (clinical, values)	{
			var i = 0;

			bio.iteration.loop(values, function (val, idx)	{
				var result = '#';

				// console.log(val);

				if (val !== 'NA')	{
					var valueLen = val.length;

					// if (val.length === 1)	{
					// 	console.log(isNaN(val.charCodeAt(2)))
					// } 


					i = i > valueLen ? i - valueLen : i;

					for (var len = i + 3; i < len; i++)	{
						var first = i.toString(16),
								secnd = val.charCodeAt(i).toString(16).split('')[1];

						result += (secnd + first);
					}

					model[val].color = result;
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