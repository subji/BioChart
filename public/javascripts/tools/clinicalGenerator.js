function clinicalGenerator ()	{
	'use strict';

	var model = {}, 
		naColor = '#D6E2E3';
	/*
		Clinical 의 색상을 지정해주는 함수.
		이는 Clinical 의 개수와 상관없이 일정하게 
		색상을 정해준다.
	 */
	function colors (clinicals)	{
		var idx = 1,
			clinicalColorArr = [],
			colorArr = [];

		function getHexaString (num)	{
			num = parseInt(num);

			if (num <= 15)	{
				return num.toString(16);
			} else {
				var remain = Math.round(num / 15) + (num % 15);

				if (remain <= 15)	{
					return remain.toString(16);
				} else {
					return getHexaString(remain);
				}
			}
		};

		bio.iteration.loop(clinicals, function (c, values)	{
			var colorText = c.hashCode(idx++);

			bio.iteration.loop(values, function (v, i)	{
				colorText += v.hashCode(i) + c.hashCode(i * 2);
			});

			clinicalColorArr.push(colorText);
			colorArr.push([]);
		});

		bio.iteration.loop(clinicalColorArr, function (text, index)	{
			var hexTxt = '';

			for (var i = 0, l = text.length; i < l; i+=2)	{
				hexTxt += getHexaString(text.substring(i, i + 2));

				if (hexTxt.length === 6)	{
					colorArr[index].push('#' + hexTxt);
					hexTxt = '';
				}
			}
		});

		bio.iteration.loop(colorArr, function (c, ci) {
			var key = Object.keys(clinicals)[ci];

			bio.iteration.loop(clinicals[key], function (v, vi) {
				if (v !== 'NA')	{
					model[v].color = colorArr[ci][vi];
				} else {
					model[v].color = naColor;
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