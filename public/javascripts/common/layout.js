function layout ()	{
	'use strict';

	var model = {
		svg: {
			pathway: {},
			variants: {},
			landscape: {},
			expression: {},
			exclusivity: {},
		},
	};
	/*
		ID 목록에 포함된 (Except 파라미터를 제외한) svg 엘리먼트를 만든다.
	 */
	function create (expt, chart, ids, isPlotted)	{
		if (!ids)	return;

		bio.iteration.loop(ids, function (id)	{
			var isId = true,
					isDraw = true;

			bio.iteration.loop(expt, function (e)	{
				if (id.indexOf(e) > -1)	{
					isId = !isId;
				}
			});

			if (isId)	{
				id = id.replace('/', '');

				if (isPlotted)	{
					bio.iteration.loop(isPlotted, function (isP)	{
						if (id.indexOf(isP) > -1 && !isPlotted[isP])	{
							if (isP === 'patient')	{
								$('#landscape_patient_group, #landscape_patient_sample, #landscape_patient_heatmap').css('box-shadow', 'None').css('background', '#fff')
							}
							
							isDraw = false;
						}
					});
				}

				if (isDraw)	{
					model.svg[chart][id] = bio.rendering().createSVG(id);
				}
			}
		});

		return model.svg[chart];
	};
	// 배열의 원소에 해당하는 DIV 태그를 제외한 나머지 태그에 svg 를 생성한다.
	model.landscape = function (ids, isPlotted)	{
		return create(['option', 'title'], 'landscape', ids, isPlotted);
	};
	
	model.variants = function (ids)	{
		return create(['title'], 'variants', ids);
	};
	
	model.expression = function (ids)	{
		return create(
			['title', 'function', 'color_mapping', 'signature'], 
			'expression', ids);
	};
	
	model.exclusivity = function (ids)	{
		return create(
			['title', 'geneset', 'survival', 'empty'], 
			'exclusivity', ids);
	};

	model.pathway = function (ids)	{
		return create(['title'], 'pathway', ids);
	};
	/*
		SVG 관련 에러 핸들러.
	 */
	function getSVGError (args)	{
		args = Array.prototype.slice.call(args);

		var typeArr = args.map(function (a)	{
			return bio.objects.getType(a);
		});

		if (typeArr.indexOf('Object') < 0)	{
			throw new Error('Not found svg set');
		} else if (typeArr.indexOf('Function') < 0)	{
			throw new Error('Not found callback');
		}
	};
	/*
		SVG 파라미터에서 id 목록과 맞는 svg 만 반환해주는 함수.
	 */
	model.get = function (svgs, ids, callback)	{
		getSVGError(arguments);

		ids = bio.objects.getType(ids) === 'Array' ? 
		ids : [ids];

		bio.iteration.loop(svgs, function (id, value)	{
			bio.iteration.loop(ids, function (i)	{
				if (id.indexOf(i) > -1)	{
					return callback(id, value);
				}
			});
		});
	};
	/*
		Specific 된 svg 가 없을 경우,
		'g-tag' 클래스를 가진 g tag 를 모두 지워주는 함수.
	 */
	model.removeGroupTag = function (classify)	{
		if (classify && typeof classify !== 'string')	{
			classify = bio.objects.getType(classify) === 'Array' ? 
			classify : [classify];

			bio.iteration.loop(classify, function (d)	{
				var id = d.replace('/', '');

				d3.selectAll((id.indexOf('.') > -1 ? id : '.' + id))
					.remove();
			});
		} else if (typeof classify === 'string')	{
			bio.iteration.loop(d3.selectAll('svg').nodes(), 
			function (svg)	{
				classify = classify.replace('/', '');

				if (svg.id.indexOf(classify) >= 0)	{
					d3.select(svg).select('.' + classify).remove();
				} else {
					d3.select(svg).selectAll('g').remove();
				}
			});
		} else {
			d3.selectAll('svg g').remove();
		}
	};

	return function ()	{
		return model;
	};
};