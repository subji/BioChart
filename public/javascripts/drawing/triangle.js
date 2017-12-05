function triangle ()	{
	'use strict';

	var model = {};

	return function (opts, that)	{
		that = that || {};

		bio.rendering().triangle({
			element: opts.element,
			data: opts.data || null,
			attr: !opts.attr ? null : {
				id: function (d) { 
					return (opts.id || that.id || 
									opts.element.attr('id')) + '_triangle';
				},
				points: function (d, i)	{
					return opts.attr.points ? 
					typeof(opts.attr.points) !== 'function' ?  
								 opts.attr.points : 
								 opts.attr.points.call(this, d, i, that) : 0;
				},
			},
			style: !opts.style ? null : {
				'fill': function (d, i) { 
					return opts.style.fill ? 
					typeof(opts.style.fill) !== 'function' ?  
								 opts.style.fill : opts.style.fill.call(
								 	this, d, i, that) : '#000000'; 
				},
				'stroke': function (d, i) { 
					return opts.style.stroke ? 
					typeof(opts.style.stroke) !== 'function' ?  
								 opts.style.stroke : 
								 opts.style.stroke.call(
								 	this, d, i, that) : 'none'; 
				},
				'stroke-width': function (d, i) { 
					return opts.style.strokeWidth ?
					typeof(opts.style.strokeWidth) !== 'function' ?  
								 opts.style.strokeWidth : 
								 opts.style.strokeWidth.call(
								 	this, d, i, that) : '0px'; 
				},
				'filter': function (d, i)	{
					return opts.style.filter ?
					typeof(opts.style.filter) !== 'function' ?  
								 opts.style.filter : 
								 opts.style.filter.call(
								 	this, d, i, that) : false; 
				},
				'cursor': function (d, i)	{
					return opts.style.cursor ?
					typeof(opts.style.cursor) !== 'function' ?  
								 opts.style.cursor : 
								 opts.style.cursor.call(
								 	this, d, i, that) : false; 
				},
			},
			on: !opts.on ? null : {
				click: function (d, i)	{
					opts.on.click ? 
					opts.on.click.call(this, d, i, that) : false;
				},
				mouseover: function (d, i)	{
					opts.on.mouseover ? 
					opts.on.mouseover.call(this, d, i, that) : false;
				},
				mouseout: function (d, i)	{
					opts.on.mouseout ? 
					opts.on.mouseout.call(this, d, i, that) : false;
				},
			},
			call: !opts.call ? null : {
				start: function (d, i)	{
					opts.call.start ? 
					opts.call.start.call(this, d, i, that) : false;
				},
				drag: function (d, i)	{
					opts.call.drag ? 
					opts.call.drag.call(this, d, i, that) : false;
				},
				end: function (d, i)	{
					opts.call.end ? 
					opts.call.end.call(this, d, i, that) : false;
				},
			},
		});
	};
};