function axises ()	{
	'use strict';

	var model = {
		axises: {},
	};
	/*
		D3 v3 과 v4 에서 axis 코드 차이가 있으므로 아래 함수에서
		구분지어 줬다.
	 */
	model.byD3v = function (scale, orient, opts)	{
		var axis = (bio.dependencies.version.d3v4() ? 
							 d3['axis' + orient.pronoun()](scale) : 
							 d3.svg.axis().scale(scale).orient(orient)).ticks(5);
		// TickValues 가 존재할 경우 적용.
		if (opts && opts.tickValues)	{
			axis.tickValues(opts.tickValues);
		} else if (opts && opts.ticks)	{
			axis.ticks(opts.ticks);
		}

		return axis;
	};
	/*
		초기 세팅 함수.
	 */
	function setting (type, opts)	{
		var position = [opts.top || 0, opts.left || 0],
				group = bio.rendering().addGroup(
				opts.element, position[0], position[1], type + '-axis');

		return {
			group: group,
			position: position,
			margin: bio.sizing.setMargin(opts.margin),
			scale: bio.scales().get(opts.domain, opts.range),
		};
	};
	/*
		Path, Line, Text 중 제외시킬 부분을 받아
		Axis 에서 제외한다.
	 */
	function exclude (group, item)	{
		if (typeof(item) !== 'string')	{
			throw new Error ('2nd Parameter type is not a string');
		} else if (!item)	{
			return group;
		}

		return group.selectAll(item).remove(), group; 
	};
	/*
		최종 반환 함수.
	 */
	function returnGroup (setting, opts, direction)	{
		var set = model.byD3v(setting.scale, direction, opts);

		if (opts.tickValues)	{

		}

		return opts.exclude ? 
			exclude(setting.group.call(set), opts.exclude) : 
			 				setting.group.call(set);
	};
	/*
		Data structure: {
			element: 'SVG Element',
			top: 'Top of axis',
			left: 'Left of axis',
			domain: 'Axis's domain data',
			range: 'Axis's range data',
			margin: 'Margin for axis',
			exclude: 'Path, Line, Text' or '', ...,
		}
	 */
	model.top = function (opts)	{
		return returnGroup(setting('top', opts), opts, 'top');
	};

	model.left = function (opts)	{
		return returnGroup(setting('left', opts), opts, 'left');
	};

	model.bottom = function (opts)	{
		return returnGroup(setting('bottom', opts), opts, 'bottom');
	};

	model.right = function (opts)	{
		return returnGroup(setting('right', opts), opts, 'right');
	};

	return function ()	{
		return model;
	};
};