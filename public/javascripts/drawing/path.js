function path ()	{
	'use strict';

	var model = {};
	/*
		D3 Line 함수.
	 */
	function toLine (opts, that)	{
		var target = this;

		return (bio.dependencies.version.d3v4() ? 
						d3.line() : d3.svg.line())
							.x(function (d, i)	{
								return opts.attr.x ? 
								typeof(opts.attr.x) !== 'function' ?  
									 		 opts.attr.x : 
									 		 opts.attr.x.call(target, d, i, that) : 0; 
							})	
							.y(function (d, i)	{
								return opts.attr.y ? 
								typeof(opts.attr.y) !== 'function' ?  
											 opts.attr.y : 
											 opts.attr.y.call(target, d, i, that) : 0; 
							});
	};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().line({
			element: opts.element,
			attr: !opts.attr ? null : {
				id: function (d, i) {
					return opts.attr.id ? 
					typeof(opts.attr.id) !== 'function' ?  
								(opts.id || that.id || 
								 opts.element.attr('id')) + 
									'_path' : 
								 opts.attr.id.call(this, d, i, that) : (opts.id || that.id || 
								 opts.element.attr('id')) + 
									'_path';
				},
				d: function (d, i)	{
					return toLine.call(this, opts, that)(opts.data);
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#A8A8A8'; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : '#A8A8A8'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '1px'; 
				},
				'stroke-dasharray': function (d, i)	{
					return opts.style.strokeDash ?
					typeof(opts.style.strokeDash) !== 'function' ?  
								 opts.style.strokeDash : 
								 opts.style.strokeDash.call(
								 	this, d, i, that) : 'none'; 
				}
			},
		});
	};
};