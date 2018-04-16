function checkBox ()	{
	'use strict';

	return function (base, size, data, opacityEvt, mouseoverEvt, mouseoutEvt, clickEvt)	{
		var line = (bio.dependencies.version.d3v4() ? 
								d3.line() : d3.svg.line())
								.x(function (d)	{ return d.x; })
								.y(function (d)	{ return d.y; });

		var coord = [
			{ x: size.x + size.len / 8, y: size.y + (size.len / 3) },
			{ x: size.x + size.len / 2.2, y: (size.y + size.len) - (size.len / 4) },
			{ x: (size.x + size.len) - size.len / 8, y: size.y + (size.len / 10) }
		];
		// v 체크 그림을 먼저 그린 후 rectangle 을 그려야 마우스오버 이벤트가
		// 사각형 전반에 영향을 미치게 된다.
		var mark = base.append('path')
		.data(data)
		.attr('d', line(coord))
		.style('fill', 'none')
	  .style('opacity', opacityEvt)
	  .style('stroke', '#333333')
	  .style('stroke-width', 2);
		
		var border = base.append('rect')
		.data(data)
		.attr('width', size.len)
		.attr('height', size.len)
		.attr('x', size.x)
		.attr('y', size.y)
		.style('cursor', 'pointer')
		.style('fill-opacity', 0.00)
		.style('stroke-width', 2)
		.style('stroke', '#333333')
		.on('mouseover', function (d, i)	{ mouseoverEvt.call(this, d, i, mark); })
		.on('mouseout', function (d, i) { mouseoutEvt.call(this, d, i, mark); })
		.on('click', function (d, i) { clickEvt.call(this, d, i, mark); })

		return { mark: mark, border: border };
	};
}