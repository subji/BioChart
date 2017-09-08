var layout = (function (layout)	{
	'use strict';

	var model = {
		exclusivity: {},
		expression: {},
		landscape: {},
		variants: {},
	};
	/*
		파라미터 ids 를 조회하며 e(except) 항목들을 제외한
		id 들을 t(chart case) 에 svg 를 만들어 넣어준다.
	 */
	function create (e, t, ids)	{
		util.loop(ids, function (d, i)	{
			var is = true;

			util.loop(e, function (b, j)	{
				if (d.indexOf(b) > -1)	{
					is = !is;
				}
			});

			if (is)	{
				model[t][d] = render.createSVG(d);
			}
		});

		return model[t];
	};
	/*
		SVG 를 가져오는데 필요한 조건을 충족시키지 못하면
		발생하는 에러이다.
	 */
	function getSVGError (args)	{
		var a = Array.prototype.slice.call(args),
				ta = a.map(function (d)	{
					return util.varType(d);
				});

		if (ta.indexOf('Object') < 0)	{
			throw new Error ('Not found svg set');
		} else if (ta.indexOf('Function') < 0)	{
			throw new Error ('Not found CallBack function');
		}
	};
	/*
		사용자가 전달한 id set (i) 에 맞는 svg 들을 
		콜백함수로 반환하는 함수.
	 */
	layout.getSVG = function (s, i, cb)	{
		getSVGError(arguments);

		i = util.varType(i) === 'Array' ? i : [i];

		util.loop(s, function (k, v)	{
			util.loop((i || ['']), function (d, j)	{
				if (k.indexOf(d) > -1)	{
					return cb(k, v);
				}
			});
		});
	};
	/*
		Specific 된 svg 가 없을 경우,
		'g-tag' 클래스를 가진 g tag 를 모두 지워주는 함수.
	 */
	layout.removeG = function (specify)	{
		if (specify)	{
			specify = util.varType(specify) === 'Array' ? 
			specify : [specify];

			util.loop(specify, function (d)	{
				// var id = d.indexOf('#') > -1 ? d : '#' + d;

				d3.selectAll((d.indexOf('.') > -1 ? d : '.' + d))
					.remove();
			});
		} else {
			d3.selectAll('svg g').remove();
		}
	};	
	/*
		ID (select_geneset, network, survival) 를 
		조회하며 svg 태그를 만들어 div 태그에 넣고 svg 를
		반환한다.
	 */
	layout.exclusivity = function (ids)	{
		return create(['geneset', 'survival', 'network'], 
									 'exclusivity', ids);
	};
	/*
		Id (scale_option, title 제외) 를 조회하며
		svg 태그를 만들어 div 태그에 삽입한다.
	 */
	layout.landscape = function (ids)	{
		return create(['option', 'title'], 'landscape', ids);
	};
	/*
		ID (title 제외) 를 조회하며 svg 태그를 만들어
		div 태그에 삽입한다.
	 */
	layout.variants = function (ids)	{
		return create(['title'], 'variants', ids);
	};
	/*
		Id (title 제외) 를 조회하며
		svg 태그를 만들어 div 태그에 삽입한다.
	 */
	layout.expression = function (ids)	{
		return create([
			'title', 'function', 'color_mapping', 'signature'
		], 'expression', ids);
	};

	return layout;
}(layout||{}));