var axis = (function (axis)	{
	'use strict';

	var model = {
		axies: {},
	};
	/*
		인자로 받은 값이 svg element 일 경우,
		id 문자열일 경우 또는 '#' symbol 이 빠진 문자열일
		경우를 분석하고 svg 를 반환한다.
	 */
	axis.element = function (e)	{	
		e = util.varType(e) === 'Object' ? 
		e : (/\W/).test(e[0]) ? 
		d3.select(e) : d3.select('#' + e);

		model.current = e;

		return axis;
	};
	/*
		d3 의 버전 (3, 4)에 따라서 호출되는 함수명이 다르므로
		이에 맞는 적절한 함수를 호출해주는 함수이다.
	 */
	axis.byVersion = function (s, l)	{
		return util.d3v4() ? v4Axis(s, l) : v3Axis(s, l);
	};
	/*
		v3 axis function.
	 */
	function v3Axis (s, l)	{
		return d3.svg.axis().scale(s).orient(l);
	};
	/*
		v4 axis function.
	 */
	function v4Axis (s, l)	{
		return d3['axis' + util.camelCase(l)](s);
	};	
	/*
		axis 에 옵션을 적용하는 함수이다.
	 */
	function options (a, o, d)	{
		util.loop(o, function (k, v)	{
			if (a[k])	{
				a[k](axis.option[k](d, v));
			}
		});

		return a;
	};
	/*
		tick, line, text 등을 지워주는 함수.
	 */
	function isRemove (g, r)	{
		return r ? g.selectAll(r).remove() : g;
	};
	/*
		Axis 관련 옵션들을 정의해주는 함수들을 모아놓은
		객체이다.
	 */
	axis.option = {
		/*
			tickValues 는 축에 표시될 값을 지정해주는 함수로서
			n 개의 값을 표시하고 싶을 때, n - 1 의 값으로 나눈
			몫을 0부터 더해주며 맨 끝값은 기존 데이터의 max 값으로
			채운다.
		 */
		tickValues: function (d, n)	{
			if (util.varType(n) === 'Array')	{
				return n;
			}

			var v = (util.minmax(d).max / (n - 1)),
					r = [];

			for (var i = 0; i < (n - 1); i++)	{
				r.push(i * v);
			}

			return (r.push(util.minmax(d).max), r);
		},
	};

	axis.top = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, m.left],
				c = scale.get(d.data, [m.left, s.w - m.right]),
				g = render.addGroup(
						model.current, p[0], p[1], 'top-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
				axis.byVersion(c, 'top'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};
	/*
		축이 종 방향이고 축의 값이 왼쪽에 표기될때 호출되는 함수.
	 */
	axis.left = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, s.w - m.right],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(
						model.current, p[0], p[1], 'left-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
			 	axis.byVersion(c, 'left'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};

	axis.bottom = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [s.h - m.bottom, m.left],
				c = scale.get(d.data, [m.left, s.w - m.right]),
				g = render.addGroup(
						model.current, p[0], p[1], 'bottom-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
				axis.byVersion(c, 'bottom'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};

	axis.right = function (d)	{
		var m = size.setMargin(d.margin),
				s = draw.size(model.current),
				p = d.position || [m.top, m.left],
				c = scale.get(d.data, [m.top, s.h - m.bottom]),
				g = render.addGroup(
						model.current, p[0], p[1], 'right-axis'),
				o = d.opt ? d.opt : {};

		return g.call(options(
				axis.byVersion(c, 'right'), d.opt, d.data)), 
					 	 isRemove(g, o.remove), g;
	};

	return axis;
}(axis || {}));