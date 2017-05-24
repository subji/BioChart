'use strict';

var exclusive = (function ()	{
	function makeFrame(ele, sizes)	{
		// console.log(sizes);

		for (var s in sizes)	{
			var e = document.createElement('div');
					e.id = s;
					e.style.width = sizes[s].w + 'px';
					e.style.height = sizes[s].h + 'px';

			ele.appendChild(e);
		}
	};

	function toNetwork(key, data) {
		var id_regex = /id:\w+/ig,
				result = [];

		function toRgb(txt)	{
			return 'rgb(' + txt.split(' ').join(',') + ')';
		}

		data.split('\n').splice(1).filter(function (d, i)	{
			var obj = {};

				if(d.match(id_regex)[0].replace(key, '') === 'id:')	{
					d.split('\t').filter(function (ts)	{
						obj[ts.split(':')[0]] = 
						ts.split(':')[0].indexOf('color') > -1 ? 
						toRgb(ts.split(':')[1]) : ts.split(':')[1];	
					});

					result.push(obj);
				}
		});

		return result;
	};

	function toHeatmap(key, data) {
		var k = key.replace(/\s/g, ''),
				genes = key.split(' '),
				result = [];

		var targeted = data.split('\n\n').filter(function (d, i)	{
			var m = (/[\[][\w(\s|,)]+[\]]/g).exec(d.split('\n'))[0].replace((/\[|\]|\s/g), '');

			if (k.indexOf(m) > -1)	{
				return d;
			}
		})[0].split('\n').filter(function (d, i)	{
			if (i > 0)	{
				var idx = 0,
						len = 0,
						tg = '';

				genes.forEach(function (g)	{
					if (d.indexOf(g) > -1)	{
						idx = d.indexOf(g);
						len = g.length;
					}
				});

				tg = d.substring(idx, idx + len);

				d.substring(0, idx - 2).split('').forEach(function (d, i)	{
					result.push({
						x: i,
						y: tg,
						value: d,
					});
				})
			}
		});

		return result;
	};

	function toHeatmapAxis (data)	{
		var y = {}, x = 0, len = 0;

		for (var i = 0, l = data.length; i < l; i++)	{
			y[data[i].y] = 1;
		}

		return {
			x: [0, data.length / Object.keys(y).length],
			y: Object.keys(y),
		};
	};

	function toSurvival() {

	};

	function toGrouping()	{

	};

	return function (opts)	{
		var e = opts.element || null,
				dq = document.querySelector(e),
				w = parseFloat(opts.width || dq.style.width || 800),
				h = parseFloat(opts.height || dq.style.height || 400);

		makeFrame(dq, size.chart.mutualExt(dq, w, h));

		var sample = 'MAPK1 BRAF KRAS NF1 EGFR HGF';
		var test = new RegExp(sample.replace(/\s/g, '|'), 'ig');
		var hm = toHeatmap(sample, opts.heatmap); 

		// network({
		// 	data: toNetwork(test, opts.network),
		// 	element: '#network',
		// });
		/** 
		 data: heatmap data [{x:'x', y:'y', value:'value'}, ...],
		 margin: heatmap margin [top, left, bottom, right],
		 axis: { x: {
		 		scale: 'scale type', 
		 		data: 'only list or array',
		 		location: 'top / left / bottom / right',
		 		range: 'normal / riverse' normal is 0 - n, riverse is n - 0,
		 		ticks: 'true / false' is ticks showing or not,
		 		base: 'true / false' is baseline showing or not,
				text: 'true / false' is text of axis showing or not,
		 	}
		 },
		 element: 'targeted div or other element',
		 rect: if you are defined overlap over 0 then use this options. it is only array.
		 */
		heatmap({
			data: hm,
			margin: [20, 40, 20, 20],
			element: '#heatmap',
			axis: {
				x: { 
					location: 'bottom',
					scale: 'ordinal', 
					data: toHeatmapAxis(hm).x,
					ticks: false,
					base: false, 
					text: false,
				},
				y: { 
					location: 'left',
					scale: 'ordinal', 
					data: toHeatmapAxis(hm).y,
					ticks: false,
					base: false, 
				},
			},
			rect: [
				function (d) {
					return {
						top: d.scaleY(d.y) + 1,
						left: d.scaleX(d.x) + 0.25,
						width: d.scaleX.bandwidth() + 0.5,
						height: d.scaleY.bandwidth() - 2,
						fillStyle: config.mutualExColor(d.value).bg,
					};
				},
				function (d) {
					var topAdd = 0, heiAdd = d.scaleY.bandwidth();

					if (d.value === 'M' || d.value === 'B' || d.value === 'E')	{
						topAdd = d.scaleY.bandwidth() / 3;
						heiAdd = topAdd;
					}

					return {
						top: d.scaleY(d.y) + topAdd + 1,
						left: d.scaleX(d.x) + 0.25,
						width: d.scaleX.bandwidth() + 0.5,
						height: heiAdd - 2,
						fillStyle: config.mutualExColor(d.value).ins,
					};
				}
			]
		});
		survival({
			element: '#survival',
		});
		// grouping();
	};
}());