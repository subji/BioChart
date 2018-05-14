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
		bio.iteration.loop(clinicals, function (clinical, values)	{
			var i = 0,
				beforeValue = '',
				sameLength = 1;

			bio.iteration.loop(values, function (v)	{
				if (beforeValue.length === v.length)	{
					sameLength += 1;
				} else {
					beforeValue = v;
				}
			});

			bio.iteration.loop(values, function (val, idx)	{
				var result = '#';

				if (val !== 'NA')	{
					var valueLen = val.length;

					i = i > valueLen ? i - valueLen : i;

					for (var len = i + 3; i < len; i++)	{
						var first = i.toString(16),
							secnd = isNaN(val.charCodeAt(i)) === true ? 
							val.charCodeAt(Math.abs(valueLen - i + (sameLength - 3))).toString(16).split('')[1] : 
							val.charCodeAt(i).toString(16).split('')[1];

						if (i % 2 == 0)	{
							result += (secnd + first);
						} if (i % 3 == 0)  {
							result += (first + secnd);
						} else {
							// console.log(first, secnd)
							// result += (first.substring(0, 2) + secnd.substring(0, 2) + first.substring(2, 3) + secnd.substring(2, 3));
							// console.log(result);
						}
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
			var na = null;

			if (values.indexOf('NA') > -1)	{
				na = values.splice(
				values.indexOf('NA'), 1);

				bio.iteration.loop(values.sort(function (a, b)	{
					return a > b ? 1 : -1;
				}), 
				function (v, i)	{
					if (!model[v])	{
						model[v] = { order: i + 1 };
					}
				});

				model['NA'] = { order: values.length + 1 };

				values.push(na[0]);
			}	else {
				bio.iteration.loop(values.sort(function (a, b)	{
					return a > b ? 1 : -1;
				}), 
				function (v, i)	{
					if (!model[v])	{
						model[v] = { order: i + 1 };
					}
				});			
			}
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